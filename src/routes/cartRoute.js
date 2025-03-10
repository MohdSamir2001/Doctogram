const express = require("express");
const authUser = require("../middlewares/authUser");
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const cartRouter = express.Router();
cartRouter.post("/add", authUser, addToCart);
cartRouter.get("/:userId", authUser, getCart);
cartRouter.put("/update", authUser, updateCartQuantity);
cartRouter.delete("/remove/:cartItemId", authUser, removeFromCart);
cartRouter.get("/clear/:userId", authUser, clearCart);
module.exports = cartRouter;
