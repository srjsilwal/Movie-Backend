const bodyRequestValidator = {
  success: false,
  data: {},
  err: "",
  message: "BAD Request",
  statusCode: 400,
};

const validateRequest = (req, res, next) => {
  if (!req.body.name) {
    bodyRequestValidator.err =
      "The Name of the movie is not present in the Request Body";
    return res
      .status(bodyRequestValidator.statusCode)
      .json(bodyRequestValidator);
  }
  if (!req.body.description) {
    bodyRequestValidator.err =
      "Description of the movie is not present in the Request Body";
    return res
      .status(bodyRequestValidator.statusCode)
      .json(bodyRequestValidator);
  }
  if (
    !req.body.cast ||
    (!req.body.cast) instanceof Array ||
    req.body.cast.length <= 0
  ) {
    bodyRequestValidator.err =
      "The Cast Members of the movie is not present in the Request Body";
    return res
      .status(bodyRequestValidator.statusCode)
      .json(bodyRequestValidator);
  }

  next();
};

const validateTheatreRequest = (req, res, next) => {
  if (!req.body.name) {
    bodyRequestValidator.err =
      "The Name of the Theatre is not present in the Request Body";
    return res
      .status(bodyRequestValidator.statusCode)
      .json(bodyRequestValidator);
  }
  if (!req.body.description) {
    bodyRequestValidator.err =
      "Description of the Theatre is not present in the Request Body";
    return res
      .status(bodyRequestValidator.statusCode)
      .json(bodyRequestValidator);
  }
  if (!req.body.city) {
    bodyRequestValidator.err =
      "City where the Theatre is located not present in the Request Body";
    return res
      .status(bodyRequestValidator.statusCode)
      .json(bodyRequestValidator);
  }
  if (!req.body.pinCode) {
    bodyRequestValidator.err =
      "PinCode of the city where Theatre is located is not present in the Request Body";
    return res
      .status(bodyRequestValidator.statusCode)
      .json(bodyRequestValidator);
  }
  next();
}
module.exports = {
  validateRequest,
  validateTheatreRequest
};
