const { StatusCodes } = require("http-status-codes");
const {
  createShowService,
  getAllShowsService,
  getShowsByMovieService,
  getShowsByTheatreService,
  getShowByIdService,
  updateShowService,
  deleteShowService,
} = require("../services/show-service");
const { createSuccessResponse } = require("../utils/responsebody");

/**
 * Creates a new show for a movie at a theatre.
 * @route POST /api/shows
 */
const createShow = async (req, res, next) => {
  try {
    const user = req.user;
    const show = await createShowService(req.body, user);

    return res
      .status(StatusCodes.CREATED)
      .json(createSuccessResponse(show, "Show created successfully! You can now manage bookings for this show."));
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all shows with optional filtering.
 * @route GET /api/shows
 */
const getAllShows = async (req, res, next) => {
  try {
    const shows = await getAllShowsService(req.query);

    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(shows, "Shows fetched successfully!"));
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all upcoming shows for a specific movie.
 * @route GET /api/shows/movie/:movieId
 */
const getShowsByMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const shows = await getShowsByMovieService(movieId);

    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(shows, "Upcoming shows for this movie fetched successfully!"));
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all shows for a specific theatre.
 * @route GET /api/shows/theatre/:theatreId
 */
const getShowsByTheatre = async (req, res, next) => {
  try {
    const { theatreId } = req.params;
    const shows = await getShowsByTheatreService(theatreId);

    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(shows, "Shows for this theatre fetched successfully!"));
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single show by its ID.
 * @route GET /api/shows/:showId
 */
const getShowById = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const show = await getShowByIdService(showId);

    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(show, "Show details fetched successfully!"));
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing show.
 * @route PATCH /api/shows/:showId
 */
const updateShow = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const user = req.user;
    const show = await updateShowService(showId, req.body, user);

    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(show, "Show updated successfully!"));
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a show (only if no active bookings exist).
 * @route DELETE /api/shows/:showId
 */
const deleteShow = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const user = req.user;
    const result = await deleteShowService(showId, user);

    return res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(result, result.message));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShow,
  getAllShows,
  getShowsByMovie,
  getShowsByTheatre,
  getShowById,
  updateShow,
  deleteShow,
};
