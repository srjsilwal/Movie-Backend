const express = require("express");
const { isAuthenticated, isCustomer } = require("../middlewares/user-middleware");
const {
  createBooking,
  getAllBookings,
  getAllBookingsById,
  cancelBooking,
  getSeatAvailability,
} = require("../controllers/booking-controller");
const { validateBookingRequest } = require("../middlewares/bodyRequestValidators");
const router = express.Router();

router.use(isAuthenticated);

// PUBLIC TO AUTHENTICATED USERS (any logged-in user)
router.get("/show/:showId/seats", getSeatAvailability);
router.get("/", getAllBookings);
router.get("/:bookingId", getAllBookingsById);

// CUSTOMER-ONLY ROUTES (only customers can book)
router.post(
  "/show/:showId",
  isCustomer,
  validateBookingRequest,
  createBooking
);
router.patch("/:bookingId/cancel", isCustomer, cancelBooking);

module.exports = { bookingRouter: router };
