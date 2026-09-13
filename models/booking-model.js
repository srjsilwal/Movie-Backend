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
      type: [String], // ["A1", "A2", "B5"]
      required: [true, "Seats are required"],
      validate: {
        validator: (seats) => seats.length > 0 && seats.length <= 10,
        message: "You can book between 1 and 10 seats at a time",
      },
    },
    seatTiers: {
      regular: { type: [String], default: [] }, // ["A1", "A2"]
      gold: { type: [String], default: [] }, // ["F1"]
      platinum: { type: [String], default: [] }, // ["K1"]
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled", "expired"],
        message: "Invalid booking status",
      },
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "refunded"],
        message: "Invalid payment status",
      },
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: false,
      index: { expires: 0 }, // TTL index - auto-delete after expiresAt
    },
    bookingNumber: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ show: 1, status: 1 });


const Booking = mongoose.model("booking", bookingSchema);

module.exports = { Booking };
