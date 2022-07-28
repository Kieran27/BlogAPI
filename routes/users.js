const express = require("express");
const router = express.Router();
const post_controller = require("../controllers/postController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
