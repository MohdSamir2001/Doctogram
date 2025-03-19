const express = require("express");
const {
  registerUser,
  loginUser,
  viewProfile,
  updateUserProfile,
  bookAppointment,
} = require("../controllers/userController");
const authUser = require("../middlewares/authUser");
const upload = require("../middlewares/multer");
const { getAllMedicines } = require("../controllers/adminController");
const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authUser, viewProfile);
userRouter.get("/all-medicines", getAllMedicines);
userRouter.patch("/edit", upload.single("image"), authUser, updateUserProfile);
userRouter.post("/book-appointment", authUser, bookAppointment);
module.exports = userRouter;
