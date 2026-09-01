const mongoose = require("mongoose");

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      minLength: 5,
    },

    city: {
      type: String,
      required: true,
    },
    pinCode: {
      type: Number,
      required: true,
    },
    address: String,
    movies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'movie'
    }
  },
  { timeStamp: true },
);

const Theatre = mongoose.model("theatre", theatreSchema);

module.exports = { Theatre };
