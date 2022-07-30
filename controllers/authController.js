const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

require("dotenv").config();

exports.sign_up_post = [
  // Validate and sanitize inputs
  body("email", "email must be valid").isEmail().trim(),
  body("username", "Username not valid").isLength({ min: 5 }).trim(),
  body("password", "Password not valid").isLength({ min: 8 }),
  body("passwordconfirm", "passwords do not match")
    .exists()
    .custom(async (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must be same");
      }
    }),

  async (req, res, next) => {
    const { email, username, password } = req.body;

    // Get validation Result
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    // check if username or email exists
    const usernameExists = await User.find({ username: req.body.username });
    const emailExists = await User.find({ email: req.body.email });
    if (usernameExists.length > 0 || emailExists.length > 0) {
      return res.status(409).json({
        error: "Username or email already exists",
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        return res.json({ error: "???" });
      }

      // Create new User
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });

      // Save user to database
      user.save((err) => {
        if (err) {
          return res.status(404);
        }

        // Create JWT
        JWT.sign(
          { username: user.username },
          process.env.SECRET,
          {
            expiresIn: "36s",
          },
          (err, token) => {
            if (err) return res.status(400).json(err);
            return res.json({
              token,
              username,
            });
          }
        );
      });
    });
  },
];

exports.sign_up_post_new = [
  // Validate and sanitize inputs
  body("email", "email must be valid").isEmail().trim(),
  body("username", "Username not valid").isLength({ min: 5 }).trim(),
  body("password", "Password not valid").isLength({ min: 8 }),
  body("passwordconfirm", "passwords do not match")
    .exists()
    .custom(async (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must be same");
      }
    }),

  async (req, res, next) => {
    const { email, username, password } = req.body;

    // Get validation Result
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    // check if username or email exists
    const usernameExists = await User.find({ username: req.body.username });
    const emailExists = await User.find({ email: req.body.email });
    if (usernameExists.length > 0 || emailExists.length > 0) {
      return res.status(409).json({
        error: "Username or email already exists",
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and save to database
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    user.save((err) => {
      if (err) return res.status(400).json({ error: err });
    });

    const accessToken = await JWT.sign({ username }, process.env.SECRET, {
      expiresIn: "36s",
    });

    res.json({
      accessToken,
    });
  },
];

exports.login_post = async (req, res, next) => {
  const { email, password } = req.body;

  // Search database for user email
  const user = await User.find({ email: email });
  if (!user) {
    return res.json({
      error: "User does not exist!",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user[0].password);

  if (!passwordMatch) {
    return res.json({
      error: "Email or password does not match!",
    });
  }

  // Send Access Token to Client
  const accessToken = await JWT.sign(
    { username: user[0].username },
    process.env.SECRET,
    {
      expiresIn: "36s",
    }
  );

  res.json({
    token: accessToken,
    message: "Successfully Logged In!",
  });
};
