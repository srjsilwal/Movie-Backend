const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
      required: [true, "Booking is required"],
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["card", "upi", "wallet", "netbanking"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // allow null values as well
    },
  },
  { timeStamp: true },
);

const Payment = mongoose.model("payment", paymentSchema);

module.exports = { Payment };
