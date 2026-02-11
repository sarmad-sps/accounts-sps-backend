import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// ========================
// CONTROLLERS + ROUTES
// ========================

// GET transactions by date
// GET /api/transactions?date=YYYY-MM-DD
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required" });

    const transactions = await Transaction.find({ date }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new transaction
// POST /api/transactions
router.post("/", async (req, res) => {
  try {
    const { date, time, type, description, party, amount } = req.body;

    if (!date || !time || !type || !description || !amount)
      return res.status(400).json({ error: "Missing required fields" });

    const newTransaction = new Transaction({
      date,
      time,
      type,
      description,
      party,
      amount,
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update transaction
// PUT /api/transactions/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE transaction
// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
