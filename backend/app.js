const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

dotenv.config();
connectDB();

const app = express();

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        'https://cdn.tailwindcss.com',
        'https://cdnjs.cloudflare.com', // for FontAwesome
        "'unsafe-inline'", // allow inline styles if needed
      ],
      scriptSrc: [
        "'self'",
        'https://cdn.tailwindcss.com',
        'https://cdnjs.cloudflare.com', // for FontAwesome
        "'unsafe-inline'", // allow inline scripts if needed
      ],
      fontSrc: [
        "'self'",
        'https://cdnjs.cloudflare.com', // for FontAwesome fonts
      ],
      imgSrc: ["'self'", 'data:'],
    },
  },
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);

// Serve frontend HTML files for direct navigation
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/transactions.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/transaction.html'));
});
app.get('/receipt.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/receipt.html'));
});

// Catch-all: serve index.html for any other non-API route (for SPA support)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});