import mongoose from "mongoose";

const ReceiptSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    required: true,
    trim: true
  },
  receivedQty: {
    type: Number,
    required: true,
    min: 1
  },
  receivedAt: {
    type: Date,
    default: Date.now
  },
  enteredBy: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Check', 'Bank Transfer']   // ← restrict values
  },
  bank: {
    type: String,
    default: null,          // ← default null rakho
    required: false
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Partial'],
    default: 'Paid'
  },
  amount: {
    type: Number,
    required: false,
    min: 0
  }
}, {
  timestamps: true   // createdAt, updatedAt automatic
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
