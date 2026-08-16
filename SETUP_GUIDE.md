# 🚀 Muted Aero One — Setup & Testing Guide

## Prerequisites
- Node.js installed (v16+)
- npm installed
- Terminal/PowerShell access

## Quick Start

### 1. Install Dependencies
```bash
cd c:\Users\LAKSHMI CHANDRA\Downloads\muted-website
npm install
```

### 2. Start the Backend Server
```bash
npm start
```

Expected output:
```
🚀 Muted Aero One Server running on http://localhost:3000
📋 API Endpoints:
   POST /api/create-order   — Create Razorpay order
   POST /api/verify-payment — Verify payment signature
   GET  /api/health        — Health check
```

### 3. Open the Website
- Open browser: `http://localhost:3000`
- Or use file explorer and open `index.html` (but API won't work via file://)

### 4. Test Payment Flow

1. **Select a Plan**
   - Click on a pricing tier (₹50, ₹100, ₹150, ₹200)
   - Adjust quantity if needed

2. **Fill Form**
   - Full Name: Your name
   - Email: your@email.com
   - Shipping Address: Your address
   - Phone: +91 XXXXXXXXXX (optional)

3. **Click "Pay ₹XX & Reserve"**
   - This triggers order creation on backend

4. **Razorpay Modal Opens**
   - Select payment method:
     - **UPI/QR**: Scan with any UPI app (GPay, PhonePe, Paytm)
     - **Cards**: Test card: `4111 1111 1111 1111`, any future date, any CVV
     - **Other methods**: As available

5. **Complete Payment**
   - Success: Modal closes, email opens (optional)
   - Failure: Error message shown

---

## API Endpoints

### Create Order
```bash
POST http://localhost:3000/api/create-order
Content-Type: application/json

{
  "amount": 5000,
  "currency": "INR",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "address": "123 Main St, City",
  "quantity": 1,
  "plan_name": "Premium"
}
```

**Response (Success):**
```json
{
  "success": true,
  "order_id": "order_1234567890abc",
  "amount": 5000,
  "currency": "INR"
}
```

### Verify Payment
```bash
POST http://localhost:3000/api/verify-payment
Content-Type: application/json

{
  "razorpay_order_id": "order_1234567890abc",
  "razorpay_payment_id": "pay_1234567890abc",
  "razorpay_signature": "abcd1234efgh5678ijkl9012"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment_id": "pay_1234567890abc"
}
```

---

## Troubleshooting

### "Error: failed to fetch"
- ❌ Backend server is not running
- ✅ Solution: Run `npm start` in a new terminal

### "Cannot connect to backend at http://localhost:3000"
- ❌ Backend is down or port is wrong
- ✅ Solution: Check if server is running, check PORT in `.env`

### Payment modal doesn't open
- ❌ Order creation failed (check console errors)
- ✅ Solution: Open browser DevTools (F12) → Console tab → see error message

### "Signature mismatch" error
- ❌ KEY_SECRET in `.env` is wrong
- ✅ Solution: Verify `.env` has correct `RAZORPAY_KEY_SECRET`

### QR Code not showing
- ❌ This is a Razorpay test account limitation
- ✅ Solution: Use test card instead, or contact Razorpay support

---

## Test Credentials

**Razorpay Test Key:**
- Key ID: `rzp_test_TFS7HY8SYxs4kA`
- (Key Secret is in `.env`, never commit it)

**Test Payment Methods:**
- **Test Card**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits
- **UPI**: Use any UPI app

---

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.

---

## Files

| File | Purpose |
|------|---------|
| `server.js` | Node.js + Express backend |
| `package.json` | Dependencies & scripts |
| `.env` | Razorpay credentials (secure) |
| `script.js` | Frontend checkout logic |
| `index.html` | Website UI |
| `styles.css` | Styling |

---

## Next Steps

- ✅ Razorpay integration complete
- ⏭️ Add database to store orders
- ⏭️ Deploy backend (Vercel, Render, Railway)
- ⏭️ Add email notifications
- ⏭️ Add admin dashboard

---

Need help? Check the console (F12) for detailed error messages.
