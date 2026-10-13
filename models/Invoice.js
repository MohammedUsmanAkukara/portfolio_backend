const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['invoice', 'quotation'], default: 'invoice' },
  
  // Client Info (snapshot at time of creation)
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, default: '' },
  clientCompany: { type: String, default: '' },
  clientAddress: { type: String, default: '' },

  // Line Items
  items: [invoiceItemSchema],

  // Financial
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 }, // percentage e.g. 18 for 18% GST
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  advanceAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },

  // Dates
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },

  // Status
  status: { type: String, enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'], default: 'draft' },

  // Notes
  notes: { type: String, default: '' },
  terms: { type: String, default: 'Payment due within 7 days of invoice date.' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
