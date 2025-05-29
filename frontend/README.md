# Shop Inventory Project

This project is a comprehensive shop inventory management system built using HTML, CSS, JavaScript, Node.js, and MongoDB. It provides features for managing products, processing purchases, generating receipts, maintaining transaction records, and implementing a filtering system for sales data.

## Features

- **Product Management**: Create, update, delete, and retrieve products.
- **Transaction Processing**: Handle purchases and maintain transaction history.
- **Receipt Generation**: Generate printable receipts after purchases.
- **Filtering System**: Filter transactions and products based on date and type.
- **Sales Summary**: View a summary of today's sales and transaction history.

## Project Structure

The project is organized into two main directories: `backend` and `frontend`.

### Backend

- **config/db.js**: Database connection logic using Mongoose.
- **controllers**: Contains controllers for managing products and transactions.
- **models**: Defines the schemas for products and transactions.
- **routes**: Maps HTTP requests to controller functions.
- **utils/receiptGenerator.js**: Utility functions for generating receipts.
- **app.js**: Main entry point of the backend application.
- **README.md**: Documentation for the backend part of the project.

### Frontend

- **css/styles.css**: Styles for the frontend application.
- **js**: Contains JavaScript files for global functionality, product management, transaction management, and filtering.
- **index.html**: Main HTML file for the frontend application.
- **receipt.html**: HTML template for displaying purchase receipts.
- **README.md**: Documentation for the frontend part of the project.

## Setup Instructions

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the backend dependencies:
   ```
   cd backend
   npm install
   ```
4. Set up your MongoDB database and update the `.env` file with your connection URI.
5. Start the backend server:
   ```
   npm start
   ```
6. Navigate to the `frontend` directory and open `index.html` in your web browser to access the application.

## Usage

- Use the frontend interface to manage products and transactions.
- Access the backend API for programmatic control over inventory and transactions.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.