const Cart = require("../models/cartModel");
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    let cartItem = await CartItem.findOne({ userId, productId });
    if (cartItem) {
      cartItem.quantity += quantity; // Increment quantity
    } else {
      cartItem = new Cart({ userId, productId, quantity });
    }
    await cartItem.save();
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};
const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cartItems = await Cart.find({ userId });
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const updateCartQuantity = async (req, res) => {
  try {
    const { userId, productId, change } = req.body; // change: +1 for increase, -1 for decrease

    let cartItem = await Cart.findOne({ userId, productId });

    if (!cartItem && change > 0) {
      // If item doesn't exist and user is increasing quantity, add it to cart
      cartItem = new Cart({ userId, productId, quantity: 1 });
    } else if (!cartItem) {
      return res.status(404).json({ error: "Item not found" });
    } else {
      // If item exists, update quantity
      cartItem.quantity += change;
      // If quantity becomes 0 or less, remove item
      if (cartItem.quantity <= 0) {
        await Cart.findByIdAndDelete(cartItem._id);
        return res.status(200).json({ message: "Item removed from cart" });
      }
    }
    await cartItem.save();
    res.status(200).json({ message: "Cart updated", cartItem });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    await Cart.findByIdAndDelete(cartItemId);
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Clear cart after checkout
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    await Cart.deleteMany({ userId });
    res.status(200).json({ message: "Cart cleared after checkout" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  clearCart,
  getCart,
  updateCartQuantity,
};
