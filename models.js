const mongoose = require('mongoose');

const { Schema } = mongoose;

const usersSchema = new Schema({
  username: { type: String, required: true },
  count: { type: Number, required: true, default: 0 },
  log: [
    {
      description: String,
      duration: Number,
      date: Date,
    },
  ],
});

const User = mongoose.model('User', usersSchema);

module.exports = User;
