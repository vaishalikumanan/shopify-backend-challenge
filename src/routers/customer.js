const express = require('express')
const Customer = require('../models/customer')
const { authCustomer } = require('../middleware/auth')

const router = express.Router()

// Register a customer
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

// Login to customer account
router.post('/customers/login', async (req, res) => {
    try {
        const customer = await Customer.findByCredentials(req.body.email, req.body.password)
        const token = await customer.generateAuthToken()
        res.send({ customer, token })
    } catch (e) {
        res.status(400).send({ error: 'Unable to login'})
    }
})

// Logout of customer account
router.post('/customers/logout', authCustomer, async (req, res) => {
    try {
        if (req.query.all === 'true') {
            // Logout of all sessions (remove all tokens)
            req.customer.tokens = []
        }
        else {
            // Logout of current session
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

// Get customer profile information
router.get('/customers/me', authCustomer, async (req, res) => {
    res.send(req.customer)
})

// Delete customer
router.delete('/customers/me', authCustomer, async (req, res) => {
    try {
        await req.customer.remove()
        res.send(req.customer)
    } catch (e) {
        res.status(500).send()
    }
}) 

module.exports = router