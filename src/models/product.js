const mongoose = require('mongoose')
const validator = require('validator')


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: Buffer,
        required: true
    },
    price: {
        type: Number,
        required: true,
        get: x => (x / 100).toFixed(2),
        set: x => x * 100,
        validate(value) {
            if (value < 0) {
                throw new Error('Price is invalid')
            }
        }
    },
    quantity: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Quantity is invalid')
            }
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vendor'
    }
}, {
    timestamps: true
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product