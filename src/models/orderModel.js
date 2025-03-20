const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true },
    medicines: [
      {
        medicineId: {
          type: String,
          ref: "Medicine",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
