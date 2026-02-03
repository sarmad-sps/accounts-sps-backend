import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const InventoryItem = mongoose.model("InventoryItem", inventoryItemSchema);
export default InventoryItem;
