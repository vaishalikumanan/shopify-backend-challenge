const express = require('express')
const Vendor = require('../models/vendor')
const auth = require('../middleware/auth')

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

router.post('/vendors/logout', auth, async (req, res) => {
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

router.get('/vendors/me', auth, async (req, res) => {
    res.send(req.vendor)
})

module.exports = router