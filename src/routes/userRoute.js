const express = require("express");
const {
  registerUser,
  loginUser,
  viewProfile,
} = require("../controllers/userController");
const authUser = require("../middlewares/authUser");
const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authUser, viewProfile);
module.exports = userRouter;
