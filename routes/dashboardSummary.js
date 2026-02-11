import express from "express";
import State from "../models/State.js";
import Payment from "../models/Payment.js";
import Salary from "../models/Salary.js";
import InventoryRequest from "../models/InventoryRequest.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log("Dashboard summary API hit");

    const stateData = await State.findOne().lean();
    const payments = await Payment.find().lean();
    const salaries = await Salary.find().lean();
    const inventoryRequests = await InventoryRequest.find().lean();

    const openingBalances = stateData?.openingBalances || {};

    let bankBalanceByBank = { ...openingBalances };

    let receivedByBank = {};
    let pendingByBank = {};
    let paidByBank = {};

    let cashInHand = {
      received: 0,
      paid: 0,
      pending: 0,
      balance: Number(openingBalances?.CASH || 0),
    };

    let totalReceived = 0;
    let totalPending = 0;
    let totalPaid = 0;

    const normalizeBankKey = (bankName) => {
      if (!bankName) return "CASH";
      const b = String(bankName).trim().toLowerCase();
      if (b === "bank islami" || b === "islamic bank") return "BANK_ISLAMI";
      if (b === "hbl") return "HBL";
      return b.toUpperCase().replace(/\s+/g, "_");
    };

    const safeNumber = (val) => Number(val) || 0;

    const processTransaction = (
      item,
      modeField,
      bankField,
      amountField,
      statusField
    ) => {
      if (!item) return;

      const amount = safeNumber(item?.[amountField]);
      if (!amount) return;

      const status = String(item?.[statusField] || "").toLowerCase().trim();
      const mode = String(item?.[modeField] || "").toLowerCase().trim();
      const bank = normalizeBankKey(item?.[bankField]);

      const isCash =
        mode === "cash" ||
        bank === "CASH" ||
        !item?.[bankField];

      if (isCash) {
        if (status === "received") {
          cashInHand.received += amount;
          cashInHand.balance += amount;
          totalReceived += amount;
        } else if (status === "pending" || status === "unpaid") {
          cashInHand.pending += amount;
          totalPending += amount;
        } else if (status === "paid") {
          cashInHand.paid += amount;
          cashInHand.balance -= amount;
          totalPaid += amount;
        }
        return;
      }

      // BANK TRANSACTIONS
      if (status === "received") {
        receivedByBank[bank] = safeNumber(receivedByBank[bank]) + amount;
        bankBalanceByBank[bank] =
          safeNumber(bankBalanceByBank[bank]) + amount;
        totalReceived += amount;
      } else if (status === "pending" || status === "unpaid") {
        pendingByBank[bank] = safeNumber(pendingByBank[bank]) + amount;
        totalPending += amount;
      } else if (status === "paid") {
        paidByBank[bank] = safeNumber(paidByBank[bank]) + amount;
        bankBalanceByBank[bank] =
          safeNumber(bankBalanceByBank[bank]) - amount;
        totalPaid += amount;
      }
    };

    // STATE RECEIVINGS
    (stateData?.receivings || []).forEach((r) =>
      processTransaction(r, "mode", "bank", "amount", "status")
    );

    // PAYMENTS
    (payments || []).forEach((p) =>
      processTransaction(p, "paymentMode", "bank", "amount", "status")
    );

    // SALARIES
    (salaries || []).forEach((s) =>
      processTransaction(s, "paymentMode", "bank", "amount", "status")
    );

    // INVENTORY REQUESTS
    (inventoryRequests || []).forEach((r) => {
      if (r?.receipt && typeof r.receipt === "object") {
        processTransaction(
          r.receipt,
          "mode",
          "bank",
          "amount",
          "paymentStatus"
        );
      }
    });

    const totalBankBalances = Object.values(bankBalanceByBank).reduce(
      (sum, val) => sum + safeNumber(val),
      0
    );

    const netCashEffect =
      safeNumber(cashInHand.received) - safeNumber(cashInHand.paid);

    const totalAssets =
      safeNumber(totalBankBalances) + safeNumber(netCashEffect);

    res.json({
      totalAssets: safeNumber(totalAssets),
      totalReceived: safeNumber(totalReceived),
      totalPending: safeNumber(totalPending),
      totalPaid: safeNumber(totalPaid),
      bankBalanceByBank,
      receivedByBank,
      pendingByBank,
      paidByBank,
      cashInHand,
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({
      error: "Failed to calculate dashboard summary",
      message: error.message,
    });
  }
});

export default router;
