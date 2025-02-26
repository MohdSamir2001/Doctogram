const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/database");
const connectCloudinary = require("./src/config/cloudinary");
const adminRouter = require("./src/routes/adminRoute");
const cookieParser = require("cookie-parser");
require("dotenv").config();
// App Config
const app = express();
const port = process.env.PORT || 1234;
// Middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());
// API EndPoints
app.use("/api/admin", adminRouter);
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
