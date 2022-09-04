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
        timestamp: new Date(),
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

  // Check if userId exists
  if (!userId) {
    throw new Error("No User Id Provided!");
  }

  try {
    // Get starIds array and stars integer from document
    const post = await Post.find({ _id: postId });
    const starIds = post[0].starIds;
    let stars = post[0].stars;

    // Check if userId exists within StarIds Array and respond accordingly
    const checkIfIdExists = starIds.includes(userId);
    console.log(checkIfIdExists);

    // If userId exists, remove id from array and decrement stars
    if (checkIfIdExists) {
      console.log("no");
      const filteredArray = starIds.filter((id) => id !== userId);
      console.log(filteredArray);
      let updatedStars = (stars -= 1);

      // Update document with updated values
      const updatedPost = await Post.findByIdAndUpdate(postId, {
        stars: updatedStars,
        starIds: filteredArray,
      });
    }

    // If userId doesn't exist, add id to array and increment stars
    if (!checkIfIdExists) {
      console.log("yes");
      const newArray = [...starIds, userId];
      let updatedStars = (stars += 1);

      // Update document with updated values
      const updatedPost = await Post.findByIdAndUpdate(postId, {
        stars: updatedStars,
        starIds: newArray,
      });
      console.log(updatedPost);
    }

    return res.json({ message: "Success!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
