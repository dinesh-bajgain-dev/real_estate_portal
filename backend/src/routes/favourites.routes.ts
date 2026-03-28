import { Router } from 'express';
import { getFavourites, addFavourite, removeFavourite } from '../controllers/favourites.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All favourites routes require authentication
router.get('/', authenticate, getFavourites);
router.post('/:propertyId', authenticate, addFavourite);
router.delete('/:propertyId', authenticate, removeFavourite);

export default router;
