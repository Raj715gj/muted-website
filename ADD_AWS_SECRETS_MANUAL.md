================================================================================
          ADD AWS SECRETS TO GITHUB - STEP BY STEP
================================================================================

Your AWS credentials need to be added to GitHub Secrets for deployment to work.

⚠️ IMPORTANT: GitHub Secrets are ENCRYPTED and PRIVATE
   - Only used during deployment
   - Never logged or exposed
   - Safe to store here

================================================================================
STEP 1: GO TO GITHUB SECRETS PAGE
================================================================================

Open this link in your browser:
  https://github.com/Raj715gj/muted-website/settings/secrets/actions

OR:
  1. Go to: https://github.com/Raj715gj/muted-website
  2. Click "Settings" (top menu)
  3. Click "Secrets and variables" (left sidebar)
  4. Click "Actions"

================================================================================
STEP 2: ADD FIRST SECRET - AWS_ACCESS_KEY_ID
================================================================================

1. Click "New repository secret" (green button, top right)

2. In "Name" field, type:
   AWS_ACCESS_KEY_ID

3. In "Value" field, paste:
   <your AWS Access Key ID>

4. Click "Add secret" button

✅ First secret added!

================================================================================
STEP 3: ADD SECOND SECRET - AWS_SECRET_ACCESS_KEY
================================================================================

1. Click "New repository secret" (green button again)

2. In "Name" field, type:
   AWS_SECRET_ACCESS_KEY

3. In "Value" field, paste:
   <your AWS Secret Access Key>

4. Click "Add secret" button

✅ Second secret added!

================================================================================
STEP 4: ADD THIRD SECRET - AWS_REGION
================================================================================

1. Click "New repository secret" (green button again)

2. In "Name" field, type:
   AWS_REGION

3. In "Value" field, type:
   us-east-1

4. Click "Add secret" button

✅ Third secret added!

================================================================================
VERIFY ALL SECRETS ARE ADDED
================================================================================

You should see THREE secrets listed:
  ✅ AWS_ACCESS_KEY_ID
  ✅ AWS_SECRET_ACCESS_KEY
  ✅ AWS_REGION

They will show as masked (not visible) - that's normal and secure! ✓

================================================================================
STEP 5: WAIT FOR DEPLOYMENT
================================================================================

GitHub Actions will automatically start deployment!

Watch progress here:
  https://github.com/Raj715gj/muted-website/actions

Look for:
  "Deploy to AWS Lambda" workflow
  
It will:
  1. Install dependencies
  2. Build Lambda package
  3. Deploy to AWS Lambda
  4. Create API endpoint
  5. Update website

Status will show as:
  🟡 In Progress → 🟢 Success

Takes about 2-5 minutes.

================================================================================
STEP 6: GET YOUR LAMBDA API URL
================================================================================

After deployment succeeds:

1. Go to: https://console.aws.amazon.com/lambda/
2. Login with your AWS credentials
3. Click "Functions" (left menu)
4. Click "muted-website-backend"
5. Scroll down to "Function URL"
6. Copy the URL (looks like):
   https://abc123def456.lambda-url.us-east-1.amazonaws.com/

SAVE THIS URL! 📋

================================================================================
STEP 7: CONNECT LAMBDA URL TO WEBSITE
================================================================================

After you have the Lambda URL from step 6:

Option A: Run setup script (EASIEST)
  1. Open PowerShell in project folder
  2. Run: .\setup-backend-url.ps1
  3. Paste your Lambda URL
  4. Done! Auto-commits and pushes

Option B: Manual (if script doesn't work)
  1. Open script.js
  2. Line 13: Change "GITHUB_PAGES_MODE = true" to "false"
  3. Line 14: Add: const BACKEND_URL = 'YOUR_LAMBDA_URL';
  4. Git commit: git add script.js && git commit -m "Update Lambda URL"
  5. Git push: git push origin main

Website will auto-update! ✅

================================================================================
TEST YOUR WEBSITE
================================================================================

1. Open: https://Raj715gj.github.io/muted-website
2. Fill pre-order form
3. Click "Pay ₹100 & Reserve"
4. You should see Razorpay payment button
5. Complete payment
6. Should see ✅ Success message
7. Check email for order confirmation

If still showing error:
  - Wait 5 more minutes for Lambda to fully initialize
  - Refresh the website
  - Check browser console (F12) for errors
  - Check GitHub Actions for deployment errors

================================================================================
WHAT HAPPENS AUTOMATICALLY
================================================================================

After you add secrets:

1. GitHub Actions detects secrets ✓
2. Workflow runs automatically ✓
3. Builds Node.js backend ✓
4. Creates Lambda function ✓
5. Deploys to AWS ✓
6. Gets public API endpoint ✓
7. Lambda is LIVE 24/7 ✓

All automatic - no manual AWS console needed!

================================================================================
SUPPORT
================================================================================

Still not working?

Check these URLs:

GitHub Actions Log:
  https://github.com/Raj715gj/muted-website/actions

AWS Lambda Console:
  https://console.aws.amazon.com/lambda/

AWS CloudWatch Logs:
  https://console.aws.amazon.com/cloudwatch/

Browser Console:
  Press F12 → Console tab
  Look for red errors

================================================================================
YOU'RE ALL SET! 🎉
================================================================================

Just add the 3 secrets and everything happens automatically!

Next action: Add secrets to GitHub (see steps above)

Then: Monitor deployment at GitHub Actions
Then: Get Lambda URL from AWS Console
Then: Connect URL to website

Website will be LIVE in 15 minutes total! 🚀

================================================================================
