var express = require("express");
var router = express.Router();

/* GET base route and redirect to posts. */
router.get("/", (req, res, next) => {
  res.redirect("/api/posts");
});

module.exports = router;
