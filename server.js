const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// GET/POST users
app
  .route('/api/users')
  .get((req, res, next) => {
    User.find({})
      .select('_id username count log')
      .exec((err, users) => {
        err ? next(err) : res.json(users);
      });
  })
  .post((req, res, next) => {
    const newUser = new User({ username: req.body.username });
    newUser.save((err) => {
      err
        ? next(err)
        : User.find(newUser)
            .select('_id username')
            .exec((err, user) => {
              err ? next(err) : res.json(user);
            });
    });
  });

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
