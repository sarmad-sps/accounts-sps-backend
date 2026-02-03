import mongoose from "mongoose";

const paymentExpenseSchema = new mongoose.Schema({
  payee: {
    type: String,
    required: [true, "Payee is required"],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Inventory",
      "Salary",
      "Utility Bill",
      "Rent",
      "Maintenance",
      "Marketing",
      "Tracker",
      "Other",
    ],
  },
  amount: {
    type: Number,
    required: true,
    min: [1, "Amount must be at least 1"],
  },
  description: {
    type: String,
    default: "—",
    trim: true,
  },
  status: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid",
  },
  paymentMode: {
    type: String,
    enum: ["Online", "Bank Transfer", "Check", "Cash"],
    default: "Online",
    required: true,
  },
  // ─── NEW FIELD ───────────────────────────────────────
  bank: {
    type: String,
    enum: ["HBL", "Islamic Bank", "Other"],
    default: "HBL",
    required: true,          // or false — your choice
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model("PaymentExpense", paymentExpenseSchema);