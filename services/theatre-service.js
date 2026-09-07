const { StatusCodes } = require("http-status-codes");
const { Theatre } = require("../models/theatre-model.js");
const { AppError } = require("../utils/app-error");

/**
 * Service to create a new theatre in the database.
 * @param {Object} data - Theatre data containing name, description, city, pinCode, address
 * @returns {Promise<Object>} Created theatre object
 * @throws {AppError} If theatre creation fails or validation errors occur
 * @param {userId} - set the currently logged in user as the owner of theatre which is being created.
 */
const createTheatreService = async (data, userId) => {
  try {
    const theatre = await Theatre.create({ ...data, owner: { userId } });
    if (!theatre) {
      throw new AppError("Theatre cannot be created", StatusCodes.NO_CONTENT);
    }
    return theatre;
  } catch (error) {
    if (error.name === "ValidationError") {
      let err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      throw new AppError(
        "Validation failed",
        StatusCodes.UNPROCESSABLE_ENTITY,
        err,
      );
    }

    if (error.name === "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new AppError("Duplicate field", StatusCodes.UNPROCESSABLE_ENTITY, {
        [field]: "already exists",
      });
    }

    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Service to fetch theatres with optional filtering and pagination.
 * Supports filtering by city, name, and pincode.
 * Supports pagination via limit and skip query parameters.
 * @param {Object} filter - Query parameters containing optional filters and pagination
 * @param {string} [filter.city] - Filter theatres by city name
 * @param {string} [filter.name] - Filter theatres by name
 * @param {number} [filter.pincode] - Filter theatres by pincode
 * @param {number} [filter.limit] - Number of results per page (default: 5)
 * @param {number} [filter.skip] - Page number for pagination (0-indexed)
 * @returns {Promise<Object>} Array of theatres with pagination metadata
 * @throws {AppError} If no theatres are found
 */
const fetchTheatre = async (filter) => {
  let query = {};
  // Build filter query based on provided parameters
  if (filter.city) {
    query.city = filter.city;
  }
  if (filter && filter.name) {
    query.name = filter.name;
  }
  if (filter && filter.pincode) {
    query.pincode = filter.pincode;
  }

  // setup limit and page number
  const limit = filter.limit ? parseInt(filter.limit) : 5;
  const page = filter.page ? parseInt(filter.page) : 1;

  const skip = (page - 1) * limit;

  // Execute query with pagination options
  const theatres = await Theatre.find(query).skip(skip).limit(limit);

  // Get total count for pagination metadata
  const totalTheatres = await Theatre.countDocuments(query);
  const totalPages = Math.ceil(totalTheatres / limit);

  // find() always returns an array, so check length instead of truthiness
  if (theatres.length === 0) {
    throw new AppError(
      "Not able to find the query theatre",
      StatusCodes.NOT_FOUND,
    );
  }

  // Return theatres along with pagination metadata
  return {
    data: theatres,
    pagination: {
      totalTheatres,
      totalPages,
      currentPage: page,
      limit: limit,
    },
  };
};

/**
 * Service to delete a theatre by its ID.
 * @param {string} id - Theatre ID to delete
 * @returns {Promise<Object>} Deletion result
 * @throws {AppError} If theatre is not found
 */
const deleteTheatreById = async (id, user) => {
  const theatre = await Theatre.findById(id)
  if (!theatre) {
    throw new AppError("No theatre found by this id", StatusCodes.NOT_FOUND);
  }
  if (theatre.owner.toString() !== user.id && user.userRole !== 'admin') {
    throw new AppError("You are not authorized to delete this theatre", StatusCodes.FORBIDDEN)
  }
  await Theatre.deleteOne({ id });

  return theatre;
};

/**
 * Service to update theatre details by ID.
 * @param {string} id - Theatre ID to update
 * @param {Object} data - Updated theatre data
 * @returns {Promise<Object>} Updated theatre object
 * @throws {AppError} If theatre is not found or validation fails
 */
const updateTheatreById = async (id, data, user) => {
  try {
    const theatre = await Theatre.findById(id);
    if (!theatre) {
      throw new AppError("No theatre found by this id", StatusCodes.NOT_FOUND);
    }
    if (theatre.owner.toString() !== user.id && user.userRole !== 'admin') {
      throw new AppError("You are not authorized to update the theatre", StatusCodes.FORBIDDEN)
    }
    Object.assign(theatre, data);
    await theatre.save();
    return theatre;
  } catch (error) {
    if (error.name == "ValidationError") {
      const err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      throw new AppError(
        "Validation failed",
        StatusCodes.UNPROCESSABLE_ENTITY,
        err,
      );
    }
    throw error;
  }
};

