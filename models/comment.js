const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: { type: String, default: "anon", required: true },
  content: { type: String, minLength: 1, maxLength: 500, required: true },
  likes: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now() },
  postId: { type: String },
});

CommentSchema.virtual("url").get(function () {
  return "api/posts/:id/comments" + this._id;
});

CommentSchema.virtual("formattedDate").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(
    DateTime,
    DATETIME_MED
  );
});

module.exports = mongoose.model("comments", CommentSchema);
