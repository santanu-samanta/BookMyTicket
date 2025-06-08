const mongoose = require('mongoose');
const schema = mongoose.Schema;

const company = new schema({
    company_name: {
        type: String,
        require: [true, 'Company Name Is Required']
    },
    phone: {
        type: Number,
        require: [true, 'phone is required']
    },
    email: {
        type: String,
        require: [true, 'email is required']
    },
    address: {
        city: {
            type: String,
            require: [true, 'city is required']
        },
        state: {
            type: String,
            require: [true, 'state is required']
        },
        pin: {
            type: Number,
            require: [true, 'pin is required']
        },
        landmark: {
            type: String,
            require: [true, 'landmark is required']
        }
    },
    password: {
        type: String,
        require: [true, 'password is required']
    },
    company_type: {
        type: String,
        require: [true, 'Company Type is required']
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
    role: {
        type: String,
        default: 'Corporate'
    },
    logo: {
        type: String,
        default: 'null'
    },
    facilities_avl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enam: ['Pending', 'Approved', 'Reject'],
        default: 'Pending'
    }
},
    {
        timestamps: true
    })

const companymodel = mongoose.model('company', company);
module.exports = companymodel;