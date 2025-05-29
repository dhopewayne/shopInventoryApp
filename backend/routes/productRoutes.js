const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// @desc    Get all products
// @route   GET /api/products
router.get('/', productController.getProducts);

// @desc    Get a single product
// @route   GET /api/products/:id
router.get('/:id', productController.getProductById);

// @desc    Create a new product
// @route   POST /api/products
router.post('/', productController.createProduct);

// @desc    Update product price
// @route   PUT /api/products/:id/price
router.put('/:id/price', productController.updateProductPrice);

// @desc    Add quantity to product
// @route   PUT /api/products/:id/quantity
router.put('/:id/quantity', productController.addProductQuantity);

// @desc    Request product deletion
// @route   DELETE /api/products/:id/request
router.delete('/:id/request', productController.requestProductDeletion);

// @desc    Confirm product deletion
// @route   DELETE /api/products/:id/confirm
router.delete('/:id/confirm', productController.confirmProductDeletion);

// @desc    Cancel product deletion request
// @route   PUT /api/products/:id/cancel-delete
router.put('/:id/cancel-delete', productController.cancelProductDeletion);

module.exports = router;