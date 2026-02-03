import express from "express";
import PaymentExpense from "../models/PaymentExpense.js";

const router = express.Router();

/* ===== GET ALL PAYMENTS ===== */
router.get("/", async (req, res) => {
  try {
    const payments = await PaymentExpense.find().sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===== ADD NEW PAYMENT ===== */
router.post("/", async (req, res) => {
  try {
    const payment = new PaymentExpense(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });   
  }
});

/* ===== UPDATE PAYMENT ===== */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: you can add validation here if needed
    const updatedPayment = await PaymentExpense.findByIdAndUpdate(
      id,
      { $set: req.body },        
      { 
        new: true,                 
        runValidators: true         
      }
    );

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(updatedPayment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ===== DELETE PAYMENT ===== */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPayment = await PaymentExpense.findByIdAndDelete(id);

    if (!deletedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ 
      message: "Payment deleted successfully",
      deletedId: id 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const result = await PaymentExpense.aggregate([
      { $match: { status: "Paid" } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: "$amount" }
        }
      }
    ]);

    const total = result.length > 0 ? result[0].totalPaid : 0;

    res.json({ totalPaid: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;