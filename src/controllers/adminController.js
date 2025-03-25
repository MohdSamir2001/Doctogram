const {
  validateAddDoctorDetails,
  validateMedicineDetails,
} = require("../utils/validation");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/doctorModel");
const validator = require("validator");
const Medicine = require("../models/medicineModel");
const Order = require("../models/orderModel");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
// API to get dashboard data for admin panel
const getToken = async (req, res) => {
  res.json({
    adminToken: req.cookies.adminToken || null,
    doctorToken: req.cookies.doctorToken || null,
  });
};
const adminDashboard = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    const users = await User.find({});
    const appointments = await Appointment.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse(),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// API for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    await Appointment.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
const checkLogin = (req, res) => {
  const adminToken = req.cookies.adminToken;
  const doctorToken = req.cookies.doctorToken;

  if (adminToken) {
    return res.json({ role: "admin" });
  } else if (doctorToken) {
    return res.json({ role: "doctor" });
  } else {
    return res.status(401).json({ message: "Not logged in" });
  }
};
// API For Adding Doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      image,
      speciality,
      degree,
      experience,
      about,
      available,
      fees,
      address,
      date,
      slots_booked,
    } = req.body;
    const imageFile = req.file;
    if (!imageFile) throw new Error("Missing Image");
    console.log(req.file);
    const isAllFieldsPresent = validateAddDoctorDetails(req);
    if (isAllFieldsPresent.length > 0) {
      return res.json({ success: false, message: "Missing Details" });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (!validator.isStrongPassword(password)) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;
    const finalDoctorDataForAddingDoctor = {
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };
    const newDoctor = new Doctor(finalDoctorDataForAddingDoctor);
    await newDoctor.save();
    res.json({
      success: true,
      message: "Doctor added successfully",
      imageUrl,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};
// API For Deleting Doctor
const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID is required" });
    }

    // Find doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    // Delete image from Cloudinary
    const imagePublicId = doctor.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(imagePublicId);

    // Delete doctor from database
    await Doctor.findByIdAndDelete(doctorId);

    res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: "ERROR: " + err.message });
  }
};
// Add Medicine
const addMedicine = async (req, res) => {
  try {
    const {
      name,
      noOfTablets,
      includeSalts,
      description,
      price,
      category,
      stock,
      manufacturer,
      expiryDate,
      prescriptionRequired,
      dosage,
      form,
    } = req.body;
    const isAllFieldsPresent = validateMedicineDetails(req);
    if (isAllFieldsPresent.length > 0) {
      return res.json({ success: false, message: "Missing Details" });
    }
    const imageFile = req.file;
    if (!imageFile) throw new Error("Missing Image");
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;
    const finalMedicineData = {
      name,
      description,
      price,
      includeSalts,
      category,
      stock,
      noOfTablets,
      image: imageUrl,
      manufacturer,
      expiryDate,
      prescriptionRequired,
      dosage,
      form,
    };

    const newMedicine = new Medicine(finalMedicineData);
    await newMedicine.save();
    res.json({
      success: true,
      message: "Medicine added successfully",
      imageUrl,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};
const deleteMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    console.log(medicineId);
    if (!medicineId)
      return res
        .status(400)
        .json({ success: false, message: "Medicine ID is required" });

    const medicine = await Medicine.findById(medicineId);
    if (!medicine)
      return res
        .status(404)
        .json({ success: false, message: "Medicine not found" });

    // Delete image from Cloudinary if exists
    if (medicine.image) {
      const imagePublicId = medicine.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imagePublicId);
    }

    await Medicine.findByIdAndDelete(medicineId);
    res.json({ success: true, message: "Medicine deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
const toggleMedicineStock = async (req, res) => {
  try {
    const { medicineId } = req.params;
    console.log(medicineId);
    // Find the medicine in the database
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res
        .status(404)
        .json({ success: false, message: "Medicine not found" });
    }
    // Toggle the stock status
    await Medicine.findByIdAndUpdate(medicineId, {
      stock: !medicine.stock,
    });
    res.json({ success: true, message: "Stock status toggled successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// Get All Medicines
const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    if (!medicines || medicines.length === 0) {
      return res.json({ success: false, message: "No medicines found" });
    }
    res.json({ success: true, medicines });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = await jwt.sign(email, process.env.JWT_SECRET);
    // Set adminToken
    res.cookie("adminToken", token);
    res.json({ success: true, message: "Logged in successfully", token });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  try {
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};
const getAdmin = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Admin is logged in" });
  } catch (error) {
    res.status(401).json({ success: false, message: "Admin is not logged in" });
  }
};

// API For Logout Admin
const logoutAdmin = async (req, res) => {
  res.clearCookie("adminToken");
  res.clearCookie("doctorToken");
  res.json({ success: true, message: "Logged out successfully", token: "" });
};
// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
};
const allOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("medicines.medicineId user");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status" });
  }
};
const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order" });
  }
};
const updateMedicineStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityInStore } = req.body;

    // Validate quantity
    if (quantityInStore < 10) {
      return res.status(400).json({ message: "Quantity cannot be negative." });
    }

    // Find and update medicine
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      id,
      { quantityInStore },
      { new: true, runValidators: true }
    );

    if (!updatedMedicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }

    res.status(200).json({
      message: "Stock quantity updated successfully!",
      medicine: updatedMedicine,
    });
  } catch (error) {
    console.error("Error updating stock quantity:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addDoctor,
  addMedicine,
  deleteOrder,
  updateOrderStatus,
  updateMedicineStock,
  logoutAdmin,
  loginAdmin,
  getAllMedicines,
  allDoctors,
  deleteDoctor,
  getToken,
  deleteMedicine,
  toggleMedicineStock,
  allOrders,
  getAdmin,
  checkLogin,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
};
