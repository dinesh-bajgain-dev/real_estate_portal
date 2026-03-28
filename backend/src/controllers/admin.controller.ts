import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../db/pool';

// ─── Properties CRUD ─────────────────────────────────────────────────────────

/**
 * GET /api/admin/properties
 * Lists all properties with favourite count per property.
 */
export const adminGetProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.*,
        COUNT(f.id)::int AS favourite_count
      FROM properties p
      LEFT JOIN favourites f ON f.property_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, properties: rows });
  } catch (err) {
    console.error('adminGetProperties error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/admin/properties
 * Creates a new property listing.
 */
export const adminCreateProperty = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { title, address, price, bedrooms, bathrooms, area_sqft, image_url, property_type } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO properties (title, address, price, bedrooms, bathrooms, area_sqft, image_url, property_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title.trim(),
        address.trim(),
        Number(price),
        Number(bedrooms),
        Number(bathrooms),
        Number(area_sqft),
        image_url?.trim() || null,
        property_type,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      property: rows[0],
    });
  } catch (err) {
    console.error('adminCreateProperty error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * PUT /api/admin/properties/:id
 * Updates an existing property. Only provided fields are updated.
 */
export const adminUpdateProperty = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { id } = req.params;
  const { title, address, price, bedrooms, bathrooms, area_sqft, image_url, property_type } = req.body;

  try {
    // Check property exists first
    const existing = await pool.query('SELECT id FROM properties WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Property not found.' });
      return;
    }

    const { rows } = await pool.query(
      `UPDATE properties
       SET
         title         = COALESCE($1, title),
         address       = COALESCE($2, address),
         price         = COALESCE($3, price),
         bedrooms      = COALESCE($4, bedrooms),
         bathrooms     = COALESCE($5, bathrooms),
         area_sqft     = COALESCE($6, area_sqft),
         image_url     = COALESCE($7, image_url),
         property_type = COALESCE($8, property_type)
       WHERE id = $9
       RETURNING *`,
      [
        title?.trim() ?? null,
        address?.trim() ?? null,
        price != null ? Number(price) : null,
        bedrooms != null ? Number(bedrooms) : null,
        bathrooms != null ? Number(bathrooms) : null,
        area_sqft != null ? Number(area_sqft) : null,
        image_url?.trim() ?? null,
        property_type ?? null,
        id,
      ]
    );

    res.json({
      success: true,
      message: 'Property updated successfully.',
      property: rows[0],
    });
  } catch (err) {
    console.error('adminUpdateProperty error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * DELETE /api/admin/properties/:id
 * Deletes a property. Favourites cascade-delete automatically via FK.
 */
export const adminDeleteProperty = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query('DELETE FROM properties WHERE id = $1', [id]);

    if (rowCount === 0) {
      res.status(404).json({ success: false, message: 'Property not found.' });
      return;
    }

    res.json({ success: true, message: 'Property deleted successfully.' });
  } catch (err) {
    console.error('adminDeleteProperty error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── Users Management ─────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * Lists all registered users with their favourite counts.
 */
export const adminGetUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(f.id)::int AS favourites_count
      FROM users u
      LEFT JOIN favourites f ON f.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, users: rows });
  } catch (err) {
    console.error('adminGetUsers error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Deletes a user account. Prevents admin from deleting themselves.
 */
export const adminDeleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (id === req.user!.id) {
    res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    return;
  }

  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);

    if (rowCount === 0) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('adminDeleteUser error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/admin/stats
 * Dashboard summary stats.
 */
export const adminGetStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [propResult, userResult, favResult] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM properties'),
      pool.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'buyer'"),
      pool.query('SELECT COUNT(*)::int AS count FROM favourites'),
    ]);

    res.json({
      success: true,
      stats: {
        total_properties: propResult.rows[0].count,
        total_buyers: userResult.rows[0].count,
        total_favourites: favResult.rows[0].count,
      },
    });
  } catch (err) {
    console.error('adminGetStats error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
