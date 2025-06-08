const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userModel = new schema({

    first_name: {
        type: String,
        required: [true, "All Field Is Required"]
    },
    last_name: {
        type: String,
        required: [true, "All Field Is Required"]
    },
    email: {
        type: String,
        required: [true, "All Field Is Required"]
    },
    phone: {
        type: Number,
    },
    image: {
        type: String,
        default:'image'
    },
    role: {
        type: String,
        default: 'user'
    },
    gender: {
        type: String,
        required: [true, "All Field Is Required"]
    },
    date_of_birth: {
        type: Date,
        required: [true, "All Field Is Required"]
    },
    password: {
        type: String,
        required: [true, "All Field Is Required"]
    },
    isdelete:{
        type:Boolean,
        default:false
    },
    isadmindelete:{
        type:Boolean,
        default:false
    },
    admindelete_msg: {
        type: String,
        default: ''
    },
    isverify:{
        type:Boolean,
        default:false
    }
},
    {
        timestamps: true
    })

const user = mongoose.model('user', userModel);
module.exports = user;