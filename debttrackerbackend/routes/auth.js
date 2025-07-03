const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🔐 Signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ msg: 'User already exists' });

    const newUser = new User({ username, password });
    await newUser.save();
    res.json({ msg: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Error creating user' });
  }
});

// 🔑 Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Incorrect password' });

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET);
    res.json({ msg: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ msg: 'Error logging in' });
  }
});

module.exports = router;
