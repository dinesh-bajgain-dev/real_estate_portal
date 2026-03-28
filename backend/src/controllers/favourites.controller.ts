import { Request, Response } from 'express';
import pool from '../db/pool';

/**
 * GET /api/favourites
 * Returns all favourite properties for the authenticated user.
 * Users can ONLY see their own favourites (enforced by req.user.id).
 */
export const getFavourites = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    const { rows } = await pool.query(
      `SELECT p.*, f.created_at AS favourited_at, TRUE AS is_favourited
       FROM favourites f
       JOIN properties p ON p.id = f.property_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({ success: true, favourites: rows });
  } catch (err) {
    console.error('GetFavourites error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/favourites/:propertyId
 * Adds a property to the authenticated user's favourites.
 */
export const addFavourite = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { propertyId } = req.params;

  try {
    // Verify the property exists
    const propertyCheck = await pool.query('SELECT id FROM properties WHERE id = $1', [propertyId]);
    if (propertyCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Property not found.' });
      return;
    }

    // ON CONFLICT DO NOTHING handles the case where user clicks "like" twice
    await pool.query(
      `INSERT INTO favourites (user_id, property_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, property_id) DO NOTHING`,
      [userId, propertyId]
    );

    res.status(201).json({ success: true, message: 'Property added to favourites.' });
  } catch (err) {
    console.error('AddFavourite error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * DELETE /api/favourites/:propertyId
 * Removes a property from the authenticated user's favourites.
 * The WHERE clause on user_id ensures users can only delete their OWN favourites.
 */
export const removeFavourite = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { propertyId } = req.params;

  try {
    const { rowCount } = await pool.query(
      'DELETE FROM favourites WHERE user_id = $1 AND property_id = $2',
      [userId, propertyId]
    );

    if (rowCount === 0) {
      res.status(404).json({ success: false, message: 'Favourite not found.' });
      return;
    }

    res.json({ success: true, message: 'Property removed from favourites.' });
  } catch (err) {
    console.error('RemoveFavourite error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
