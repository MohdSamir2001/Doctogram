const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/database");
const connectCloudinary = require("./src/config/cloudinary");
const cookieParser = require("cookie-parser");
const app = express();
// App Config
const port = process.env.PORT || 1234;
// Middlewares
// Middleware to parse JSON and form data
app.use(
  cors({
    origin: ["http://localhost:1111", "http://localhost:2222"], // Frontend origins
    credentials: true, // Allows cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
require("dotenv").config();
const adminRouter = require("./src/routes/adminRoute");
const userRouter = require("./src/routes/userRoute");
const doctorRouter = require("./src/routes/doctorRoute");
const cartRouter = require("./src/routes/cartRoute");
// API EndPoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor/", doctorRouter);
app.use("/api/user/", userRouter);
app.use("/api/user/cart/", cartRouter);
// localhost:1234/api/admin/add-doctor
app.get("/", (req, res) => {
  res.send("API Working");
});
connectDB()
  .then(() => {
    connectCloudinary();
    console.log("Database connection is established");
    app.listen(port, () => {
      console.log("Server is sucessfully connected on port 1234");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected");
  });
