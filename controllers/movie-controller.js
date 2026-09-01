const {
  createMovieService,
  getMovieById,
  deleteMovieById,
  updateMovieById,
  fetchMovies,
} = require("../services/movie-service");
const { StatusCodes } = require("http-status-codes");
const {
  errorResponseBody,
  successResponseBody,
} = require("../utils/responsebody");

const createMovie = async (req, res) => {
  try {
    const response = await createMovieService(req.body);
    if (response.err) {
      errorResponseBody.err = response.err;
      errorResponseBody.message = "Fail to create a movie";
      return res.status(response.code).json(errorResponseBody);
    }
    successResponseBody.data = response;
    successResponseBody.message = "successfully created a movie";
    return res.status(StatusCodes.CREATED).json(successResponseBody);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponseBody);
  }
};

const deleteMovie = async (req, res) => {
  try {
    const response = await deleteMovieById(req.params.id);
    if (response.err) {
      errorResponseBody.err = response.err;
      errorResponseBody.message = "Fail to delete movie";
      return res.status(response.code).json(errorResponseBody);
    }
    successResponseBody.data = response;
    successResponseBody.message = "Movie deleted successfully";
    return res.status(StatusCodes.NOT_FOUND).json(successResponseBody);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponseBody);
  }
};

const updateMovie = async (req, res) => {
  try {
    const response = await updateMovieById(req.params.id, req.body);
    if (response.err) {
      errorResponseBody.err = response.err;
      errorResponseBody.message = "Faile to update a movie";
      return res.status(response.code).json(errorResponseBody);
    }
    successResponseBody.data = response;
    successResponseBody.message = "Successfully update a movie";
    return res.status(StatusCodes.CREATED).json(successResponseBody);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponseBody);
  }
};

const getMovie = async (req, res) => {
  try {
    const response = await getMovieById(req.params.id);
    if (response.err) {
      errorResponseBody.err = response.err;
      errorResponseBody.message = "Fail to fetch the movie details";
      return res.status(response.code).json(errorResponseBody);
    }
    successResponseBody.data = response;
    successResponseBody.message = "successfully fetch the movie details";
    return res.status(StatusCodes.OK).json(successResponseBody);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponseBody);
  }
};

const getAllMovies = async (req, res) => {
  try {
    const response = await fetchMovies(req.query);
    if (response.err) {
      errorResponseBody.err = response.err;
      errorResponseBody.message = "Fail to find movies";
      return res.status(response.code).json(errorResponseBody);
    }
    successResponseBody.data = response
    return res.status(StatusCodes.OK).json(successResponseBody)
  } catch (error) {
     console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponseBody);
  }
};

module.exports = {
  createMovie,
  getMovie,
  deleteMovie,
  updateMovie,
  getAllMovies
};
