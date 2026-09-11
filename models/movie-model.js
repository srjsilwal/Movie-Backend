const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      minLength: 5,
    },
    cast: {
      type: [String],
      required: true,
    },
    releaseDate: {
      type: Date,
      default: null,
    },
    trailerUrl: {
      type: String,
      default: "release1/movie1",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    duration: {
      type: Number,
      required: [true, "Movie duration is required"],
      min: [1, "Movie duration must be at least 1 minute"],
    },
    language: {
      type: [String],
      default: "english",
    },
  },
  { timestamps: true },
);

const Movie = mongoose.model("movie", movieSchema);

module.exports = {
  Movie,
};
