const Comment = require("../models/comment");
const { body, validationResult } = require("express-validator");

exports.comments_get = async (req, res, next) => {
  console.log(req.params);
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
      Comment.create({
        author: req.body.name,
        content: req.body.content,
        postId: req.params.post_id,
      });
      return res.send("Yay!");
    } catch (error) {
      return res.status(404).json({ error });
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
  body("comment-content", "Comment edit is not valid")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.json(err);
    }

    // Comment.findByIdAndUpdate
    res.json({ message: "comment updated!" });
  },
];

exports.comment_delete_id = (req, res, next) => {
  const id = req.params.comment_id;
  Comment.findByIdAndDelete(id, (err, docs) => {
    if (err) {
      return res.json({ err });
    }
    console.log(`Deleted: ${docs}`);
    res.json({ message: "comment deleted!" });
  });
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
