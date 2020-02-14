const express = require('express')
const sharp = require('sharp')
const Vendor = require('../models/vendor')
const Product = require('../models/product')
const { authVendor } = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = express.Router()

// Register a vendor
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

// Login to vendor account
router.post('/vendors/login', async (req, res) => {
    try {
        const vendor = await Vendor.findByCredentials(req.body.email, req.body.password)
        const token = await vendor.generateAuthToken()
        res.send({ vendor, token })
    } catch (e) {
        res.status(400).send({ error: 'Unable to login'})
    }
})

// Logout of vendor account
router.post('/vendors/logout', authVendor, async (req, res) => {
    try {
        if (req.query.all === 'true') {
            // Logout of all sessions (remove all tokens)
            req.vendor.tokens = []
        }
        else {
            // Logout of current session
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

// Get vendor profile information
router.get('/vendors/me', authVendor, async (req, res) => {
    res.send(req.vendor)
})

// Delete vendor
router.delete('/vendors/me', authVendor, async (req, res) => {
    try {
        await req.vendor.remove()
        res.send(req.vendor)
    } catch (e) {
        res.status(500).send()
    }
}) 

// Vendors can only add/update/delete products in their inventory, so check authentication first
// Get list of products being sold by logged in vendor
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

// Create a new product to be sold by current vendor
router.post('/vendors/products', authVendor, upload.single('image'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    
    const product = new Product({
        ...req.body,
        image: buffer,
        owner: req.vendor._id
    })

    try {
        await product.save()
        res.status(201).send(product)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Get a product by id
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

// Update a product by id
router.patch('/vendors/products/:id', authVendor, async (req, res) => {
    const _id = req.params.id

    const updates = Object.keys(req.body)
    // Can only change price and quantity 
    const allowedUpdates = ['price','quantity']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }
    
    try {
        const product = await Product.findOne({ _id, owner: req.vendor._id })
        if (!product) {
            return res.status(404).send()
        }

        updates.forEach((update) => product[update] = req.body[update])
        await product.save()
        res.send(product)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete a product by id
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

// Get a product's image
router.get('/vendors/products/:id/image', authVendor, async (req, res) => {
    const _id = req.params.id
    
    try {
        const product = await Product.findOne({ _id, owner: req.vendor._id })

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