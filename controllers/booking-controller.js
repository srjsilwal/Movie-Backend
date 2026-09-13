const {
  createBookingService,
  getAllBookingsService,
  getBookingsByIdService,
  cancelBookingService,
  getSeatAvailabilityService,
} = require("../services/booking-service");
const { StatusCodes } = require("http-status-codes");
const { createSuccessResponse } = require("../utils/responsebody");

const createBooking = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const { seats } = req.body;
    const response = await createBookingService(showId, seats, req.user);
    return res
      .status(StatusCodes.CREATED)
      .json(
        createSuccessResponse(
          response,
          `Booking created. Complete payment within 10 minutes. Booking number: ${response.bookingNumber}.`,
        ),
      );
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const response = await getAllBookingsService(userId, status);
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Bookings fetched successfully."));
  } catch (error) {
    next(error);
  }
};

const getAllBookingsById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;
    const response = await getBookingsByIdService(bookingId, userId);
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Booking fetched successfully."));
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { bookingId } = req.params;
      const response = await cancelBookingService(bookingId, userId);
       return res
         .status(StatusCodes.OK)
         .json(
           createSuccessResponse(response, "Booking cancelled successfully."),
         );
  } catch (error) {
    next(error);
  }
};

const getSeatAvailability = async (req, res, next) => { 
    try {
        const { showId } = req.params
        const response = await getSeatAvailabilityService(showId)
          return res
            .status(StatusCodes.OK)
            .json(
              createSuccessResponse(
                response,
                "Seat availability fetched successfully.",
              ),
            );
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createBooking,
    getAllBookings,
    getAllBookingsById,
    cancelBooking,
    getSeatAvailability
};
