import bcrypt from 'bcrypt';
import { findUserByEmailAndRole, findUserByMobileAndRole } from '../services/userService.js';
import { createOtpForUser, verifyUserOtp } from '../services/otpService.js';
import { createSessionForUser } from '../services/sessionService.js';
import { signJwt } from '../utils/jwt.js';
import { getClientInfo } from '../utils/request.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Helper: Check if user is active
 */
function isUserActive(user) {
  return user && String(user.is_active).trim() === 'true';
}

/**
 * Helper: Verify password (supports both bcrypt hash and plain text for backward compatibility)
 */
async function verifyPassword(plainPassword, hashedPassword) {
  // Try bcrypt comparison first (if hash starts with $2b$ or similar)
  if (hashedPassword && (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2y$'))) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Bcrypt comparison error:', error);
      return false;
    }
  }
  
  // Fallback to plain text comparison (for backward compatibility)
  return plainPassword === hashedPassword;
}

/**
 * STEP 1: Credential Validation (Email + Password)
 * Validates user credentials and sends OTP
 */
export async function validateCredentials(req, res) {
  try {
    const { email, password, role, login_type } = req.body;

    // Find user by email and role
    const user = await findUserByEmailAndRole(email, role);

    // Validate user exists and is active
    if (!isUserActive(user)) {
      return errorResponse(res, 401, 'Invalid user credentials');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return errorResponse(res, 401, 'Invalid user credentials');
    }

    // Generate and send OTP
    const { otpCode, expiresIST } = await createOtpForUser(user);

    return successResponse(res, 200, 'Valid details. OTP sent', {
      otp: otpCode, // TODO: Remove in production
      expires_at: expiresIST,
      user_id: user.user_id,
      login_type,
    });
  } catch (err) {
    console.error('Credential validation error:', err);
    return errorResponse(res, 500, 'Internal server error', err.message);
  }
}

/**
 * STEP 2: Send OTP (Mobile Only)
 * Sends OTP to user's mobile number
 */
export async function sendOtp(req, res) {
  try {
    const { mobile, role, login_type } = req.body;

    // Find user by mobile and role
    const user = await findUserByMobileAndRole(mobile, role);

    // Validate user exists and is active
    if (!isUserActive(user)) {
      return errorResponse(res, 401, 'Invalid user credentials');
    }

    // Generate and send OTP
    const { otpCode, expiresIST } = await createOtpForUser(user, mobile);

    return successResponse(res, 200, 'OTP sent', {
      otp: otpCode, // TODO: Remove in production
      expires_at: expiresIST,
      user_id: user.user_id,
      login_type,
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return errorResponse(res, 500, 'Internal server error', err.message);
  }
}

/**
 * STEP 3: Final Login (OTP Verification + Session Creation)
 * Verifies OTP and creates session with JWT token
 */
export async function finalLogin(req, res) {
  try {
    const { email, mobile, role, otp } = req.body;

    // Find user by email or mobile
    let user = null;
    if (email) {
      user = await findUserByEmailAndRole(email, role);
    } else if (mobile) {
      user = await findUserByMobileAndRole(mobile, role);
    }

    // Validate user exists and is active
    if (!isUserActive(user)) {
      return errorResponse(res, 401, 'Invalid user credentials');
    }

    // Determine mobile number for OTP verification
    const mobileToUse = mobile || user.phone;
    if (!mobileToUse) {
      return errorResponse(res, 400, 'Mobile number is required for OTP verification');
    }

    // Verify OTP
    const { valid, reason } = await verifyUserOtp(user.user_id, mobileToUse, otp);
    if (!valid) {
      return errorResponse(res, 401, `Invalid OTP: ${reason}`);
    }

    // Generate JWT token
    const token = signJwt({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    });

    // Get client information
    const { ip, userAgent } = getClientInfo(req);

    // Create session
    const { sessionId, expiresAt, dbRow } = await createSessionForUser(
      user.user_id,
      token,
      ip,
      userAgent
    );

    return successResponse(res, 200, 'Login successful', {
      session_id: sessionId,
      user_id: user.user_id,
      token,
      expiry: expiresAt,
      role: user.role,
      email: user.email,
      session_status: dbRow.is_active,
    });
  } catch (err) {
    console.error('Final login error:', err);
    return errorResponse(res, 500, 'Internal server error', err.message);
  }
}

/**
 * Legacy login controller (maintains backward compatibility)
 * Routes to appropriate handler based on step
 */
export async function loginController(req, res) {
  const { step } = req.body || {};

  if (!step) {
    return errorResponse(res, 400, 'step is required');
  }

  switch (step) {
    case 'credential_validation':
      return validateCredentials(req, res);
    case 'send_otp':
      return sendOtp(req, res);
    case 'final_login':
      return finalLogin(req, res);
    default:
      return errorResponse(res, 400, `Unknown step: ${step}`);
  }
}
