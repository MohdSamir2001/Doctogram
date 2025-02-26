const jwt = require("jsonwebtoken");
// admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    const { adminToken } = req.cookies;
    if (!adminToken) {
      return res.json({ success: false, message: "Please login as a admin" });
    }
    const decodedToken = await jwt.verify(adminToken, process.env.JWT_SECRET);
    if (decodedToken !== process.env.ADMIN_EMAIL) {
      return res
        .status(401)
        .send({ success: false, message: "Token in not valid" });
    }
    next();
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
};

module.exports = authAdmin;
