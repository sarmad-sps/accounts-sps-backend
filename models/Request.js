import mongoose from "mongoose";


const ReceiptSchema = new mongoose.Schema({
  invoiceNo: String,
  receivedQty: Number,
  receivedAt: Date,
  enteredBy: String,
  paymentMethod: { type: String, required: true },
  bank: { 
    type: String, 
    default: null,
    // ✅ Validation: agar Cash nahi hai tab required
    validate: {
      validator: function(value) {
        // Agar paymentMethod Cash hai toh bank null hona chahiye
        if (this.paymentMethod === "Cash") {
          return value === null || value === undefined;
        }
        // Agar Cash nahi hai toh bank required
        return value && value.trim().length > 0;
      },
      message: "Bank is required for non-Cash payments"
    }
  },
  paymentStatus: String,
  amount: Number,
});

// ✅ Pre-save hook to clean bank field
ReceiptSchema.pre('save', function(next) {
  if (this.paymentMethod === "Cash") {
    this.bank = null;
  }
  next();
});
const InventoryRequestSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    qty: { type: Number, required: true },
    desc: String,
    category: String,
    requestedBy: { type: String, required: true },

    status: {
      type: String,
      enum: [
        "pending_store",       // user created
        "pending_admin",       // store → admin
        "needs_purchase",      // stock out
        "purchase_requested",  // store → admin
        "purchase_approved",   // admin approved purchase
        "stock_received",      // accountant added stock
        "approved",            // admin approved user request
        "issued",              // store issued
      ],
      default: "pending_store",
    },

    receipt: ReceiptSchema,
    issuedDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model(
  "InventoryRequest",
  InventoryRequestSchema
);
