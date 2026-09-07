const express = require("express");
const {
  signUp,
  login,
  changePassword,
  getCurrentUser,
  updateRoleAndStatus,
  getAllUsers,
} = require("../controllers/user-controller");
const { isAuthenticated, isAdmin } = require("../middlewares/user-middleware");
const {
  validateSignupRequest,
  validateLoginRequest,
  validateChangePasswordRequest,
  validateUpdateRoleAndStatusRequest,
} = require("../middlewares/user-validator");
const router = express.Router();

router.post("/signup", validateSignupRequest, signUp);
router.post("/login", validateLoginRequest, login);


router.get("/me", isAuthenticated, getCurrentUser);
router.get("/all",isAuthenticated, isAdmin,  getAllUsers);



router.patch("/:id/updateRole", isAuthenticated, isAdmin, validateUpdateRoleAndStatusRequest, updateRoleAndStatus);
router.patch("/changePassword", isAuthenticated, validateChangePasswordRequest, changePassword );

module.exports = { userRouter: router };