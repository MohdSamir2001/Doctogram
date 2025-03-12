const mongoose = require("mongoose");
const { USER_IMAGE_64 } = require("../utils/userImageCode");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: USER_IMAGE_64 },
  address: {
    type: Object,
    default: { line1: "Moradabad", line2: "Moradabad" },
  },
  gender: { type: String, default: "Not Selected" },
  dob: { type: String, default: "Not Selected" },
  phone: { type: String, default: "0000000000" },
});
const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
