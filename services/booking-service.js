const { StatusCodes } = require("http-status-codes");
const { Show } = require("../models/shows-model.js");
const { AppError } = require("../utils/app-error.js");
const { Booking } = require("../models/booking-model.js");

const getSeatTier = (seat) => {
  const row = seat[0];
  if (row >= "A" && row <= "E") return "regular";
  if (row >= "F" && row <= "J") return "gold";
  if (row >= "K" && row <= "M") return "platinum";
  return null;
};

const calculateTotalPrice = (seatTiers, prices) => {
  const regularTotal = seatTiers.regular.length * (prices.regular ?? 200);
  const goldTotal = seatTiers.gold.length * (prices.gold ?? 350);
  const platinumTotal = seatTiers.platinum.length * (prices.platinum ?? 500);
  return regularTotal + goldTotal + platinumTotal;
};

const tierRows = {
  regular: ["A", "B", "C", "D", "E"],
  gold: ["F", "G", "H", "I", "J"],
  platinum: ["K", "L", "M"],
};

/** Builds the real seat map from this show's configured capacity. */
const getShowSeatMap = (totalSeats) => {
  const seatMap = { regular: [], gold: [], platinum: [] };
  for (const [tier, rows] of Object.entries(tierRows)) {
    const capacity = totalSeats[tier] || 0;
    for (let position = 0; position < capacity; position++) {
      const row = rows[Math.floor(position / 20)];
      // REVIEW: the API format only supports 20 seats per row (A1–M20).
      // Show validation should reject a tier capacity beyond its row capacity.
      if (!row) break;
      seatMap[tier].push(`${row}${(position % 20) + 1}`);
    }
  }
  return seatMap;
};

