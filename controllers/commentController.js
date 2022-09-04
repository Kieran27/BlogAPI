const Comment = require("../models/comment");
const Post = require("../models/post");
const { body, validationResult } = require("express-validator");
const { findByIdAndUpdate, findById } = require("../models/post");

exports.comments_get = async (req, res, next) => {
  Comment.find()
    .sort({ timestamp: -1 })
    .exec((err, comments) => {
      if (err) {
        return res.json({ error: err });
      }
      res.json({ comments });
    });
};

exports.comments_post = [
  // Sanitize and validate
  body("name", "name cannot be empty")
    .exists()
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape(),

  body("content", "comment not valid").trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    console.log(req.params);
    // Check if validation result passes
    const errors = validationResult(req.body);
    if (!errors.isEmpty) {
      return res.json(err);
    }
    try {
      const newComment = await Comment.create({
        author: req.body.name,
        content: req.body.content,
        postId: req.params.post_id,
        timestamp: new Date(),
      });

      // Update Post's comments Array
      const comments = await Comment.find({ postId: req.params.post_id });
      console.log(comments);
      const updatedPost = await Post.findByIdAndUpdate(req.params.post_id, {
        comments: comments,
      });

      return res.json({ updatedPost });
    } catch (error) {
      return res.status(409).json({ error });
    }
  },
];

exports.comment_get_id = (req, res, next) => {
  Comment.findById(req.params.comment_id).exec((err, comment) => {
    if (err) {
      return res.json({ error: err });
    }
    return res.json({ comment });
  });
};

exports.comment_put_id = [
  // Validate and Sanitize
  body("commentContent", "Comment edit is not valid")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async (req, res) => {
    // Check Validation Result
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.json(err);
    }

    const commentId = req.params.comment_id;

    try {
      commentUpdateResult = await Comment.findByIdAndUpdate(commentId, {
        content: req.body.commentContent,
      });
    } catch (error) {
      res.json({ error: error.message });
    }
  },
];

exports.comment_delete_id = async (req, res) => {
  const id = req.params.comment_id;
  try {
    deletedResult = await Comment.findByIdAndDelete(id);
    return res.json({ deletedResult });
  } catch (error) {
    res.json({ error });
  }
};

exports.comments_create = (req, res) => {
  Comment.create({
    content: "hello world",
    timestamp: Date.now(),
  });
  Comment.create({
    content: "Test Comment",
    timestamp: Date.now(),
  });
  Comment.create({
    content: "Testing for populate method",
    timestamp: Date.now(),
  });
  res.send("Done!");
};

exports.user_comments_get = async (req, res) => {
  const userId = req.params.user_id;
  try {
    Comment.find(userId);
  } catch (error) {
    res.json({ error });
  }
};
