

import express from "express";
import InventoryRequest from "../models/Request.js";
import InventoryItem from "../models/InventoryItem.js";

const router = express.Router();

/* ================= USER CREATE REQUEST ================= */
router.post("/", async (req, res) => {
  try {
    const { item, qty, desc, requestedBy, category } = req.body;

    if (!item || !qty || !requestedBy) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newReq = new InventoryRequest({
      item,
      qty: Number(qty),
      desc,
      requestedBy,
      category,
      status: "pending_store",
    });

    await newReq.save();
    res.status(201).json(newReq);
  } catch (err) {
    res.status(500).json({ message: "Failed to create request" });
  }
});

/* ================= GET ALL REQUESTS ================= */
router.get("/", async (req, res) => {
  try {
    const requests = await InventoryRequest.find().sort({ createdAt: -1 });

    const enriched = await Promise.all(
      requests.map(async (r) => {
        const item = await InventoryItem.findOne({ name: r.item });
        return { ...r.toObject(), stock: item ? item.quantity : 0 };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

/* ================= UPDATE REQUEST STATUS ================= */
router.patch("/:id", async (req, res) => {
  try {
    const { status, receivedQty, invoiceNo, paymentMethod, bank, paymentStatus, amount } = req.body;

    const request = await InventoryRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    let inventoryItem = await InventoryItem.findOne({ name: request.item });
    const stock = inventoryItem ? inventoryItem.quantity : 0;
    const qty = request.qty;

    /* ===== STORE → SEND TO ADMIN ===== */
    if (status === "send_to_admin") {
      if (stock >= qty) {
        request.status = "pending_admin"; // stock available
      } else {
        request.status = "needs_purchase"; // stock out
      }
    }

    /* ===== STORE → PURCHASE REQUEST ===== */
    if (status === "purchase_requested") {
      request.status = "purchase_requested";
    }

    /* ===== ADMIN → APPROVE PURCHASE ===== */
    if (status === "purchase_approved") {
      request.status = "purchase_approved";
    }

    /* ===== ACCOUNTANT → RECEIVE STOCK ===== */
    if (status === "stock_received") {
      if (!receivedQty || !invoiceNo || !paymentMethod) {
        return res.status(400).json({ message: "Receipt info required (invoiceNo, receivedQty, paymentMethod)" });
      }

      // If payment method requires a bank, ensure bank provided
      if ((paymentMethod === "Bank Transfer" || paymentMethod === "Check") && !bank) {
        return res.status(400).json({ message: "Bank is required for Bank Transfer or Check" });
      }

      request.status = "stock_received";

      if (!inventoryItem) {
        inventoryItem = new InventoryItem({
          name: request.item,
          quantity: Number(receivedQty),
        });
      } else {
        inventoryItem.quantity += Number(receivedQty);
      }

      await inventoryItem.save();

      
      // request.receipt = {
      //   invoiceNo,
      //   receivedQty: Number(receivedQty),
      //   receivedAt: new Date(),
      //   enteredBy: "Accountant",
      //   paymentMethod,
      //   bank: bank || null,
      //   paymentStatus: paymentStatus || "Paid",
      //   amount: amount ? Number(amount) : null,
      // };
    request.receipt = {
  invoiceNo,
  receivedQty: Number(receivedQty),
  receivedAt: new Date(),
  enteredBy: "Accountant",
  paymentMethod,
  bank:
    paymentMethod === "Cash"
      ? null
      : bank || null,
  paymentStatus: paymentStatus || "Paid",
  amount: amount ? Number(amount) : null,
};

    
    
    }

    /* ===== STORE → REQUEST ADMIN (AFTER STOCK RECEIVED) ===== */
    if (status === "request_user_approval") {
      request.status = "pending_admin";
    }

    /* ===== ADMIN → APPROVE USER REQUEST ===== */
    if (status === "approved") {
      request.status = "approved";
    }

    /* ===== STORE → ISSUE ITEM ===== */
    if (status === "issued") {
      if (!inventoryItem || inventoryItem.quantity < qty) {
        return res
          .status(400)
          .json({ message: "Cannot issue: stock insufficient" });
      }

      inventoryItem.quantity -= qty;
      await inventoryItem.save();

      request.status = "issued";
      request.issuedDate = new Date();
    }

    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Update failed",
      error: err.message,
    });
  }
});

export default router;
