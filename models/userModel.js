const mongoose = require('mongoose');

const userScheme = new mongoose.Schema({
    username: { type: String, unique: true, default: null },
    password: { type: String },
    token: { type: String }
});

module.exports = mongoose.model("user", userScheme);