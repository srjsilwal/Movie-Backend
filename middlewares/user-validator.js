const { StatusCodes } = require("http-status-codes");
const { AppError } = require("../utils/app-error");

const validateSignupRequest = (req, res, next) => {
  const { name, email, password, userRole } = req.body;

  if (!name || name.trim().length < 3) {
    return next(
      new AppError(
        "Name must be at least 3 characters long",
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  if (!email) {
    return next(
      new AppError("Email is required", StatusCodes.BAD_REQUEST),
    );
  }

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return next(
      new AppError("Please provide a valid email", StatusCodes.BAD_REQUEST),
    );
  }

  if (!password || password.length < 6) {
    return next(
      new AppError(
        "Password must be at least 6 characters long",
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  if (userRole && !["customer", "client"].includes(userRole)) {
    return next(
      new AppError(
        "You can register only as a customer or client",
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  next();
};

const validateLoginRequest = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return next(
      new AppError("Email is required", StatusCodes.BAD_REQUEST),
    );
  }

  if (!password) {
    return next(
      new AppError("Password is required", StatusCodes.BAD_REQUEST),
    );
  }

  next();
};

const validateChangePasswordRequest = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    return next(
      new AppError(
        "Current password is required",
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  if (!newPassword || newPassword.length < 6) {
    return next(
      new AppError(
        "New password must be at least 6 characters long",
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  next();
};

const validateUpdateRoleAndStatusRequest = (req, res, next) => {
  const { userRole, userStatus } = req.body;

  if (userRole) {
    const validRoles = ["admin", "client", "customer"];
    if (!validRoles.includes(userRole)) {
      return next(
        new AppError(
          "Role must be admin, client, or customer",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
  }

  if (userStatus) {
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(userStatus)) {
      return next(
        new AppError(
          "Status must be pending, approved, or rejected",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
  }

  if (!userRole && !userStatus) {
    return next(
      new AppError(
        "At least one of userRole or userStatus must be provided",
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  next();
};

module.exports = {
  validateSignupRequest,
  validateLoginRequest,
  validateChangePasswordRequest,
  validateUpdateRoleAndStatusRequest,
};
