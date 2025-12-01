/**
 * Standardized API Response Helpers
 * Ensures consistent response format across the application
 */

export function successResponse(res, statusCode = 200, message, data = null) {
  const response = {
    status: statusCode,
    message,
  };

  // Merge data fields directly into response (flat structure like original)
  if (data !== null && typeof data === 'object') {
    Object.assign(response, data);
  } else if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

export function errorResponse(res, statusCode = 400, message, error = null) {
  const response = {
    status: statusCode,
    message,
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
}

export function validationErrorResponse(res, message, errors = []) {
  return res.status(400).json({
    status: 400,
    message,
    errors,
  });
}

