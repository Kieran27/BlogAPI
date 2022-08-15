const Post = require("../models/post");
const Comment = require("../models/comment");

// Get all posts
exports.posts_get = (req, res) => {
  Post.find()
    .sort({ timestamp: "descending" })
    .populate({
      path: "comments",
    })
    .exec((err, data) => {
      if (err) {
        res.status(404);
        res.json({ error: err });
      }
      res.json({ posts: data });
    });
};

// Create new post
exports.posts_post = async (req, res, next) => {
  try {
    await Post.create({
      title: "pls work",
      content: "worldies",
      comments: await Comment.find(),
    });
    res.json({ message: "Post Submitted!" });
  } catch (err) {
    res.json({ message: "error" });
  }
};

// Get individual post
exports.post_get_id = (req, res) => {
  console.log(req.params);
  Post.findById(req.params.post_id)
    .populate("comments", "postId")
    .exec((err, data) => {
      if (err) {
        return res.json({ error: err });
      }
      return res.json({ post: data });
    });
};

// Updated existing individual post
exports.post_put_id = (req, res, next) => {
  res.json({ message: "Post Updated" });
};

//Delete existing individual post
exports.post_delete_id = (req, res, next) => {
  res.json({ message: "Post Deleted!" });
};
