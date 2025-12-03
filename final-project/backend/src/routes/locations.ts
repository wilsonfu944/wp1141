import { Router } from 'express';
import { getAllLocations, getLocationById } from '../controllers/locationController';

const router = Router();

router.get('/', getAllLocations);
router.get('/:id', getLocationById);

export default router;


