const mongoose = require('mongoose');
const schema = mongoose.Schema;


const testModel = new schema({
    userid: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: [true, "All Field Is Required"]
    },
    movie_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'movie',
        
    },

    eventorganization_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'organizerevent', 
    },
    review: {
        type: String,
        required: [true, "All Field Is Required"]
    },
    rating: {
        type: Number,
        required: [true, "All Field Is Required"]
    },
    ismovie: {
        type: Boolean,
        default: false
    },
    isdelete: {
        type: Boolean,
        default: false
    },
    isadmindelete: {
        type: Boolean,
        default: false
    },
    admindelete_msg: {
        type: String,
        default: ''
    },
    isverify: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    })

const testimonial = mongoose.model('testimonial', testModel);
module.exports = testimonial;