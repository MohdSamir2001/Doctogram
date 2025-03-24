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
const getDoctorById = async (req, res) => {
  try {
    const { docId } = req.params;

    // Check if docId is valid
    if (!docId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID is required" });
    }

    const doctor = await Doctor.findById(docId).select("-password"); // Exclude password field

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, doctor });
  } catch (err) {
    console.error("Error fetching doctor:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
module.exports = { doctorList, getDoctorById, changeAvailablity };
