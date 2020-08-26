const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/User");

//! Signin handler
exports.signin = async (req, res, next) => {
  try {
    console.log(req.body);
    const user = await User.findOne({ email: req.body.email });
    console.log(user);
    if (user) {
      const { _id, email, username } = user;
      let isMatch = await bcrypt.compare(req.body.password, user.password);
      console.log(isMatch);
      if (isMatch) {
        const token = jwt.sign(
          { _id, username, email },
          process.env.SECRET_KEY
        );
        res.status(200).json({ _id, username, email, token });
      }
    } else next({ status: 400, message: "Invalid credentials" });
  } catch (err) {
    next({ status: 500, message: err });
  }
};

//! Signup handler
exports.signup = async (req, res, next) => {
  try {
    // Create a user
    const user = await User.create(req.body);
    const { id, username, email } = user;
    // Create a token for the user
    const token = jwt.sign({ id, username, email }, process.env.SECRET_KEY);
    res.status(200).json({ id, username, email, token });
  } catch (err) {
    // What kind of error
    //  If username/ email already taken, tell user
    if (err.code === 11000) {
      // This is validation error code in mongoose
      err.message = "Sorry the username/ email is already taken";
      //  Tell user bad request(400)
      return next({ status: 400, message: err.message });
    }
    //  Otherwise send a gerneric error
    console.log(err);
    return next({ status: 500 });
  }
};
