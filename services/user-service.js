const { StatusCodes } = require("http-status-codes");
const { User } = require("../models/user-model");
const { AppError } = require("../utils/app-error");

const signupService = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError(
        "User with this email already exists",
        StatusCodes.CONFLICT,
      );
    }
    const user = await User.create(userData);
    if(user.userRole === 'customer'){
      user.userStatus = 'approved'
    }
    return user.isSafeObject();
  } catch (error) {
    if (error.name === "ValidationError") {
      let err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      throw new AppError(
        "Validation failed",
        StatusCodes.UNPROCESSABLE_ENTITY,
        err,
      );
    }
    throw error;
  }
};

const loginService = async (email, password) => {
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }
    if (user.userRole === "client" && user.userStatus !== "approved") {
      throw new AppError(
        "You are not approved. please wait for approval",
        StatusCodes.FORBIDDEN,
      );
    }

    const token = await user.createJwtToken();

    return {
      user: user.isSafeObject(),
      token,
    };
  } catch (error) {
    throw error;
  }
};

const changePasswordService = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError("Invalid old password", StatusCodes.UNAUTHORIZED);
    }
    user.password = newPassword;
    await user.save();
    return user.isSafeObject();
  } catch (error) {
    if (error.name === "ValidationError") {
      let err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      throw new AppError(
        "Validation failed",
        StatusCodes.UNPROCESSABLE_ENTITY,
        err,
      );
    }
    throw error;
  }
};

const updateRoleOrStatus = async (
  adminId,
  targetUserId,
  userRole,
  userStatus,
) => {
  try {
    if (adminId === targetUserId && userRole && userRole !== "admin") {
      throw new AppError(
        "You cannot change your own admin role",
        StatusCodes.BAD_REQUEST,
      );
    }
    const user = await User.findById(targetUserId);
    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }
    if (userRole) user.userRole = userRole;
    if (userStatus) user.userStatus = userStatus;
    await user.save();
    return user.isSafeObject();
  } catch (error) {
    if (error.name === "ValidationError") {
      let err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      throw new AppError(
        "Validation failed",
        StatusCodes.UNPROCESSABLE_ENTITY,
        err,
      );
    }
    throw error;
  }
};

const getAllUserService = async () => {
  try {
    const users = await User.find();
    return users.map((u) => u.isSafeObject());
  } catch (error) {
    throw new AppError(
      "Failed to list all users",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

module.exports = {
  signupService,
  loginService,
  changePasswordService,
  updateRoleOrStatus,
  getAllUserService,
};
