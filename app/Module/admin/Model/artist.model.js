const mongoose = require('mongoose');
const schema = mongoose.Schema;

const artistModel = new schema({
    image: {
        type: String,
        require: [false]
    },
    artist_name: {
        type: String,
        require: [true, 'All Field Is Required']
    },
    occupation: {
        type: [String],
        require: [true, 'All Field Is Required']
    },
    about: {
        type: String,
        require: [true, 'All Field Is Required']
    },
    Birthplace: {
        type: String,
        require: [false]
    },
    Born: {
        type: Date,
        require: [false]
    },
    other: {
        type: String,
        require: false
    },
    family:[{
        f_id:{ type: mongoose.Schema.ObjectId, ref: "artist", require: false },
        relationship: {type: String,require: false}
    }],
    isdelete: {
        type: Boolean,
        default: false
    },
    msg: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
})

const artistmodel = mongoose.model('artist', artistModel);
module.exports =artistmodel;