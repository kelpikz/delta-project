const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const TrackerSchema = require("./Tracking");
/**
 * A user schema for the user
 * email, username, password attribute required
 * ? and before saving the data to our database, we run a pre save hook
 *   this one way hashes our password using bcrypt
 * ? schema methord to compare passwords and check if the user has entered the correct password
 */

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  collections: [
    {
      // User who created the the collection
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collections",
    },
  ],
  tasks: [
    {
      // User who created the the collection
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tasks",
    },
  ],
  limits: [
    {
      hostName: { type: String },
      limit: { type: Number },
    },
  ],
  tracker: [TrackerSchema],
});

userSchema.pre("save", async function (next) {
  try {
    let hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    return next();
  } catch (err) {
    return next(err);
  }
});

//! To compare the input password and check if the user
userSchema.methods.comparePassword = async (inputPassword, next) => {
  try {
    //* Comparing passwords
    console.log(inputPassword);
    let isMatch = await bcrypt.compare(inputPassword, this.password);

    //* Returning true( correct password ) or false( wrong )
    return isMatch;
  } catch (err) {
    return next(err);
  }
};

module.exports = mongoose.model("Users", userSchema);
