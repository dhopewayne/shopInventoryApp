const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const moment = require('moment');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Public
exports.createProduct = async (req, res) => {
  const { name, price, quantity } = req.body;

  try {
    // Check if product with the same name already exists (case-insensitive)
    const existingProduct = await Product.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product already exists. You can add quantity instead.' });
    }

    const product = new Product({
      name,
      price,
      quantity
    });

    const savedProduct = await product.save();

    // Create a transaction record for adding a new product
    const transaction = new Transaction({
      type: 'add',
      productId: savedProduct._id,
      productName: savedProduct.name,
      quantity: savedProduct.quantity
    });

    await transaction.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product price
// @route   PUT /api/products/:id/price
// @access  Public
exports.updateProductPrice = async (req, res) => {
  const { price } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const oldPrice = product.price;
    product.price = price;
    const updatedProduct = await product.save();

    // Create a transaction record for editing the price
    const transaction = new Transaction({
      type: 'edit',
      productId: updatedProduct._id,
      productName: updatedProduct.name,
      oldPrice,
      newPrice: updatedProduct.price
    });

    await transaction.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add quantity to product
// @route   PUT /api/products/:id/quantity
// @access  Public
exports.addProductQuantity = async (req, res) => {
  const { quantity } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.quantity += parseInt(quantity); // <-- This adds to the current quantity
    const updatedProduct = await product.save();

    // Create a transaction record for updating quantity
    const transaction = new Transaction({
      type: 'update quantity',
      productId: updatedProduct._id,
      productName: updatedProduct.name,
      quantity: parseInt(quantity), // quantity added
      quantityAvailable: updatedProduct.quantity, // new total after update
      timestamp: new Date()
    });

    await transaction.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product quantity (add quantity)
// @route   PUT /api/products/:id/quantity
// @access  Public
exports.updateProductQuantity = async (req, res) => {
  const { quantity } = req.body; // quantity to add
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.quantity += parseInt(quantity); // ADD, not replace
    const updatedProduct = await product.save();

    // Create a transaction record for updating quantity
    const transaction = new Transaction({
      type: 'update quantity',
      productId: updatedProduct._id,
      productName: updatedProduct.name,
      quantity: parseInt(quantity), // quantity added
      quantityAvailable: updatedProduct.quantity, // new total after update
      timestamp: new Date()
    });

    await transaction.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Request product deletion
// @route   DELETE /api/products/:id/request
// @access  Public
exports.requestProductDeletion = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.pendingDelete = true;
    product.deleteRequestTime = Date.now();
    const updatedProduct = await product.save();

    res.json({
      message: 'Product deletion requested. Will be deleted in 24 hours.',
      product: updatedProduct
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Confirm product deletion
// @route   DELETE /api/products/:id/confirm
// @access  Public
exports.confirmProductDeletion = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.pendingDelete) {
      return res.status(400).json({ message: 'Product is not pending deletion' });
    }

    const deleteRequestTime = moment(product.deleteRequestTime);
    const now = moment();
    const hoursDiff = now.diff(deleteRequestTime, 'hours');

    if (hoursDiff < 24) {
      return res.status(400).json({
        message: `Cannot delete yet. Please wait ${24 - hoursDiff} more hours.`
      });
    }

    // Create a transaction record for deleting the product
    const transaction = new Transaction({
      type: 'delete',
      productId: product._id,
      productName: product.name,
      quantity: product.quantity
    });

    await transaction.save();

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel product deletion request
// @route   PUT /api/products/:id/cancel-delete
// @access  Public
exports.cancelProductDeletion = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.pendingDelete) {
      return res.status(400).json({ message: 'Product is not pending deletion' });
    }

    product.pendingDelete = false;
    product.deleteRequestTime = null;
    const updatedProduct = await product.save();

    res.json({
      message: 'Product deletion request cancelled.',
      product: updatedProduct
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};











