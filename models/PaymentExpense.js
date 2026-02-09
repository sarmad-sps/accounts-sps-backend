// import mongoose from "mongoose";

// const paymentExpenseSchema = new mongoose.Schema({
//   payee: {
//     type: String,
//     required: [true, "Payee is required"],
//     trim: true,
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: [
//       "Inventory",
//       "Salary",
//       "Utility Bill",
//       "Rent",
//       "Maintenance",
//       "Marketing",
//       "Tracker",
//       "Other",
//     ],
//   },
//   amount: {
//     type: Number,
//     required: true,
//     min: [1, "Amount must be at least 1"],
//   },
//   description: {
//     type: String,
//     default: "—",
//     trim: true,
//   },
//   status: {
//     type: String,
//     enum: ["Paid", "Unpaid"],
//     default: "Unpaid",
//   },
//   paymentMode: {
//     type: String,
//     enum: ["Online", "Bank Transfer", "Check", "Cash"],
//     default: "Online",
//     required: true,
//   },
//   // ─── NEW FIELD ───────────────────────────────────────
//   bank: {
//     type: String,
//     enum: ["HBL", "Islamic Bank", "Other"],
//     default: "HBL",
//     required: true,          // or false — your choice
//   },
//   paymentDate: {
//     type: Date,
//     default: Date.now,
//   },
// }, {
//   timestamps: true,
// });

// export default mongoose.model("PaymentExpense", paymentExpenseSchema);

import mongoose from "mongoose";

const paymentExpenseSchema = new mongoose.Schema(
  {
    payee: {
      type: String,
      required: [true, "Payee name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },
    description: {
      type: String,
      trim: true,
      default: "—",
    },
    status: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },
    paymentMode: {
      type: String,
      enum: ["Online", "Bank Transfer", "Check", "Cash"],
      required: [true, "Payment mode is required"],
    },
    bank: {
      type: String,
      trim: true,
      // Yeh conditional validation hai
      validate: {
        validator: function (value) {
          // Agar paymentMode Cash nahi hai to bank required hai
          if (this.paymentMode !== "Cash") {
            return !!value && value.trim() !== ""; // bank should not be empty
          }
          return true; // Cash ke case mein bank null/empty allowed
        },
        message: "Bank is required when payment mode is not Cash",
      },
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentExpense = mongoose.model("PaymentExpense", paymentExpenseSchema);

export default PaymentExpense;