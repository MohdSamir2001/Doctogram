const Doctor = require("../models/doctorModel");
const changeAvailablity = async (req, res) => {
  try {
    const { doctorId } = req.body;
    // Find that doctor in the database
    const oneDoctor = await Doctor.findById(doctorId);
    // Change his availability
    await Doctor.findByIdAndUpdate(doctorId, {
      avaliable: !oneDoctor.avaliable,
    });
    res.json({ success: true, message: "Availablity changed successfully" });
  } catch (err) {
    res.status(401).send({ success: false, message: err.message });
  }
};
const doctorList = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(401).send({ success: false, message: err.message });
  }
};

module.exports = { doctorList, changeAvailablity };
