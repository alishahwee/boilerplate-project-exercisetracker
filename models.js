const mongoose = require('mongoose');

const { Schema } = mongoose;

const usersSchema = new Schema({
  username: { type: String, required: true },
  count: { type: Number, required: true },
  log: [
    {
      description: String,
      duration: Number,
      date: Date,
    },
  ],
});

const User = mongoose.model('User', usersSchema);

export default User;
