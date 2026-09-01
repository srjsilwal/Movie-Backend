const express = require("express");
const {
  createTheatre,
  getAllTheatre,
  deleteTheatre,
} = require("../controllers/theatre-controller");
const {
  validateTheatreRequest,
} = require("../middlewares/bodyRequestValidators");
const router = express.Router();

router.post("/", validateTheatreRequest, createTheatre);
router.get("/", getAllTheatre);
router.delete("/:id", deleteTheatre);

module.exports = {
  theatreRouter: router,
};
