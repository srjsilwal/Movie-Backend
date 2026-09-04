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
const router = express.Router();

router.post("/", validateTheatreRequest, createTheatre);
router.get("/", getAllTheatre);
router.get("/:id", getSingleTheatre);
router.delete("/:id", deleteTheatre);
router.patch("/:id/movies", validateUpdateMoviesRequest, updateMoviesInTheatre)
router.put("/:id", validateUpdateMoviesRequest, updateTheatre);
router.patch("/:id", validateUpdateMoviesRequest, updateTheatre);
router.get("/movie/:id", getAllTheatreByMovie);
router.get("/:theatreId/movies/:movieId", checkMovie);

module.exports = {
  theatreRouter: router,
};
