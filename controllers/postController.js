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
  body("content", "content not valid").exists().trim().escape(),

  async (req, res, next) => {
    // Check if validation result passes
    const errors = validationResult(req.body);
    if (!errors.isEmpty) {
      return res.json(err);
    }
    const { title, content } = req.body;
    try {
      await Post.create({
        title: title,
        content: content,
      });
      res.json({ message: "Post Submitted!" });
    } catch (err) {
      res.json({ message: "error" });
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
    res.json({ message: "Post Deleted!" });
  } catch (error) {
    res.json({ error });
  }
};
