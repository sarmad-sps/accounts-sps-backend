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
//       enum: ["Cash", "Online", "Cheque", "Bank Transfer"],
//       required: true,
//     },
//     bank: {
//       type: String,
//       enum: ["HBL", "Bank Islami", "Other"],
//       default: null,
//       validate: {
//         validator: function (value) {
//           // Cash ho to bank NULL allow
//           if (this.paymentMethod === "Cash") {
//             return value === null || value === undefined;
//           }
//           // Non-cash ho to bank REQUIRED
//           return !!value;
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
          // Cash → bank can be null, undefined, or empty string
          if (this.paymentMethod === "Cash") {
            return value === null || value === undefined || value === "";
          }
          // Non-Cash → bank must be a non-empty string
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
