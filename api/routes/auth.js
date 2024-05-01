const router = require('express').Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    // Check if the email already exists
    const cUserEmail = await User.findOne({
      email: req.body.email,
    });
    if(cUserEmail) {
      return res.status(400).json('Email already exists');
    }
    
    // Check if the username already exists
    const cUserName = await User.findOne({
      username: req.body.username,
    });
    if (cUserName) {
      return res.status(400).json('Username already exists');
    }

    // Save the user and respond with the user
    const user = await newUser.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if(!user) {
      return res.status(400).json('Invalid email');
    }
    
    const userPassword = await User.findOne({
      password: req.body.password,
    });
    if (!userPassword) {
      return res.status(400).json('Invalid password');
    }
    
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;