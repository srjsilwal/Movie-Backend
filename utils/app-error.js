class AppError extends Error {
  /**
   * Custom application error class that carries an HTTP status code.
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
   * @param {*} [data=null] - Optional additional error data (e.g., validation errors object)
   */
  constructor(message, statusCode, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.data = data;
    this.isOperational = true; // Distinguish operational errors from programming bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };
