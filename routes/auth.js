const express = require("express");
const router = express.Router();
const auth_controller = require("../controllers/authController");

router.get("/users", auth_controller.users_get);

router.get("/users/:userid", auth_controller.user_get);

router.post("/signup", auth_controller.sign_up_post_new);

router.post("/login", auth_controller.login_post);

module.exports = router;
