// // import mongoose from "mongoose";

// // const SalarySchema = new mongoose.Schema(
// //   {
// //     employeeName: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //     },
// //     designation: {
// //       type: String,
// //       required: true,
// //     },
// //     amount: {
// //       type: Number,
// //       required: true,
// //       min: 1,
// //     },
// //     month: {
// //       type: String,
// //       required: true,
// //     },
// //     paymentDate: {
// //       type: Date,
// //       required: true,
// //     },
// //     paymentMethod: {
// //       type: String,
// //       required: true,
// //     },
// //     // ─── NEW FIELDS ───────────────────────────────────────
// //     bank: {
// //       type: String,
// //       enum: ["HBL", "Islamic Bank", "Other"],
// //       default: "HBL",
// //       required: true,
// //     },
// //     status: {
// //       type: String,
// //       enum: ["Paid", "Unpaid"],
// //       default: "Paid",
// //       required: true,
// //     },
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model("Salary", SalarySchema);


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
//       min: 1,
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
//     bank: {
//       type: String,
//       enum: ["HBL", "Islamic Bank", "Other"],
//       default: "",
//       // Yeh conditional validation lagao
//       validate: {
//         validator: function (value) {
//           // Agar paymentMethod Cash nahi hai to bank required hai
//           if (this.paymentMethod !== "Cash") {
//             return !!value && value.trim() !== "";
//           }
//           return false; // Cash ke liye bank empty ya null allowed
//         },
//         message: "Bank is required when payment method is not Cash",
//       },
//     },
//     status: {
//       type: String,
//       enum: ["Paid", "Unpaid"],
//       default: "Paid",
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
      enum: ["Cash", "Online", "Cheque", "Bank Transfer"],
      required: true,
    },
  bank: {
  type: String,
  enum: ["HBL", "Bank Islami", "Other"],
  default: null,
  validate: {
    validator: function (value) {
      if (this.paymentMethod === "Cash") {
        // Cash → bank can be null, undefined, or empty
        return value === null || value === undefined || value === "";
      }
      // Non-Cash → bank must be non-empty string
      return typeof value === "string" && value.trim() !== "";
    },
    message: "Bank is required when payment method is not Cash",
  },
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
