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

/**
 * Validates the request body for creating a new show.
 * Checks for required fields and valid formats.
 */
const validateCreateShowRequest = (req, res, next) => {
  const { movie, theatre, date, startTime, screen } = req.body;

  if (!movie) {
    return next(
      new AppError("Movie ID is required to create a show", StatusCodes.BAD_REQUEST)
    );
  }

  if (!theatre) {
    return next(
      new AppError("Theatre ID is required to create a show", StatusCodes.BAD_REQUEST)
    );
  }

  if (!date) {
    return next(
      new AppError("Show date is required", StatusCodes.BAD_REQUEST)
    );
  }

  if (!startTime) {
    return next(
      new AppError("Start time is required for the show", StatusCodes.BAD_REQUEST)
    );
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(startTime)) {
    return next(
      new AppError(
        "Start time must be in valid HH:MM format (24-hour, e.g., 14:30)",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  if (!screen) {
    return next(
      new AppError("Screen number is required", StatusCodes.BAD_REQUEST)
    );
  }

  const validScreens = ["Screen 1", "Screen 2", "Screen 3", "Screen 4", "Screen 5"];
  if (!validScreens.includes(screen)) {
    return next(
      new AppError(
        "Screen must be one of: Screen 1, Screen 2, Screen 3, Screen 4, or Screen 5",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // Validate date is not in the past
  const selectedDate = new Date(date);
  if (Number.isNaN(selectedDate.getTime())) {
    return next(
      new AppError("Show date must be a valid date", StatusCodes.BAD_REQUEST)
    );
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return next(
      new AppError(
        "Show date cannot be in the past. Please select a future date.",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  next();
};

/**
 * Validates the request body for updating a show.
 * Only validates fields that are being updated.
 */
const validateUpdateShowRequest = (req, res, next) => {
  const { startTime, screen, date, price, totalSeats } = req.body;

  if (startTime) {
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime)) {
      return next(
        new AppError(
          "Start time must be in valid HH:MM format (24-hour, e.g., 14:30)",
          StatusCodes.BAD_REQUEST
        )
      );
    }
  }

  if (screen) {
    const validScreens = ["Screen 1", "Screen 2", "Screen 3", "Screen 4", "Screen 5"];
    if (!validScreens.includes(screen)) {
      return next(
        new AppError(
          "Screen must be one of: Screen 1, Screen 2, Screen 3, Screen 4, or Screen 5",
          StatusCodes.BAD_REQUEST
        )
      );
    }
  }

  if (date) {
    const selectedDate = new Date(date);
    if (Number.isNaN(selectedDate.getTime())) {
      return next(
        new AppError("Show date must be a valid date", StatusCodes.BAD_REQUEST)
      );
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return next(
        new AppError(
          "Show date cannot be in the past. Please select a future date.",
          StatusCodes.BAD_REQUEST
        )
      );
    }
  }

  if (price) {
    const { regular, gold, platinum } = price;
    if (regular !== undefined && (typeof regular !== "number" || regular < 0)) {
      return next(
        new AppError("Regular seat price must be a non-negative number", StatusCodes.BAD_REQUEST)
      );
    }
    if (gold !== undefined && (typeof gold !== "number" || gold < 0)) {
      return next(
        new AppError("Gold seat price must be a non-negative number", StatusCodes.BAD_REQUEST)
      );
    }
    if (platinum !== undefined && (typeof platinum !== "number" || platinum < 0)) {
      return next(
        new AppError("Platinum seat price must be a non-negative number", StatusCodes.BAD_REQUEST)
      );
    }
  }

  if (totalSeats) {
    const { regular, gold, platinum } = totalSeats;
    if (regular !== undefined && (typeof regular !== "number" || regular < 0)) {
      return next(
        new AppError("Regular seat count must be a non-negative number", StatusCodes.BAD_REQUEST)
      );
    }
    if (gold !== undefined && (typeof gold !== "number" || gold < 0)) {
      return next(
        new AppError("Gold seat count must be a non-negative number", StatusCodes.BAD_REQUEST)
      );
    }
    if (platinum !== undefined && (typeof platinum !== "number" || platinum < 0)) {
      return next(
        new AppError("Platinum seat count must be a non-negative number", StatusCodes.BAD_REQUEST)
      );
    }
  }

  // Ensure at least one field is being updated
  if (
    !startTime &&
    !screen &&
    !date &&
    !price &&
    !totalSeats
  ) {
    return next(
      new AppError(
        "Please provide at least one field to update (startTime, screen, date, price, or totalSeats)",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  next();
};

/**
 * Validates request shape only. Seat availability and pricing require show data,
 * so they are intentionally enforced in the booking service.
 */
const validateBookingRequest = (req, res, next) => {
  const { seats } = req.body;

  if (!Array.isArray(seats)) {
    return next(new AppError("Seats must be provided as an array, for example: [\"A1\", \"A2\"].", StatusCodes.BAD_REQUEST));
  }
  if (seats.length < 1 || seats.length > 10) {
    return next(new AppError("Select between 1 and 10 seats per booking.", StatusCodes.BAD_REQUEST));
  }
  if (seats.some((seat) => typeof seat !== "string" || !/^[A-M](?:[1-9]|[1-9][0-9])$/.test(seat))) {
    return next(new AppError("Each seat must use a valid format such as A1 or M20.", StatusCodes.BAD_REQUEST));
  }
  if (new Set(seats).size !== seats.length) {
    return next(new AppError("Each selected seat must be listed only once.", StatusCodes.BAD_REQUEST));
  }
  next();
};

module.exports = {
  validateRequest,
  validateTheatreRequest,
  validateUpdateMoviesRequest,
  validateCreateShowRequest,
  validateUpdateShowRequest,
  validateBookingRequest,
};
