const { required } = require('joi');
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const oevent = new schema({
    company_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'company',
        required: true
    },
    event_name: {
        type: String, required: true
    },
    description: {
        type: String, required: true
    },
    category: {
        type: String,
    },
    artist: [{
        artistname: {
            type: String,
            require: ["true"]
        },
        artistrole: {
            type: String,
            require: ["true"]
        },
        artistimage: {
            type: String,
            default:''
        },
    }],
    validAge: {
        type: Boolean,
        default: false
    },
    images: {
        type: [String],
        default: []
    },
    videos: {
        type: [String],
        default: []
    },
    schedules: [{
        location: {
            venue: { type: String, required: true },
            city: { type: String, required: true },
        },
        date: {
            type: Date,
            required: true,
        },
        start_time: {
            type: String,  // e.g., "14:30"
            required: true,
        },
        end_time: {
            type: String,
            required: true,
        },
        screen: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        format: {
            type: [String],  // array of formats like ["Online", "Offline"]
            required: true,
        },
        prime_ticket_price: {
            type: Number,
            required: true,
            min: 0,
        },
        golden_ticket_price: {
            type: Number,
            required: true,
            min: 0,
        },
        clasic_ticket_price: {
            type: Number,
            required: true,
            min: 0,
        },
        prime_seats: {
            type: Number,
            required: true,
            min: 0,
        },
        golden_seats: {
            type: Number,
            required: true,
            min: 0,
        },
        clasic_seats: {
            type: Number,
            required: true,
            min: 0,
        },
        avl_prime_seats: {
            type: Number,
            default: 0
        },
        avl_golden_seats: {
            type: Number,
            default: 0
        },
        avl_classic_seats: {
            type: Number,
            default: 0
        }

    }],
    type:{
        type:String,
        enum:['event','activity','palys','sports','strems'],
        required:true
    },
    msg: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Reject'],
        default: 'Pending'
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
    },
    adminreject_msg: {
        type: String,
        default: ''
    },
}, {
    timestamps: true,
    versionKey: false
})


const organizereventmodel = mongoose.model('organizerevent', oevent);
module.exports = organizereventmodel;