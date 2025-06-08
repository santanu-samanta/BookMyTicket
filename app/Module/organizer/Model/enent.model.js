const mongoose = require('mongoose');
const schema = mongoose.Schema;

const event = new schema({
    company_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'company',
         required: true
    },
    movie_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'movie',
         required: true
    },
    schedules: [{
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
            validate: [arr => arr.length > 0, 'At least one format is required']
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
        prime_seats_book: {
            type: [Number],
            default: []
        },
        golden_seats_book: {
            type: [Number],
            default: []
        },
        classic_seats_book: {
            type: [Number],
            default: []
        }
    }],
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
    timestamps: true
})


const eventmodel = mongoose.model('event', event);
module.exports = eventmodel;