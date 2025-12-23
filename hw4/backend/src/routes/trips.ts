import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  addPlaceToTrip,
  updateTripDay,
  removePlaceFromTrip,
  getDirectionsAPI
} from '../controllers/tripsController';
import { tripValidation, validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.get('/', getTrips);
router.get('/:id', getTrip);
router.post('/', tripValidation, validateRequest, createTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// Trip days routes
router.post('/:id/days', addPlaceToTrip);
router.put('/:id/days/:dayId', updateTripDay);
router.delete('/:id/days/:dayId', removePlaceFromTrip);

// Directions route
router.get('/:id/directions', getDirectionsAPI);

export default router;

