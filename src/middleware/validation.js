/**
 * Validation Middleware
 * Validates request data for authentication endpoints
 */

/**
 * Validate login request step 1: credential_validation
 */
export function validateCredentialValidation(req, res, next) {
  const { login_type, email, password, role } = req.body || {};

  const errors = [];

  if (!login_type || login_type !== 'email_password') {
    errors.push('login_type must be email_password');
  }

  if (!email) {
    errors.push('email is required');
  }

  if (!password) {
    errors.push('password is required');
  }

  if (!role) {
    errors.push('role is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

/**
 * Validate login request step 2: send_otp
 */
export function validateSendOtp(req, res, next) {
  const { login_type, mobile, role } = req.body || {};

  const errors = [];

  if (!login_type || login_type !== 'mobile') {
    errors.push('login_type must be mobile');
  }

  if (!mobile) {
    errors.push('mobile is required');
  }

  if (!role) {
    errors.push('role is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

/**
 * Validate login request step 3: final_login
 */
export function validateFinalLogin(req, res, next) {
  const { role, otp, email, mobile } = req.body || {};

  const errors = [];

  if (!role) {
    errors.push('role is required');
  }

  if (!otp) {
    errors.push('otp is required');
  }

  if (!email && !mobile) {
    errors.push('email or mobile is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