const generateBookingNumber = () => {
  const timestamps = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamps}-${random}`;
};

const createBookingService = async (showId, seats, user) => {
  try {
    // check if the show is running or not
    const show = await Show.findById(showId);
    if (!show) throw new AppError("Show not found", StatusCodes.NOT_FOUND);

    // only upcoming show can be booked.
    if (show.status !== "upcoming")
      throw new AppError(
        `Cannot book seats for a ${show.status} show`,
        StatusCodes.BAD_REQUEST,
      );

    const showDateTime = new Date(show.date);
    const [hours, minutes] = show.startTime.split(":").map(Number);
    showDateTime.setHours(hours, minutes, 0, 0);
    if (showDateTime < new Date())
      throw new AppError(
        "Cannot book seats for a past show",
        StatusCodes.BAD_REQUEST,
      );

  
    const uniqueSeats = [...new Set(seats)];
    if (uniqueSeats.length !== seats.length)
      throw new AppError("Duplicate seats in request", StatusCodes.BAD_REQUEST);

    const seatTiers = { regular: [], gold: [], platinum: [] };
    const seatRegex = /^[A-M][1-9][0-9]?$/;
    for (const seat of seats) {
      if (!seatRegex.test(seat)) {
        throw new AppError(`Invalid seat: "${seat}"`, StatusCodes.BAD_REQUEST);
      }
      const tier = getSeatTier(seat);
      seatTiers[tier].push(seat);
    }

    const validShowSeats = new Set(Object.values(getShowSeatMap(show.totalSeats)).flat());
    if (seats.some((seat) => !validShowSeats.has(seat))) {
      throw new AppError("One or more selected seats do not exist for this show.", StatusCodes.BAD_REQUEST);
    }

    // check if seats are already booked or not, if already booked then throw an error.
    if (seats.some((seat) => show.bookedSeats.includes(seat))) {
      throw new AppError(
        "One or more selected seats are already booked",
        StatusCodes.CONFLICT,
      );
    }

    // findById accepts only an _id, not a query object. 
    const activeLock = await Booking.findOne({
      show: showId,
      status: "pending",
      seats: { $in: seats },
      expiresAt: { $gt: new Date() },
    });

    if (activeLock) {
      throw new AppError(
        "One or more selected seats are currently held by another user",
        StatusCodes.CONFLICT,
      );
    }

    // Create a pending reservation. A payment handler must later confirm it
    // and add its seats to show.bookedSeats before the hold expires.
    const booking = await Booking.create({
      show: showId,
      user: user._id,
      seats,
      seatTiers,
      totalPrice: calculateTotalPrice(seatTiers, show.price),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      bookingNumber: generateBookingNumber(),
    });

    return await Booking.findById(booking._id)
      .populate({ path: "show", populate: ["movie", "theatre"] })
      .populate("user", "name email");
  } catch (error) {
    if (error.name === "CastError")
      throw new AppError(
        `Invalid ID format: "${error.value}"`,
        StatusCodes.BAD_REQUEST,
      );
    throw error;
  }
};

const getAllBookingsService = async (userId, status = null) => {
  const validStatuses = ["pending", "confirmed", "cancelled", "expired"];
  if (status && !validStatuses.includes(status)) {
    throw new AppError(
      `Invalid booking status. Use one of: ${validStatuses.join(", ")}.`,
      StatusCodes.BAD_REQUEST,
    );
  }
  const query = { user: userId };
  if (status) query.status = status;

  return await Booking.find(query)
    .populate({ path: "show", populate: ["movie", "theatre"] })
    .sort({ createdAt: -1 }); // sortBy newest
};

const getBookingsByIdService = async (bookingId, userId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate({ path: "show", populate: ["movie", "theatre"] })
      .populate("user", "name email");
    if (!booking)
      throw new AppError("Booking not found", StatusCodes.NOT_FOUND);
    if (booking.user.toString() !== userId)
      throw new AppError("Unauthorized", StatusCodes.FORBIDDEN);

    return booking;
  } catch (error) {
    if (error.name === "CastError")
      throw new AppError(
        `Invalid booking ID: "${error.value}"`,
        StatusCodes.BAD_REQUEST,
      );
    throw error;
  }
};

const cancelBookingService = async (bookingId, userId) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking)
      throw new AppError("Booking not found", StatusCodes.NOT_FOUND);

    if (booking.user.toString() !== userId)
      throw new AppError("Unauthorized", StatusCodes.FORBIDDEN);

    if (booking.status === "cancelled" || booking.status === "expired") {
      throw new AppError(
        `Booking is already ${booking.status}`,
        StatusCodes.BAD_REQUEST,
      );
    }

    if (booking.status === "confirmed") {
      throw new AppError(
        "Cannot cancel confirmed booking directly",
        StatusCodes.BAD_REQUEST,
      );
    }

    booking.status = "cancelled";
    await booking.save();
    return booking;
  } catch (error) {
    if (error.name === "CastError")
      throw new AppError(
        `Invalid booking ID: "${error.value}"`,
        StatusCodes.BAD_REQUEST,
      );
    throw error;
  }
};

const getSeatAvailabilityService = async (showId) => {
    try {
        
        const show = await Show.findById(showId).select("bookedSeats totalSeats");
        if (!show) throw new AppError("Show not found", StatusCodes.NOT_FOUND);
      
        const pendingBookings = await Booking.find({
          show: showId,
          status: "pending",
          expiresAt: { $gt: new Date() },
        }).select("seats");
      
        const lockedSeats = pendingBookings.flatMap((b) => b.seats); // .flatMap() flattens those nested arrays into one single list of locked seats:
      
        const unavailableSeats = new Set([...show.bookedSeats, ...lockedSeats]);
      
        const showSeatMap = getShowSeatMap(show.totalSeats);
        const available = Object.fromEntries(
          Object.entries(showSeatMap).map(([tier, seats]) => [
            tier,
            seats.filter((seat) => !unavailableSeats.has(seat)),
          ]),
        );
      
        return {
          showId: show._id,
          bookedSeats: show.bookedSeats,
          lockedSeats,
          availableSeats: available,
          totalSeatsCount: Object.values(showSeatMap).flat().length,
          availableSeatsCount: Object.values(available).flat().length,
        };
    } catch (error) {
         if (error.name === "CastError")
           throw new AppError(
             `Invalid show ID: "${error.value}"`,
             StatusCodes.BAD_REQUEST,
           );
         throw error;
    }
};

module.exports = {
  createBookingService,
  getAllBookingsService,
  getBookingsByIdService,
  cancelBookingService,
  getSeatAvailabilityService,
};
