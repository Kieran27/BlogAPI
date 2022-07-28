const Post = require("../models/post");

// Get all posts
exports.posts_get = (req, res, next) => {
  Post.find()
    .sort({ timestamp: "descending" })
    .exec((err, data) => {
      if (err) {
        res.status(404);
        res.json({ error: err });
      }
      res.json({ posts: data });
    });
};

// Create new post
exports.posts_post = (req, res, next) => {
  const post = new Post({
    title: req.body.posttitle,
    content: req.body.postbody,
  });

  post.save((err) => {
    if (err) {
      return res.status(404);
    }
    console.log("Saved to database!");
  });
  res.json({ message: "Post Submitted!" });
};

// Get individual post
exports.post_get_id = (req, res, next) => {
  Post.findById(req.params.id).exec((err, data) => {
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
