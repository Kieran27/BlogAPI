const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, minLength: 5, maxLength: 50, required: true },
  headerURL: { type: String },
  content: { type: String, minLength: 1, maxLength: 1000, required: true },
  author: { type: String, default: "user", required: true },
  published: { type: Boolean, default: false },
  comments: [{ type: Schema.Types.ObjectId, ref: "comments", required: true }],
  stars: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now() },
});

PostSchema.virtual("url").get(function () {
  return "api/posts/" + this._id;
});

PostSchema.virtual("formattedDate").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(
    DateTime,
    DATETIME_MED
  );
});

module.exports = mongoose.model("posts", PostSchema);
