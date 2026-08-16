================================================================================
                    🚀 QUICK START CHECKLIST
================================================================================

Follow these steps in order. Total time: 20 minutes

================================================================================
STEP 1: TWILIO ACCOUNT (5 minutes)
================================================================================

[ ] 1. Go to: https://www.twilio.com/try-twilio
[ ] 2. Sign up with email
[ ] 3. Verify phone number
[ ] 4. Copy Account SID
[ ] 5. Copy Auth Token
[ ] 6. Get a Twilio phone number
[ ] 7. Save these credentials:
      - TWILIO_ACCOUNT_SID: ___________________
      - TWILIO_AUTH_TOKEN: ___________________
      - TWILIO_PHONE_NUMBER: ___________________

================================================================================
STEP 2: DEPLOY ON REPLIT (10 minutes)
================================================================================

[ ] 1. Go to: https://replit.com
[ ] 2. Sign up with GitHub (Raj715gj)
[ ] 3. Click "Create" → "Import from GitHub"
[ ] 4. Paste: https://github.com/Raj715gj/muted-website
[ ] 5. Click "Import" (wait 1-2 min)
[ ] 6. Click "Secrets" (left sidebar, lock icon)
[ ] 7. Add all environment variables (see COMPLETE_SETUP_GUIDE.md)
[ ] 8. In terminal: npm install (wait 2-3 min)
[ ] 9. In terminal: npm start
[ ] 10. Copy the URL that appears:
       https://muted-website-xxxxx.replit.dev

YOUR REPLIT URL: _________________________________

================================================================================
STEP 3: CONNECT TO WEBSITE (2 minutes)
================================================================================

Option A: Use the Setup Script (Easiest)
[ ] 1. Open PowerShell in your project folder
[ ] 2. Run: .\setup-backend-url.ps1
[ ] 3. Paste your Replit URL when prompted
[ ] 4. Done! Script auto-commits and pushes

Option B: Manual Update
[ ] 1. Open script.js
[ ] 2. Line 13: Change "GITHUB_PAGES_MODE = true" to "false"
[ ] 3. Add: "const BACKEND_URL = 'YOUR_REPLIT_URL';"
[ ] 4. Git commit and push

================================================================================
STEP 4: TEST EVERYTHING (3 minutes)
================================================================================

[ ] 1. Open: https://Raj715gj.github.io/muted-website
[ ] 2. Fill pre-order form
[ ] 3. Click "Pay ₹100 & Reserve"
[ ] 4. Complete Razorpay payment
[ ] 5. Check email for confirmation
[ ] 6. Check phone for SMS message
[ ] 7. Admin email sent to support@mutedtech.com

If anything fails:
[ ] Check console errors (F12 → Console)
[ ] Check Replit logs
[ ] Verify environment variables
[ ] Restart Replit

================================================================================
FINAL RESULT
================================================================================

✅ Website: https://Raj715gj.github.io/muted-website
✅ Backend: https://muted-website-xxxxx.replit.dev
✅ Repo: https://github.com/Raj715gj/muted-website

✅ Features Working:
   - Pre-order form
   - Razorpay payments
   - Email confirmations
   - SMS notifications
   - Admin alerts

✅ Cost: $0 per month

================================================================================
SUPPORT
================================================================================

Need help? Check these files in your repo:

- COMPLETE_SETUP_GUIDE.md      ← Full setup instructions
- REPLIT_DEPLOYMENT_GUIDE.md   ← Replit-specific guide
- setup-backend-url.ps1        ← Quick URL connection script
- server.js                    ← Backend code
- script.js                    ← Frontend code

================================================================================
YOU'RE DONE! 🎉
================================================================================
