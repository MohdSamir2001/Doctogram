const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const authUser = async (req, res, next) => {
  try {
    const { userToken } = req.cookies;
    console.log(userToken);
    if (!userToken) {
      return res.status(401).send({ success: false, message: "Please login" });
    }
    const decodedToken = await jwt.verify(userToken, process.env.JWT_SECRET);
    const { id } = decodedToken;
    const user = await User.findById(id);
    console.log(user);
    if (!user) {
      return res
        .status(401)
        .send({ success: false, message: "User not found" });
    }
    req.body.userData = user;
    next();
  } catch (err) {
    res.status(401).send({ status: false, message: err.message });
  }
};
module.exports = authUser;
