const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const razorpay = require("razorpay");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const Medicine = require("../models/medicineModel");
const cloudinary = require("cloudinary").v2;
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
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
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("userToken"); // Clears the authentication cookie
    res.json({ success: true, message: "Logged Out Successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Logout Failed", error: err.message });
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
    const { userId, docId, slotDate, slotTime } = req.body;
    const doctorData = await Doctor.findById(docId).select("-password").lean();
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
      docId,
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
    await Doctor.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment Booked Successfully" });
  } catch (err) {
    res.status(401).send({ success: false, message: err.message });
  }
};
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
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    if (!doctors || doctors.length === 0) {
      return res.json({ success: false, message: "No doctors found" });
    }
    res.json({ success: true, doctors });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.body; // Extracted from authentication middleware

    const appointments = await Appointment.find({ userId }).sort({ date: -1 });

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId, userId } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId,
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found." });
    }

    if (appointment.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Completed appointments cannot be cancelled.",
      });
    }

    appointment.cancelled = true;
    await appointment.save();

    res
      .status(200)
      .json({ success: true, message: "Appointment cancelled successfully." });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await Appointment.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Appointment Cancelled or not found",
      });
    }

    const options = {
      amount: appointmentData.amount * 100,
      currency: "INR",
      receipt: appointmentId,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server Error: " + error.message });
  }
};
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await Appointment.findByIdAndUpdate(
        orderInfo.receipt,
        { payment: true },
        { new: true }
      );
      res.status(200).json({ success: true, message: "Payment Successful" });
    } else {
      res.status(400).json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server Error: " + error.message });
  }
};

module.exports = {
  registerUser,
  paymentRazorpay,
  verifyRazorpay,
  loginUser,
  getUserAppointments,
  cancelAppointment,
  getAllDoctors,
  viewProfile,
  bookAppointment,
  updateUserProfile,
  getAllMedicines,
  logoutUser,
};
