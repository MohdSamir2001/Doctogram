const express = require("express");
const authUser = require("../middlewares/authUser");
const {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  createOrder,
  getOrders,
  updateCart,
} = require("../controllers/cartController");
const cartRouter = express.Router();
cartRouter.post("/add", authUser, addToCart);
cartRouter.get("/get", authUser, getCart);
cartRouter.get("/get-orders", authUser, getOrders);
cartRouter.put("/update", authUser, updateCart);
cartRouter.post("/remove", authUser, removeFromCart);
cartRouter.post("/create-order", authUser, createOrder);
cartRouter.delete("/clear", authUser, clearCart);
module.exports = cartRouter;
