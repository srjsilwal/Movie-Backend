const express = require("express");
const { dbConnection } = require("./config/db-config");
const { movieRouter } = require("./routes/movie-route");
const { theatreRouter } = require("./routes/theatre-route");
const { showRouter } = require("./routes/show-route");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const generateSwaggerFromRoutes = require("./swagger/autoSwagger");
const { StatusCodes } = require("http-status-codes");
const { createErrorResponse } = require("./utils/responsebody");
const { userRouter } = require("./routes/user-route");
require("dotenv").config();

dbConnection();

const port = process.env.PORT;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Swagger setup
const swaggerSpec = {
  openapi: "3.0.0",

  info: {
    title: "Movie Booking API",
    version: "1.0.0",
    description: "Movie Booking REST API",
  },

  servers: [
    {
      url: `http://localhost:${port}`,
    },
  ],

  paths: {
    ...generateSwaggerFromRoutes(movieRouter, "/mb/api/v1/movies", "Movies"),
    ...generateSwaggerFromRoutes(theatreRouter, "/mb/api/v1/theatres", "Theatres"),
    ...generateSwaggerFromRoutes(showRouter, "/mb/api/v1/shows", "Shows"),
  },
};



app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/mb/api/v1/movies", movieRouter);
app.use("/mb/api/v1/theatres", theatreRouter);
app.use("/mb/api/v1/shows", showRouter);
app.use("/mb/api/v1/users", userRouter);

// Centralized error handling middleware
// Must be defined after all routes
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const errorData = err.data || { message: err.message };

  return res
    .status(statusCode)
    .json(createErrorResponse(errorData, err.message));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

