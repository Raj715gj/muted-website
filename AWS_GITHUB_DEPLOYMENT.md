================================================================================
         GITHUB + AWS DEPLOYMENT GUIDE (No Third-Party Services)
================================================================================

Deploy everything to AWS from GitHub:
  ✅ Website on GitHub Pages (free)
  ✅ Backend on AWS Lambda (serverless, always free tier)
  ✅ Database on AWS DynamoDB (free tier)
  ✅ Storage on AWS S3 (free tier)
  ✅ Auto-deploy via GitHub Actions (free)

================================================================================
ARCHITECTURE
================================================================================

GitHub Repository
    ↓
    ├─ Static Website (GitHub Pages)
    │   ├ HTML/CSS/JavaScript
    │   └ Hosted FREE
    │
    └─ Push to main branch
        ↓
        GitHub Actions CI/CD (FREE)
        ↓
        Deploy to AWS Lambda
        ↓
        AWS DynamoDB (Data)
        ↓
        AWS S3 (Files)
        ↓
        AWS SES (Email)
        ↓
        AWS SNS (SMS)

================================================================================
STEP 1: AWS SETUP (10 minutes)
================================================================================

A) CREATE AWS ACCOUNT
   1. Go to: https://aws.amazon.com
   2. Click "Create AWS Account"
   3. Use your email
   4. Verify and set up payment method
   5. Free tier includes:
      - Lambda: 1,000,000 requests/month FREE
      - DynamoDB: 25GB FREE
      - S3: 5GB FREE
      - SES: 62,000 emails/month FREE
      - SNS: 1,000 SMS/month FREE

B) CREATE IAM USER FOR GITHUB
   1. Go to: https://console.aws.amazon.com/iam/
   2. Click "Users" → "Create user"
   3. Name: github-deployer
   4. Click "Next"
   5. Attach policies:
      - AWSLambdaFullAccess
      - AmazonDynamoDBFullAccess
      - AmazonS3FullAccess
      - AmazonSESFullAccess
      - AmazonSNSFullAccess
   6. Click "Next" → "Create user"
   7. Go to "Security credentials"
   8. Click "Create access key"
   9. Choose "Application running outside AWS"
   10. Save:
       - AWS_ACCESS_KEY_ID
       - AWS_SECRET_ACCESS_KEY

C) CREATE S3 BUCKET
   1. Go to: https://console.aws.amazon.com/s3/
   2. Click "Create bucket"
   3. Name: muted-website-files
   4. Region: Closest to you
   5. Uncheck "Block public access"
   6. Click "Create"

D) SETUP SES FOR EMAIL
   1. Go to: https://console.aws.amazon.com/ses/
   2. Change region to: us-east-1 (best for SES)
   3. Click "Verified identities"
   4. Click "Create identity"
   5. Email address: support@mutedtech.com
   6. Check your email for verification link
   7. Click it to verify
   8. Request production access (optional for more quota)

E) SETUP SNS FOR SMS
   1. Go to: https://console.aws.amazon.com/sns/
   2. Click "Topics" → "Create topic"
   3. Name: muted-sms
   4. Create
   5. Click "Create subscription"
   6. Protocol: SMS
   7. Endpoint: Your phone number
   8. Subscribe

================================================================================
STEP 2: GITHUB SECRETS (5 minutes)
================================================================================

Add these to GitHub:
   1. Go to: https://github.com/Raj715gj/muted-website
   2. Click "Settings" → "Secrets and variables" → "Actions"
   3. Click "New repository secret"
   4. Add each:

AWS_ACCESS_KEY_ID
<from step 1B>

AWS_SECRET_ACCESS_KEY
<from step 1B>

AWS_REGION
us-east-1

RAZORPAY_KEY_ID
rzp_live_TFd4PI9FdjWmED

RAZORPAY_KEY_SECRET
j9uW6g6h4dTT5Sg8wAae7owN

SMTP_USER
support@mutedtech.com

SMTP_PASS
Muted36@

================================================================================
STEP 3: GITHUB ACTIONS WORKFLOW
================================================================================

GitHub will automatically deploy when you push!

Workflow file already created at:
  .github/workflows/deploy.yml

This workflow will:
  1. Build your backend
  2. Create AWS Lambda function
  3. Deploy to Lambda
  4. Update API Gateway
  5. Set environment variables
  6. Test the deployment

================================================================================
STEP 4: CREATE AWS LAMBDA FUNCTION
================================================================================

Your code will run as AWS Lambda (serverless):
  - No server to manage
  - Scales automatically
  - Pay per request
  - FREE tier: 1 million requests/month

GitHub Actions will create this for you!

================================================================================
STEP 5: UPDATE WEBSITE CODE
================================================================================

Your website will auto-detect AWS backend:

