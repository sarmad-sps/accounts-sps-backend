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


export default router;
