const { StatusCodes } = require("http-status-codes");
const { Movie } = require("../models/movie-model");
const { Theatre } = require("../models/theatre-model");
const { Show } = require("../models/shows-model");
const { Booking } = require("../models/booking-model");
const { AppError } = require("../utils/app-error");

/**
 * Converts a time string in HH:MM format to total minutes.
 * @param {string} timeStr - Time in "HH:MM" format (e.g., "14:30")
 * @returns {number} Total minutes from midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":");
  return Number(hours) * 60 + Number(minutes);
};

/**
 * Calculates the end time of a show based on start time and duration.
 * @param {string} startTime - Start time in "HH:MM" format
 * @param {number} duration - Duration in minutes
 * @returns {string} End time in "HH:MM" format
 */
const calculateEndTime = (startTime, duration) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + duration;

  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
};

/**
 * Creates a new show after validating all business rules.
 * @param {Object} showData - Show details from request body
 * @param {Object} user - Authenticated user object
 * @returns {Promise<Object>} Created show document
 */
const createShowService = async (showData, user) => {
  try {
    // Validate that the movie exists
    const movie = await Movie.findById(showData.movieId);
    if (!movie) {
      throw new AppError(
        "The selected movie does not exist. Please choose a valid movie.",
        StatusCodes.NOT_FOUND,
      );
    }

    // Validate that the theatre exists
    const theatre = await Theatre.findById(showData.theatreId);
    if (!theatre) {
      throw new AppError(
        "The selected theatre does not exist. Please choose a valid theatre.",
        StatusCodes.NOT_FOUND,
      );
    }

    // Only theatre owner or admin can create shows
    if (theatre.owner.toString() !== user.id && user.userRole !== "admin") {
      throw new AppError(
        "You are not authorized to create shows for this theatre. Only the theatre owner or admin can perform this action.",
        StatusCodes.FORBIDDEN,
      );
    }

    // Ensure the movie is currently running in the selected theatre
    const movieRunningInTheatre = theatre.movies.some(
      (movieId) => movieId.toString() === movie._id.toString(),
    );
    if (!movieRunningInTheatre) {
      throw new AppError(
        "This movie is not currently running in the selected theatre.",
        StatusCodes.NOT_FOUND,
      );
    }

    // Calculate show end time based on movie duration
    const endTime = calculateEndTime(showData.startTime, movie.duration);

    const newStartMinutes = timeToMinutes(showData.startTime);
    const newEndMinutes = timeToMinutes(endTime);

    // Check for overlapping shows on the same screen and date
    const overlappingShow = await Show.findOne({
      theatre: showData.theatreId,
      screen: showData.screen,
      date: showData.date,
      status: { $ne: "cancelled" }, // Ignore cancelled shows
      startingTimeMinutes: { $lt: newEndMinutes },
      endTimeMinutes: { $gt: newStartMinutes },
    });

    if (overlappingShow) {
      throw new AppError(
        `Time slot conflicts with an existing show (${overlappingShow.startTime} - ${overlappingShow.endTime}). Please choose a different time.`,
        StatusCodes.CONFLICT,
      );
    }

    // Prevent scheduling shows in the past
    const showDate = new Date(showData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (showDate < today) {
      throw new AppError(
        "Show date cannot be in the past. Please select a future date.",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Create and save the new show
    const show = await Show.create({
      ...showData,
      endTime,
    });

    return show;
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      const err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      throw new AppError(
        "Please check the provided details. Some fields have invalid values.",
        StatusCodes.UNPROCESSABLE_ENTITY,
        err,
      );
    }
    if (error.name === "CastError") {
      throw new AppError(
        `Invalid ID format: "${error.value}". Please provide a valid ID.`,
        StatusCodes.BAD_REQUEST,
      );
    }
    throw error;
  }
};

/**
 * Retrieves all shows with optional filters.
 * @param {Object} filter - Query parameters for filtering
 * @returns {Promise<Array>} List of shows
 */
const getAllShowsService = async (filter) => {
  try {
    const query = {};
    if (filter.movie) query.movie = filter.movie;
    if (filter.theatre) query.theatre = filter.theatre;
    if (filter.date) query.date = filter.date;
    if (filter.status) query.status = filter.status;

    const shows = await Show.find(query)
      .populate("movie", "name duration language")
      .populate("theatre", "name city")
      .sort({ date: 1, startTime: 1 }); // Sort by date first, then by start time

    return shows;
  } catch (error) {
    throw new AppError(
      "Failed to fetch shows. Please try again later.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Retrieves upcoming shows for a specific movie.
 * @param {string} movieId - Movie ID
 * @returns {Promise<Array>} List of upcoming shows
 */
const getShowsByMovieService = async (movieId) => {
  try {
    const shows = await Show.find({ movie: movieId, status: "upcoming" })
      .populate("theatre", "name city")
      .sort({ date: 1, startTime: 1 });

    if (shows.length === 0) {
      throw new AppError(
        "No upcoming shows found for this movie. Please check back later.",
        StatusCodes.NOT_FOUND,
      );
    }
    return shows;
  } catch (error) {
    if (error.name === "CastError") {
      throw new AppError(
        `Invalid movie ID format: "${error.value}". Please provide a valid movie ID.`,
        StatusCodes.BAD_REQUEST,
      );
    }
    throw error;
  }
};

/**
 * Retrieves all shows for a specific theatre.
 * @param {string} theatreId - Theatre ID
 * @returns {Promise<Array>} List of shows
 */
const getShowsByTheatreService = async (theatreId) => {
  try {
    const shows = await Show.find({ theatre: theatreId })
      .populate("movie", "name duration language")
      .sort({ date: 1, startTime: 1 });

    if (shows.length === 0) {
      throw new AppError(
        "No shows found for this theatre. Please check back later.",
        StatusCodes.NOT_FOUND,
      );
    }
    return shows;
  } catch (error) {
    if (error.name === "CastError") {
      throw new AppError(
        `Invalid theatre ID format: "${error.value}". Please provide a valid theatre ID.`,
        StatusCodes.BAD_REQUEST,
      );
    }
    throw error;
  }
};

/**
 * Retrieves a single show by its ID.
 * @param {string} showId - Show ID
 * @returns {Promise<Object>} Show document
 */
const getShowByIdService = async (showId) => {
  try {
    const show = await Show.findById(showId)
      .populate("movie", "name duration language")
      .populate("theatre", "name city");

    if (!show) {
      throw new AppError(
        "Show not found. Please check the show ID and try again.",
        StatusCodes.NOT_FOUND,
      );
    }

    return show;
  } catch (error) {
    if (error.name === "CastError") {
      throw new AppError(
        `Invalid show ID format: "${error.value}". Please provide a valid show ID.`,
        StatusCodes.BAD_REQUEST,
      );
    }
    throw error;
  }
};

/**
 * Updates an existing show after validating ownership and time conflicts.
 * @param {string} showId - Show ID to update
 * @param {Object} updateData - Fields to update
 * @param {Object} user - Authenticated user object
 * @returns {Promise<Object>} Updated show document
 */
const updateShowService = async (showId, updateData, user) => {
  try {
    const show = await Show.findById(showId);
    if (!show) {
      throw new AppError(
        "Show not found. Please check the show ID and try again.",
        StatusCodes.NOT_FOUND,
      );
    }

    const theatre = await Theatre.findById(show.theatre);

    // Only theatre owner or admin can update shows
    if (theatre.owner.toString() !== user.id && user.userRole !== "admin") {
      throw new AppError(
        "You are not authorized to update this show. Only the theatre owner or admin can perform this action.",
        StatusCodes.UNAUTHORIZED,
      );
    }

    // If time, screen, or date is being updated, check for conflicts
    if (updateData.screen || updateData.startTime || updateData.date) {
      const newUpdatedTime = updateData.startTime || show.startTime;
      const newUpdatedScreen = updateData.screen || show.screen;
      const newUpdatedDate = updateData.date || show.date;

      const movie = await Movie.findById(show.movie);
      if (!movie) {
        throw new AppError(
          "Associated movie not found. Please contact support.",
          StatusCodes.NOT_FOUND,
        );
      }

      const newEndTime = calculateEndTime(newUpdatedTime, movie.duration);

      const newStartMins = timeToMinutes(newUpdatedTime);
      const newEndMins = timeToMinutes(newEndTime);

      // Find other shows on the same screen and date (excluding current show)
      const otherShows = await Show.find({
        _id: { $ne: showId },
        theatre: show.theatre,
        date: newUpdatedDate,
        screen: newUpdatedScreen,
        status: { $ne: "cancelled" },
      });

      // Check for time overlap with other shows
      const hasOverlap = otherShows.some((otherShow) => {
        const otherStartMins = timeToMinutes(otherShow.startTime);
        const otherEndMins = timeToMinutes(otherShow.endTime);

        return newStartMins < otherEndMins && newEndMins > otherStartMins;
      });

      if (hasOverlap) {
        throw new AppError(
          "Time slot conflicts with an existing show. Please choose a different time.",
          StatusCodes.CONFLICT,
        );
      }

      show.startTime = newUpdatedTime;
      show.screen = newUpdatedScreen;
      show.date = newUpdatedDate;
      show.endTime = newEndTime;
    }

    // Update price if provided
    if (updateData.price) {
      show.price = { ...show.price, ...updateData.price };
    }

    // Update total seats if provided
    if (updateData.totalSeats) {
      show.totalSeats = { ...show.totalSeats, ...updateData.totalSeats };
    }

    await show.save();
    return show;
  } catch (error) {
    if (error.name === "ValidationError") {
      const err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      throw new AppError(
        "Please check the provided details. Some fields have invalid values.",
        StatusCodes.UNPROCESSABLE_ENTITY,
        err,
      );
    }
    if (error.name === "CastError") {
      throw new AppError(
        `Invalid ID format: "${error.value}". Please provide a valid ID.`,
        StatusCodes.BAD_REQUEST,
      );
    }
    throw error;
  }
};

/**
 * Deletes a show if there are no active bookings.
 * @param {string} showId - Show ID to delete
 * @param {Object} user - Authenticated user object
 * @returns {Promise<Object>} Success message
 */
const deleteShowService = async (showId, user) => {
  try {
    const show = await Show.findById(showId);
    if (!show) {
      throw new AppError(
        "Show not found. Please check the show ID and try again.",
        StatusCodes.NOT_FOUND,
      );
    }

    const theatre = await Theatre.findById(show.theatre);

    // Only theatre owner or admin can delete shows
    if (theatre.owner.toString() !== user.id && user.userRole !== "admin") {
      throw new AppError(
        "You are not authorized to delete this show. Only the theatre owner or admin can perform this action.",
        StatusCodes.UNAUTHORIZED,
      );
    }

    // Check for active bookings (pending or confirmed)
    const activeBookingsCount = await Booking.countDocuments({
      show: showId,
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBookingsCount > 0) {
      throw new AppError(
        "Cannot delete this show because there are active bookings. Please cancel the show instead.",
        StatusCodes.BAD_REQUEST,
      );
    }

    await show.deleteOne();
    return { message: "Show deleted successfully" };
  } catch (error) {
    if (error.name === "CastError") {
      throw new AppError(
        `Invalid show ID format: "${error.value}". Please provide a valid show ID.`,
        StatusCodes.BAD_REQUEST,
      );
    }
    throw error;
  }
};

module.exports = {
  createShowService,
  getAllShowsService,
  getShowsByMovieService,
  getShowsByTheatreService,
  getShowByIdService,
  updateShowService,
  deleteShowService,
};
