const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// @desc    Process a purchase
// @route   POST /api/transactions/purchase
// @access  Public
exports.processPurchase = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    product.quantity -= quantity;
    await product.save();

    const totalPrice = product.price * quantity;

    const transaction = new Transaction({
      type: 'purchase',
      productId: product._id,
      productName: product.name,
      quantity,
      totalPrice
    });

    await transaction.save();

    res.status(201).json({ message: 'Purchase processed successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction history
// @route   GET /api/transactions
// @access  Public
exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('productId', 'name price');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's sales summary
// @route   GET /api/transactions/today
// @access  Public
exports.getTodaysSalesSummary = async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    const transactions = await Transaction.find({
      timestamp: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const totalSales = transactions.reduce((acc, transaction) => acc + transaction.totalPrice, 0);
    res.json({ totalSales, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};