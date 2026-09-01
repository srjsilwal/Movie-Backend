const express = require("express");
const {
  createTheatre,
  getAllTheatre,
  deleteTheatre,
  updateMoviesInTheatre,
} = require("../controllers/theatre-controller");
const {
  validateTheatreRequest,
  validateUpdateMoviesRequest,
} = require("../middlewares/bodyRequestValidators");
const router = express.Router();

router.post("/", validateTheatreRequest, createTheatre);
router.get("/", getAllTheatre);
router.delete("/:id", deleteTheatre);
router.patch("/:id/movies", validateUpdateMoviesRequest, updateMoviesInTheatre)

module.exports = {
  theatreRouter: router,
};
