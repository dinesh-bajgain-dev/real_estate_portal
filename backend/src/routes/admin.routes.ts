import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import {
  adminGetProperties,
  adminCreateProperty,
  adminUpdateProperty,
  adminDeleteProperty,
  adminGetUsers,
  adminDeleteUser,
  adminGetStats,
} from '../controllers/admin.controller';

const router = Router();

// Every admin route requires: (1) valid JWT, (2) role === 'admin'
const guard = [authenticate, requireAdmin];

// ── Property validation rules ────────────────────────────────────────────────
const propertyCreateRules = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 255 }),
  body('address').trim().notEmpty().withMessage('Address is required.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('bedrooms').isInt({ min: 0, max: 20 }).withMessage('Bedrooms must be 0–20.'),
  body('bathrooms').isInt({ min: 0, max: 20 }).withMessage('Bathrooms must be 0–20.'),
  body('area_sqft').isInt({ min: 1 }).withMessage('Area must be a positive integer.'),
  body('property_type')
    .isIn(['house', 'apartment', 'villa', 'penthouse'])
    .withMessage('Type must be house, apartment, villa, or penthouse.'),
  body('image_url').optional({ nullable: true }).isURL().withMessage('Image URL must be a valid URL.'),
];

const propertyUpdateRules = [
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('address').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('bedrooms').optional().isInt({ min: 0, max: 20 }),
  body('bathrooms').optional().isInt({ min: 0, max: 20 }),
  body('area_sqft').optional().isInt({ min: 1 }),
  body('property_type').optional().isIn(['house', 'apartment', 'villa', 'penthouse']),
  body('image_url').optional({ nullable: true }).isURL().withMessage('Image URL must be a valid URL.'),
];

// ── Routes ───────────────────────────────────────────────────────────────────

// Stats
router.get('/stats', ...guard, adminGetStats);

// Properties CRUD
router.get('/properties', ...guard, adminGetProperties);
router.post('/properties', ...guard, propertyCreateRules, adminCreateProperty);
router.put('/properties/:id', ...guard, propertyUpdateRules, adminUpdateProperty);
router.delete('/properties/:id', ...guard, adminDeleteProperty);

// Users management
router.get('/users', ...guard, adminGetUsers);
router.delete('/users/:id', ...guard, adminDeleteUser);

export default router;
