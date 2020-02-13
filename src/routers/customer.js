const express = require('express')
const Customer = require('../models/customer')
const authCustomer = require('../middleware/authCustomer')

const router = express.Router()

router.post('/customers/register', async (req, res) => {
    const customer = new Customer(req.body)

    try {
        await customer.save()
        const token = await customer.generateAuthToken()
        res.status(201).send({ customer, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/customers/login', async (req, res) => {
    try {
        const customer = await Customer.findByCredentials(req.body.email, req.body.password)
        const token = await customer.generateAuthToken()
        res.send({ customer, token })
    } catch (e) {
        res.status(400).send({ error: 'Unable to login'})
    }
})

router.post('/customers/logout', authCustomer, async (req, res) => {
    try {
        if (req.query.all === 'true') {
            req.customer.tokens = []
        }
        else {
            req.customer.tokens = req.customer.tokens.filter((token) => {
                return token.token !== req.token
            })
        }
        await req.customer.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/customers/me', authCustomer, async (req, res) => {
    res.send(req.customer)
})

module.exports = router