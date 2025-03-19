const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true, ref: "Medicine" },
    quantity: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);
const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
module.exports = Cart;
