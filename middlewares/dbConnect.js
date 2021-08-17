const mongoose = require('mongoose');
const config = require('../config');
const { MONGO_URI } = config;

// Middleware for connecting to the DB when the server first runs.
exports.connect = () => {
    mongoose.connect(MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        .then(() => {
            console.log("Successfully connected to db.");
        })
        .catch((error) => {
            console.log(error.message);
        });
}