const Doctor = require("../models/doctorModel");
const changeAvailablity = async (req, res) => {
  try {
    const { doctorId } = req.body;
    // Find that doctor in the database
    const oneDoctor = await Doctor.findById(doctorId);
    // Change his availability
    await Doctor.findByIdAndUpdate(doctorId, {
      available: !oneDoctor.available,
    });
    res.json({ success: true, message: "Availablity changed successfully" });
  } catch (err) {
    res.status(401).send({ success: false, message: err.message });
  }
};
module.exports = changeAvailablity;
