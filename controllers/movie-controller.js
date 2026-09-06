const { StatusCodes } = require("http-status-codes");
const {
  createMovieService,
  getMovieById,
  deleteMovieById,
  updateMovieById,
  fetchMovies,
} = require("../services/movie-service");
const {
  createErrorResponse,
  createSuccessResponse,
} = require("../utils/responsebody");

/**
 * Creates a new movie in the system.
 *
 * @route POST /movie
 * @param {Object} req - Express request object containing movie details in the body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with created movie data or error message
 */
const createMovie = async (req, res, next) => {
  try {
    // Call the service layer to create a new movie with the request body data
    const response = await createMovieService(req.body);

    // On success, send the created movie data back to the client
    return res
      .status(StatusCodes.CREATED)
      .json(createSuccessResponse(response, "Movie created successfully"));
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

/**
 * Deletes a movie from the system by its ID.
 *
 * @route DELETE /movie/:id
 * @param {Object} req - Express request object with movie ID in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response confirming deletion or error message
 */
const deleteMovie = async (req, res, next) => {
  try {
    // Call the service layer to delete the movie by ID
    const response = await deleteMovieById(req.params.id);

    // On success, send confirmation back to the client
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Movie deleted successfully"));
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

/**
 * Updates an existing movie's details by its ID.
 *
 * @route PATCH/PUT /movie/:id
 * @param {Object} req - Express request object with movie ID in params and updated data in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with updated movie data or error message
 */
const updateMovie = async (req, res, next) => {
  try {
    // Call the service layer to update the movie with the provided ID and new data
    const response = await updateMovieById(req.params.id, req.body);

    // On success, send the updated movie data back to the client
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Movie updated successfully"));
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

/**
 * Retrieves a single movie by its ID.
 *
 * @route GET /movie/:id
 * @param {Object} req - Express request object with movie ID in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with movie details or error message
 */
const getMovie = async (req, res, next) => {
  try {
    // Call the service layer to fetch a single movie by ID
    const response = await getMovieById(req.params.id);

    // On success, send the movie details back to the client
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Movie fetched successfully"));
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

/**
 * Retrieves all movies from the system with optional filtering.
 *
 * @route GET /movie
 * @param {Object} req - Express request object with optional query parameters for filtering
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with list of movies or error message
 */
const getAllMovies = async (req, res, next) => {
  try {
    // Fetch movies based on query parameters (filters, search, etc.)
    const response = await fetchMovies(req.query);

    // On success, send the list of movies back to the client
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Movies fetched successfully"));
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

module.exports = {
  createMovie,
  getMovie,
  deleteMovie,
  updateMovie,
  getAllMovies,
};
