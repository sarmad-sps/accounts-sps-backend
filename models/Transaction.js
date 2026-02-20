import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true, // YYYY-MM-DD format
    },
    time: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["purchase", "expense"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    party: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", TransactionSchema);
