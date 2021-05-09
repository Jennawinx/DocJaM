const jwt = require("jsonwebtoken");
// To access data from .env file
require("dotenv").config();

module.exports = (req, res, next) => {
  // Verify that the Authorization header is present
  const authorizationHeader = req.get("Authorization");

  // If the authentication header is not present, set the isAuthenticated field to false
  if (!authorizationHeader) {
    req.isAuthenticated = false;
    return next();
  }
  // Get the token from the header
  const jwtToken = authorizationHeader.split(" ")[1];

  // Verify that the token exists and is not empty
  if (!jwtToken || jwtToken === "") {
    req.isAuthenticated = false;
    return next();
  }

  // Verify the token with jwt
  try {
    const userToken = jwt.verify(jwtToken, process.env.SECRET);

    // Check that the token is valid and return it
    if (!userToken) {
      req.isAuthenticated = false;
      return next();
    } else {
      req.isAuthenticated = true;
      req.id = userToken.id;

      next();
    }
  } catch (err) {
    req.isAuthenticated = false;
    return next();
  }
};
