const express = require("express");
const {
  doctorList,
  changeAvailablity,
  getDoctorById,
  doctorLogin,
  appointmentComplete,
  appointmentCancel,
  appointmentsDoctor,
  doctorDashboard,
  doctorProfile,
} = require("../controllers/doctorController");
const authAdmin = require("../middlewares/authAdmin");
const { loginDoctor } = require("../controllers/adminController");
const authDoctor = require("../middlewares/authDoctor");
const doctorRouter = express.Router();
doctorRouter.get("/doctorlist", doctorList);
doctorRouter.post("/login", doctorLogin);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/get-doctor/:docId", getDoctorById);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/change-availablity", authAdmin, changeAvailablity);
module.exports = doctorRouter;
