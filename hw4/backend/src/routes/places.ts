import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPlaces,
  getPlace,
  createPlace,
  updatePlace,
  deletePlace,
  searchPlacesAPI,
  geocodeAPI
} from '../controllers/placesController';
import { placeValidation, validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.get('/', getPlaces);
router.get('/:id', getPlace);
router.post('/', placeValidation, validateRequest, createPlace);
router.put('/:id', updatePlace);
router.delete('/:id', deletePlace);

// Google Maps API routes
router.post('/search', searchPlacesAPI);
router.post('/geocode', geocodeAPI);

export default router;

