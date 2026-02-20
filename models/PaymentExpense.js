// import mongoose from "mongoose";

// const paymentExpenseSchema = new mongoose.Schema(
//   {
//     payee: {
//       type: String,
//       required: [true, "Payee name is required"],
//       trim: true,
//     },
//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//     },
//     amount: {
//       type: Number,
//       required: [true, "Amount is required"],
//       min: [1, "Amount must be greater than 0"],
//     },
//     description: {
//       type: String,
//       trim: true,
//       default: "—",
//     },
//     status: {
//       type: String,
//       enum: ["Paid", "Unpaid"],
//       default: "Unpaid",
//     },
//     paymentMode: {
//       type: String,
//       enum: ["Online", "Bank Transfer", "Check", "Cash"],
//       required: [true, "Payment mode is required"],
//     },
//     bank: {
//       type: String,
//       trim: true,
//       // Yeh conditional validation hai
//       validate: {
//         validator: function (value) {
//           // Agar paymentMode Cash nahi hai to bank required hai
//           if (this.paymentMode !== "Cash") {
//             return !!value && value.trim() !== ""; // bank should not be empty
//           }
//           return true; // Cash ke case mein bank null/empty allowed
//         },
//         message: "Bank is required when payment mode is not Cash",
//       },
//     },
//     paymentDate: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const PaymentExpense = mongoose.model("PaymentExpense", paymentExpenseSchema);

// export default PaymentExpense;

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
      enum: ["Inventory", "Utility Bill", "Rent", "Maintenance", "Marketing", "Tracker", "Other"],
    },
    itemName: {
      type: String,
      trim: true,
      default: null,
      // Optional — only meaningful for "Inventory" category
    },
    quantity: {
      type: Number,
      min: [1, "Quantity must be at least 1"],
      default: null,
      // Optional — only meaningful for "Inventory" category
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // or Object — flexible for any key-value pairs
      default: {},
      // Will store category-specific data, e.g.:
      // { billType: "Electricity", billPeriod: "Jan 2026" }
      // { registrationNo: "ABC-123", vehicleType: "Car", trackerModel: "MT200" }
      // { rentFor: "Office DHA", period: "Feb 2026" }
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
      default: null,
      validate: {
        validator: function (value) {
          // Bank is required only when paymentMode is NOT "Cash"
          if (this.paymentMode !== "Cash") {
            return !!value && value.trim() !== "";
          }
          return true;
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

// Optional: Add index for faster searching
paymentExpenseSchema.index({ payee: "text", category: 1, status: 1 });
paymentExpenseSchema.index({ paymentDate: -1 });

const PaymentExpense = mongoose.model("PaymentExpense", paymentExpenseSchema);

export default PaymentExpense;