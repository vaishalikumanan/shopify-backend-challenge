const express = require('express')
const Vendor = require('../models/vendor')
const Product = require('../models/product')
const authVendor = require('../middleware/authVendor')

const router = express.Router()

router.post('/vendors/register', async (req, res) => {
    const vendor = new Vendor(req.body)

    try {
        await vendor.save()
        const token = await vendor.generateAuthToken()
        res.status(201).send({ vendor, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/vendors/login', async (req, res) => {
    try {
        const vendor = await Vendor.findByCredentials(req.body.email, req.body.password)
        const token = await vendor.generateAuthToken()
        res.send({ vendor, token })
    } catch (e) {
        res.status(400).send({ error: 'Unable to login'})
    }
})

router.post('/vendors/logout', authVendor, async (req, res) => {
    try {
        if (req.query.all === 'true') {
            req.vendor.tokens = []
        }
        else {
            req.vendor.tokens = req.vendor.tokens.filter((token) => {
                return token.token !== req.token
            })
        }
        await req.vendor.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/vendors/me', authVendor, async (req, res) => {
    res.send(req.vendor)
})

router.get('/vendors/products', authVendor, async (req, res) => {
    try {
        await req.vendor.populate({
            path: 'products'
        }).execPopulate()

        res.send(req.vendor.products)
    } catch(e) {
        res.status(500).send()
    }
})

router.post('/vendors/products', authVendor, async (req, res) => {
    console.log(req.body)
    const product = new Product({
        ...req.body,
        owner: req.vendor._id
    })

    try {
        await product.save()
        res.status(201).send(product)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/vendors/products/:id', authVendor, async (req, res) => {
    const _id = req.params.id

    try {
        const product = await Product.findOne({ _id, owner: req.vendor._id })
        
        if (!product) {
            return res.status(404).send()
        }

        res.send(product)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/vendors/products/:id', authVendor, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, owner: req.vendor._id })
        
        if (!product) {
            return res.status(404).send()
        }

        res.send(product)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router