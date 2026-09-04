// utils/responsebody.js

/**
 * Generates a fresh success response object for every request
 */
const createSuccessResponse = (
  data,
  message = "Successfully processed the request",
) => {
  return {
    success: true,
    message: message,
    data: data,
    err: null, // Explicitly clear errors on success
  };
};

/**
 * Generates a fresh error response object for every request
 */
const createErrorResponse = (
  err,
  message = "Something went wrong, can't process the request",
) => {
  return {
    success: false,
    message: message,
    err: err,
    data: null, // Explicitly clear data on error
  };
};

module.exports = {
  createSuccessResponse,
  createErrorResponse,
};
