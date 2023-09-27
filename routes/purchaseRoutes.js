const express = require('express');
const purchaseController = require('../controllers/purchaseController')

const router = express.Router();

router.get('/checkout-session/:courseID', purchaseController.getCheckoutSession)

module.exports = router;
