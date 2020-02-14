const jwt = require('jsonwebtoken')
const Vendor = require('../models/vendor')
const Customer = require('../models/customer')

// Check if user is an authenticated vendor
const authVendor = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'challengeVendor')
        const vendor = await Vendor.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!vendor) {
            throw new Error()
        }

        req.token = token
        req.vendor = vendor
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

// Check if user is an authenticated customer
const authCustomer = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'challengeCustomer')
        const customer = await Customer.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!customer) {
            throw new Error()
        }

        req.token = token
        req.customer = customer
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = { authVendor, authCustomer }