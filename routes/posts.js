const express = require("express");
const router = express.Router();
const post_controller = require("../controllers/postController");
const authToken = require("../middleware/authToken");

/* GET home page. */
router.get("/", post_controller.posts_get);

router.post("/", authToken, post_controller.posts_post);

router.get("/:post_id", post_controller.post_get_id);

router.put("/:post_id", authToken, post_controller.post_put_id);

router.delete("/:post_id", authToken, post_controller.post_delete_id);

router.post("/:post_id/star", authToken, post_controller.post_star_post);

module.exports = router;
