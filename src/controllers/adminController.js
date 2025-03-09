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
// Add Medicine
const addMedicine = async (req, res) => {
  try {
    const {
      name,
      noOfTablets,
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
// API For Admin Login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = await jwt.sign(email, process.env.JWT_SECRET);
    // token saved in the cookie of browser
    res.cookie("adminToken", token);
    res.json({ success: true, message: "Logged in successfully" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  try {
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
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
module.exports = { addDoctor, addMedicine, loginAdmin, allDoctors };
