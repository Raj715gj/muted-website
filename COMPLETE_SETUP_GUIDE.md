================================================================================
      COMPLETE SETUP GUIDE: PAYMENTS + EMAIL + SMS (ALL FREE!)
================================================================================

Your website will have:
  ✅ Payment processing via Razorpay
  ✅ Automatic email confirmations
  ✅ SMS notifications via Twilio
  ✅ Everything hosted FREE

================================================================================
OPTION 1: BACKEND DEPLOYMENT (Choose One)
================================================================================

A) REPLIT (EASIEST - Recommended for Free) 🟢
   - Go to: https://replit.com
   - Sign up with GitHub
   - Import: https://github.com/Raj715gj/muted-website
   - Add environment variables (see below)
   - Run: npm install && npm start
   - Get URL: https://muted-website-xxxxx.replit.dev

B) RENDER (Free Tier - May be Limited)
   - Go to: https://render.com
   - Sign up with GitHub
   - Create Web Service
   - Connect your repo
   - Add environment variables
   - Deploy
   - Get URL: https://muted-website-xxxxx.onrender.com

================================================================================
STEP 1: PAYMENT PROCESSING - RAZORPAY (Already Configured ✅)
================================================================================

YOUR CREDENTIALS ARE READY:
  ✅ Key ID: rzp_live_TFd4PI9FdjWmED
  ✅ Key Secret: j9uW6g6h4dTT5Sg8wAae7owN

What you need to do:
  1. Login to Razorpay: https://dashboard.razorpay.com
  2. Verify your account (KYC)
  3. Get live keys (already in .env file)

When backend runs:
  ✓ Razorpay payment button appears
  ✓ Users can pay ₹100 to reserve
  ✓ Payment confirmed instantly
  ✓ Webhook sends email confirmation

================================================================================
STEP 2: EMAIL SENDING - HOSTINGER (Already Configured ✅)
================================================================================

YOUR CREDENTIALS ARE READY:
  ✅ Host: smtp.hostinger.com
  ✅ Port: 465
  ✅ User: support@mutedtech.com
  ✅ Password: Muted36@
  ✅ From Email: noreply@mutedtech.com

What's already set up:
  ✓ Confirmation emails sent to customers
  ✓ Admin notification emails to support@mutedtech.com
  ✓ Order details included in emails
  ✓ PDF receipts generated automatically

Nothing more to do!

================================================================================
STEP 3: SMS NOTIFICATIONS - TWILIO (FREE TRIAL)
================================================================================

A) CREATE TWILIO ACCOUNT (5 minutes)

1. Go to: https://www.twilio.com/try-twilio
2. Sign up with your email
3. Verify your phone number
4. You get $15 FREE credit (enough for 50+ SMS)

B) GET YOUR TWILIO CREDENTIALS

In Twilio Dashboard:
  1. Click "Account" (top right)
  2. Copy "Account SID" → Your TWILIO_ACCOUNT_SID
  3. Copy "Auth Token" → Your TWILIO_AUTH_TOKEN
  4. Go to "Phone Numbers" → Get a number → Your TWILIO_PHONE_NUMBER

C) BUY AN SMS-ENABLED NUMBER (Optional - Included in Free Credit)

  1. In Twilio Console, click "Buy a Number"
  2. Choose country (India +91)
  3. Free with trial credit ($15)
  4. Copy the number (format: +1234567890)

================================================================================
STEP 4: DEPLOY ON REPLIT (RECOMMENDED)
================================================================================

Go to: https://replit.com

1. Sign Up
   - Click "Sign up with GitHub"
   - Select Raj715gj
   - Authorize

2. Create Repl
   - Click "Create" (top left)
   - Select "Import from GitHub"
   - Paste: https://github.com/Raj715gj/muted-website
   - Click "Import"

3. Add Environment Variables
   - Click "Secrets" (lock icon, left sidebar)
   - Click "Add new secret"
   - Add each variable:

