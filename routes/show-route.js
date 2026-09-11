const express = require("express");
const {
  createShow,
  getAllShows,
  getShowsByMovie,
  getShowsByTheatre,
  getShowById,
  updateShow,
  deleteShow,
} = require("../controllers/show-controller");
const {
  isAuthenticated,
  isAdminOrClient,
} = require("../middlewares/user-middleware");
const {
  validateCreateShowRequest,
  validateUpdateShowRequest,
} = require("../middlewares/bodyRequestValidators");

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   GET /api/shows
 * @desc    Get all shows with optional filters
 * @access  Public
 */
router.get("/", getAllShows);

/**
 * @route   GET /api/shows/movie/:movieId
 * @desc    Get all upcoming shows for a specific movie
 * @access  Public
 */
router.get("/movie/:movieId", getShowsByMovie);

/**
 * @route   GET /api/shows/theatre/:theatreId
 * @desc    Get all shows for a specific theatre
 * @access  Public
 */
router.get("/theatre/:theatreId", getShowsByTheatre);

/**
 * @route   GET /api/shows/:showId
 * @desc    Get a single show by ID
 * @access  Public
 */
router.get("/:showId", getShowById);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * @route   POST /api/shows
 * @desc    Create a new show
 * @access  Private (Admin or Client only)
 */
router.post(
  "/",
  isAuthenticated,
  isAdminOrClient,
  validateCreateShowRequest,
  createShow,
);

/**
 * @route   PATCH /api/shows/:showId
 * @desc    Update an existing show
 * @access  Private (Admin or Client only)
 */
router.patch(
  "/:showId",
  isAuthenticated,
  isAdminOrClient,
  validateUpdateShowRequest,
  updateShow,
);

/**
 * @route   DELETE /api/shows/:showId
 * @desc    Delete a show (only if no active bookings)
 * @access  Private (Admin or Client only)
 */
router.delete("/:showId", isAuthenticated, isAdminOrClient, deleteShow);

module.exports = { showRouter: router };
