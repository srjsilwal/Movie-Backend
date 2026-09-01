const { StatusCodes } = require("http-status-codes");
const { Theatre } = require("../models/theatre-model.js");

const createTheatreService = async (data) => {
  try {
    const theatre = await Theatre.create(data);
    if (!theatre) {
      return {
        err: "Theatre cannot be created",
        code: StatusCodes.NO_CONTENT,
      };
    }
    return theatre;
  } catch (error) {
    if (error.name === "ValidationError") {
      let err = {};
      Object.keys(error.errors).forEach((key) => {
        err[key] = error.errors[key].message;
      });
      return { err, code: StatusCodes.UNPROCESSABLE_ENTITY };
    }

    if (error.name === "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return {
        err: { [field]: "already exists" },
        code: StatusCodes.UNPROCESSABLE_ENTITY,
      };
    }

    return {
      err: { message: error.message },
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

const fetchTheatre = async (filter) => {
  let query = {};
  if (filter.name) {
    query.name = filter.name;
  }
  const theatre = await Theatre.find(query);
  if (!theatre) {
    return {
      err: "Not able to find the query theatre",
      code: StatusCodes.NOT_FOUND,
    };
  }
  return theatre;
};

const deleteTheatreById = async (id) => {
  const theatre = await Theatre.deleteOne({ id });
  if (!theatre) {
    return {
      err: "No theatre found by this id",
      code: StatusCodes.NOT_FOUND,
    };
  }
  return theatre;
};


module.exports = {
  createTheatreService,
  fetchTheatre,
  deleteTheatreById,
};
