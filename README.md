<<<<<<< HEAD
# Shop Inventory Project

## Overview
The Shop Inventory Project is a comprehensive application designed to manage products and transactions for a retail environment. It allows users to create, update, delete products, process purchases, generate receipts, and maintain transaction records. The project also includes a filtering system for sales data and provides a summary of today's sales and transaction history.

## Features
- **Product Management**: Create, update, delete, and retrieve products with a 24-hour confirmation period for deletions.
- **Transaction Processing**: Handle purchases and maintain a history of transactions.
- **Receipt Generation**: Generate printable receipts after purchases.
- **Sales Data Filtering**: Filter transactions and products based on date and type.
- **Sales Summary**: View a summary of today's sales.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB (using Mongoose for object modeling)

## Project Structure
```
shop-inventory-project
├── backend
│   ├── config
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── utils
│   ├── app.js
│   └── README.md
├── frontend
│   ├── css
│   ├── js
│   ├── index.html
│   ├── receipt.html
│   └── README.md
├── .env
├── package.json
└── README.md
```

## Setup Instructions

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/inventory_db
   ```
4. Start the server:
   ```
   node app.js
   ```

### Frontend
1. Navigate to the `frontend` directory.
2. Open `index.html` in a web browser to access the application.

## API Endpoints
- **Products**
  - `GET /api/products`: Retrieve all products
  - `POST /api/products`: Create a new product
  - `PUT /api/products/:id`: Update a product
  - `DELETE /api/products/:id/request`: Request product deletion
  - `DELETE /api/products/:id/confirm`: Confirm product deletion

- **Transactions**
  - `GET /api/transactions`: Retrieve all transactions
  - `POST /api/transactions`: Process a purchase

## Contribution
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.
=======
# shopInventoryApp
A comprehensive shop inventory project for managing products, processing purchases, and maintaining transaction records.
>>>>>>> a93137d07287ece50a3c364d5a41a7d24e0d7e2f
