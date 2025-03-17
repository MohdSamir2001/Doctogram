const express = require("express");
const {
  addDoctor,
  loginAdmin,
  allDoctors,
  addMedicine,
  logoutAdmin,
  getAllMedicines,
  deleteDoctor,
  deleteMedicine,
} = require("../controllers/adminController");
const upload = require("../middlewares/multer");
const authAdmin = require("../middlewares/authAdmin");

const adminRouter = express.Router();
adminRouter.post("/login", loginAdmin);
adminRouter.post("/logout", logoutAdmin);
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.delete("/delete-doctor/:doctorId", authAdmin, deleteDoctor);
adminRouter.post(
  "/add-medicine",
  authAdmin,
  upload.single("image"),
  addMedicine
);
adminRouter.get("/all-medicines", authAdmin, getAllMedicines);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
module.exports = adminRouter;
adminRouter.delete("/delete-doctor/:doctorId", authAdmin, deleteDoctor);
adminRouter.delete("/delete-medicine/:medicineId", authAdmin, deleteMedicine);
adminRouter.post(
  "/add-medicine",
  authAdmin,
  upload.single("image"),
  addMedicine
);
adminRouter.get("/all-medicines", authAdmin, getAllMedicines);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
module.exports = adminRouter;
