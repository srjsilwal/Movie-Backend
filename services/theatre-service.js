const { StatusCodes } = require("http-status-codes");
const { Theatre } = require("../models/theatre-model.js");

/**
 * Service to create a new theatre in the database.
 * @param {Object} data - Theatre data containing name, description, city, pinCode, address
 * @returns {Promise<Object>} Created theatre object or error response
 */
const createTheatreService = async (data) => {
  try {
    const theatre = await Theatre.create(data);
    if (!theatre) {
      return {
        err: "Theatre cannot be created",
        code: StatusCodes.NO_CONTENT,
      };
    }
    return theatre;
  } catch (error) {
    if (error.name === "ValidationError") {
      let err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      return { err, code: StatusCodes.UNPROCESSABLE_ENTITY };
    }

    if (error.name === "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return {
        err: { [field]: "already exists" },
        code: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    return {
      err: { message: error.message },
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    };
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
 * @returns {Promise<Object>} Array of theatres with pagination metadata or error response
 */
const fetchTheatre = async (filter) => {
  let query = {};
  let pagination = {};

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

  // Set pagination limit (default to 5 if not provided)
  if (filter && filter.limit) {
    pagination.limit = filter.limit;
  } else {
    pagination.limit = 5;
  }

  // Calculate skip value for pagination (skip = pageNumber * limit)
  if (filter && filter.skip) {
    pagination.skip = filter.skip * pagination.limit;
  }

  // Execute query with pagination options
  const theatres = await Theatre.find(query, {}, pagination);

  // Get total count for pagination metadata
  const totalTheatres = await Theatre.countDocuments(query);
  const totalPages = Math.ceil(totalTheatres / pagination.limit);

  // find() always returns an array, so check length instead of truthiness
  if (theatres.length === 0) {
    return {
      err: "Not able to find the query theatre",
      code: StatusCodes.NOT_FOUND,
    };
  }

  // Return theatres along with pagination metadata
  return {
    data: theatres,
    pagination: {
      totalTheatres,
      totalPages,
      currentPage: filter.skip || 0,
      limit: pagination.limit,
    },
  };
};

/**
 * Service to delete a theatre by its ID.
 * @param {string} id - Theatre ID to delete
 * @returns {Promise<Object>} Deletion result or error response
 */
const deleteTheatreById = async (id) => {
  const theatre = await Theatre.deleteOne({ id });
  if (!theatre) {
    return {
      err: "No theatre found by this id",
      code: StatusCodes.NOT_FOUND,
    };
  }
  return theatre;
};

/**
 * Service to update theatre details by ID.
 * @param {string} id - Theatre ID to update
 * @param {Object} data - Updated theatre data
 * @returns {Promise<Object>} Updated theatre object or error response
 */
const updateTheatreById = async (id, data) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!theatre) {
      return {
        err: "No theatre found by this id",
        code: StatusCodes.NOT_FOUND,
      };
    }
    return theatre;
  } catch (error) {
    if (error.name == "ValidationError") {
      const err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      return { err, code: StatusCodes.UNPROCESSABLE_ENTITY };
    }
  }
};

/**
 * Service to insert or remove movies from a theatre.
 * @param {string} theatreId - ID of the theatre to update
 * @param {Array<string>} movieIds - Array of movie IDs to insert or remove
 * @param {boolean} insert - true to insert movies, false to remove movies
 * @returns {Promise<Object>} Updated theatre with populated movies or error response
 */
const insertMoviesIntoTheatre = async (theatreId, movieIds, insert) => {
  // Find the theatre by ID
  const theatre = await Theatre.findById(theatreId);
  if (!theatre) {
    return {
      err: "No theatre found by this id",
      code: StatusCodes.NOT_FOUND,
    };
  }

  if (insert) {
    // Insert mode: Add movie IDs to the theatre's movies array
    movieIds.forEach((movieId) => {
      // Avoid adding duplicate movie IDs
      const exists = theatre.movies.some(
        (id) => id.toString() === movieId.toString()
      );
      if (!exists) {
        theatre.movies.push(movieId);
      }
    });
  } else {
    // Remove mode: Remove specified movie IDs from the theatre's movies array
    // Convert movieIds to strings for consistent comparison with ObjectIds
    const movieIdsToRemove = movieIds.map((id) => id.toString());

    // Filter out movies that match any of the IDs to remove
    theatre.movies = theatre.movies.filter((savedMovieId) => {
      return !movieIdsToRemove.includes(savedMovieId.toString());
    });
  }

  // Save the updated theatre
  await theatre.save();

  // Return the theatre with populated movie details
  return theatre.populate("movies");
};

module.exports = {
  createTheatreService,
  fetchTheatre,
  deleteTheatreById,
  updateTheatreById,
  insertMoviesIntoTheatre,
};
