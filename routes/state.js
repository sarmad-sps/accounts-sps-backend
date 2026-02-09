import express from "express";
import { StateModel } from "../models/State.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();


// router.get("/", async (req, res) => {
//   try {
//     let state = await StateModel.findOne();
//     if (!state) {
//       state = await StateModel.create({
//         companyName: "Secure Path Solutions",
//         openingBalances: { BANK_ISLAMI: 0, HBL: 0 },
//         receivings: [],
//         payments: [],
//       });
//     }

//     // Debug logs
//     console.log("State fetched:", state);

//     // Totals
//     const totalReceived = state.receivings?.reduce((sum, r) => sum + r.amount, 0) || 0;
//     const totalPaid = state.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
//     const totalBankBalance =
//       Object.values(state.openingBalances || {}).reduce((sum, val) => sum + val, 0) +
//       totalReceived -
//       totalPaid;
//     const pending = totalReceived - totalPaid;

//     res.json({
//       ...state.toObject(),
//       totals: { totalReceived, totalPaid, totalBankBalance, pending },
//     });
//   } catch (err) {
//     console.error("Error in /api/state:", err); // <- See the full error
//     res.status(500).json({ error: "Failed to fetch state" });
//   }
// });


router.get("/", async (req, res) => {
  try {
    // Fetch the state or create default if not exists
    let state = await StateModel.findOne();
    if (!state) {
      state = await StateModel.create({
        companyName: "Secure Path Solutions",
        openingBalances: { BANK_ISLAMI: 0, HBL: 0 },
        receivings: [],
        payments: [],
      });
    }

    // Initialize totals
    let totalReceived = 0;
    let totalPending = 0;
    let totalPaid = 0;
    let bankBalanceByBank = { ...state.openingBalances };
    let receivedByBank = {};
    let pendingByBank = {};
    let paidByBank = {};

    // Process receivings
    (state.receivings || []).forEach(r => {
      const bank = r.bank || "UNKNOWN";
      const amount = r.amount || 0;
      const status = (r.status || "").toLowerCase(); // Normalize to lowercase

      if (status === "received") {
        totalReceived += amount;
        receivedByBank[bank] = (receivedByBank[bank] || 0) + amount;
        bankBalanceByBank[bank] = (bankBalanceByBank[bank] || 0) + amount;
      } else if (status === "pending") {
        totalPending += amount;
        pendingByBank[bank] = (pendingByBank[bank] || 0) + amount;
        // Do NOT add pending to bank balance
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



// Update state (only Admin / Accountant)
router.put("/", auth, async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    if (!["admin", "accountant"].includes(role)) {
      return res.status(403).json({ error: "Access Denied: Only Admin/Accountant can update state" });
    }

    const incoming = req.body;
    await StateModel.findOneAndUpdate(
      {},
      { ...incoming, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;
