const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const bcrypt = require("require");
const JWT = require("jsonwebtoken");

require("dotenv").config();

exports.sign_up_post = [
  body("email", "email must be valid").exists().isEmail().escape().trim(),
  body("username", "Username not valid").exists().isLength({ min: 5 }).trim(),
  body("password", "Password not valid").exists().isLength({ min: 8 }),
  body("confirm password", "passwords do not match")
    .exists()
    .custom(async (confirmPassword, { req }) => {
      const password = req.body.password;
      if (password !== confirmPassword) {
        throw new Error("Passwords must be same");
      }
    }),

  async (req, res, next) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    // check if username exists
    const usernameExists = await User.find({ username: req.body.username });
    const emailExists = await User.find({ email: req.body.email });
    if (userExists.length > 0 || emailExists.length > 0) {
      return res.status(409).json({
        error: "Username or email already exists",
      });
    }

    // Hash Password
    const hashedPassword = bcrypt.hash(
      req.body.password,
      10,
      (err, hashedPassword) => {
        if (err) return next();

        // Create new User
        const user = new User({
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
        });

        user.save((err) => {
          if (err) {
            return res.status(404);
          }
          console.log("Saved to database!");
        });
      }
    );
  },
];

exports.login_post = (req, res) => {};
