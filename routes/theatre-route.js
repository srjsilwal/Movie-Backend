const express = require("express");
const {
  createTheatre,
  getAllTheatre,
  deleteTheatre,
  updateMoviesInTheatre,
  updateTheatre,
  getSingleTheatre,
  getAllTheatreByMovie,
  checkMovie,
} = require("../controllers/theatre-controller");
const {
  validateTheatreRequest,
  validateUpdateMoviesRequest,
} = require("../middlewares/bodyRequestValidators");
const { isAuthenticated } = require("../middlewares/user-middleware");
const router = express.Router();

router.post("/", isAuthenticated, validateTheatreRequest, createTheatre);
router.get("/", getAllTheatre);
router.get("/:id", getSingleTheatre);
router.delete("/:id", isAuthenticated, deleteTheatre);
router.patch("/:id/movies", isAuthenticated, validateUpdateMoviesRequest, updateMoviesInTheatre)
router.put("/:id", isAuthenticated, validateUpdateMoviesRequest, updateTheatre);
router.patch("/:id", isAuthenticated, validateUpdateMoviesRequest, updateTheatre);
router.get("/movie/:id", getAllTheatreByMovie);
router.get("/:theatreId/movies/:movieId", checkMovie);

module.exports = {
  theatreRouter: router,
};