/**
 * Service to insert or remove movies from a theatre.
 * @param {string} theatreId - ID of the theatre to update
 * @param {Array<string>} movieIds - Array of movie IDs to insert or remove
 * @param {boolean} insert - true to insert movies, false to remove movies
 * @returns {Promise<Object>} Updated theatre with populated movies
 * @throws {AppError} If theatre is not found
 */
const insertMoviesIntoTheatre = async (theatreId, movieIds, insert, user) => {
  // Find the theatre by ID
  const theatre = await Theatre.findById(theatreId);
  if (!theatre) {
    throw new AppError("No theatre found by this id", StatusCodes.NOT_FOUND);
  }

  if (theatre.owner.toString() !== user.id && user.userRole !== 'admin') {
    throw new AppError('You are not authorized to insert movies into theatre', StatusCodes.FORBIDDEN)
  }
  if (insert) {
    // Insert mode: Add movie IDs to the theatre's movies array
    movieIds.forEach((movieId) => {
      // Avoid adding duplicate movie IDs
      const exists = theatre.movies.some(
        (id) => id.toString() === movieId.toString(),
      );
      if (!exists) {
        theatre.movies.push(movieId);
      }
    });
  } else {
    // Remove mode: Remove specified movie IDs from the theatre's movies array
    // Convert movieIds to strings for consistent comparison with ObjectIds
    const idsToRemove = new Set(movieIds.map((id) => id.toString()));

    // Filter out any movie whose string representation exists in the Set
    theatre.movies = theatre.movies.filter(
      (id) => !idsToRemove.has(id.toString()),
    );
  }

  // Save the updated theatre
  await theatre.save();

  // Return the theatre with populated movie details
  return theatre.populate("movies");
};

/**
 * service to get the single theatres and all of it's movies
 * @param {string} theatreId - Id of the theatre which we want to fetch
 * @returns {Promise<Object>} - fetch the single theatres by id with all of it's movies
 * @throws {AppError} If theatre is not found
 */
const getSingleThreateWithMovies = async (theatreId) => {
  // Find the theatre by ID
  const theatre = await Theatre.findById(theatreId).populate("movies");
  if (!theatre) {
    throw new AppError("No theatre found by this id", StatusCodes.NOT_FOUND);
  }

  return theatre;
};

/**
 * This service will list all the theatres where a particular movie is running
 * @param {string} movieId
 * @returns {Promise<Object>} List of theatres showing the movie
 * @throws {AppError} If no theatres found or invalid movie ID format
 */
const getAllTheatresByMovie = async (movieId) => {
  try {
    const theatres = await Theatre.find({ movies: movieId }).populate("movies");

    if (theatres.length === 0) {
      throw new AppError(
        "No theatres found running this movie",
        StatusCodes.NOT_FOUND,
      );
    }

    return theatres;
  } catch (error) {
    if (error.name === "CastError") {
      throw new AppError(
        `Invalid movie ID format: "${error.value}"`,
        StatusCodes.BAD_REQUEST,
      );
    }

    // Re-throw AppError as-is, wrap other errors
    if (error instanceof AppError) throw error;
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Checks if a specific movie is currently running in a specific theatre.
 * @param {string} theatreId - ID of the theatre to check
 * @param {string} movieId - ID of the movie to check for
 * @returns {Promise<Object>} Result object with theatre details and presence status
 * @throws {AppError} If theatre not found or invalid ID format
 */
const checkMovieInTheatre = async (theatreId, movieId) => {
  try {
    // 1. Find the theatre
    const theatre = await Theatre.findById(theatreId);

    if (!theatre) {
      throw new AppError("Theatre not found", StatusCodes.NOT_FOUND);
    }

    // 2. Check if the movie is in the theatre's movies array
    const isPresent = theatre.movies.some((savedMovieId) => {
      return savedMovieId.toString() === movieId.toString();
    });

    // 3. Return the result
    return {
      theatreId: theatre._id,
      theatreName: theatre.name,
      movieId: movieId,
      isPresent: isPresent,

      message: isPresent
        ? "Movie is currently running at this theatre"
        : "Movie is not running at this theatre",
    };
  } catch (error) {
    if (error.name === "CastError") {
      throw new AppError(
        `Invalid ID format: "${error.value}"`,
        StatusCodes.BAD_REQUEST,
      );
    }

    if (error instanceof AppError) throw error;
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  createTheatreService,
  fetchTheatre,
  deleteTheatreById,
  updateTheatreById,
  insertMoviesIntoTheatre,
  getSingleThreateWithMovies,
  getAllTheatresByMovie,
  checkMovieInTheatre,
};
