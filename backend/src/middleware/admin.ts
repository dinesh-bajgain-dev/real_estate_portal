import { Request, Response, NextFunction } from 'express';

/**
 * requireAdmin — must be used AFTER the authenticate middleware.
 * authenticate sets req.user; this checks that the role is 'admin'.
 * Returns 403 Forbidden (not 401) — the user IS authenticated, just not authorized.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
    return;
  }
  next();
};
