const express = require("express");
const {
  createMovie,
  getMovie,
  deleteMovie,
  getAllMovies,
  updateMovie,
} = require("../controllers/movie-controller");
const { validateRequest } = require("../middlewares/bodyRequestValidators");
const { isAuthenticated } = require("../middlewares/user-middleware");
const router = express.Router();

router.post("/", isAuthenticated, validateRequest, createMovie);
router.get("/:id", getMovie);
router.delete("/:id", isAuthenticated, deleteMovie);
router.put("/:id", isAuthenticated, validateRequest, updateMovie);
router.patch("/:id", isAuthenticated, validateRequest, updateMovie);
router.get("/", getAllMovies);

module.exports = { movieRouter: router };
