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
router.post('/signup', signup);
router.post('/login', verifyRecaptcha, login);
router.post('/logout', logout);
router.get('/session', checkSession);

// Password Reset
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Stripe Payment
router.post('/create-checkout-session', createCheckoutSession);

export default router;