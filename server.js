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
    ...(date && date.length > 0 && { date }),
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

// GET user logs
app.get('/api/users/:_id/logs', (req, res, next) => {
  const { from, to, limit } = req.query;

  const dateMatch = {
    match: {
      date:
        from && to
          ? { $gte: from, $lte: to }
          : from
          ? { $gte: from }
          : { $lte: to },
    },
  };

  const limitOption = {
    options: { limit },
  };

  User.findById(req.params._id)
    .populate({
      path: 'log',
      select: '-_id', // Unable to exclude userId here due to population logic
      ...((from || to) && dateMatch),
      ...(limit && limitOption),
    })
    .exec((err, user) => {
      if (err) {
        next(err);
      } else {
        // Necessary in order to delete properties
        const { _id, username, count, log } = user.toObject();

        // Populate response object
        const resObj = {
          _id,
          username,
          ...(from && { from: new Date(from.split('-')).toDateString() }),
          ...(to && { to: new Date(to.split('-')).toDateString() }),
          count,
          log,
        };

        // Delete the userId field from the log subdocs
        for (let i = 0; i < resObj.log.length; i++) {
          delete resObj.log[i].userId;
        }
        res.json(resObj);
      }
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
