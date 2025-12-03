import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { registerValidation, loginValidation, validateRequest } from '../middleware/validation';

const router = express.Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

export default router;

