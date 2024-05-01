const router = require('express').Router();
const User = require('../models/User');

// Get a user
router.get('/', async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId 
      ? await User.findById(userId) 
      : await User.findOne({ username: username });

    if (!user) {
      return res.status(400).json({error: 'User not found'});
    }

    const { password, updatedAt, ...other } = user._doc;
    
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update user
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      }, { new: true });
      
      if (!updatedUser) {
        return res.status(400).json({ error: 'User not found or you can update only your account' });
      }

      res.status(200).json({ message: 'Account updated', user: updatedUser });
    } catch (err) {
      res.status(500).json({ error: 'Unexpected error occured' });
    }
  } else {
    res.status(400).json({ error: 'User not found or you can update only your account' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      
      if (!deletedUser) {
        return res.status(400).json({ error: 'User not found or you can delete only your account' });
      }

      res.status(200).json({ message: 'Account deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Unexpected error occured' });
    }
  } else {
    res.status(400).json({ error: 'User not found or you can delete only your account' });
  }
});

// Follow a user
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      // Find the user with the id passed in the params of the request
      const user = await User.findById(req.params.id);
      
      // Find the current user
      const currentUser = await User.findById(req.body.userId);

      if (!user || !currentUser) {
        return res.status(400).json({ error: 'User not found' });
      }
      
      // Check if the current user is NOT already following the user
      if (!user.followers.includes(req.body.userId)) {
        //Add the current user to the user's followers list
        await user.updateOne({ $push: { followers: req.body.userId } });
        
        // Add the user to the current user's following list
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        
        // Return a success message
        res.status(200).json('User has been followed and added to your following list.');
      } else {
        //If the current user is already following the user, return an error
        res.status(400).json('You already follow this user');
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json('You cant follow yourself');
  }
});

// Un-follow a user
router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      // Find the user with the id passed in the params of the request
      const user = await User.findById(req.params.id);
      
      // Find the current user
      const currentUser = await User.findById(req.body.userId);

      if (!user || !currentUser) {
        return res.status(400).json({ error: 'User not found' });
      }
      
      // Check if the current user is already following the user
      if (user.followers.includes(req.body.userId)) {
        //Remove the current user from the user's followers list
        await user.updateOne({ $pull: { followers: req.body.userId } });
        
        // Remove the user from the current user's following list
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
      
        // Return a success message
        res.status(200).json('User has been un followed and removed from your following list.');
      } else {
        // If the current user is NOT already following the user, return an error
        res.status(400).json('You do not follow this user');
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json('You cant un-follow yourself');
  }
});

module.exports = router;