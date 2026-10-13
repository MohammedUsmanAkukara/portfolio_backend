const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const protect = require('../middlewares/authMiddleware');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// Helper: generate invoice number
const generateInvoiceNumber = async (type) => {
  const prefix = type === 'quotation' ? 'QT' : 'INV';
  const count = await Invoice.countDocuments({ type });
  const num = String(count + 1).padStart(4, '0');
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${num}`;
};

// Helper: format currency
const formatCurrency = (amount, currency = 'INR') => {
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

// Helper: generate beautiful HTML email for invoice/quotation
const generateInvoiceHtml = (invoice) => {
  const isQuotation = invoice.type === 'quotation';
  const docTitle = isQuotation ? 'QUOTATION' : 'INVOICE';
  const accentColor = isQuotation ? '#7c3aed' : '#2563eb';
  const headerBg = isQuotation ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';

  const itemsHtml = invoice.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'}">
      <td style="padding:14px 16px; font-size:14px; color:#1e293b; border-bottom:1px solid #e2e8f0">${item.description}</td>
      <td style="padding:14px 16px; font-size:14px; color:#64748b; text-align:center; border-bottom:1px solid #e2e8f0">${item.quantity}</td>
      <td style="padding:14px 16px; font-size:14px; color:#64748b; text-align:right; border-bottom:1px solid #e2e8f0">${formatCurrency(item.rate, invoice.currency)}</td>
      <td style="padding:14px 16px; font-size:14px; font-weight:600; color:#1e293b; text-align:right; border-bottom:1px solid #e2e8f0">${formatCurrency(item.amount, invoice.currency)}</td>
    </tr>
  `).join('');

  const statusColor = {
    draft: '#64748b', sent: '#2563eb', paid: '#16a34a',
    partial: '#d97706', overdue: '#dc2626', cancelled: '#6b7280'
  }[invoice.status] || '#2563eb';

  const advanceSection = invoice.advanceAmount > 0 ? `
    <tr>
      <td colspan="2" style="padding:8px 16px; font-size:14px; color:#16a34a; text-align:right; font-weight:600">
        Advance Received:
      </td>
      <td style="padding:8px 16px; font-size:14px; color:#16a34a; text-align:right; font-weight:600">
        - ${formatCurrency(invoice.advanceAmount, invoice.currency)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding:12px 16px; font-size:16px; color:#dc2626; text-align:right; font-weight:800">
        Balance Due:
      </td>
      <td style="padding:12px 16px; font-size:16px; color:#dc2626; text-align:right; font-weight:800">
        ${formatCurrency(invoice.balanceAmount, invoice.currency)}
      </td>
    </tr>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle} ${invoice.invoiceNumber}</title>
</head>
<body style="margin:0; padding:0; background:#f1f5f9; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:700px; margin:40px auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.12)">
    
    <!-- Header -->
    <div style="background:${headerBg}; padding:40px 48px; position:relative">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:20px">
        <div>
          <div style="font-size:32px; font-weight:900; color:white; letter-spacing:-1px; margin-bottom:4px">Mohammed Usman<span style="color:rgba(255,255,255,0.6)">.</span></div>
          <div style="font-size:14px; color:rgba(255,255,255,0.8)">Full-Stack Web Developer</div>
          <div style="font-size:13px; color:rgba(255,255,255,0.7); margin-top:4px">mdusmanakukara2.0@gmail.com</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:28px; font-weight:900; color:rgba(255,255,255,0.25); letter-spacing:4px">${docTitle}</div>
          <div style="font-size:18px; font-weight:700; color:white; margin-top:4px">${invoice.invoiceNumber}</div>
          <div style="display:inline-block; background:rgba(255,255,255,0.2); padding:4px 14px; border-radius:999px; font-size:12px; font-weight:700; color:white; margin-top:8px; text-transform:uppercase; letter-spacing:1px">${invoice.status}</div>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:40px 48px">
      
      <!-- Bill To / Dates -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-bottom:40px">
        <div>
          <div style="font-size:11px; font-weight:700; color:${accentColor}; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px">BILL TO</div>
          <div style="font-size:18px; font-weight:800; color:#1e293b; margin-bottom:4px">${invoice.clientName}</div>
          ${invoice.clientCompany ? `<div style="font-size:14px; color:#64748b; margin-bottom:4px">${invoice.clientCompany}</div>` : ''}
          <div style="font-size:14px; color:#64748b; margin-bottom:2px">${invoice.clientEmail}</div>
          ${invoice.clientPhone ? `<div style="font-size:14px; color:#64748b; margin-bottom:2px">${invoice.clientPhone}</div>` : ''}
          ${invoice.clientAddress ? `<div style="font-size:14px; color:#94a3b8; margin-top:4px">${invoice.clientAddress}</div>` : ''}
        </div>
        <div style="text-align:right">
          <div style="font-size:11px; font-weight:700; color:${accentColor}; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px">DETAILS</div>
          <div style="margin-bottom:8px">
            <span style="font-size:13px; color:#94a3b8; font-weight:600">Issue Date: </span>
            <span style="font-size:13px; color:#1e293b; font-weight:700">${new Date(invoice.issueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
          </div>
          ${invoice.dueDate ? `<div style="margin-bottom:8px">
            <span style="font-size:13px; color:#94a3b8; font-weight:600">Due Date: </span>
            <span style="font-size:13px; color:#dc2626; font-weight:700">${new Date(invoice.dueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
          </div>` : ''}
          <div>
            <span style="font-size:13px; color:#94a3b8; font-weight:600">Currency: </span>
            <span style="font-size:13px; color:#1e293b; font-weight:700">${invoice.currency}</span>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; margin-bottom:32px">
        <table style="width:100%; border-collapse:collapse">
          <thead>
            <tr style="background:${accentColor}">
              <th style="padding:14px 16px; text-align:left; font-size:12px; font-weight:700; color:white; text-transform:uppercase; letter-spacing:1px">Description</th>
              <th style="padding:14px 16px; text-align:center; font-size:12px; font-weight:700; color:white; text-transform:uppercase; letter-spacing:1px">Qty</th>
              <th style="padding:14px 16px; text-align:right; font-size:12px; font-weight:700; color:white; text-transform:uppercase; letter-spacing:1px">Rate</th>
              <th style="padding:14px 16px; text-align:right; font-size:12px; font-weight:700; color:white; text-transform:uppercase; letter-spacing:1px">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="display:flex; justify-content:flex-end; margin-bottom:36px">
        <table style="min-width:300px">
          <tbody>
            ${invoice.taxRate > 0 ? `
            <tr>
              <td colspan="2" style="padding:8px 16px; font-size:14px; color:#64748b; text-align:right">Subtotal:</td>
              <td style="padding:8px 16px; font-size:14px; color:#1e293b; text-align:right; font-weight:600">${formatCurrency(invoice.subtotal, invoice.currency)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px 16px; font-size:14px; color:#64748b; text-align:right">GST (${invoice.taxRate}%):</td>
              <td style="padding:8px 16px; font-size:14px; color:#1e293b; text-align:right; font-weight:600">${formatCurrency(invoice.taxAmount, invoice.currency)}</td>
            </tr>
            ` : ''}
            <tr style="background:#f8fafc; border-radius:8px">
              <td colspan="2" style="padding:16px; font-size:18px; color:#1e293b; text-align:right; font-weight:800">Total:</td>
              <td style="padding:16px; font-size:20px; color:${accentColor}; text-align:right; font-weight:900">${formatCurrency(invoice.totalAmount, invoice.currency)}</td>
            </tr>
            ${advanceSection}
          </tbody>
        </table>
      </div>

      <!-- Notes -->
      ${invoice.notes ? `
      <div style="background:#f8fafc; border-left:4px solid ${accentColor}; border-radius:8px; padding:16px 20px; margin-bottom:24px">
        <div style="font-size:11px; font-weight:700; color:${accentColor}; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px">NOTES</div>
        <div style="font-size:14px; color:#475569; line-height:1.6">${invoice.notes}</div>
      </div>
      ` : ''}

      <!-- Terms -->
      <div style="background:#f8fafc; border-radius:8px; padding:16px 20px; margin-bottom:40px">
        <div style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px">TERMS & CONDITIONS</div>
        <div style="font-size:13px; color:#94a3b8; line-height:1.6">${invoice.terms}</div>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#0f172a; padding:28px 48px; text-align:center">
      <div style="font-size:14px; color:#94a3b8">Thank you for your business! 🙏</div>
      <div style="font-size:12px; color:#475569; margin-top:6px">Mohammed Usman · Full-Stack Developer · mdusmanakukara2.0@gmail.com</div>
    </div>
  </div>
</body>
</html>
  `;
};

// @route   GET /api/invoices — Admin only
router.get('/', protect, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/invoices/:id — Admin only
router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST /api/invoices — Admin only: create invoice/quotation
router.post('/', protect, async (req, res) => {
  try {
    const body = req.body;
    // Calculate amounts
    const subtotal = body.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal * (body.taxRate || 0)) / 100;
    const totalAmount = subtotal + taxAmount;
    const advanceAmount = Number(body.advanceAmount) || 0;
    const balanceAmount = totalAmount - advanceAmount;

    // Enrich items with computed amount
    const items = body.items.map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));

    const invoiceNumber = await generateInvoiceNumber(body.type || 'invoice');

    const invoice = await Invoice.create({
      ...body,
      items,
      invoiceNumber,
      subtotal,
      taxAmount,
      totalAmount,
      advanceAmount,
      balanceAmount
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create invoice' });
  }
});

// @route   PUT /api/invoices/:id — Admin only: update invoice
router.put('/:id', protect, async (req, res) => {
  try {
    const body = req.body;
    if (body.items) {
      const subtotal = body.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
      const taxAmount = (subtotal * (body.taxRate || 0)) / 100;
      const totalAmount = subtotal + taxAmount;
      const advanceAmount = Number(body.advanceAmount) || 0;
      body.subtotal = subtotal;
      body.taxAmount = taxAmount;
      body.totalAmount = totalAmount;
      body.balanceAmount = totalAmount - advanceAmount;
      body.items = body.items.map(item => ({ ...item, amount: item.quantity * item.rate }));
    }

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update' });
  }
});

// @route   DELETE /api/invoices/:id — Admin only
router.delete('/:id', protect, async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete' });
  }
});

// @route   POST /api/invoices/:id/send — Admin only: email invoice to client
router.post('/:id/send', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const docTitle = invoice.type === 'quotation' ? 'Quotation' : 'Invoice';
    const htmlContent = generateInvoiceHtml(invoice);

    const mailOptions = {
      from: `"Mohammed Usman" <${process.env.EMAIL_USER}>`,
      to: invoice.clientEmail,
      bcc: process.env.EMAIL_USER,
      subject: `${docTitle} ${invoice.invoiceNumber} from Mohammed Usman`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    // Update status to 'sent' if it was draft
    if (invoice.status === 'draft') {
      invoice.status = 'sent';
      await invoice.save();
    }

    res.status(200).json({ success: true, message: `${docTitle} sent successfully to ${invoice.clientEmail}` });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email: ' + error.message });
  }
});

module.exports = router;
