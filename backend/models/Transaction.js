const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['purchase', 'add', 'edit', 'delete', 'update quantity']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: function() {
      return (
        this.type === 'purchase' ||
        this.type === 'add' ||
        this.type === 'update quantity'
      );
    },
    default: 0
  },
  quantityAvailable: {
    type: Number,
    required: function() {
      return this.type === 'update quantity';
    },
    default: 0
  },
  oldPrice: {
    type: Number,
    required: function() {
      return this.type === 'edit';
    }
  },
  newPrice: {
    type: Number,
    required: function() {
      return this.type === 'edit';
    }
  },
  totalPrice: {
    type: Number,
    required: function() {
      return this.type === 'purchase';
    },
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);