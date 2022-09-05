const JWT = require("jsonwebtoken");
require("dotenv").config();

const authToken = async (req, res, next) => {
  const token = req.header("x-auth-token");
  console.log(token);

  // If token not found, send error message
  if (!token) {
    res.status(401).json({
      errors: [
        {
          msg: "Token not found",
        },
      ],
    });
  }

  // Authenticate token
  try {
    const user = await JWT.verify(token, process.env.SECRET);
    req.user = user.username;
    next();
  } catch (error) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid token",
        },
      ],
    });
  }
};

module.exports = authToken;
