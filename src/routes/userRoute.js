const express = require("express");
const {
  registerUser,
  loginUser,
  viewProfile,
  updateUserProfile,
  bookAppointment,
  logoutUser,
  getAllDoctors,
  cancelAppointment,
  getUserAppointments,
  paymentRazorpay,
  verifyRazorpay,
} = require("../controllers/userController");
const authUser = require("../middlewares/authUser");
const upload = require("../middlewares/multer");
const { getAllMedicines } = require("../controllers/adminController");
const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.get("/profile", authUser, viewProfile);
userRouter.get("/appointments", authUser, getUserAppointments);
userRouter.get("/all-medicines", getAllMedicines);
userRouter.get("/all-doctors", getAllDoctors);
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay);
userRouter.post("/edit", upload.single("image"), authUser, updateUserProfile);
userRouter.post("/book-appointment", authUser, bookAppointment);
module.exports = userRouter;
