const { Movie } = require("../models/movie-model.js");
const { StatusCodes } = require("http-status-codes");

const createMovieService = async (data) => {
  try {
    const movie = await Movie.create(data);
    if (!movie) {
      return {
        err: "movie cannot created.",
        code: StatusCodes.NO_CONTENT,
      };
    }
    return movie;
  } catch (error) {
    // Mongoose validation error — has error.errors keyed by field
    if (error.name === "ValidationError") {
      const err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      return { err, code: StatusCodes.UNPROCESSABLE_ENTITY };
    }

    // MongoDB duplicate-key error — code 11000, has keyValue/keyPattern
    if (error.name === "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return {
        err: { [field]: "already exists" },
        code: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    // Fallback
    return {
      err: { message: error.message },
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

const getAllMovies = async () => {
  const movie = await Movie.find();
  if (!movie) {
    return {
      err: "Movies not found",
      code: StatusCodes.NOT_FOUND,
    };
  }
  return movie;
};

const deleteMovieById = async (id) => {
  const movie = await Movie.deleteOne({ id });
  if (!movie) {
    return {
      err: "No movie found by this id",
      code: StatusCodes.NOT_FOUND,
    };
  }
  return movie;
};

const updateMovieById = async (id, data) => {
  try {
    const movie = await Movie.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return {
        err: "No movie found by this id",
        code: StatusCodes.NOT_FOUND,
      };
    }
    return movie;
  } catch (error) {
    if (error.name == "ValidationError") {
      const err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
        return { err, code: StatusCodes.UNPROCESSABLE_ENTITY };
    }
  }
};

const getMovieById = async (id) => {
  const movie = await Movie.findById(id);
  if (!movie) {
    return {
      err: "No movie found by this id",
      code: StatusCodes.NOT_FOUND,
    };
  }
  return movie;
};

module.exports = {
  createMovieService,
  getMovieById,
  deleteMovieById,
  updateMovieById,
};
