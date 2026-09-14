const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
      required: [true, "Booking reference is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1"],
    },
    method: {
      type: String,
      enum: {
        values: ["card", "upi", "wallet", "netbanking"],
        message: "Invalid payment method",
      },
      required: [true, "Payment method is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "refunded"],
        message: "Invalid payment status",
      },
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Allow null for pending/failed payments
    },
    paymentGatewayResponse: {
      type: mongoose.Schema.Types.Mixed, // Store raw gateway response
      default: null,
    },
    refundDetails: {
      refundAmount: { type: Number, default: 0 },
      refundReason: { type: String, default: null },
      refundedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, status: 1 });
// paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model("payment", paymentSchema);

module.exports = { Payment };
