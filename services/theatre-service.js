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
      currentPage: page,
      limit: limit,
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
 */
const getSingleThreateWithMovies = async (theatreId) => {
  // Find the theatre by ID
  const theatre = await Theatre.findById(theatreId).populate("movies");
  if (!theatre) {
    return {
      err: "No theatre found by this id",
      code: StatusCodes.NOT_FOUND,
    };
  }

  return theatre;
};



/**
 * This service will list all the theatres where a particular movie is running
 * @param {movieId}
 */
const getAllTheatresByMovie = async (movieId) => {
  try {
    const theatres = await Theatre.find({ movies: movieId }).populate("movies");

    if (theatres.length === 0) {
      return {
        err: "No theatres found running this movie",
        code: StatusCodes.NOT_FOUND,
      };
    }

    return theatres;
  } catch (error) {
    if (error.name === "CastError") {
      return {
        err: `Invalid movie ID format: "${error.value}"`,
        code: StatusCodes.BAD_REQUEST, // 400, not 500!
      };
    }

    // Catch any other unexpected errors
    return {
      err: { message: error.message },
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};


/**
 * Checks if a specific movie is currently running in a specific theatre.
 * @param {string} theatreId - ID of the theatre to check
 * @param {string} movieId - ID of the movie to check for
 * @returns {Promise<Object>} Result object with theatre details and presence status, or error response
 */
const checkMovieInTheatre = async (theatreId, movieId) => {
  try {
    // 1. Find the theatre
    const theatre = await Theatre.findById(theatreId);

    if (!theatre) {
      return {
        err: "Theatre not found",
        code: StatusCodes.NOT_FOUND,
      };
    }

    // 2. Check if the movie is in the theatre's movies array
    const isPresent = theatre.movies.some((savedMovieId) => {
      return savedMovieId.toString() === movieId.toString();
    });

    // 3. Return the result
    return {
      data: {
        theatreId: theatre._id,
        theatreName: theatre.name,
        movieId: movieId,
        isPresent: isPresent,
      },
      message: isPresent
        ? "Movie is currently running at this theatre"
        : "Movie is not running at this theatre",
    };
  } catch (error) {
    if (error.name === "CastError") {
      return {
        err: `Invalid ID format: "${error.value}"`,
        code: StatusCodes.BAD_REQUEST,
      };
    }

    return {
      err: { message: error.message },
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    };
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
