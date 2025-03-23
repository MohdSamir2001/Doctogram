const Cart = require("../models/cartModel");
const Medicine = require("../models/medicineModel");
const Order = require("../models/orderModel");
const addToCart = async (req, res) => {
  try {
    const { userId, quantity, productId } = req.body;

    // Find the medicine in the database
    const medicine = await Medicine.findById(productId);
    if (!medicine) {
      return res
        .status(404)
        .json({ success: false, message: "Medicine not found" });
    }

    // Check stock availability
    if (medicine.quantityInStore < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock available" });
    }

    // Check if the item is already in the cart
    const cartItem = await Cart.findOne({ userId, productId });
    if (cartItem) {
      return res
        .status(400)
        .json({ success: false, message: "Item already in cart" });
    }

    // Reduce stock in the database
    medicine.quantityInStore -= quantity;
    await medicine.save();

    // Add item to cart
    const newCartItem = new Cart({ userId, productId, quantity });
    await newCartItem.save();

    // Check if stock is low (threshold: 3)
    let warningMessage = "";
    if (medicine.quantityInStore <= 3) {
      warningMessage =
        "Stock is running low, we will notify you when available.";
    }

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cartItem: newCartItem,
      warning: warningMessage,
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
    const { userId } = req.body; // ✅ Fetch userId from req.user

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

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
const updateCart = async (req, res) => {
  try {
    const { cartId, action } = req.body;

    // Find cart item and populate product details
    const cartItem = await Cart.findById(cartId).populate("productId");
    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    const product = cartItem.productId;
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (action === "increase") {
      if (product.quantityInStore <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Stock unavailable!" });
      }
      cartItem.quantity += 1;
      product.quantityInStore -= 1;
    } else if (action === "decrease") {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        product.quantityInStore += 1;
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Minimum quantity reached!" });
      }
    }

    // First save the product, then the cart item
    await product.save();
    await cartItem.save();

    let warning = "";
    if (product.quantityInStore <= 3) {
      warning = `⚠ Low stock! Only ${product.quantityInStore} left.`;
    }

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cartItem,
      warning,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "ERROR: " + err.message });
  }
};

module.exports = {
  addToCart,
  updateCart,
  removeFromCart,
  getOrders,
  clearCart,
  getCart,
  createOrder,
};
