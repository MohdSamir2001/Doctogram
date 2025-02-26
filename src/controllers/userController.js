const Doctor = require("../models/doctorModel");

const doctorList = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(401).send({ success: false, message: err.message });
  }
};
module.exports = doctorList;
