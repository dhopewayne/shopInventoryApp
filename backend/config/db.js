const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('debug', true); // Enable mongoose debug logs

const connectDB = async () => {    

  if (!process.env.MONGODB_URI) {
    console.error('MongoDB URI is not defined in environment variables.');
    process.exit(1);
  } else {
    console.log('MongoDB URI is defined.'); 
    console.log(`Connecting to MongoDB at ${process.env.MONGODB_URI}`);
     console.log('MONGODB_URI:', process.env.MONGODB_URI); // Debug line
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.message && error.message.includes('Authentication failed')) {
      console.error('MongoDB authentication failed: Check your username and password in the connection string.');
    } else if (error.message && error.message.includes('ENOTFOUND')) {
      console.error('MongoDB server not found: Check your network connection and cluster address.');
    } else {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
};

module.exports = connectDB;