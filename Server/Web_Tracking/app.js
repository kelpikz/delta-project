require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

//Creating a secure https server
// const server = https.createServer({ key, cert }, app);

//* middleware and handler
require("./config/db");
const errorHandler = require("./handlers/Error");
const authenticateToken = require("./Middleware/authenticateToken");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//* Routes
const authRouter = require("./routes/auth");
const trackerRoute = require("./routes/tracker");

//? Routes
app.get("/");

// Authentication route
app.use("/auth", authRouter);

app.use(authenticateToken);

// Web Tracker Route
app.use("/tracker", trackerRoute);

//? Common error handler
app.use((req, res, next) => {
  let err = new Error("Not found");
  err.status = 404;
  next(err);
});

app.use(errorHandler);

//? Running the server
app.listen(3500, () => {
  console.log("the app is now running in http://localhost:3500");
});
