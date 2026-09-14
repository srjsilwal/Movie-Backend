const { default: mongoose } = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const { Booking } = require("../models/booking-model.js");
const { Show } = require("../models/shows-model.js");
const { AppError } = require("../utils/app-error.js");
const { Payment } = require("../models/payment-model");

// Helper: Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

// Helper: Simulate gateway interaction
const simulatePaymentGateway = async (paymentData) => {
  await new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 1500),
  );
  const isSuccess = Math.random() < 0.9;

  if (isSuccess) {
    return {
      success: true,
      transactionId: generateTransactionId(),
      message: "Payment processed successfully",
      gatewayResponse: {
        status: "success",
        method: paymentData.method,
        amount: paymentData.amount,
      },
    };
  }
  return {
    success: false,
    transactionId: null,
    message: "Payment failed: Insufficient funds",
    gatewayResponse: { status: "failed", errorCode: "INSUFFICIENT_FUNDS" },
  };
};

/**
 * Process payment for a booking
 */
const processPaymentService = async (bookingId, paymentData, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking)
      throw new AppError("Booking not found", StatusCodes.NOT_FOUND);
    if (booking.user.toString() !== user.id)
      throw new AppError("Unauthorized", StatusCodes.FORBIDDEN);

    if (booking.status === "confirmed")
      throw new AppError("Payment already completed", StatusCodes.BAD_REQUEST);
    if (booking.status === "cancelled" || booking.status === "expired") {
      throw new AppError(
        `Cannot pay for a ${booking.status} booking`,
        StatusCodes.BAD_REQUEST,
      );
    }

    if (booking.expiresAt && new Date() > booking.expiresAt) {
      booking.status = "expired";
      await booking.save({ session });
      throw new AppError(
        "Booking has expired. Please reserve your seats again.",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (paymentData.amount !== booking.totalPrice) {
      throw new AppError(
        `Amount mismatch: expected ${booking.totalPrice}`,
        StatusCodes.BAD_REQUEST,
      );
    }

    const existingPayment = await Payment.findOne({
      booking: bookingId,
      status: { $in: ["pending", "completed"] },
    }).session(session);

    if (existingPayment)
      throw new AppError(
        "Payment already in progress or completed",
        StatusCodes.CONFLICT,
      );

    // Create pending payment
    const [payment] = await Payment.create(
      [
        {
          booking: bookingId,
          user: user.id,
          amount: paymentData.amount,
          method: paymentData.method,
          status: "pending",
        },
      ],
      { session },
    );

    // Execute simulated payment gateway call
    const gatewayResponse = await simulatePaymentGateway({
      amount: paymentData.amount,
      method: paymentData.method,
    });

    if (gatewayResponse.success) {
      // 1. Update Payment Record
      payment.status = "completed";
      payment.transactionId = gatewayResponse.transactionId;
      payment.paymentGatewayResponse = gatewayResponse.gatewayResponse;
      await payment.save({ session });

      // 2. Update Booking Record & Clear TTL Expiration
      booking.status = "confirmed";
      booking.paymentStatus = "completed";
      booking.expiresAt = undefined; // Prevents TTL deletion
      await booking.save({ session });

      // 3. Write seats to Show document permanently
      await Show.findByIdAndUpdate(
        booking.show,
        { $push: { bookedSeats: { $each: booking.seats } } },
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return {
        payment,
        booking,
        message: "Payment successful! Your booking is confirmed.",
      };
    } else {
      // Payment Failed Handling
      payment.status = "failed";
      payment.paymentGatewayResponse = gatewayResponse.gatewayResponse;
      await payment.save({ session });

      booking.status = "cancelled";
      booking.paymentStatus = "failed";
      booking.expiresAt = new Date(); // Instantly trigger TTL cleanup
      await booking.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        payment,
        booking,
        message: "Payment failed. Seats have been released.",
      };
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.name === "CastError")
      throw new AppError(
        `Invalid ID format: "${error.value}"`,
        StatusCodes.BAD_REQUEST,
      );
    throw error;
  }
};

/**
 * Get payment history for a user
 */
const getUserPaymentsService = async (userId, status = null) => {
  const validStatuses = ["pending", "completed", "failed", "refunded"];
  if (status && !validStatuses.includes(status)) {
    throw new AppError(
      `Invalid payment status. Use one of: ${validStatuses.join(", ")}.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const query = { user: userId };
  if (status) query.status = status;

  return await Payment.find(query)
    .populate({
      path: "booking",
      populate: {
        path: "show",
        populate: [
          { path: "movie", select: "name duration" },
          { path: "theatre", select: "name city" },
        ],
      },
    })
    .sort({ createdAt: -1 });
};

/**
 * Get single payment by ID
 */
const getPaymentByIdService = async (paymentId, userId) => {
  try {
    const payment = await Payment.findById(paymentId)
      .populate({
        path: "booking",
        populate: {
          path: "show",
          populate: [
            { path: "movie", select: "name duration" },
            { path: "theatre", select: "name city" },
          ],
        },
      })
      .populate("user", "name email");

    if (!payment)
      throw new AppError("Payment not found", StatusCodes.NOT_FOUND);
    if (payment.user._id.toString() !== userId)
      throw new AppError("Unauthorized", StatusCodes.FORBIDDEN);

    return payment;
  } catch (error) {
    if (error.name === "CastError")
      throw new AppError(
        `Invalid payment ID: "${error.value}"`,
        StatusCodes.BAD_REQUEST,
      );
    throw error;
  }
};

const requestRefundService = async (bookingId, reason, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking)
      throw new AppError("Booking not found", StatusCodes.NOT_FOUND);
    if (booking.user.toString() !== user.id)
      throw new AppError("Unauthorized", StatusCodes.FORBIDDEN);
    if (booking.status !== "confirmed")
      throw new AppError(
        "Only confirmed bookings can be refunded",
        StatusCodes.BAD_REQUEST,
      );
    if (booking.paymentStatus === "refunded")
      throw new AppError("Already refunded", StatusCodes.BAD_REQUEST);

    const payment = await Payment.findOne({
      booking: bookingId,
      status: "completed",
    }).session(session);
    if (!payment)
      throw new AppError("No completed payment found", StatusCodes.NOT_FOUND);

    payment.status = "refunded";
    payment.refundDetails = {
      refundAmount: payment.amount,
      refundReason: reason?.trim() || "Customer requested refund",
      refundedAt: new Date(),
    };
    await payment.save({ session });

    await Show.findByIdAndUpdate(
      booking.show,
      { $pull: { bookedSeats: { $in: booking.seats } } },
      { session },
    );

    booking.status = "cancelled";
    booking.paymentStatus = "refunded";
    booking.expiresAt = undefined;
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();
    return {
      payment,
      booking,
      message: `Refund of ${payment.amount} processed successfully`,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.name === "CastError")
      throw new AppError(
        `Invalid ID format: "${error.value}"`,
        StatusCodes.BAD_REQUEST,
      );
    throw error;
  }
};

module.exports = {
  processPaymentService,
  getUserPaymentsService,
  getPaymentByIdService,
  requestRefundService,
};
