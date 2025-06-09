const mongoose = require('mongoose');
const schema = mongoose.Schema;


const subscriberModel = new schema({
    email: {
        type: String,
        required: [true, "All Field Is Required"]
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

const subscriber = mongoose.model('subscriber', subscriberModel);
module.exports = subscriber;