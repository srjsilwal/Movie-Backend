const express = require("express");
const { dbConnection } = require("./config/db-config");
const {movieRouter} = require("./routes/movie-route");
const { theatreRouter } = require("./routes/theatre-route");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const generateSwaggerFromRoutes = require("./swagger/autoSwagger");
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
  },
};



app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/mb/api/v1/movies", movieRouter);
app.use("/mb/api/v1/theatres", theatreRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

