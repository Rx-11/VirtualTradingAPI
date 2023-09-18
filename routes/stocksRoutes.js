const express = require('express')
const router = express.Router()
const stocksController = require('../controllers/stocksController')
// const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)

router.route('/')
    .get(stocksController.getAllStocks)
    .post(stocksController.createNewStocks)
    .patch(stocksController.updateStocks)
    .delete(stocksController.deleteStocks)

module.exports = router