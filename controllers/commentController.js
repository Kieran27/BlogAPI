const Comment = require("../models/comment");
const { body, validationResult } = require("express-validator");

exports.comments_get = (req, res, next) => {
  Comment.find()
    .sort({ timestamp: -1 })
    .exec((err, comments) => {
      if (err) {
        return res.json({ error: err });
      }
    });
  res.json({ message: "Got all the comments!" });
};

exports.comments_post = [
  body("name", "name cannot be empty")
    .exists()
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape(),

  body("comment-content", "comment not valid")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const comment = new Comment({
      content: req.body.content,
    });

    comment.save((err) => {
      if (err) {
        return res.status(404);
      }
      console.log("Saved to database!");
    });
    res.json({ message: "Comment Posted!" });
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

exports.comment_put_id = (req, res, next) => {
  res.json({ message: "comment updated!" });
};

exports.comment_delete_id = (req, res, next) => {
  res.json({ message: "comment deleted!" });
};
