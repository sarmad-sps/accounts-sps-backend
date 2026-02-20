import mongoose from "mongoose";

const ReceivingSchema = new mongoose.Schema(
  {
    id: String,
    // ─── New Client Fields (Start) ───
    clientName: { type: String, required: true, trim: true },
    clientAddress: { type: String, required: true, trim: true },
    clientPhone: { type: String, required: true, trim: true },
    // ─── New Client Fields (End) ───

    party: String,
    amount: Number,
    date: String,
    notes: String,
    status: String,
    bank: String,
    category: String,
    paymentMode: { type: String, default: "Cash" }, // updated name
totalAmount: { type: Number, default: 0 }, 
    // Tracker specific fields
    trackerCompany: { type: String, default: null },
    trackerType: { type: String, default: null },
    addonService: { type: String, default: null },
    vehicleType: { type: String, default: null },
    registrationNo: { type: String, default: null },
    vehicleBrand: { type: String, default: null },
    chassisNumber: { type: String, default: null },
    engineNumber: { type: String, default: null },
    agentName: { type: String, default: null },

    insuranceCover: { type: String, default: null },
  },
  { _id: true, timestamps: true },
);


/* ================= ITEM SCHEMA ================= */
const ExpenseItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

/* ================= MAIN EXPENSE SCHEMA ================= */
const ExpenseSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },

    mode: {
      type: String, // category | type
      required: true,
    },

    category: {
      type: String,
      default: null,
    },

    expenseType: {
      type: String,
      default: null,
    },

    items: {
      type: [ExpenseItemSchema],
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", ExpenseSchema);

/* ================= EXPENSE ================= */
const PaymentSchema = new mongoose.Schema(
  {
    date: String,
    category: String,        // Kitchen Items etc
    expenseType: String,     // Office Grocery etc
    mode: String,            // "category" | "type"
    items: [ExpenseItemSchema],
    total: Number,
  },
  { _id: true, timestamps: true }
);

const StateSchema = new mongoose.Schema({
  companyName: String,
  openingBalances: {
    BANK_ISLAMI: Number,
    HBL: Number,
     CASH: Number,
  },
  receivings: [ReceivingSchema],
  expenses: { type: [ExpenseSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

export const StateModel = mongoose.model("State", StateSchema);
