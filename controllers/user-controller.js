const { StatusCodes } = require("http-status-codes");
const {
  signupService,
  loginService,
  changePasswordService,
  updateRoleOrStatus,
  getAllUserService,
} = require("../services/user-service");
const { createSuccessResponse } = require("../utils/responsebody");

const signUp = async (req, res, next) => {
    try {
    const response = await signupService(req.body);
    return res
      .status(StatusCodes.CREATED)
      .json(createSuccessResponse(response, "User Register Successfully"));
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const response = await loginService(email, password);
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Successfully logged in"));
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const response = await changePasswordService(userId, currentPassword, newPassword);
    return res
      .status(StatusCodes.OK)
      .json(
        createSuccessResponse(response, "Successfully change the password"),
      );
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = (req, res, next) => {
  try {
    return res
      .status(StatusCodes.OK)
      .json(
        createSuccessResponse(
          req.user.isSafeObject(),
          "Successfully fetched the User profile",
        ),
      );
  } catch (error) {
    return next(error);
  }
};

const updateRoleAndStatus = async (req, res, next) => {
  try {
    const adminId = req.user.id
    const { userRole, userStatus } = req.body;
    const targetUserId = req.params.id
    const response = await updateRoleOrStatus(adminId, targetUserId, userRole, userStatus);
    return res
      .status(StatusCodes.OK)
      .json(
        createSuccessResponse(
          response,
          "Successfully updated user role and status",
        ),
      );
  } catch (error) {
    return next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const response = await getAllUserService();
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Successfully fetched the users"));
  } catch (error) {
    return next(error);
  }
};
module.exports = {
  signUp,
  login,
  changePassword,
  getCurrentUser,
  updateRoleAndStatus,
  getAllUsers,
};
