const express = require("express");
const router = express.Router();
const auth_controller = require("../controllers/authController");

router.post("/signup", auth_controller.sign_up_post_new);

router.post("/login", auth_controller.login_post);

module.exports = router;
