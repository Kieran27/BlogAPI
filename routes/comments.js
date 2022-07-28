const express = require("express");
const router = express.Router();
const comment_controller = require("../controllers/commentController");
const Comment = require("../models/comment");

/* GET home page. */
router.get("/", comment_controller.comments_get);

router.post("/", comment_controller.comments_post);

router.get("/:comment_id", comment_controller.comment_get_id);

router.put("/:comment_id", comment_controller.comment_put_id);

router.delete("/:comment_id", comment_controller.comment_delete_id);

module.exports = router;
