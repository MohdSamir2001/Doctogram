const express = require("express");
const {
  addDoctor,
  loginAdmin,
  allDoctors,
} = require("../controllers/adminController");
const upload = require("../middlewares/multer");
const authAdmin = require("../middlewares/authAdmin");
const changeAvailablity = require("../controllers/doctorController");
const adminRouter = express.Router();
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.get("/change-availablity", authAdmin, changeAvailablity);
module.exports = adminRouter;
