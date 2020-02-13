const express = require('express')
const Product = require('../models/product')
const authCustomer = require('../middleware/authCustomer')

const router = express.Router()

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({})
        res.send(products)
    } catch (e) {
        res.status(500).send()
    }
})

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

router.post('/products/:id', authCustomer, async (req, res) => {
    const _id = req.params.id
    let quantity = 1

    if (req.query.quantity) {
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
        else if (product.quantity < quantity) {
            return res.status(400).send()
        }

        product.quantity -= quantity
        await product.save()
        res.send(product)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

module.exports = router