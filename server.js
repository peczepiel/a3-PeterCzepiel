require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');

const User = require('./models/User');
const Score = require('./models/Score');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clickgame';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret';

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1day
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    //grader account
    const graderUsername = 'grader@example.com';
    const graderPassword = 'graderpass123';
    const existing = await User.findOne({ username: graderUsername });
    if (!existing) {
      const hash = await bcrypt.hash(graderPassword, 10);
      const grader = new User({ username: graderUsername, passwordHash: hash });
      await grader.save();
      //sample scores
      await Score.create({
        user: grader._id,
        name: 'sample data 1',
        score: 42,
        clicksPerSecond: 4.2
      });
      await Score.create({
        user: grader._id,
        name: 'sample data 2',
        score: 20,
        clicksPerSecond: 2.0
      });
      console.log(`Seeded grader account -> ${graderUsername} / ${graderPassword}`);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
  });

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/register',
  body('username').isEmail().withMessage('username must be an email'),
  body('password').isLength({ min: 6 }).withMessage('password must be >= 6 chars'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    try {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ error: 'Username already exists' });

      const hash = await bcrypt.hash(password, 10);
      const user = new User({ username, passwordHash: hash });
      await user.save();

      req.session.userId = user._id;
      req.session.username = user.username;
      res.json({ message: 'Registered', username: user.username });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

app.post('/api/login',
  body('username').isString(),
  body('password').isString(),
  async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

      req.session.userId = user._id;
      req.session.username = user.username;
      res.json({ message: 'Logged in', username: user.username });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logged out' });
  });
});

app.get('/api/me', (req, res) => {
  if (!req.session || !req.session.userId) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, username: req.session.username });
});

app.get('/api/results', requireAuth, async (req, res) => {
  try {
    const scores = await Score.find({ user: req.session.userId }).sort({ score: -1 }).lean();
    const response = scores.map(s => ({
      _id: s._id,
      name: s.name,
      score: s.score,
      clicksPerSecond: s.clicksPerSecond,
      createdAt: s.createdAt
    }));
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/submit', requireAuth,
  body('name').isString().trim().isLength({ min: 1 }),
  body('score').isInt({ min: 0 }),
  body('clicksPerSecond').isFloat({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name, score, clicksPerSecond } = req.body;
      const s = new Score({
        user: req.session.userId,
        name,
        score,
        clicksPerSecond
      });
      await s.save();
      res.json({ message: 'Saved', id: s._id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

app.put('/api/score/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Score.findOne({ _id: id, user: req.session.userId });
    if (!record) return res.status(404).json({ error: 'Not found' });

    const updates = {};
    if (typeof req.body.name === 'string') updates.name = req.body.name.trim();
    if (typeof req.body.score === 'number') updates.score = req.body.score;
    if (typeof req.body.clicksPerSecond === 'number') updates.clicksPerSecond = req.body.clicksPerSecond;

    await Score.updateOne({ _id: id }, { $set: updates });
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/score/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Score.findOneAndDelete({ _id: id, user: req.session.userId });
    if (!removed) return res.status(404).json({ error: 'Not found or not your record' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
