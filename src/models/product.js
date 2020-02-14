const mongoose = require('mongoose')

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
    timestamps: true,
    toJSON: {
        getters: true
    }
})

// Customize stringify to hide image buffer (takes up a lot of space)
productSchema.methods.toJSON = function () {
    const product = this
    const productObject = product.toObject()

    delete productObject.image
    
    return productObject
}

const Product = mongoose.model('Product', productSchema)

module.exports = Product