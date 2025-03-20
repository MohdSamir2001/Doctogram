const express = require("express");
const authUser = require("../middlewares/authUser");
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  placeOrder,
  createOrder,
  getOrders,
} = require("../controllers/cartController");
const cartRouter = express.Router();
cartRouter.post("/add", authUser, addToCart);
cartRouter.get("/get", authUser, getCart);
cartRouter.get("/get-orders", authUser, getOrders);
cartRouter.put("/update", authUser, updateCartQuantity);
cartRouter.post("/remove", authUser, removeFromCart);
cartRouter.post("/create-order", authUser, createOrder);
cartRouter.get("/clear/:userId", authUser, clearCart);
module.exports = cartRouter;
