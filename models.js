const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    chatId: { type: Number, required: true, unique: true },
    right: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
});

module.exports = mongoose.model('UserTG', userSchema);