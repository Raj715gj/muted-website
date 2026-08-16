/**
 * AWS Lambda Handler for Express Application
 * Converts Express app to AWS Lambda compatible format
 */

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
import serverless from 'serverless-http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ===== RAZORPAY SETUP =====
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===== EMAIL SETUP =====
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

// ===== TWILIO SETUP =====
let twillioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twillioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// ===== ROUTES =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'AWS Lambda running', 
    timestamp: new Date().toISOString(),
    environment: 'lambda'
  });
});

// Public config endpoint
app.get('/config', (req, res) => {
  return res.json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    mode: process.env.RAZORPAY_MODE || (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'live' : 'test')
  });
});

// Create order endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt, name, email, phone, address, quantity, plan_name } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_address: address,
        quantity,
        plan_name,
      },
    });

    // Log to CloudWatch
    console.log('✅ Razorpay order created:', order.id);

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Verify payment endpoint
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Signature mismatch');
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // Send confirmation email
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const { customer_name, customer_email, customer_phone, quantity, plan_name } = order.notes || {};

    if (customer_email) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: customer_email,
        subject: '✅ Muted Aero One Pre-Order Confirmed',
        html: `
          <h2>Thank you for your pre-order!</h2>
          <p>Name: ${customer_name}</p>
          <p>Plan: ${plan_name}</p>
          <p>Quantity: ${quantity}</p>
          <p>Amount: ₹${order.amount / 100}</p>
          <p>Order ID: ${razorpay_order_id}</p>
          <p>We'll ship your order soon!</p>
        `,
      });
      console.log('✅ Confirmation email sent to:', customer_email);
    }

    // Send SMS if Twilio is configured
    if (twillioClient && customer_phone) {
      try {
        await twillioClient.messages.create({
          body: `✅ Muted pre-order confirmed! Order ID: ${razorpay_order_id}. Amount: ₹${order.amount / 100}. We'll ship soon!`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: customer_phone,
        });
        console.log('✅ SMS sent to:', customer_phone);
      } catch (smsError) {
        console.error('⚠️ SMS error:', smsError.message);
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    });
  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({ error: 'Verification failed', details: error.message });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send to admin
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: adminRecipient,
      subject: `New contact message from ${name}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div>${message}</div>
      `,
    });

    console.log('✅ Contact message sent to admin:', adminRecipient);

    res.json({
      success: true,
      message: 'Contact message sent successfully.',
    });
  } catch (error) {
    console.error('❌ Contact send error:', error);
    res.status(500).json({ error: 'Failed to send contact message.' });
  }
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  const robotsPath = path.join(__dirname, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.sendFile(robotsPath);
  } else {
    res.send('User-agent: *\nAllow: /');
  }
});

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const sitemapPath = path.join(__dirname, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.sendFile(sitemapPath);
  } else {
    res.send('<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>');
  }
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found');
  }
});

// AWS Lambda handler
export const handler = serverless(app);

// Local development
if (process.env.NODE_ENV !== 'lambda') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 API Endpoints:`);
    console.log(`   POST /api/create-order   — Create Razorpay order`);
    console.log(`   POST /api/verify-payment — Verify payment signature`);
    console.log(`   POST /api/contact        — Send contact message`);
    console.log(`   GET  /api/health        — Health check\n`);
  });
}
