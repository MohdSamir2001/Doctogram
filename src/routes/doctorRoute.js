const express = require("express");
const {
  doctorList,
  changeAvailablity,
} = require("../controllers/doctorController");
const authAdmin = require("../middlewares/authAdmin");
const doctorRouter = express.Router();
doctorRouter.get("/doctorlist", doctorList);
doctorRouter.post("/change-availablity", authAdmin, changeAvailablity);
module.exports = doctorRouter;
