// checking user info
module.exports = (req, res, next) => {
  const { username, password } = req.body;

  // check user info when registering
  if (req.path === "/register") {
    if (![username, password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    }

    // check user info when logging in
  } else if (req.path === "/login") {
    if (![username, password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    }
  }

  next();
};
