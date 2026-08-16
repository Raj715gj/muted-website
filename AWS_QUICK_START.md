================================================================================
              AWS + GITHUB QUICK SETUP (20 minutes)
================================================================================

Deploy everything FREE using GitHub + AWS. No other services needed!

================================================================================
STEP 1: CREATE AWS ACCOUNT (2 minutes)
================================================================================

1. Go to: https://aws.amazon.com
2. Click "Create AWS Account"
3. Sign up with email
4. Set up payment method (won't be charged - free tier)
5. Verify email
6. Done! ✅

================================================================================
STEP 2: GET AWS CREDENTIALS (8 minutes)
================================================================================

A) Create IAM User:
   1. Go to: https://console.aws.amazon.com/iam/
   2. Click "Users" (left menu)
   3. Click "Create user"
   4. Name: github-deployer
   5. Click "Next"
   6. Click "Attach policies directly"
   7. Search and select:
      ✓ AWSLambdaFullAccess
      ✓ AmazonDynamoDBFullAccess
      ✓ AmazonS3FullAccess
      ✓ AmazonSESFullAccess
      ✓ AmazonSNSFullAccess
      ✓ IAMFullAccess
      ✓ APIGatewayAdministrator
   8. Click "Next" → "Create user"

B) Get Access Keys:
   1. Click the new "github-deployer" user
   2. Go to "Security credentials" tab
   3. Click "Create access key"
   4. Choose "Application running outside AWS"
   5. Click "Create"
   6. COPY and SAVE:
      - Access Key ID: ___________________
      - Secret Access Key: ___________________

C) Note AWS Region:
   - Region: us-east-1 (recommended)

================================================================================
STEP 3: ADD GITHUB SECRETS (5 minutes)
================================================================================

1. Go to: https://github.com/Raj715gj/muted-website
2. Click "Settings" (top right)
3. Click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret:

Name: AWS_ACCESS_KEY_ID
Value: <paste from step 2B>

Name: AWS_SECRET_ACCESS_KEY
Value: <paste from step 2B>

Name: AWS_REGION
Value: us-east-1

Name: RAZORPAY_KEY_ID
Value: rzp_live_TFd4PI9FdjWmED

Name: RAZORPAY_KEY_SECRET
Value: j9uW6g6h4dTT5Sg8wAae7owN

Name: SMTP_USER
Value: support@mutedtech.com

Name: SMTP_PASS
Value: Muted36@

================================================================================
STEP 4: SETUP AWS SERVICES (5 minutes) - OPTIONAL
================================================================================

For production, optionally set up:

A) AWS S3 (File Storage):
   1. Go to: https://console.aws.amazon.com/s3/
   2. Click "Create bucket"
   3. Name: muted-website-files-<your-username>
   4. Click "Create"
   5. Done! ✅

B) AWS DynamoDB (Database):
   1. Go to: https://console.aws.amazon.com/dynamodbv2/
   2. Click "Create table"
   3. Name: muted-preorders
   4. Partition key: order_id
   5. Billing: PAY_PER_REQUEST
   6. Click "Create"
   7. Done! ✅

C) AWS SES (Email):
   1. Go to: https://console.aws.amazon.com/ses/
   2. Change region to: us-east-1 (top right)
   3. Click "Create identity"
   4. Add: support@mutedtech.com
   5. Check email → click verification link
   6. Done! ✅

================================================================================
STEP 5: PUSH CODE TO TRIGGER DEPLOYMENT
================================================================================

In your project folder:

git pull origin main
git add .
git commit -m "AWS Lambda deployment setup"
git push origin main

GitHub Actions will automatically:
  1. Build your backend
  2. Create Lambda function
  3. Deploy to AWS
  4. Get you an API endpoint
  5. Update your website

Watch deployment:
  1. Go to: https://github.com/Raj715gj/muted-website/actions
  2. Click the latest workflow
  3. Watch it deploy! 🚀

================================================================================
STEP 6: GET YOUR AWS LAMBDA API URL
================================================================================

After deployment completes:

1. Go to: https://console.aws.amazon.com/lambda/
2. Click "Functions" (left menu)
3. Look for: "muted-website-backend"
4. Click it
5. Scroll down to "Function URL"
6. Copy the URL (looks like):
   https://abc123def456.lambda-url.us-east-1.amazonaws.com/

SAVE THIS URL! You'll need it for step 7.

================================================================================
STEP 7: CONNECT LAMBDA URL TO WEBSITE
================================================================================

Option A: Use setup script (Easiest)
   1. Open PowerShell in project folder
   2. Run: .\setup-backend-url.ps1
   3. Paste your Lambda URL
   4. Done! ✅

Option B: Manual
   1. Open script.js
   2. Find line 13: const GITHUB_PAGES_MODE = true;
   3. Change to: const GITHUB_PAGES_MODE = false;
   4. Add after: const BACKEND_URL = 'YOUR_LAMBDA_URL';
   5. git add . && git commit -m "Update Lambda URL" && git push

Website automatically updates! 🎉

================================================================================
STEP 8: TEST EVERYTHING
================================================================================

1. Open: https://Raj715gj.github.io/muted-website
2. Fill pre-order form
3. Click "Pay ₹100 & Reserve"
4. Complete Razorpay payment
5. Should see ✅ success
6. Check email for confirmation
7. Check AWS logs for processing

If error:
  1. Open browser console (F12)
  2. Check error message
  3. Go to AWS Lambda logs
  4. Search for error

================================================================================
FINAL RESULT
================================================================================

✅ Website: https://Raj715gj.github.io/muted-website
✅ Backend: AWS Lambda (serverless)
✅ Database: AWS DynamoDB (if enabled)
✅ Storage: AWS S3 (if enabled)
✅ Email: AWS SES (if enabled)
✅ Repo: https://github.com/Raj715gj/muted-website

ALL DEPLOYED ON GITHUB + AWS! 🎉

================================================================================
COSTS (FREE TIER)
================================================================================

Service          | Free Tier          | Cost
=========================================
Lambda           | 1M requests/month  | $0
DynamoDB         | 25GB storage       | $0
S3               | 5GB storage        | $0
SES              | 62K emails/month   | $0
SNS              | 1K SMS/month       | $0
API Gateway      | 1M calls/month     | $0

TOTAL: $0/month ✅

================================================================================
WHAT'S HAPPENING BEHIND THE SCENES
================================================================================

When you push to GitHub:
  1. GitHub Actions triggers
  2. Builds your Node.js backend
  3. Packages it as Lambda function
  4. Uploads to AWS
  5. AWS Lambda becomes active
  6. Website connects to Lambda
  7. Ready for customer orders! ✅

All automatic. No manual deployment needed.

================================================================================
NEED HELP?
================================================================================

Issues?
  1. Check: https://github.com/Raj715gj/muted-website/actions
  2. Click failed workflow
  3. See error details
  4. Fix code
  5. git push again

AWS issues?
  1. https://console.aws.amazon.com/cloudwatch/
  2. Click "Logs"
  3. Search: muted-website-backend
  4. See Lambda logs

================================================================================
YOU'RE DONE! 🎉
================================================================================

Your website is now:
  ✅ Hosted on GitHub Pages
  ✅ Backend on AWS Lambda
  ✅ Auto-deployed when you push
  ✅ Fully FREE
  ✅ Production-ready

Next time you update code:
  git add .
  git commit -m "Your message"
  git push origin main

AWS automatically updates! 🚀

================================================================================
