import { Request, Response } from 'express';
import pool from '../db/pool';

/**
 * GET /api/properties
 * Returns all properties. If authenticated, includes is_favourited flag per property.
 */
export const getAllProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    let query: string;
    let params: string[];

    if (userId) {
      // JOIN with favourites to know which ones the user has saved
      query = `
        SELECT
          p.*,
          CASE WHEN f.property_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favourited
        FROM properties p
        LEFT JOIN favourites f
          ON f.property_id = p.id AND f.user_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [userId];
    } else {
      query = 'SELECT *, FALSE AS is_favourited FROM properties ORDER BY created_at DESC';
      params = [];
    }

    const { rows } = await pool.query(query, params);
    res.json({ success: true, properties: rows });
  } catch (err) {
    console.error('GetAllProperties error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/properties/:id
 * Returns a single property by ID.
 */
export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const { rows } = await pool.query(
      `SELECT p.*,
        CASE WHEN f.property_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favourited
       FROM properties p
       LEFT JOIN favourites f ON f.property_id = p.id AND f.user_id = $2
       WHERE p.id = $1`,
      [id, userId ?? null]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Property not found.' });
      return;
    }

    res.json({ success: true, property: rows[0] });
  } catch (err) {
    console.error('GetPropertyById error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
