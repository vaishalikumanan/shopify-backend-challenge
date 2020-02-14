const multer = require('multer')

// Middleware for uploading files
const upload = multer({
    limits: {
        filesize: 1000000
    },
    fileFilter(req, file, cb) {
        // Make sure file is an image
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})
module.exports = upload