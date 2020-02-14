const express = require('express')
const Product = require('../models/product')
const { authCustomer } = require('../middleware/auth')

const router = express.Router()

// Get list of all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({})
        res.send(products)
    } catch (e) {
        res.status(500).send()
    }
})

// Get one product's information by id
router.get('/products/:id', async (req, res) => {
    const _id = req.params.id
    
    try {
        const product = await Product.findOne({ _id })

        if (!product) {
            return res.status(404).send()
        }

        res.send(product)
    } catch (e) {
        res.status(500).send()
    }
})

// Purchase a product by id
router.post('/products/:id', authCustomer, async (req, res) => {
    const _id = req.params.id
    let quantity = 1

    if (req.query.quantity) {
        // Verify the purchase quantity is positive
        if (req.query.quantity < 1) {
            return res.status(400).send()
        }
        quantity = parseInt(req.query.quantity)
    }

    try {
        const product = await Product.findOne({ _id })

        if (!product) {
            return res.status(404).send()
        }
        // Verify there are enough units of the product to purchase
        else if (product.quantity < quantity) {
            return res.status(400).send()
        }

        // Update quantity after purchase
        product.quantity -= quantity
        await product.save()
        res.send(product)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

// Get a product's image
router.get('/products/:id/image', async (req, res) => {
    const _id = req.params.id
    
    try {
        const product = await Product.findOne({ _id })

        if (!product) {
            return res.status(404).send()
        }

        res.set('Content-Type', 'image/png')
        res.send(product.image)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router