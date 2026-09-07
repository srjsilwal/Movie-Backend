const { StatusCodes } = require("http-status-codes");
const {
  createTheatreService,
  fetchTheatre,
  deleteTheatreById,
  insertMoviesIntoTheatre,
  updateTheatreById,
  getSingleThreateWithMovies,
  getAllTheatresByMovie,
  checkMovieInTheatre,
} = require("../services/theatre-service");
const {
  createErrorResponse,
  createSuccessResponse,
} = require("../utils/responsebody");

/**
 * Creates a new theatre in the system.
 *
 * @route POST /theatres
 * @param {Object} req - Express request object containing theatre details in the body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with created theatre data or error message
 */
const createTheatre = async (req, res, next) => {
  try {
    const userId = req.user.id
    // Call the service layer to create a new theatre with the request body data
    const response = await createTheatreService(req.body, userId);

    // On success, send the created theatre data back to the client
    return res
      .status(StatusCodes.CREATED)
      .json(createSuccessResponse(response, "Theatre created successfully"));
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

/**
 * Retrieves all theatres from the system with optional filtering and pagination.
 *
 * @route GET /theatres
 * @param {Object} req - Express request object with optional query parameters for filtering
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with list of theatres and pagination metadata or error message
 */
const getAllTheatre = async (req, res, next) => {
  try {
    // Fetch theatres based on query parameters (filters, pagination, etc.)
    const response = await fetchTheatre(req.query);

    // On success, send the list of theatres back to the client
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Theatres fetched successfully"));
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

/**
 * Deletes a theatre from the system by its ID.
 *
 * @route DELETE /theatres/:id
 * @param {Object} req - Express request object with theatre ID in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response confirming deletion or error message
 */
const deleteTheatre = async (req, res, next) => {
  try {
    const user = req.user
    // Call the service layer to delete the theatre by ID
    const response = await deleteTheatreById(req.params.id, user);

    // On success, send confirmation back to the client
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Theatre deleted successfully"));
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

/**
 * Updates an existing theatre's details by its ID.
 *
 * @route PATCH/PUT /theatress/:id
 * @param {Object} req - Express request object with theatre ID in params and updated data in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with updated theatre data or error message
 */
const updateTheatre = async (req, res, next) => {
  try {
    const user = req.user
    // Call the service layer to update the theatre with the provided ID and new data
    const response = await updateTheatreById(req.params.id, req.body, user);

    // On success, send the updated theatre data back to the client
    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, "Theatre updated successfully"));
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

/**
 * Adds or removes movies from a theatre's collection.
 *
 * @route PATCH /theatres/:id/movies
 * @param {Object} req - Express request object with theatre ID in params and movie IDs in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with updated theatre movies or error message
 */
const updateMoviesInTheatre = async (req, res, next) => {
  try {
    const user = req.user
    // Call the service layer to insert or remove movies from the theatre
    const response = await insertMoviesIntoTheatre(
      req.params.id,
      req.body.movieIds,
      req.body.insert,
      user
    );

    // On success, send the updated theatre data back to the client
    return res
      .status(StatusCodes.OK)
      .json(
        createSuccessResponse(
          response,
          "Movies updated in theatre successfully",
        ),
      );
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

/**
 * Retrieves a single theatre along with its associated movies by theatre ID.
 *
 * @route GET /theatres/:id
 * @param {Object} req - Express request object with theatre ID in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with theatre details and its movies or error message
 */
const getSingleTheatre = async (req, res, next) => {
  try {
    // Call the service layer to fetch a single theatre with its movies
    const response = await getSingleThreateWithMovies(req.params.id);

    // On success, send the theatre details along with its movies back to the client
    return res
      .status(StatusCodes.OK)
      .json(
        createSuccessResponse(
          response,
          "Theatre fetched successfully with its movies",
        ),
      );
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

/**
 * Retrieves all theatres where a specific movie is currently running.
 *
 * @route GET /theatres/movie/:id
 * @param {Object} req - Express request object with movie ID in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with list of theatres showing the movie or error message
 */
const getAllTheatreByMovie = async (req, res, next) => {
  try {
    const response = await getAllTheatresByMovie(req.params.id);

    return res
      .status(StatusCodes.OK)
      .json(
        createSuccessResponse(
          response,
          "Successfully list all theatres where this movie is running",
        ),
      );
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

/**
 * Checks if a specific movie is currently running in a specific theatre.
 *
 * @route GET /theatres/:theatreId/movies/:movieId
 * @param {Object} req - Express request object with theatreId and movieId in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response indicating whether the movie is running in the theatre
 */
const checkMovie = async (req, res, next) => {
  try {
    const response = await checkMovieInTheatre(req.params.theatreId, req.params.movieId);

    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(response, response.message));
  } catch (error) {
    // Pass any errors to the centralized error handler
    return next(error);
  }
};

module.exports = {
  createTheatre,
  getAllTheatre,
  deleteTheatre,
  updateTheatre,
  updateMoviesInTheatre,
  getSingleTheatre,
  getAllTheatreByMovie,
  checkMovie,
};
