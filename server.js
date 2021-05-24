const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const { User, Exercise } = require('./models');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// GET/POST users
app
  .route('/api/users')
  .get((_req, res, next) => {
    User.find({}, (err, users) => {
      err ? next(err) : res.json(users);
    });
  })
  .post((req, res, next) => {
    const newUser = new User({ username: req.body.username });
    newUser.save((err, user) => {
      err ? next(err) : res.json(user);
    });
  });

// POST exercises
app.post('/api/users/:_id/exercises', (req, res, next) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;
  const newExercise = new Exercise({
    userId,
    description,
    duration,
    ...(date.length > 0 && { date }),
  });
  newExercise.save((err, exercise) => {
    if (err) return next(err);
    User.findById(userId, (err, user) => {
      const resObj = {
        _id: user._id,
        username: user.username,
        date: exercise.date,
        duration: exercise.duration,
        description: exercise.description,
      };
      err ? next(err) : res.json(resObj);
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
