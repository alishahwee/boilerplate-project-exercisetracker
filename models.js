const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);
userSchema.virtual('count').get(function () {
  return this.log.length;
});
userSchema.virtual('log', {
  ref: 'Exercise',
  localField: '_id',
  foreignField: 'userId',
  justOne: false,
});

const exerciseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now, get: (v) => v.toDateString() },
  },
  {
    versionKey: false,
    toJSON: { getters: true },
    toObject: { getters: true },
    id: false,
  }
);

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

exports.User = User;
exports.Exercise = Exercise;
