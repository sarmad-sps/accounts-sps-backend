import express from "express";
import State from "../models/State.js";
import Payment from "../models/PaymentExpense.js";
import Salary from "../models/SalaryModel.js";
import InventoryRequest from "../models/InventoryRequest.js";

const router = express.Router();

router.get("/dashboard-summary", async (req, res) => {
  try {
    const stateData = await State.findOne();
    const payments = await Payment.find();
    const salaries = await Salary.find();
    const inventoryRequests = await InventoryRequest.find();

    const normalizeBankKey = (bankName) => {
      if (!bankName) return "CASH";
      const b = bankName.trim().toLowerCase();
      if (b === "bank islami" || b === "islamic bank") return "BANK_ISLAMI";
      if (b === "hbl") return "HBL";
      return bankName.toUpperCase().replace(/\s+/g, "_");
    };

    const openingBalances = stateData?.openingBalances || {};

    let bankBalanceByBank = { ...openingBalances };
    let receivedByBank = {};
    let pendingByBank = {};
    let paidByBank = {};

    let cashInHand = {
      received: 0,
      paid: 0,
      pending: 0,
      balance: Number(openingBalances.CASH || 0),
    };

    let totalReceived = 0;
    let totalPending = 0;
    let totalPaid = 0;

    const processTransaction = (
      item,
      modeField,
      bankField,
      amountField,
      statusField
    ) => {
      const amount = Number(item[amountField]) || 0;
      if (!amount) return;

      const status = (item[statusField] || "").toLowerCase().trim();
      const mode = (item[modeField] || "").toLowerCase().trim();
      const bank = normalizeBankKey(item[bankField]);

      const isCash =
        mode === "cash" || bank === "CASH" || !item[bankField];

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

      if (status === "received") {
        receivedByBank[bank] =
          (receivedByBank[bank] || 0) + amount;
        bankBalanceByBank[bank] =
          (bankBalanceByBank[bank] || 0) + amount;
        totalReceived += amount;
      } else if (status === "pending" || status === "unpaid") {
        pendingByBank[bank] =
          (pendingByBank[bank] || 0) + amount;
        totalPending += amount;
      } else if (status === "paid") {
        paidByBank[bank] =
          (paidByBank[bank] || 0) + amount;
        bankBalanceByBank[bank] =
          (bankBalanceByBank[bank] || 0) - amount;
        totalPaid += amount;
      }
    };

    // Process Data
    (stateData?.receivings || []).forEach((r) =>
      processTransaction(r, "mode", "bank", "amount", "status")
    );

    payments.forEach((p) =>
      processTransaction(p, "paymentMode", "bank", "amount", "status")
    );

    salaries.forEach((s) =>
      processTransaction(s, "paymentMode", "bank", "amount", "status")
    );

    inventoryRequests.forEach((r) => {
      if (r.receipt)
        processTransaction(
          r.receipt,
          "mode",
          "bank",
          "amount",
          "paymentStatus"
        );
    });

    const totalBankBalances = Object.values(
      bankBalanceByBank
    ).reduce((sum, val) => sum + (Number(val) || 0), 0);

    const totalAssets = totalBankBalances;

    res.json({
      totalAssets,
      totalReceived,
      totalPending,
      totalPaid,
      bankBalanceByBank,
      receivedByBank,
      pendingByBank,
      paidByBank,
      cashInHand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to generate dashboard summary",
    });
  }
});

export default router;
