const Doctor = require("../models/doctorModel");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");
const jwt = require("jsonwebtoken");
const Appointment = require("../models/appointmentModel");
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
// API for doctor Login
const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find doctor in DB
    const doctor = await Doctor.findOne({ email });
    if (!doctor)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    // Validate password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: doctor._id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set doctorToken
    res.cookie("doctorToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res
      .status(200)
      .json({ success: true, message: "Login successful", doctor, token });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;

    const appointments = await Appointment.find({ docId });

    let earnings = 0;

    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    let patients = [];

    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse(),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await Appointment.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await Appointment.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment Cancelled" });
    }

    res.json({ success: false, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    await Appointment.findByIdAndUpdate(appointmentId, {
      isCompleted: true,
      acceptAppointment: true, // ✅ Ensure this is updated
    });

    res.status(200).json({ message: "Appointment marked as completed!" });
  } catch (error) {
    res.status(500).json({ message: "Error completing appointment", error });
  }
};

const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    // Get the doctor's ID from the JWT token (set by authMiddleware)
    const doctor = await Doctor.findById(docId).select("-password");

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    res.json({ success: true, profileData: doctor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
module.exports = {
  appointmentComplete,
  doctorProfile,
  appointmentsDoctor,
  appointmentCancel,
  appointmentCancel,
  doctorList,
  doctorDashboard,
  doctorLogin,
  getDoctorById,
  changeAvailablity,
};
