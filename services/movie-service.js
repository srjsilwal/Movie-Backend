const { Movie } = require("../models/movie-model.js");
const { StatusCodes } = require("http-status-codes");
const { AppError } = require("../utils/app-error");

const createMovieService = async (data, userId) => {
  try {
    const movie = await Movie.create({ ...data, owner: { userId } });
    if (!movie) {
      throw new AppError("Movie cannot be created", StatusCodes.NO_CONTENT);
    }
    return movie;
  } catch (error) {
    // Mongoose validation error — has error.errors keyed by field
    if (error.name === "ValidationError") {
      const err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      throw new AppError("Validation failed", StatusCodes.UNPROCESSABLE_ENTITY, err);
    }

    // MongoDB duplicate-key error — code 11000, has keyValue/keyPattern
    if (error.name === "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new AppError(
        "Duplicate field",
        StatusCodes.UNPROCESSABLE_ENTITY,
        { [field]: "already exists" },
      );
    }

    // Re-throw AppError as-is, wrap other errors
    if (error instanceof AppError) throw error;
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const deleteMovieById = async (id, user) => {
  const movie = await Movie.findById(id);
  if (!movie) {
    throw new AppError("No movie found by this id", StatusCodes.NOT_FOUND);
  }
  if (movie.owner.toString() !== user.id && user.userRole !== 'admin') {
    throw new AppError("You are not authorized to delete this movie", StatusCodes.FORBIDDEN);
  }
  await Movie.deleteOne({ id });
  return movie;
};

const updateMovieById = async (id, data, user) => {
  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new AppError("No movie found by this id", StatusCodes.NOT_FOUND);
    }
    if (movie.owner.toString() !== user.id && user.userRole !== 'admin') {
      throw new AppError("You are not authorized to update the movie", StatusCodes.FORBIDDEN);
    }
    Object.assign(movie, data);
    await movie.save();
    return movie;
  } catch (error) {
    if (error.name == "ValidationError") {
      const err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      throw new AppError("Validation failed", StatusCodes.UNPROCESSABLE_ENTITY, err);
    }
    throw error;
  }
};

const getMovieById = async (id) => {
  const movie = await Movie.findById(id);
  if (!movie) {
    throw new AppError("No movie found by this id", StatusCodes.NOT_FOUND);
  }
  return movie;
};

const fetchMovies = async (filter) => {
  let query = {};
  if (filter.name) {
    query.name = filter.name;
  }
  const movies = await Movie.find(query);
  if (!movies) {
    throw new AppError("Not able to find the query movies", StatusCodes.NOT_FOUND);
  }
  return movies;
};

module.exports = {
  createMovieService,
  getMovieById,
  deleteMovieById,
  updateMovieById,
  fetchMovies,
};
