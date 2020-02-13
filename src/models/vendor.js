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

vendorSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'owner'
})


vendorSchema.methods.toJSON = function () {
    const vendor = this
    const vendorObject = vendor.toObject()

    delete vendorObject.password
    delete vendorObject.tokens
    
    return vendorObject
}

vendorSchema.methods.generateAuthToken = async function () {
    const vendor = this
    const token = jwt.sign({ _id: vendor._id.toString() }, 'challengeVendor')

    vendor.tokens = vendor.tokens.concat({ token })
    await vendor.save()

    return token
}

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

vendorSchema.pre('save', async function (next) {
    const vendor = this
    
    if (vendor.isModified('password')) {
        vendor.password = await bcrypt.hash(vendor.password, 6)
    }
})

const Vendor = mongoose.model('Vendor', vendorSchema)

module.exports = Vendor