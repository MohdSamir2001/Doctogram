const jwt = require("jsonwebtoken");
const authDoctor = async (req, res, next) => {
  try {
    const { doctorToken } = req.cookies;

    if (!doctorToken) {
      return res.json({ success: false, message: "Please login as a doctor" });
    }

    const decodedToken = await jwt.verify(doctorToken, process.env.JWT_SECRET);

    if (!decodedToken.id) {
      return res
        .status(401)
        .send({ success: false, message: "Token is not valid" });
    }

    req.body.docId = decodedToken.id;
    next();
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
};

module.exports = authDoctor;
