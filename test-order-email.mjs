import dotenv from 'dotenv';
import crypto from 'crypto';
import fetch from 'node-fetch';

dotenv.config();
const secret = process.env.RAZORPAY_KEY_SECRET;
if (!secret) throw new Error('Missing RAZORPAY_KEY_SECRET');
const order_id = `order_test_${Date.now()}`;
const payment_id = `pay_test_${Date.now()}`;
const body = order_id + '|' + payment_id;
const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

const response = await fetch('http://localhost:3000/api/verify-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    razorpay_order_id: order_id,
    razorpay_payment_id: payment_id,
    razorpay_signature: signature,
    order_details: {
      name: 'Test Buyer',
      email: 'test@example.com',
      phone: '9999999999',
      address: '123 Test Lane',
      tier: 'Test Plan',
      quantity: 1,
      amount: 100,
    },
  }),
});
const text = await response.text();
console.log('STATUS', response.status);
console.log('BODY', text);
