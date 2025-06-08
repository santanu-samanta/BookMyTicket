const { default: mongoose } = require('mongoose')
const mongoos = require('mongoose');
const schema = mongoos.Schema

const moviemodel = new schema({
    name: {
        type: String,
        required: [true, "movie name is requiredd"]
    },
    posters: {
        type: [String],
        required: [true, "movie name is requiredd"]
    },
    languages: {
        type: [String],
        required: [true, "language is requiredd"]
    },
    genre: {
        type: [String],
        required: [true, "cetagories is requiredd"]
    },
    movieCertificate: {
        type: String,
        required: [true, "cetagories is requiredd"]
    },
    duration: {
        type: String,
        required: [true, "cetagories is requiredd"]
    },
    releaseDate: {
        type: Date,
        required: [true, "cetagories is requiredd"]
    },
    duration: {
        type: String,
        required: [true, 'deuration is requiredd']
    },
    description: {
        type: String,
        required: [true, "about is requiredd"]
    },
    isdelete: {
        type: Boolean,
        required: false
    },
    cast: [
        {
            cast_id: { type: mongoose.Schema.ObjectId, ref: "artist", required: true },
            cast_role: { type: String, required: true },
            cast_nickname: { type: String, default: '' }
        }],
    crew: [
        {
            crew_id: { type: mongoose.Schema.ObjectId, ref: "artist", required: true },
            crew_role: { type: String, required: true },
            crew_nickname: { type: String, default: '' }
        }],
    trailers: [{
        language: { type: String, required: true },  // Correct type
        filename: { type: String, required: true }   // Correct type
    }],

    isdelete: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})

const movieModel = mongoos.model('movie', moviemodel)
module.exports = movieModel;