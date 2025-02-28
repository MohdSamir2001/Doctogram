const Doctor = require("../models/doctorModel");
const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
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
    const { userData } = req.body;
    return res.json({ success: true, data: userData });
  } catch (err) {
    res.status(401).send("ERROR : " + err.message);
  }
};
module.exports = { registerUser, loginUser, viewProfile };
