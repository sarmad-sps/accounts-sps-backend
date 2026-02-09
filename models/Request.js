import mongoose from "mongoose";


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
