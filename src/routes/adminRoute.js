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
  toggleMedicineStock,
  allOrders,
  updateOrderStatus,
  deleteOrder,
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
adminRouter.get("/all-orders", authAdmin, allOrders);
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
adminRouter.post("/update-stock/:medicineId", authAdmin, toggleMedicineStock);
adminRouter.put("/orders/update/:id", authAdmin, updateOrderStatus);
adminRouter.delete("/orders/delete/:id", authAdmin, deleteOrder);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
module.exports = adminRouter;
