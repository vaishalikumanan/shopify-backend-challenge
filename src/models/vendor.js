const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Product = require('./product')


const vendorSchema = new mongoose.Schema({
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

// Define relationship between products and their owner (vendors)
vendorSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'owner'
})

// Customize stringify to hide password and tokens
vendorSchema.methods.toJSON = function () {
    const vendor = this
    const vendorObject = vendor.toObject()

    delete vendorObject.password
    delete vendorObject.tokens
    
    return vendorObject
}

// Generate a new authentication token for a customer
vendorSchema.methods.generateAuthToken = async function () {
    const vendor = this
    const token = jwt.sign({ _id: vendor._id.toString() }, 'challengeVendor')

    vendor.tokens = vendor.tokens.concat({ token })
    await vendor.save()

    return token
}

// Find a customer by email address and password
vendorSchema.statics.findByCredentials = async (email, password) => {
    const vendor = await Vendor.findOne({ email })

    if (!vendor) {
        throw new Error()
    }

    const isMatch = await bcrypt.compare(password, vendor.password)

    if (!isMatch) {
        throw new Error()
    }

    return vendor
}

// Hash password every time it's modified for security
vendorSchema.pre('save', async function (next) {
    const vendor = this
    
    if (vendor.isModified('password')) {
        vendor.password = await bcrypt.hash(vendor.password, 6)
    }
})

// Delete all products in vendor's inventory before deleting the venor
vendorSchema.pre('remove', async function (next) {
    const vendor = this
    await Product.deleteMany({ owner: vendor._id })
    next()
})

const Vendor = mongoose.model('Vendor', vendorSchema)

module.exports = Vendor