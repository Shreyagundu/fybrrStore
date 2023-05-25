const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.MONGODB_URL;

const connectDB = async() => {
    try {
        await mongoose.connect(URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log('DB Connected!');
    } catch (err) {
        console.log('Error while connecting DB: ' + err);
    }
};

module.exports = connectDB;