RAZORPAY_KEY_ID
rzp_live_TFd4PI9FdjWmED

RAZORPAY_KEY_SECRET
j9uW6g6h4dTT5Sg8wAae7owN

SMTP_HOST
smtp.hostinger.com

SMTP_PORT
465

SMTP_USER
support@mutedtech.com

SMTP_PASS
Muted36@

SMTP_FROM
noreply@mutedtech.com

CONTACT_EMAIL
support@mutedtech.com

TWILIO_ACCOUNT_SID
<copy from Twilio dashboard>

TWILIO_AUTH_TOKEN
<copy from Twilio dashboard>

TWILIO_PHONE_NUMBER
<your Twilio number, e.g. +1234567890>

SMS_DEFAULT_COUNTRY_CODE
+91

NODE_ENV
production

RAZORPAY_MODE
live

4. Install & Run
   - Open Terminal in Replit (right side)
   - Run: npm install
   - Wait 2-3 minutes
   - Run: npm start
   - You'll get a URL! Copy it.

5. Keep Running 24/7
   - Click "Run" button
   - Select "Always On" mode
   - Backend stays alive!

================================================================================
STEP 5: CONNECT BACKEND TO WEBSITE
================================================================================

After you get your Replit URL (https://muted-website-xxxxx.replit.dev):

A) UPDATE SCRIPT.JS

Open: script.js (line 13)

Change this line:
  const GITHUB_PAGES_MODE = true;

To:
  const GITHUB_PAGES_MODE = false;

Add this line after:
  const BACKEND_URL = 'https://your-replit-url.replit.dev';

B) UPDATE API_BASE

Change line 12:
  const API_BASE = isLocalBackendPreview
    ? 'http://localhost:3000'
    : window.location.origin;

To:
  const API_BASE = isLocalBackendPreview
    ? 'http://localhost:3000'
    : (typeof BACKEND_URL !== 'undefined' ? BACKEND_URL : window.location.origin);

C) Commit & Push

git add script.js
git commit -m "Connect to backend URL"
git push origin main

================================================================================
STEP 6: TEST EVERYTHING
================================================================================

1. Open your website:
   https://Raj715gj.github.io/muted-website

2. Fill pre-order form

3. Click "Pay ₹100 & Reserve"

4. You should see:
   ✅ Razorpay payment window
   ✅ Payment processed
   ✅ Email sent to customer
   ✅ SMS sent to your Twilio number
   ✅ Admin email with order details

================================================================================
COMPLETE URLS
================================================================================

Frontend: https://Raj715gj.github.io/muted-website
Backend: https://muted-website-xxxxx.replit.dev
GitHub Repo: https://github.com/Raj715gj/muted-website

================================================================================
COST BREAKDOWN
================================================================================

Razorpay:        FREE (2.36% + ₹0 flat fee)
Email:           FREE (with Hostinger)
SMS (Twilio):    FREE ($15 trial credit = 50+ messages)
Backend (Replit): FREE (always-on included)
GitHub:          FREE
Website:         FREE

TOTAL: $0 per month! 🎉

================================================================================
TROUBLESHOOTING
================================================================================

❌ "Payment not working"
   → Check Razorpay credentials in .env
   → Restart Replit

❌ "Email not sent"
   → Check SMTP credentials
   → Check spam folder
   → Verify email is correct

❌ "SMS not received"
   → Verify Twilio number is correct
   → Check Twilio trial credit (https://console.twilio.com)
   → Verify phone number format (+91XXXXXXXXXX)

❌ "Backend not responding"
   → Click "Run" in Replit
   → Check console for errors
   → Restart the process

✅ "All working!"
   → Your website is ready for real customers!

================================================================================
READY TO START?
================================================================================

1. Get Twilio account (5 min)
2. Deploy on Replit (5 min)
3. Update script.js with backend URL
4. Test payments
5. Go live!

Total setup time: 20 minutes ⏱️

================================================================================
