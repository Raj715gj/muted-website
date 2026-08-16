import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import twilio from 'twilio';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve SEO files with proper content type
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Initialize Email Transporter
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE.toLowerCase() === 'true' : smtpPort === 465;
const adminRecipient = process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'contact@mutedtech.com';
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
const hasTwilioConfig = /^AC[a-zA-Z0-9]{32}$/.test(twilioAccountSid) && twilioAuthToken.length > 20;
const twilioClient = hasTwilioConfig ? twilio(twilioAccountSid, twilioAuthToken) : null;

transporter.verify().then(() => {
  console.log(`✅ SMTP transporter verified: ${smtpHost}:${smtpPort} (secure=${smtpSecure})`);
}).catch((err) => {
  console.error('❌ SMTP verification failed:', err && err.message ? err.message : err);
});

// Function to send admin notification only
async function sendAdminNotification(orderData) {
  try {
    const { name, email, phone, address, tier, quantity, amount, razorpay_payment_id } = orderData;
    
    const receiptBuffer = await generateReceiptPdfBuffer(orderData);
    const mailOptions = {
      from: process.env.SMTP_USER || process.env.SMTP_FROM || 'Muted Tech <contact@mutedtech.com>',
      replyTo: process.env.SMTP_USER || process.env.CONTACT_EMAIL || 'contact@mutedtech.com',
      to: adminRecipient,
      subject: `📦 New Order: ${name} - ₹${amount}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #a88948, #c8a96e); padding: 20px; border-radius: 8px; color: white; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">🎉 New Muted Aero One Pre-Order</h2>
          </div>
          
          <div style="background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Customer Details:</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p style="margin: 8px 0;"><strong>Address:</strong> ${address}</p>
          </div>
          
          <div style="background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p style="margin: 8px 0;"><strong>Plan:</strong> ${tier}</p>
            <p style="margin: 8px 0;"><strong>Quantity:</strong> ${quantity}</p>
            <p style="margin: 8px 0;"><strong>Amount Paid:</strong> ₹${amount}</p>
            <p style="margin: 8px 0;"><strong>Payment ID:</strong> <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${razorpay_payment_id}</code></p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">Process this order in your admin panel.</p>
        </div>
      `,
      attachments: [
        {
          filename: `MutedAeroOne-Receipt-${razorpay_payment_id || Date.now()}.pdf`,
          content: receiptBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Admin notification email sent to: ${adminRecipient}`);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
}

function generateReceiptPdfBuffer(orderData) {
  return new Promise((resolve, reject) => {
    try {
      const { name, email, phone, address, tier, quantity, amount, razorpay_payment_id } = orderData;
      const doc = new PDFDocument({ size: 'A4', margin: 30 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.font('Helvetica-Bold').fontSize(18).fillColor('#0d3b2e').text('ADVANCE PAYMENT RECEIPT', { align: 'center' });
      doc.moveDown(0.1);
      doc.font('Helvetica').fontSize(10).fillColor('#0c4f4f').text('Muted Technology Private Limited', { align: 'center' });
      doc.fontSize(8).fillColor('#0c4f4f').text('Shravanabelagola, Channarayapatna, Hassan, Karnataka - 573135', { align: 'center' });
      doc.fontSize(8).fillColor('#0c4f4f').text('Phone: 7996064494', { align: 'center' });
      doc.moveDown(0.3);
      doc.strokeColor('#c8a96e').lineWidth(1).moveTo(30, doc.y).lineTo(565, doc.y).stroke();
      doc.moveDown(0.3);

      doc.fontSize(9).fillColor('#374151');
      const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      doc.text(`Receipt No.: ${razorpay_payment_id || 'N/A'}`, 30, doc.y, { continued: true });
      doc.text(`Date: ${new Date().toLocaleDateString()} ${currentTime}`, { align: 'right' });
      doc.moveDown(0.15);
      doc.text(`Payment Method: UPI / Card`, 30, doc.y);
      doc.moveDown(0.15);
      doc.font('Helvetica-Bold').fontSize(9).text('Bill To:', 30);
      doc.font('Helvetica').fontSize(9).text(name, 30);
      doc.fontSize(8).text(email, { indent: 0 });
      doc.fontSize(8).text(phone ? phone : 'N/A', { indent: 0 });
      doc.fontSize(8).text(address, { indent: 0, lineGap: 1 });
      doc.moveDown(0.3);

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('Item Details', { underline: true });
      doc.moveDown(0.2);
      
      const tableTop = doc.y;
      const colX = [30, 270, 360, 460];
      const colW = [240, 90, 100, 75];
      const rowH = 22;
      
      // Header row
      doc.fillColor('#c8a96e').rect(colX[0], tableTop, 535, rowH).fill();
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9);
      doc.text('Description', colX[0] + 6, tableTop + 4, { width: colW[0] });
      doc.text('Qty', colX[1] + 6, tableTop + 4, { width: colW[1], align: 'center' });
      doc.text('Amount', colX[2] + 6, tableTop + 4, { width: colW[2], align: 'center' });
      doc.text('Paid', colX[3] + 6, tableTop + 4, { width: colW[3], align: 'center' });
      
      // Item row
      const itemRowY = tableTop + rowH;
      doc.strokeColor('#ddd').lineWidth(0.5);
      doc.rect(colX[0], itemRowY, 535, rowH).stroke();
      doc.fillColor('#374151').font('Helvetica').fontSize(9);
      doc.text('Muted Aero One', colX[0] + 6, itemRowY + 4, { width: colW[0] });
      doc.text(quantity.toString(), colX[1] + 6, itemRowY + 4, { width: colW[1], align: 'center' });
      doc.text(`₹${amount}`, colX[2] + 6, itemRowY + 4, { width: colW[2], align: 'center' });
      doc.text(`₹${amount}`, colX[3] + 6, itemRowY + 4, { width: colW[3], align: 'center' });
      
      // Totals row
      const totalRowY = itemRowY + rowH;
      doc.fillColor('#f0f0f0').rect(colX[0], totalRowY, 535, rowH).fill();
      doc.strokeColor('#ddd').lineWidth(0.5).rect(colX[0], totalRowY, 535, rowH).stroke();
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9);
      doc.text('Total', colX[0] + 6, totalRowY + 4);
      doc.text(quantity.toString(), colX[1] + 6, totalRowY + 4, { width: colW[1], align: 'center' });
      doc.text(`₹${amount}`, colX[2] + 6, totalRowY + 4, { width: colW[2], align: 'center' });
      doc.text(`₹${amount}`, colX[3] + 6, totalRowY + 4, { width: colW[3], align: 'center' });
      
      doc.y = totalRowY + rowH + 8;
      doc.moveDown(0.2);

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Notes', { underline: true });
      doc.moveDown(0.15);
      doc.font('Helvetica').fontSize(8).fillColor('#374151');
      doc.text('This receipt confirms advance payment for your Muted Aero One preorder.', { paragraphGap: 2 });
      doc.text('The final invoice will be issued once the product is ready for dispatch.', { paragraphGap: 2 });
      doc.moveDown(0.2);

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Terms and Conditions', { underline: true });
      doc.moveDown(0.15);
      doc.font('Helvetica').fontSize(7).fillColor('#374151').lineGap(1);
      doc.text('1. Preorder subject to product availability and shipping timelines.');
      doc.text('2. Amount refundable if product does not ship within stated timeline.');
      doc.text('3. Delivery dates are estimates and may change due to manufacturing or logistics.');
      doc.text('4. Orders processed after payment verification. We will contact you with updates.');
      doc.text('5. Receipt acknowledges advance payment and does not substitute the final invoice.', { paragraphGap: 0 });
      doc.moveDown(0.3);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function sendCustomerReceipt(orderData) {
  try {
    const { email, razorpay_payment_id } = orderData;
    if (!email) {
      console.warn('⚠️ Customer receipt skipped: no customer email provided');
      return false;
    }

    const receiptBuffer = await generateReceiptPdfBuffer(orderData);

    const mailOptions = {
      from: process.env.SMTP_USER || process.env.SMTP_FROM || 'Muted Tech <contact@mutedtech.com>',
      replyTo: process.env.SMTP_USER,
      to: email,
      subject: `Your Muted Aero One order is confirmed!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #a88948, #c8a96e); padding: 20px; border-radius: 8px; color: white; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">Thank you for your order!</h2>
          </div>
          <p style="color: #111; font-size: 14px;">Your purchase is confirmed and a PDF receipt is attached to this email.</p>
          <p style="color: #111; font-size: 14px;">If you have any questions, please reply to this email.</p>
        </div>
      `,
      attachments: [
        {
          filename: `MutedAeroOne-Receipt-${razorpay_payment_id || Date.now()}.pdf`,
          content: receiptBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Customer receipt email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Customer receipt send error:', error);
    return false;
  }
}

function normalizeSmsPhone(phone) {
  const value = String(phone || '').trim();
  if (!value) return null;
  if (value.startsWith('+')) return value.replace(/[^+\d]/g, '');

  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  const countryCode = (process.env.SMS_DEFAULT_COUNTRY_CODE || '+91').replace(/[^+\d]/g, '');
  return `${countryCode}${digits}`;
}

async function sendCustomerSms(orderData) {
  const { name, phone, amount, razorpay_payment_id } = orderData;
  const to = normalizeSmsPhone(phone);
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!to) {
    console.warn('⚠️ Customer SMS skipped: no customer phone provided');
    return false;
  }
  if (!twilioClient || !from) {
    console.warn('⚠️ Customer SMS skipped: Twilio is not configured');
    return false;
  }

  try {
    const message = await twilioClient.messages.create({
      from,
      to,
      body: `Hi ${name || 'there'}, your Muted Aero One preorder is confirmed. Payment of ₹${amount} received. ID: ${razorpay_payment_id}. Thank you!`,
    });
    console.log(`✅ Customer confirmation SMS sent: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('❌ Customer SMS send error:', error && error.message ? error.message : error);
    return false;
  }
}

async function sendContactAcknowledgement({ name, email }) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER || process.env.SMTP_FROM || 'Muted Tech <contact@mutedtech.com>',
      replyTo: adminRecipient,
      to: email,
      subject: 'We received your message - Muted Aero One',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa; border-radius: 10px;">
          <h2 style="margin-top: 0; color: #111;">Thanks for contacting Muted</h2>
          <p style="color: #333;">Hi ${name || 'there'}, we received your message and will get back to you soon.</p>
          <p style="color: #666; font-size: 14px;">For urgent questions, reply to this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact acknowledgement sent to customer', { messageId: info.messageId });
    return true;
  } catch (error) {
    console.error('❌ Contact acknowledgement error:', error && error.message ? error.message : error);
    return false;
  }
}



// ===== CREATE ORDER =====
app.post('/api/create-order', async (req, res) => {
  console.log('⤴ Received /api/create-order', { bodyPreview: req.body && Object.keys(req.body).length ? { ...req.body, address: (req.body.address || '').slice(0,60) } : req.body });
  try {
    const { amount, currency = 'INR', receipt, name, email, phone, address, quantity, plan_name } = req.body;

    // Development/test mock mode: return a fake order when explicitly requested or when test mode is enabled.
    const isTestMode = (process.env.RAZORPAY_MODE || '').toLowerCase() === 'test';
    const secretPlaceholder = (process.env.RAZORPAY_KEY_SECRET || '').toLowerCase().includes('test') || (process.env.RAZORPAY_KEY_SECRET || '').toLowerCase().includes('placeholder');
    const shouldMockOrder = req.body.mock_mode === true || (isTestMode && secretPlaceholder);
    if (shouldMockOrder) {
      const fakeOrderId = `order_mock_${Date.now()}`;
      console.log('ℹ️ Mock create-order ->', fakeOrderId);
      return res.json({ success: true, order_id: fakeOrderId, amount: Math.round(amount || 0), currency, mock_mode: true });
    }

    // Validate amount (minimum 100 paise = ₹1)
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Amount must be at least ₹1 (100 paise)' });
    }

    const options = {
      amount: Math.round(amount),
      currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: {
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: address,
        quantity: quantity?.toString(),
        plan_name,
      },
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('❌ Order Creation Error:', error);
    return res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// ===== VERIFY PAYMENT =====
app.post('/api/verify-payment', async (req, res) => {
  console.log('⤴ Received /api/verify-payment', { bodyPreview: req.body && Object.keys(req.body).length ? { razorpay_order_id: req.body.razorpay_order_id, razorpay_payment_id: req.body.razorpay_payment_id } : req.body });
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_details } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // Development/test mock mode: accept a mocked verification when explicitly requested or when test mode is enabled.
    const isTestMode = (process.env.RAZORPAY_MODE || '').toLowerCase() === 'test';
    const secretPlaceholder = (process.env.RAZORPAY_KEY_SECRET || '').toLowerCase().includes('test') || (process.env.RAZORPAY_KEY_SECRET || '').toLowerCase().includes('placeholder');
    const shouldMockVerification = req.body.mock_mode === true || (isTestMode && secretPlaceholder);
    const isAuthentic = shouldMockVerification ? true : (expectedSignature === razorpay_signature);

    if (!isAuthentic) {
      console.error('❌ Signature Mismatch');
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    console.log('✅ Payment verified:', razorpay_payment_id);

    if (order_details) {
      const emailData = {
        ...order_details,
        razorpay_payment_id,
      };

      const adminSent = await sendAdminNotification(emailData);
      const customerSent = await sendCustomerReceipt(emailData);
      const smsSent = await sendCustomerSms(emailData);

      console.log(`✅ Order notifications: admin=${adminSent ? 'sent' : 'failed'}, email=${customerSent ? 'sent' : 'failed'}, sms=${smsSent ? 'sent' : 'skipped/failed'}`);
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
    });
  } catch (error) {
    console.error('❌ Verification Error:', error);
    return res.status(500).json({ error: 'Verification failed', details: error.message });
  }
});

// ===== CONTACT MESSAGE =====
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email and message are required.' });
    }

    const mailOptions = {
      from: process.env.SMTP_USER || process.env.SMTP_FROM || `Muted Tech <contact@mutedtech.com>`,
      replyTo: email,
      to: adminRecipient,
      subject: `Muted Aero One Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa; border-radius: 10px;">
          <h2 style="margin-top: 0; color: #111;">New contact message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="padding: 15px; background: #fff; border: 1px solid #e1e1e1; border-radius: 8px; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    const acknowledgementSent = await sendContactAcknowledgement({ name, email });
    console.log('✅ Contact message sent to admin', {
      recipient: adminRecipient,
      messageId: info.messageId,
      acknowledgementSent,
    });
    return res.json({
      success: true,
      message: 'Contact message sent successfully.',
      acknowledgementSent,
    });
  } catch (error) {
    console.error('❌ Contact send error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send contact message.' });
  }
});

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date().toISOString() });
});

// Public config endpoint (safe to expose public key id)
app.get('/config', (req, res) => {
  return res.json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    mode: process.env.RAZORPAY_MODE || (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'live' : 'test')
  });
});

// ===== SERVE INDEX.HTML FOR ROUTES =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Muted Aero One Server running on http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   POST /api/create-order   — Create Razorpay order`);
  console.log(`   POST /api/verify-payment — Verify payment signature`);
  console.log(`   GET  /api/health        — Health check\n`);
});
