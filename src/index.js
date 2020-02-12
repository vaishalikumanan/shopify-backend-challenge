const express = require('express')
require('./db/mongoose')
const vendorRouter = require('./routers/vendor')

const app = express()
const port = 3000

app.use(express.json())
app.use(vendorRouter)

app.listen(port, () => {
    console.log('Server is up on port', port)
})