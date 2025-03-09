const express = require("express");
const {
  addDoctor,
  loginAdmin,
  allDoctors,
  addMedicine,
} = require("../controllers/adminController");
const upload = require("../middlewares/multer");
const authAdmin = require("../middlewares/authAdmin");

const adminRouter = express.Router();
adminRouter.post("/login", loginAdmin);
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post(
  "/add-medicine",
  authAdmin,
  upload.single("image"),
  addMedicine
);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
module.exports = adminRouter;
