// LIBRARIES
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

// MIDDLEWARE
app.use(cors());
app.use(express.json()); // allows us to access req.body

// ROUTES
// auth route
app.use("/auth", require("./routes/jwtAuth"));

// home route
app.use("/home", require("./routes/home"));

// LISTENING ON PORT 5000
app.listen(5000, () => {
  console.log(`Server has started on PORT 5000`);
});
