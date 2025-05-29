# Shop Inventory Project

## Overview
The Shop Inventory Project is a comprehensive application designed to manage products and transactions for a retail environment. It allows users to create, update, delete products, process purchases, and maintain transaction records. The project also includes features for generating receipts and filtering sales data.

## Features
- **Product Management**: Create, update, delete, and retrieve products.
- **Transaction Processing**: Process purchases and maintain a history of transactions.
- **Receipt Generation**: Generate printable receipts after purchases.
- **Sales Data Filtering**: Filter transactions based on date and type.
- **24-Hour Deletion Confirmation**: Implement a confirmation period for product deletions.

## Technologies Used
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Frontend**: HTML, CSS, JavaScript

## Setup Instructions

### Prerequisites
- Node.js and npm installed on your machine.
- MongoDB installed and running, or a MongoDB Atlas account.

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd shop-inventory-project
   ```

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the backend directory and add your MongoDB connection URI:
   ```
   MONGODB_URI=mongodb://localhost:27017/inventory_db
   PORT=5000
   ```

5. Start the backend server:
   ```
   node app.js
   ```

6. Navigate to the frontend directory:
   ```
   cd ../frontend
   ```

7. Open `index.html` in your web browser to access the application.

## API Endpoints

### Product Routes
- `GET /api/products`: Retrieve all products.
- `GET /api/products/:id`: Retrieve a single product by ID.
- `POST /api/products`: Create a new product.
- `PUT /api/products/:id/price`: Update the price of a product.
- `PUT /api/products/:id/quantity`: Add quantity to a product.
- `DELETE /api/products/:id/request`: Request product deletion.
- `DELETE /api/products/:id/confirm`: Confirm product deletion.
- `PUT /api/products/:id/cancel-delete`: Cancel product deletion request.

### Transaction Routes
- `GET /api/transactions`: Retrieve all transactions.
- `POST /api/transactions`: Process a new purchase.

## Contribution
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.