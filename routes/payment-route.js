const express = require("express");
const { isAuthenticated, isCustomer } = require("../middlewares/user-middleware");
const {
  processPayment,
  getUserPayments,
  getPaymentById,
  requestRefund,
} = require("../controllers/payment-controller");
const {
  validatePaymentRequest,
  validateRefundRequest,
} = require("../middlewares/bodyRequestValidators");

const router = express.Router();

router.use(isAuthenticated, isCustomer);

router.get("/", getUserPayments);
router.get("/:paymentId", getPaymentById);
router.post("/booking/:bookingId", validatePaymentRequest, processPayment);
router.post("/booking/:bookingId/refund", validateRefundRequest, requestRefund);

module.exports = { paymentRouter: router };
