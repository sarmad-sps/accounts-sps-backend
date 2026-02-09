import express from "express";
import Salary from "../models/SalaryModel.js";

const router = express.Router();

/* ================= ADD SALARY ================= */
router.post("/", async (req, res) => {
  try {
   const {
  employeeName,
  designation,
  amount,
  month,
  paymentDate,
  paymentMethod,
  bank,
  status
} = req.body;

const salary = new Salary({
  employeeName,
  designation,
  amount,
  month,
  paymentDate,
  paymentMethod,
  bank,
  status
});

    await salary.save();

    res.status(201).json({ message: "Salary saved successfully", salary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= GET ALL SALARIES ================= */
router.get("/", async (req, res) => {
  try {
    const salaries = await Salary.find().sort({ createdAt: -1 });
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= DELETE SALARY ================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSalary = await Salary.findByIdAndDelete(id);

    if (!deletedSalary) return res.status(404).json({ message: "Salary not found" });
    res.json({ message: "Salary deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= UPDATE SALARY =================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Optional: prevent updating _id or createdAt, etc.
    const allowedUpdates = [
      "employeeName",
      "designation",
      "amount",
      "month",
      "paymentDate",
      "paymentMethod",
      "bank",
      "status"
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const updatedSalary = await Salary.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedSalary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    res.json({
      message: "Salary updated successfully",
      salary: updatedSalary
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
});
export default router;
