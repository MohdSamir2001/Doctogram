const express = require("express");
const {
  doctorList,
  changeAvailablity,
  getDoctorById,
} = require("../controllers/doctorController");
const authAdmin = require("../middlewares/authAdmin");
const doctorRouter = express.Router();
doctorRouter.get("/doctorlist", doctorList);
doctorRouter.get("/get-doctor/:docId", getDoctorById);
doctorRouter.post("/change-availablity", authAdmin, changeAvailablity);
module.exports = doctorRouter;
