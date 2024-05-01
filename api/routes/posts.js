const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');
const { validationResult } = require('express-validator');

// Create an image post
router.post('/', async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { userId, desc, img } = req.body;
    
    // Check if the image is a URL or a file
    const isUrl = img.startsWith('https://');
  
    // Encode image to base64
    function base64_encode(file) {
      return "data:image/jpeg;base64," + fs.readFileSync(file, 'base64');
    }
  
    let base64str = img;
  
    // If the image is a file, encode it to base64
    if (!isUrl) {
      // Update the file path based on your environment
      base64str = base64_encode(`/usercode/image_sharing_app/api/public/images/${img}`);
    }
  
    // Create a new post
    const newPost = new Post({
      userId,
      desc,
      img: base64str,
    });
  
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error occured' });
  }
});

// Update an image post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(400).json({ error: 'Post not found' });
    } else if (post.userId !== req.body.userId) {
      res.status(400).json({ error: 'You can only update your post' });
    } else {
      await post.updateOne({$set: req.body});
      res.status(200).json('The post has been updated');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete an image post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ error: 'Post not found' });
    }

    console.log("post.userId: ", post.userId);
    console.log("req.body.userId: ", req.body.userId);

    if (post.userId !== req.body.userId) {
      return res.status(400).json({ error: 'You can only delete your post' });
    }

    await post.deleteOne();
    res.status(200).json('The post has been deleted');
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get a single image post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(400).json({ error: 'Post not found' });
    } else {
      res.status(200).json(post);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all posts of a user
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({username: req.params.username});
    if (!user) {
      res.status(400).json({ error: 'User not found' });
    } else {
      const posts = await Post.find({userId: user._id});
      res.status(200).json(posts);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;