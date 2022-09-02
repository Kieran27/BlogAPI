const Post = require("../models/post");
const Comment = require("../models/comment");
const { body, validationResult } = require("express-validator");

// Get all posts
exports.posts_get = (req, res) => {
  Post.find()
    .sort({ timestamp: "descending" })
    .populate("comments")
    .exec((err, data) => {
      if (err) {
        res.status(404);
        res.json({ error: err });
      }
      res.json({ posts: data });
    });
};

// Create new post
exports.posts_post = [
  // Sanitize and validate
  body("title", "title cannot be empty").exists().trim().escape(),
  body("content", "content not valid").exists().trim(),

  async (req, res, next) => {
    // Check if validation result passes
    const errors = validationResult(req.body);
    if (!errors.isEmpty) {
      return res.json(errors);
    }

    const { title, content, author } = req.body;
    try {
      await Post.create({
        title: title,
        content: content,
        author: author,
      });
      res.json({ message: "Post Submitted!" });
    } catch (error) {
      res.status(409).json({ message: error });
    }
  },
];

// Get individual post
exports.post_get_id = (req, res) => {
  console.log(req.params);
  Post.findById(req.params.post_id)
    .populate("comments")
    .exec((err, data) => {
      if (err) {
        return res.json({ error: err });
      }
      return res.json({ post: data });
    });
};

// Updated existing individual post
exports.post_put_id = [
  // Validate and sanitize
  body("title", "title cannot be empty").exists().trim().escape(),
  body("content", "content not valid").exists().trim(),

  async (req, res) => {
    //Get Validation Results
    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
      return res.json(errors.array());
    }

    const postId = req.params.post_id;
    const { title, content } = req.body;

    console.log(postId, title, content);

    // Create New Post
    newPost = new Post({
      title: title,
      content: content,
    });

    // update post
    try {
      const updatedResult = await Post.findByIdAndUpdate(postId, {
        title,
        content,
      });
      res.json({ updatedResult });
    } catch (error) {
      res.json({ error });
    }
  },
];

//Delete existing individual post
exports.post_delete_id = async (req, res) => {
  const postId = req.params.post_id;
  try {
    await Post.findByIdAndDelete(postId);

    // Find and delete all comments with corresponding postId
    const deleteComments = await Comment.deleteMany({ postId: postId });

    res.json({ message: "Post Deleted!" });
  } catch (error) {
    res.json({ error });
  }
};

// Handle Starring Post
exports.post_star_post = async (req, res) => {
  const { userId } = req.body;
  const postId = req.params.post_id;
  console.log(postId);
  try {
    // Add userid to starids array from post model
    const staridsPosts = await Post.find({ _id: postId });
    const starids = staridsPosts[0].starIds;
    console.log(starids);

    // Push userId to array and update document's array
    const updatedArray = [...starids, userId];
    console.log(updatedArray);
    const updatedStarIds = await Post.findByIdAndUpdate(postId, {
      starIds: updatedArray,
    });

    // Update and increment post star number by 1
    const post = await Post.find({ _id: postId });
    let stars = post[0].stars;
    let updatedStars = (stars += 1);

    await Post.findByIdAndUpdate(postId, {
      stars: updatedStars,
    });
    return res.json({ message: "Success!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handle Un-Starring Post
exports.post_star_post = async (req, res) => {
  const { userId } = req.body;
  const postId = req.params.post_id;
  try {
    // Remove userid to starids array from post model
    const staridsPosts = await Post.find({ _id: postId });
    const starids = staridsPosts[0].starIds;

    // Remove userId to array and update document's array
    const updatedArray = starids.filter((item) => item === userId);
    const updatedStarIds = await Post.findByIdAndUpdate(postId, {
      starIds: updatedArray,
    });

    // Update and decrement post star number by 1
    const post = await Post.find({ _id: postId });
    let stars = post[0].stars;
    let updatedStars = (stars -= 1);

    await Post.findByIdAndUpdate(postId, {
      stars: updatedStars,
    });
    return res.json({ message: "Success!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
