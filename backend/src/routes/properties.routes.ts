import { Router, Request, Response, NextFunction } from 'express';
import { getAllProperties, getPropertyById } from '../controllers/properties.controller';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * Optional auth — attaches req.user when a valid token is present
 * but never blocks unauthenticated users. Allows authenticated users
 * to receive the is_favourited flag without forcing login to browse.
 */
const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string; email: string; role: string;
      };
      req.user = decoded;
    } catch {
      // Invalid or expired token — continue as unauthenticated
    }
  }
  next();
};

router.get('/', optionalAuth, getAllProperties);
router.get('/:id', optionalAuth, getPropertyById);

export default router;
