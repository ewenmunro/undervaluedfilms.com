const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");

// register route
router.post("/register", validInfo, async (req, res) => {
  try {
    // destructure req.body
    const { username, password } = req.body;

    // check if user exists
    const user = await pool.query("SELECT * FROM users WHERE user_name = $1", [
      username,
    ]);

    // if user exists throw error
    if (user.rows.length !== 0) {
      return res.status(401).json("User already exists");
    }

    // encrypt user password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // enter new user
    const newUser = await pool.query(
      "INSERT INTO users (user_name, user_password) VALUES ($1, $2) RETURNING *",
      [username, bcryptPassword]
    );

    // generate jwt token
    const token = jwtGenerator(newUser.rows[0].user_id);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// login route
router.post("/login", validInfo, async (req, res) => {
  try {
    // destructure req.body
    const { username, password } = req.body;

    // check if user doesn't exist
    const user = await pool.query("SELECT * FROM users WHERE user_name = $1", [
      username,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Username or password is incorrect");
    }

    // check if passwords match
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].user_password
    );

    if (!validPassword) {
      return res.status(401).json("Username or password is incorrect");
    }

    // give them jwt token
    const token = jwtGenerator(user.rows[0].user_id);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// verifying user
router.get("/verify", authorization, async (req, res) => {
  try {
    // user is valid
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
