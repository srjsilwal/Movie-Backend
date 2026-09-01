const express = require("express");
const mongoose = require("mongoose");
const { dbConnection } = require("./config/db-config");
const router = require("./routes/movie-route");
const { theatreRouter } = require("./routes/theatre-route");
require("dotenv").config();

dbConnection();

const port = process.env.PORT;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/mb/api/v1/movies", router);
app.use("/mb/api/v1/theatres", theatreRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
