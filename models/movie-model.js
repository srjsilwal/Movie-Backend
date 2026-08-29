const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 2,
        unique: true
    },
    description: {
        type: String,
        required: true,
        minLength: 5
    },
    cast: {
        type: [String],
        required: true,

    },
    releaseDate: {
        type: Date,
        default: null
    },
    trailerUrl: {
        type: String,
        default: 'release1/movie1'
    }
}, { timeStamp: true })

const Movie = mongoose.model('movie', movieSchema)
console.log(Movie)

module.exports = {
    Movie
}