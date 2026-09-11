const mongoose = require("mongoose");

/**
 * Show schema defines the structure for movie show documents.
 * Each show represents a specific movie screening at a theatre on a given date and time.
 */
const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "movie",
      required: [true, "Movie is required"],
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "theatre",
      required: [true, "Theatre is required"],
    },
    date: {
      type: Date,
      required: [true, "Show date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Start time must be in HH:MM format (24-hour)",
      ],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "End time must be in HH:MM format (24-hour)",
      ],
    },
    price: {
      regular: {
        type: Number,
        default: 200,
        min: [0, "Price cannot be negative"],
      },
      gold: {
        type: Number,
        default: 300,
        min: [0, "Price cannot be negative"],
      },
      platinum: {
        type: Number,
        default: 400,
        min: [0, "Price cannot be negative"],
      },
    },
    screen: {
      type: String,
      required: [true, "Screen number is required"],
      enum: {
        values: ["Screen 1", "Screen 2", "Screen 3", "Screen 4", "Screen 5"],
        message: "Screen must be one of: Screen 1, Screen 2, Screen 3, Screen 4, or Screen 5",
      },
    },
    totalSeats: {
      regular: {
        type: Number,
        default: 50,
        min: [0, "Seats cannot be negative"],
      },
      gold: { type: Number, default: 30, min: [0, "Seats cannot be negative"] },
      platinum: {
        type: Number,
        default: 20,
        min: [0, "Seats cannot be negative"],
      },
    },
    bookedSeats: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ["upcoming", "ongoing", "completed", "cancelled"],
        message: "Status must be one of: upcoming, ongoing, completed, or cancelled",
      },
      default: "upcoming",
    },
  },
  { timestamps: true },
);

const Show = mongoose.model("show", showSchema);

module.exports = { Show };
