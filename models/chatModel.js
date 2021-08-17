const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chat_name: {type: String, unique: true},
    participants: [String],
    history: [{sender: String, msg: String}]
});

module.exports = mongoose.model("chat", chatSchema);