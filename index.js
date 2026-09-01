const express = require('express')
const mongoose = require('mongoose');
const { dbConnection } = require('./config/db-config');
const router = require('./routes/movie-route');
require('dotenv').config()

 
dbConnection()

const port = process.env.PORT;
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/mb/api/v1/movies", router);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
