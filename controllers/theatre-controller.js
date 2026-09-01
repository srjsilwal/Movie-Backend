const { StatusCodes } = require("http-status-codes");
const {
  createTheatreService,
  fetchTheatre,
  deleteTheatreById,
  insertMoviesIntoTheatre,
} = require("../services/theatre-service");
const {
  errorResponseBody,
  successResponseBody,
} = require("../utils/responsebody");

const createTheatre = async (req, res) => {
  try {
    const response = await createTheatreService(req.body);
    if (response.err) {
      errorResponseBody.err = response.err;
      errorResponseBody.message = "Fail to create a Theatre";
      return res.status(response.code).json(errorResponseBody);
    }
    successResponseBody.data = response;
    successResponseBody.message = "Successfully create a Theatre";
    return res.status(StatusCodes.CREATED).json(successResponseBody);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponseBody);
  }
};

const getAllTheatre = async (req, res) => {
  try {
    const response = await fetchTheatre(req.query);
    if (response.err) {
      errorResponseBody.err = response.err;
      errorResponseBody.message = "Fail to find Theatre";
      return res.status(response.code).json(errorResponseBody);
    }
    successResponseBody.data = response;
    return res.status(StatusCodes.OK).json(successResponseBody);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponseBody);
  }
};

const deleteTheatre = async (req, res) => {
  try {
    const response = await deleteTheatreById(req.params.id)
    if (response.err) {
      errorResponseBody.err = response.err;
      errorResponseBody.message = "Fail to delete Theatre";
      return res.status(response.code).json(errorResponseBody);
    }
    successResponseBody.data = response;
    successResponseBody.message = "Successfully deleted Theatre";
    return res.status(StatusCodes.OK).json(successResponseBody);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponseBody);
  }
}

const updateMoviesInTheatre = async (req, res) => {
  try {
    const response = await insertMoviesIntoTheatre(req.params.id, req.body.movieIds, req.body.insert);
    if (response.err) {
      errorResponseBody.err = response.err;
      errorResponseBody.message = "Fail to update movies in Theatre";
      return res.status(response.code).json(errorResponseBody);
    }
    successResponseBody.data = response;
    successResponseBody.message = "Successfully updated movies in Theatre";
    return res.status(StatusCodes.OK).json(successResponseBody);
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponseBody);
  }
}
module.exports = {
  createTheatre,
  getAllTheatre,
  deleteTheatre,
  updateMoviesInTheatre,
};
