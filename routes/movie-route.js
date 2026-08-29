const express = require("express");
const {
  createMovie,
  getMovie,
  deleteMovie,
  updateMovie,
} = require("../controllers/movie-controller");
const { validateRequest } = require("../middlewares/bodyRequestValidators");
const router = express.Router();

router.post("/", validateRequest, createMovie);
router.get("/:id", getMovie);
router.delete("/:id", deleteMovie);
router.put('/:id', validateRequest, updateMovie)

module.exports = router;
