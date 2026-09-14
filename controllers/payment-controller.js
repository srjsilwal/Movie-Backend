const { StatusCodes } = require("http-status-codes");
const {
  processPaymentService,
  getUserPaymentsService,
  getPaymentByIdService,
  requestRefundService,
} = require("../services/payment-service");
const { createSuccessResponse } = require("../utils/responsebody");

const processPayment = async (req, res, next) => {
  try {
    const response = await processPaymentService(
      req.params.bookingId,
      req.body,
      req.user,
    );
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, response.message));
  } catch (error) {
    return next(error);
  }
};

const getUserPayments = async (req, res, next) => {
  try {
    const response = await getUserPaymentsService(req.user.id, req.query.status);
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Payment history fetched successfully."));
  } catch (error) {
    return next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const response = await getPaymentByIdService(req.params.paymentId, req.user.id);
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Payment fetched successfully."));
  } catch (error) {
    return next(error);
  }
};

const requestRefund = async (req, res, next) => {
  try {
    const response = await requestRefundService(
      req.params.bookingId,
      req.body.reason,
      req.user,
    );
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, response.message));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  processPayment,
  getUserPayments,
  getPaymentById,
  requestRefund,
};