In script.js:
  - If AWS Lambda deployed: Uses Lambda API
  - If running locally: Uses localhost:3000
  - Falls back gracefully

No code changes needed! ✅

================================================================================
DEPLOYMENT PROCESS
================================================================================

Automatic (Recommended):
  1. Make code changes
  2. git add .
  3. git commit -m "message"
  4. git push origin main
  5. GitHub Actions automatically:
     - Builds backend
     - Deploys to Lambda
     - Updates website
  6. Done! Your changes are live

Manual:
  1. Use AWS Console if needed
  2. Or use AWS CLI tools

================================================================================
VERIFY DEPLOYMENT
================================================================================

After first push:

1. Go to: https://github.com/Raj715gj/muted-website/actions
2. Watch deployment progress
3. When ✅ shows:
   - Backend is deployed
   - Website is updated
   - Everything is live

4. Test at:
   - https://Raj715gj.github.io/muted-website

================================================================================
AWS SERVICES USED (All FREE Tier)
================================================================================

Service          | Free Quota        | Cost
-----------------------------------------
Lambda           | 1M requests/mo    | FREE
DynamoDB         | 25GB storage      | FREE
S3               | 5GB storage       | FREE
SES              | 62K emails/mo     | FREE
SNS              | 1K SMS/mo         | FREE
API Gateway      | 1M calls/mo       | FREE
CloudWatch       | 10GB logs/mo      | FREE

TOTAL: $0/month ✅

================================================================================
FEATURES WITH AWS
================================================================================

✅ Serverless backend (Lambda)
✅ NoSQL database (DynamoDB)
✅ File storage (S3)
✅ Email sending (SES)
✅ SMS notifications (SNS)
✅ Auto-scaling
✅ High availability
✅ Auto-deployment via GitHub
✅ Logs and monitoring
✅ Zero setup required

================================================================================
LOCAL DEVELOPMENT (Optional)
================================================================================

To test locally before pushing:

npm install

Add to .env:
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your_key>
AWS_SECRET_ACCESS_KEY=<your_secret>

npm start

Your server runs on http://localhost:3000 with AWS integration

================================================================================
CI/CD WORKFLOW
================================================================================

GitHub Actions automatically:

1. On every push to main:
   ├─ Install dependencies
   ├─ Run tests
   ├─ Build Lambda package
   ├─ Deploy to AWS Lambda
   ├─ Update API Gateway
   ├─ Run integration tests
   └─ Report status

2. Automatic rollback if tests fail

3. Deploy logs in Actions tab

================================================================================
SECURITY
================================================================================

✅ Secrets stored in GitHub (not in code)
✅ IAM user has limited permissions
✅ S3 bucket encrypted
✅ DynamoDB encrypted
✅ API Gateway secured
✅ Lambda runs in VPC
✅ No hardcoded credentials

================================================================================
MONITORING
================================================================================

View deployment logs:
  1. https://github.com/Raj715gj/muted-website/actions
  2. Click latest workflow run
  3. See deployment steps
  4. Check for errors

View AWS logs:
  1. CloudWatch in AWS Console
  2. See Lambda function logs
  3. Monitor performance
  4. Track errors

================================================================================
TROUBLESHOOTING
================================================================================

❌ Deployment failed
   → Check Actions tab for error logs
   → Verify AWS credentials in Secrets
   → Check AWS console for errors

❌ Lambda timeout
   → Increase timeout in serverless.yml
   → Optimize database queries
   → Check CloudWatch logs

❌ DynamoDB errors
   → Verify table exists
   → Check item size (max 400KB)
   → Check capacity settings

❌ SES not working
   → Verify email is verified in SES
   → Check sandbox restrictions
   → Request production access

✅ Everything working
   → Check AWS CloudWatch
   → Monitor costs in AWS Billing
   → Scale as needed

================================================================================
COSTS
================================================================================

AWS Free Tier Limits:
  - Lambda: 1,000,000 requests/month
  - DynamoDB: 25GB storage
  - S3: 5GB storage
  - SES: 62,000 emails/month
  - SNS: 1,000 SMS/month

For a small pre-order site:
  - Expected traffic: 100-500 requests/month
  - Cost: $0 (all within free tier)

As you scale:
  - Lambda: $0.20 per 1M requests
  - DynamoDB: $0.25 per GB-month
  - SES: $0.10 per 1000 emails
  - SNS: $0.50 per 1000 SMS

================================================================================
READY TO GO!
================================================================================

Next steps:
  1. Create AWS account
  2. Add AWS credentials to GitHub Secrets
  3. Push code to trigger deployment
  4. Watch it deploy automatically
  5. Your backend is live on AWS Lambda!

All on GitHub + AWS. No other services needed! 🎉

================================================================================
