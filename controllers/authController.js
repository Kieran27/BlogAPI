const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const authToken = require("../middleware/authToken");

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
      return res.status(409).json({ error: errors.array() });
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
      refreshTokens: [],
    });

    const accessToken = await JWT.sign({ username }, process.env.SECRET, {
      expiresIn: "30m",
    });

    const refreshToken = await JWT.sign({ username }, process.env.SECRET, {
      expiresIn: "45m",
    });

    // Push refresh token into user array and save to database
    user.refreshTokens.push(refreshToken);

    user.save((err) => {
      if (err) return res.status(400).json({ error: err });
    });

    res.json({
      accessToken,
      refreshToken,
    });
  },
];

exports.login_post = async (req, res, next) => {
  const { email, password } = req.body;

  // Search database for user email
  const user = await User.find({ email: email });
  if (user.length === 0) {
    return res.status(401).json({
      error: "User does not exist!",
    });
  }

  // Compares hashed password to input password
  const passwordMatch = await bcrypt.compare(password, user[0].password);

  if (!passwordMatch) {
    return res.status(401).json({
      error: "Email or password does not match!",
    });
  }

  // Send Access Token to Client
  const accessToken = await JWT.sign(
    { username: user[0].username },
    process.env.SECRET,
    {
      expiresIn: "30m",
    }
  );

  // Send Refresh Token to Client
  const refreshToken = await JWT.sign(
    { username: user[0].username },
    process.env.SECRET,
    {
      expiresIn: "45m",
    }
  );

  // Push refresh token into user token array

  res.json({
    accessToken: accessToken,
    refreshToken: refreshToken,
    message: "Successfully Logged In!",
  });
};

exports.users_get = async (req, res) => {
  const users = await User.find();
  if (!users) return res.json({ error: "Users not found!" });
  return res.json({ users });
};

exports.user_get = async (req, res) => {
  const userId = req.params.user_id;
  const user = await User.findOne({ _id: userId });
  if (!user) return res.json({ error: "User not found" });
  return res.json({ user });
};

exports.refresh_token_post = async (req, res) => {
  // Get refresh token
  const refreshToken = req.header("x-auth-token");
  // send error if there is no token
  if (!refreshToken) {
    return res.status(401).json({ msg: "Error token not supplied" });
  }
  // If token exists
  try {
    const user = JWT.verify(refreshToken, process.env.SECRET);
    const accessToken = await JWT.sign(user.username, process.env.SECRET, {
      expiresIn: "36s",
    });
    return res.json({ accessToken });
  } catch (error) {
    res.status(403).json({
      msg: "Invalid Token",
    });
  }
};

exports.logout_post = async (req, res) => {
  // Get refreshToken
  const refreshToken = req.header("x-auth-token");
  // Search database where username = username model
  const user = await User.findOneAndUpdate(
    { refreshTokens: refreshToken },
    { $pull: { refreshTokens: { $in: [refreshToken] } } }
  );

  // Send status back to user notifying them of being logged out
  return res.json({
    msg: "Logged out successfully!",
  });
};
