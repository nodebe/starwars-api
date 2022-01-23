const express = require('express')

const router = express();
const indexController = require('./controller/index')

router.use('', indexController())

router.use((req, res, next) => {
    const message = "Not found!"
    return res.status(404).json({
        error: {
            message,
        }
    })
})

module.exports = router;