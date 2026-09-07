const { StatusCodes } = require("http-status-codes");
const { AppError } = require("../utils/app-error");

const validateRequest = (req, res, next) => {
  if (!req.body.name) {
    return next(
      new AppError(
        "The Name of the movie is not present in the Request Body",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  if (!req.body.description) {
    return next(
      new AppError(
        "Description of the movie is not present in the Request Body",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  if (
    !req.body.cast ||
    !Array.isArray(req.body.cast) ||
    req.body.cast.length <= 0
  ) {
    return next(
      new AppError(
        "The Cast Members of the movie is not present in the Request Body",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  next();
};

const validateTheatreRequest = (req, res, next) => {
  if (!req.body.name) {
    return next(
      new AppError(
        "The Name of the Theatre is not present in the Request Body",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  if (!req.body.description) {
    return next(
      new AppError(
        "Description of the Theatre is not present in the Request Body",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  if (!req.body.city) {
    return next(
      new AppError(
        "City where the Theatre is located not present in the Request Body",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  if (!req.body.pinCode) {
    return next(
      new AppError(
        "PinCode of the city where Theatre is located is not present in the Request Body",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  next();
};

const validateUpdateMoviesRequest = (req, res, next) => {
  if (req.body.insert == undefined) {
    return next(
      new AppError(
        "Insert field is not present in the Request Body",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  if (!req.body.movieIds) {
    return next(
      new AppError(
        "MovieIds are not present in the Request Body",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  if (!Array.isArray(req.body.movieIds)) {
    return next(
      new AppError(
        "Movie Id should be an array in the Request Body",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  if (req.body.movieIds.length <= 0) {
    return next(
      new AppError(
        "Movie Id array should not be empty in the Request Body",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  next();
};

module.exports = {
  validateRequest,
  validateTheatreRequest,
  validateUpdateMoviesRequest,
};
