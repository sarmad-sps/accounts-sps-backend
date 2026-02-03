// import mongoose from "mongoose";

// const SalarySchema = new mongoose.Schema(
//   {
//     employeeName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     designation: {
//       type: String,
//       required: true,
//     },

//     amount: {
//       type: Number,
//       required: true,
//     },

//     month: {
//       type: String,
//       required: true,
//     },

//     paymentDate: {
//       type: Date,
//       required: true,
//     },

//     paymentMethod: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Salary", SalarySchema);

import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    month: {
      type: String,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    // ─── NEW FIELDS ───────────────────────────────────────
    bank: {
      type: String,
      enum: ["HBL", "Islamic Bank", "Other"],
      default: "HBL",
      required: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Paid",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Salary", SalarySchema);