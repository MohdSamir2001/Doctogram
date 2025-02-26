const express = require("express");
const doctorList = require("../controllers/userController");
const userRouter = express.Router();
userRouter.get("/doctorlist", doctorList);
module.exports = userRouter;
