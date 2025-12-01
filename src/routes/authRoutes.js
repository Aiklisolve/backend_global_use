import express from 'express';
import {
  loginController,
  validateCredentials,
  sendOtp,
  finalLogin,
} from '../controllers/authController.js';
import {
  validateCredentialValidation,
  validateSendOtp,
  validateFinalLogin,
} from '../middleware/validation.js';

const router = express.Router();

// Legacy route (maintains backward compatibility with step-based login)
router.post('/login', loginController);

// New structured routes
router.post('/validate-credentials', validateCredentialValidation, validateCredentials);
router.post('/send-otp', validateSendOtp, sendOtp);
router.post('/final-login', validateFinalLogin, finalLogin);

export default router;
