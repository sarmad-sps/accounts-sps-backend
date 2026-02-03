import express from "express";
import { StateModel } from "../models/State.js";

const router = express.Router();

/* ================= GET ALL EXPENSES ================= */
router.get("/expenses", async (req, res) => {
  try {
    const state = await StateModel.findOne();
    if (!state || !state.expenses) return res.json([]);
    res.json(state.expenses.reverse()); // latest first
  } catch (err) {
    console.error("GET /expenses error:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

/* ================= ADD EXPENSE ================= */
router.post("/expenses", async (req, res) => {
  try {
    let state = await StateModel.findOne();

    if (!state) {
      state = new StateModel({
        companyName: "Secure Path Solutions",
        openingBalances: { BANK_ISLAMI: 0, HBL: 0 },
        receivings: [],
        payments: [],
        expenses: [],
      });
    }

    if (!state.expenses) state.expenses = []; // 🔥 MUST

    const expense = {
      ...req.body,
      date: req.body.date || new Date().toISOString().slice(0, 10),
    };

    state.expenses.push(expense);
    state.updatedAt = new Date();
    await state.save();

    res.json(state.expenses[state.expenses.length - 1]);
  } catch (err) {
    console.error("POST /expenses error:", err);
    res.status(500).json({ error: "Failed to add expense" });
  }
});


/* ================= UPDATE EXPENSE ================= */
router.put("/expenses/:id", async (req, res) => {
  try {
    const state = await StateModel.findOne();
    if (!state) return res.status(404).json({ error: "State not found" });

    const expense = state.expenses.id(req.params.id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });

    Object.assign(expense, req.body);
    state.updatedAt = new Date();
    await state.save();

    res.json(expense);
  } catch (err) {
    console.error("PUT /expenses/:id error:", err);
    res.status(500).json({ error: "Failed to update expense" });
  }
});
/* ================= DELETE SINGLE EXPENSE ================= */
router.delete("/expenses/:id", async (req, res) => {
  try {
    const state = await StateModel.findOne();
    if (!state || !state.expenses || state.expenses.length === 0) {
      return res.status(404).json({ error: "No expenses found" });
    }

    const expenseId = req.params.id.toString();
    const index = state.expenses.findIndex(e => e._id.toString() === expenseId);

    if (index === -1) {
      return res.status(404).json({ error: "Expense not found" });
    }

    state.expenses.splice(index, 1); // remove that single expense
    state.updatedAt = new Date();
    await state.save();

    res.json({ success: true, deletedId: expenseId });
  } catch (err) {
    console.error("DELETE /expenses/:id error:", err);
    res.status(500).json({ error: "Server error while deleting expense" });
  }
});

/* ================= DELETE ALL EXPENSES ================= */
router.delete("/expenses", async (req, res) => {
  try {
    const state = await StateModel.findOne();
    if (!state || !state.expenses || state.expenses.length === 0) {
      return res.status(404).json({ error: "No expenses found" });
    }

    state.expenses = []; // remove all
    state.updatedAt = new Date();
    await state.save();

    res.json({ success: true, message: "All expenses deleted" });
  } catch (err) {
    console.error("DELETE /expenses error:", err);
    res.status(500).json({ error: "Server error while deleting all expenses" });
  }
});


export default router;
