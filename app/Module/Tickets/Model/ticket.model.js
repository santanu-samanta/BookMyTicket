const mongoose = require("mongoose");
const nodemon = require("nodemon");

const ticketSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true,
    },
    shedule_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'event',
        required: true,
    },
    event_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'event',
    },
    organizerevent_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'organizerevent',
    },
    noOfTicketsBought: {
        type: Number,
        required: true,
    },
    moviename: {
        type: String,
        required: true,
    },
    moviedate: {
        type: Date,
        required: true,
    },
    movietime: {
        type: String,
        required: true,
    },
    movieimage: {
        type: String,
        required: true,
    },
    seat: {
        prime_seats: {
            type: [Number],
            default: []
        },
        golden_seats: {
            type: [Number],
            default: []
        },
        classic_seats: {
            type: [Number],
            default: []
        }
    },
    paymentDetails: {
        razorpay_signature: {
            type: String,
            require: [true, "this filed is required"]
        },
        razorpay_order_id: {
            type: String,
            require: [true, "this filed is required"]
        },
        razorpay_payment_id: {
            type: String,
            require: [true, "this filed is required"]
        },
    },
    totalPayment: {
        type: Number,
        default: '0'
    },
    ismovie: {
        type: Boolean,
        require: [true, 'This Field Is Required']
    }
}, {
    timestamps: true
})

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;