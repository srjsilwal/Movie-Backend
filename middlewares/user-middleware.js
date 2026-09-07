const { StatusCodes } = require("http-status-codes");
const { User } = require("../models/user-model");
const { AppError } = require("../utils/app-error");
const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError(
          "Access denied. No token provided.",
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User no longer exists", StatusCodes.FORBIDDEN));
    }
    if (user.userRole === "client" && user.userStatus !== "approved") {
      return next(
        new AppError(
          "Your account is not approved. Please contact admin",
          StatusCodes.FORBIDDEN,
        ),
      );
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token.", StatusCodes.UNAUTHORIZED));
    }

    if (error.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Token expired. Please login again.",
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }

    return next(
      new AppError("Authentication error.", StatusCodes.INTERNAL_SERVER_ERROR),
    );
  }
};

const isAdmin = (req,res, next) => {
  if (req.user.userRole !== "admin") {
    return next(
      new AppError(
        "Access denied. Admin privileges required.",
        StatusCodes.FORBIDDEN,
      ),
    );
  }
  next();
};
const isAdminOrClient = (req,res, next) => {
  if (req.user.userRole !== "admin" && req.user.userRole !== "client") {
    return next(
      new AppError(
        "Access denied. Admin or Client privileges required.",
        StatusCodes.FORBIDDEN,
      ),
    );
  }
  next();
};
const isClient = (req,res, next) => {
  if (req.user.userRole !== "client") {
    return next(
      new AppError(
        "Access denied. Client privileges required.",
        StatusCodes.FORBIDDEN,
      ),
    );
  }
  next();
};

const isCustomer = (req, res, next) => {
  if (req.user.userRole !== "customer") {
    return next(
      new AppError(
        "Access denied. Customer account required.",
        StatusCodes.FORBIDDEN,
      ),
    );
  }
  next();
};
module.exports = {
  isAuthenticated,
  isAdmin,
  isClient,
  isAdminOrClient,
  isCustomer,
};
