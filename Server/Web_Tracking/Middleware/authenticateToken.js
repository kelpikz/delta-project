const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  console.log(authHeader);
  if (!token) next({ status: 403, message: "unauthorized" });
  else {
    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
      if (err) {
        next({ status: 403, message: "unauthorized" });
        return;
      }
      console.log(data);
      // res.status(200).json(data);
      req.user = {};
      req.user.id = data._id;
      req.user.email = data.email;
      req.user.username = data.username;
      let user = await User.findById(req.user.id);
      if (user) next();
      else next({ status: 403, message: "Token is invalid" });
    });
  }
};

module.exports = authenticateToken;
