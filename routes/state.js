import express from "express";
import { StateModel } from "../models/State.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// GET state
router.get("/", async (req, res) => {
  try {
    // Fetch the state or create default if not exists
    let state = await StateModel.findOne();
    if (!state) {
      state = await StateModel.create({
        companyName: "Secure Path Solutions",
        openingBalances: { BANK_ISLAMI: 0, HBL: 0, CASH: 0 }, // CASH added
        receivings: [],
        payments: [],
      });
    }

    // Initialize totals
    let totalReceived = 0;
    let totalPending = 0;
    let totalPaid = 0;
    let bankBalanceByBank = { ...state.openingBalances }; // includes CASH now
    let receivedByBank = {};
    let pendingByBank = {};
    let paidByBank = {};

    // Process receivings
    (state.receivings || []).forEach(r => {
      const bank = r.bank || "UNKNOWN";
      const amount = r.amount || 0;
      const status = (r.status || "").toLowerCase();

      if (status === "received") {
        totalReceived += amount;
        receivedByBank[bank] = (receivedByBank[bank] || 0) + amount;
        bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) + amount;
      } else if (status === "pending") {
        totalPending += amount;
        pendingByBank[bank] = (pendingByBank[bank] || 0) + amount;
        // Do not add pending to bank balance
      }
    });

    // Process payments
    (state.payments || []).forEach(p => {
      const bank = p.bank || "UNKNOWN";
      const amount = p.amount || 0;
      totalPaid += amount;
      paidByBank[bank] = (paidByBank[bank] || 0) + amount;
      bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) - amount;
    });

    // Calculate total bank balance
    const totalBankBalance = Object.values(bankBalanceByBank).reduce((sum, val) => sum + val, 0);

    // Send response
    res.json({
      ...state.toObject(),
      totals: {
        totalReceived,
        totalPending,
        totalPaid,
        totalBankBalance,
        bankBalanceByBank,
        receivedByBank,
        pendingByBank,
        paidByBank,
      },
    });
  } catch (err) {
    console.error("Error in /api/state:", err);
    res.status(500).json({ error: "Failed to fetch state" });
  }
});

// UPDATE state (only Admin / Accountant)
router.put("/", auth, async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    if (!["admin", "accountant"].includes(role)) {
      return res.status(403).json({ error: "Access Denied: Only Admin/Accountant can update state" });
    }

    const incoming = req.body;

    // Ensure CASH is included if not sent
    if (!incoming.openingBalances) incoming.openingBalances = {};
    incoming.openingBalances.CASH = incoming.openingBalances.CASH ?? 0;
    incoming.openingBalances.BANK_ISLAMI = incoming.openingBalances.BANK_ISLAMI ?? 0;
    incoming.openingBalances.HBL = incoming.openingBalances.HBL ?? 0;

    const updated = await StateModel.findOneAndUpdate(
      {},
      { ...incoming, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Error updating state:", err);
    res.status(500).json({ error: "Update failed" });
  }
});
// Example: receivingsRouter.js
router.put("/:id", auth, async (req, res) => {
  try {
    console.log("PUT request received for ID:", req.params.id);
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const { id } = req.params;
    const updateData = req.body;

    let state = await StateModel.findOne();
    if (!state) {
      console.log("No state document found");
      return res.status(404).json({ error: "State not found" });
    }

    console.log("State found, receivings count:", state.receivings?.length || 0);

    const index = state.receivings.findIndex(r => r.id === id);
    console.log("Found index:", index);

    if (index === -1) {
      console.log("Receiving not found for id:", id);
      return res.status(404).json({ error: "Receiving not found" });
    }

    const allowed = [
      "clientName", "clientAddress", "clientPhone", "party", "amount",
      "date", "status", "bank", "notes", "category", "paymentMode",
      "insuranceCover", "trackerCompany", "trackerType", "addonService",
      "vehicleType", "registrationNo", "vehicleBrand", "chassisNumber",
      "engineNumber", "agentName"
    ];

    const updated = { ...state.receivings[index] };

    allowed.forEach(key => {
      if (updateData[key] !== undefined) {
        updated[key] = updateData[key];
      }
    });

    console.log("Updated receiving object:", updated);

    state.receivings[index] = updated;

    await state.save();
    console.log("State saved successfully");

    res.json({ message: "Receiving updated", receiving: updated });
  } catch (err) {
    console.error("PUT /receivings/:id ERROR:");
    console.error(err.stack || err);
    res.status(500).json({ 
      error: "Update failed",
      message: err.message || "Internal server error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
});
export default router;
