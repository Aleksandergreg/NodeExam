import { Router } from 'express';
import { verifyRecaptcha } from '../middleware/recaptchaMiddleware.js';
import { 
    signup, 
    login, 
    logout, 
    checkSession, 
    requestPasswordReset, 
    resetPassword,
    createCheckoutSession 
} from '../controllers/authController.js';

const router = Router();

// Core Authentication
router.post('/auth/signup', signup);
router.post('/auth/login', verifyRecaptcha, login);
router.post('/auth/logout', logout);
router.get('/auth/session', checkSession);

// Password Reset
router.post('/auth/request-password-reset', requestPasswordReset);
router.post('/auth/reset-password', resetPassword);

// Stripe Payment
router.post('/auth/create-checkout-session', createCheckoutSession);

export default router;