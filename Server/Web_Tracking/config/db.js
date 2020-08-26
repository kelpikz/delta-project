const mongoose = require("mongoose");

const MONGO_USERNAME = "kelpikz";
const MONGO_PASSWORD = "123456";
const MONGO_HOSTNAME = "127.0.0.1";
const MONGO_PORT = "27017";
const MONGO_DB = "Project";

mongoose.set("debug", true); // To see mongoose data in the terminal Mongoose : ***
mongoose.Promise = Promise; // To use async functions

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

module.exports = mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to the data base !!!");
  })
  .catch((err) => {
    console.log(`ERROR!!! : ${err}`);
  });
