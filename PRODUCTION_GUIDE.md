# 🚀 Production Setup & Real Payments Guide

## IMPORTANT: Test vs Production

Your current setup uses **Razorpay TEST credentials**. Test payments are **NOT REAL** and no money is collected.

### Current Status:
- ✅ Backend running correctly
- ✅ Payments processing in TEST mode
- ✅ Emails sending automatically (once configured)
- ❌ Real money NOT being collected

---

## STEP 1: Switch to Production Razorpay Credentials

### Prerequisites:
1. **Razorpay Account** (https://razorpay.com)
2. **KYC Verification** (Complete verification in Razorpay Dashboard)
3. **Production Credentials** (Available after KYC approval)

### Get Production Keys:
1. Log in to Razorpay Dashboard: https://dashboard.razorpay.com
2. Click on **Settings** → **API Keys**
3. Switch to **LIVE** mode (toggle at top)
4. Copy your **LIVE Key ID** and **LIVE Key Secret**

### Update `.env`:
```env
# Replace TEST credentials with LIVE ones
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET_HERE
NODE_ENV=production
PORT=3000

# Email Configuration (see STEP 2 below)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@mutedtech.com

# Optional customer SMS confirmations via Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
SMS_DEFAULT_COUNTRY_CODE=+91
```

⚠️ **SECURITY WARNING:**
- Never commit `.env` to Git
- Never share LIVE Key Secret with anyone
- This file is in `.gitignore` already

---

## STEP 2: Configure Automatic Email Sending

### Option A: Gmail (Simplest)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

3. **Update `.env`:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   SMTP_FROM=noreply@yourcompany.com
   ```

4. **Restart server:**
   ```bash
   npm start
   ```

---

### Option B: SendGrid (Professional)

1. **Create SendGrid Account** (https://sendgrid.com)
2. **Create API Key** in Settings → API Keys
3. **Update `.env`:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.YOUR_API_KEY_HERE
   SMTP_FROM=noreply@yourcompany.com
   ```

---

### Option C: Other Email Services

| Service | SMTP Host | Port | Username | Password |
|---------|-----------|------|----------|----------|
| Mailgun | smtp.mailgun.org | 587 | postmaster@mg.yourcompany.com | API Key |
| AWS SES | email-smtp.region.amazonaws.com | 587 | AKIA... | Generated password |
| Zoho | smtp.zoho.com | 587 | your@zoho.com | Password |

---

## STEP 3: Test Email Configuration

1. **Restart server:**
   ```bash
   npm start
   ```

2. **Make a test payment:**
   - Open http://localhost:3000
   - Select a plan
   - Fill in your TEST email
   - Click "Pay & Reserve"
   - Complete payment

3. **Check your email:**
   - You should receive order confirmation automatically
   - Admin gets notification at contact@mutedtech.com

### If emails don't arrive:
- Check Gmail spam folder
- Verify SMTP credentials in `.env`
- Check server console for errors
- Look at logs: `npm start` output

---

## STEP 4: Payment Flow with Real Money

### When everything is configured:

1. **Customer selects plan** → Order created on backend
2. **Razorpay modal opens** → Uses LIVE credentials
3. **Customer pays real money** → Razorpay processes payment
4. **Backend verifies signature** → Confirms payment is authentic
5. **Confirmation email sent automatically** → To customer + admin
6. **Order saved** → In localStorage + your database (when added)

---

## Security Checklist

✅ TEST credentials used for development (safe)  
✅ LIVE credentials never in code (always in `.env`)  
✅ `.env` in `.gitignore` (won't be committed)  
✅ Key Secret only used on backend (never on frontend)  
✅ Signature verification prevents tampering  
✅ Emails sent via secure SMTP  

---

## Production Deployment

### Before going live:

1. ✅ Switch to LIVE Razorpay credentials
2. ✅ Set `NODE_ENV=production` in `.env`
3. ✅ Configure email properly (test sending first)
4. ✅ Update `API_BASE` in frontend to production domain
5. ✅ Add database to store orders permanently
6. ✅ Set up SSL/HTTPS on server
7. ✅ Monitor payment failures and email delivery

### Deploy to Production:

**Option 1: Vercel**
```bash
npm install -g vercel
vercel
# Follow prompts, add .env vars in Vercel dashboard
```

**Option 2: Railway**
```bash
railway link
railway up
# Add .env vars in Railway dashboard
```

**Option 3: Heroku**
```bash
heroku create
heroku config:set RAZORPAY_KEY_ID=rzp_live_...
heroku config:set RAZORPAY_KEY_SECRET=...
git push heroku main
```

**Option 4: Self-hosted (AWS/DigitalOcean)**
- Set up Node.js on server
- Copy project files
- Set environment variables
- Run `npm start` with PM2 for persistence

---

## Test Credentials (Development Only)

Once switched to LIVE, these won't work anymore:

**Test Card:**
- Number: 4111 1111 1111 1111
- Expiry: Any future date (12/25)
- CVV: Any 3 digits

**Test UPI:**
- Razorpay test account has limited UPI support
- Use cards for reliable testing

---

## Troubleshooting

### "Razorpay error - Invalid API key"
- ❌ Using TEST key in production mode
- ✅ Solution: Switch to LIVE key, set `NODE_ENV=production`

### "Email not sending"
- ❌ SMTP credentials wrong
- ✅ Solution: Test SMTP with: `npm run test-email`
- ✅ Enable "Less secure apps" if using Gmail

### "Payment verified but email didn't send"
- ✅ Payment is safe (signature verified)
- ❌ Email service issue
- ✅ Solution: Check SMTP settings, try different provider

### "Orders not saving"
- ✅ Currently saving to localStorage (temporary)
- ⏭️ Next: Add MongoDB/PostgreSQL database

---

## Next Steps

1. ✅ Set up production credentials
2. ✅ Configure email delivery
3. ⏭️ Add database (MongoDB/PostgreSQL)
4. ⏭️ Deploy to production server
5. ⏭️ Set up admin dashboard
6. ⏭️ Add order tracking
7. ⏭️ Add webhooks for payment updates

---

## Support

Need help?
- Razorpay Docs: https://razorpay.com/docs/payments/
- Email Issues: Check SMTP provider documentation
- Deployment Help: Contact your hosting provider

**Current Status:** ✅ Ready for production (update credentials first)
