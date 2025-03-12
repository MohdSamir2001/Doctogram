const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const cloudinary = require("cloudinary").v2;
// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill fields" });
    }
    // Email Validation
    if (!validator.isEmail(email))
      throw new Error("Please enter a valid email address");
    // Password Validation
    if (!validator.isStrongPassword(password))
      throw new Error("Please enter a strong password");
    // Make hashed password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      name,
      email,
      password: hashedPassword,
    };
    const newUser = new User(userData);
    const savedUser = await newUser.save();
    const token = await jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);
    res.cookie("userToken", token);
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userInDB = await User.findOne({ email });
    if (!userInDB) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, userInDB.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Credential" });
    } else {
      const token = await jwt.sign(
        { id: userInDB._id },
        process.env.JWT_SECRET
      );
      res.cookie("userToken", token);
      res.json({ success: true, message: "Logged In Successfully", token });
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};
const viewProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await User.findById(userId).select("-password -email");
    return res.json({ success: true, data: userData });
  } catch (err) {
    res.status(401).send("ERROR : " + err.message);
  }
};
const updateUserProfile = async (req, res) => {
  try {
    // Previous Data
    // userId coming from authUser
    const { userId, name, email, address, gender, dob, phone } = req.body;
    const imageFile = req.file;
    if (!userId || !name || !email || !address || !gender || !dob || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }
    await User.findByIdAndUpdate(userId, {
      name,
      email,
      gender,
      dob,
      phone,
      address,
    });
    if (imageFile) {
      // Upload image to clouniary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;
      await User.findByIdAndUpdate(userId, {
        image: imageURL,
        address: JSON.parse(address),
      });
    }
    const userData = await User.findById(userId);
    res.json({ sucess: true, message: "Profile Updated", data: userData });
  } catch (err) {
    res.status(401).send("ERROR : " + err.message);
  }
};
const bookAppointment = async (req, res) => {
  try {
    const { userId, doctorId, slotDate, slotTime } = req.body;
    const doctorData = await Doctor.findById(doctorId)
      .select("-password")
      .lean();
    if (!doctorData.avaliable) {
      return res.json({ success: false, message: "Doctor not available" });
    }
    let slots_booked = doctorData.slots_booked;
    // Checking for slots availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot is not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }
    const userData = await User.findById(userId).select("-password");
    delete doctorData.slots_booked;
    const appointmentData = {
      userId,
      doctorId,
      userData,
      doctorData,
      amount: doctorData.fees,
      slotDate,
      slotTime,
      date: Date.now(),
    };
    const newAppointment = new Appointment(appointmentData);
    await newAppointment.save();
    // Save new slots data in doctorData
    await Doctor.findByIdAndUpdate(doctorId, { slots_booked });
    res.json({ success: true, message: "Appointment Booked Successfully" });
  } catch (err) {
    res.status(401).send({ success: false, message: err.message });
  }
};
module.exports = {
  registerUser,
  loginUser,
  viewProfile,
  bookAppointment,
  updateUserProfile,
};
