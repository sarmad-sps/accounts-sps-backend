import express from "express";
import InventoryItem from "../models/InventoryItem.js";

const router = express.Router();

// GET all inventory items
router.get("/", async (req, res) => {
  try {
    const items = await InventoryItem.find();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch inventory items" });
  }
});

// POST new inventory item (seed stock)
router.post("/", async (req, res) => {
  try {
    const { name, quantity, unit, category } = req.body;
    if (!name || quantity == null) return res.status(400).json({ message: "Name and quantity required" });

    const newItem = new InventoryItem({ name, quantity, unit, category });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create inventory item" });
  }
});
// PUT - Update item
router.put("/:id", async (req, res) => {
  try {
    const { name, quantity, unit, minStock, category } = req.body;
    const updated = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { name, quantity, unit, minStock, category },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Item not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// DELETE - Remove item
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});
export default router;
