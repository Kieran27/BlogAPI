const express = require("express");
const router = express.Router();
const post_controller = require("../controllers/postController");

/* GET home page. */
router.get("/", post_controller.posts_get);

router.post("/", post_controller.posts_post);

router.get("/:id", post_controller.post_get_id);

router.put("/:id", post_controller.post_put_id);

router.delete("/:id", post_controller.post_delete_id);

module.exports = router;
