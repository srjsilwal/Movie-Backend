const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "show",
      required: [true, "Show is required"],
    },
    seats: {
      type: [String],
      required: [true, "Seats are required"],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "expired", "cancelled"],
        message:
          "Status must be according to the values[pending, confirmed, expired, cancelled]",
      },
      default: "pending",
    },
    expiredAt: {
      type: Date,
      required: true,
    },
  },
  { timeStamp: true },
);

const Booking = mongoose.model("booking", bookingSchema);

module.exports = { Booking };
