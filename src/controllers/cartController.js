const Cart = require("../models/cartModel");
const Medicine = require("../models/medicineModel");
const Order = require("../models/orderModel");
const addToCart = async (req, res) => {
  try {
    const { userId, quantity, productId } = req.body;
    console.log(userId, quantity, productId);

    // Check if the item is already in the cart
    const cartItem = await Cart.findOne({ userId, productId });

    if (cartItem) {
      return res
        .status(400)
        .json({ success: false, message: "Item already in cart" });
    }

    // If item is not in the cart, add it
    const newCartItem = new Cart({ userId, productId, quantity });
    await newCartItem.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cartItem: newCartItem,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: "ERROR: " + err.message });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const cartItems = await Cart.find({ userId }).populate(
      "productId",
      "name price includeSalts image manufacturer"
    );
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const updateCartQuantity = async (req, res) => {
  try {
    const { userId, productId, change } = req.body; // change: +1 for increase, -1 for decrease

    let cartItem = await Cart.findOne({ userId: userId, productId: productId });

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
    const { productId } = req.body;
    console.log(productId);

    // Ensure productId is treated as a string (since it's stored as a string in DB)
    const deletedItem = await Cart.findOneAndDelete({ productId: productId });

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    res.status(200).json({ message: "Item removed from cart", deletedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
    n;
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
const createOrder = async (req, res) => {
  try {
    const { userId, medicines, totalPrice } = req.body;

    // Check if medicines is an array
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "Invalid medicines data" });
    }

    // Loop through medicines to check stock and update quantity
    for (const item of medicines) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({ message: "Medicine not found" });
      }

      if (medicine.quantityInStore < item.quantity) {
        return res.status(400).json({
          message: `${medicine.name} is out of stock. Please wait for restock.`,
        });
      }

      // Reduce stock quantity
      medicine.quantityInStore -= item.quantity;
      await medicine.save();
    }

    // Create the order
    const newOrder = new Order({ user: userId, medicines, totalPrice });
    await newOrder.save();

    res.status(201).json({ message: "Order placed successfully!" });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const { userId } = req.body; // Ensure userId is provided

    const orders = await Order.find({ user: userId })
      .populate("user", "name email") // Populate user details
      .populate({
        path: "medicines.medicineId",
        select: "name price category", // Fetch relevant medicine details
      });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  getOrders,
  clearCart,
  getCart,
  createOrder,
  updateCartQuantity,
};
