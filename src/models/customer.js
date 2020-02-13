const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validator(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

// Customize stringify to hide password and tokens
customerSchema.methods.toJSON = function () {
    const customer = this
    const customerObject = customer.toObject()

    delete customerObject.password
    delete customerObject.tokens
    
    return customerObject
}

// Generate a new authentication token for a customer
customerSchema.methods.generateAuthToken = async function () {
    const customer = this
    const token = jwt.sign({ _id: customer._id.toString() }, 'challengeCustomer')

    customer.tokens = customer.tokens.concat({ token })
    await customer.save()

    return token
}

// Find a customer by email address and password
customerSchema.statics.findByCredentials = async (email, password) => {
    const customer = await Customer.findOne({ email })

    if (!customer) {
        throw new Error()
    }

    const isMatch = await bcrypt.compare(password, customer.password)

    if (!isMatch) {
        throw new Error()
    }

    return customer
}

// Hash password every time it's modified for security
customerSchema.pre('save', async function (next) {
    const customer = this
    
    if (customer.isModified('password')) {
        customer.password = await bcrypt.hash(customer.password, 6)
    }
})

const Customer = mongoose.model('Customer', customerSchema)

module.exports = Customer