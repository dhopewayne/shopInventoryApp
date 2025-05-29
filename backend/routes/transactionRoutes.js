const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// @desc    Process a purchase
// @route   POST /api/transactions/purchase
// @access  Public
router.post('/purchase', transactionController.processPurchase);

// @desc    Get transaction history
// @route   GET /api/transactions
// @access  Public
router.get('/', transactionController.getTransactionHistory);

// @desc    Get today's sales summary
// @route   GET /api/transactions/today
// @access  Public
router.get('/today', transactionController.getTodaysSalesSummary);

module.exports = router;