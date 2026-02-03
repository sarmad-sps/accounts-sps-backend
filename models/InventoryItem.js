import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: "pcs" },
    minStock: { type: Number, default: 5 },
    category: { type: String, default: "General" },
  },
  { timestamps: true }
);

export default mongoose.model("InventoryItem", InventoryItemSchema);
