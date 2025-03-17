const mongoose = require("mongoose");
const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    includeSalts: { type: String },
    noOfTablets: { type: Number },
    price: { type: Number, required: true },
    category: { type: String }, // Example: "Pain Relief", "Antibiotics", "Vitamins"
    stock: { type: Number, default: 1 }, // Track available stock
    image: { type: String }, // Image URL (Cloudinary/Firebase)
    manufacturer: { type: String }, // Company producing the medicine
    expiryDate: { type: String }, // Expiry date for safety
    prescriptionRequired: { type: Boolean, default: false }, // Require prescription?
    dosage: { type: String }, // Example: "500mg", "10ml"
    form: { type: String, enum: ["Tablet", "Syrup", "Capsule", "Injection"] }, // Medicine type
    rating: { type: Number, default: 0 }, // Average customer rating
    reviews: [
      {
        user: String,
        comment: String,
        rating: Number,
        date: { type: Date, default: Date.now },
      },
    ], // Customer reviews
  },
  { timestamps: true }
); // Adds createdAt & updatedAt timestamps
const Medicine =
  mongoose.models.Medicine || mongoose.model("Medicine", medicineSchema);
module.exports = Medicine;
