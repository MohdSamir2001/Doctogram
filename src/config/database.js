const mongoose = require("mongoose");
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI + "/doctogram");
};

module.exports = connectDB;
