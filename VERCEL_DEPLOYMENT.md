# Haven Vercel Deployment Guide

## Prerequisites
1. Vercel account
2. Git repository (GitHub/GitLab/Bitbucket)
3. All required environment variables and credentials

## Environment Variables Required

### OpenAI Configuration
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_ASSISTANT_ID` - Your OpenAI Assistant ID

### Stripe Configuration
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with sk_)
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (starts with pk_)
- `STRIPE_BETA_PRICE_ID` - Stripe price ID for beta plan
- `STRIPE_STARTER_PRICE_ID` - Stripe price ID for starter plan
- `STRIPE_REGULAR_PRICE_ID` - Stripe price ID for regular plan
- `STRIPE_FAMILY_PRICE_ID` - Stripe price ID for family plan
- `STRIPE_EMERGENCY_PRICE_ID` - Stripe price ID for emergency plan
- `STRIPE_TOKENS_PRICE_ID` - Stripe price ID for token purchases

### Google Sheets Configuration
- `GOOGLE_APPLICATION_CREDENTIALS` - Base64 encoded Google service account JSON
- `GOOGLE_HAVEN_DATA` - Google Sheets ID for main data
- `BACKUP_SHEET_ID` - Backup Google Sheets ID
- `GOOGLE_SHEETS_ID_KB` - Google Sheets ID for knowledge base

### Application Configuration
- `NEXT_PUBLIC_BASE_URL` - Your Vercel app URL (e.g., https://your-app.vercel.app)

## Deployment Steps

### 1. Prepare Google Credentials
Convert your `haven-data-afc6f79b9161.json` file to base64:
```bash
# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("haven-data-afc6f79b9161.json"))

# On macOS/Linux
base64 -i haven-data-afc6f79b9161.json
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Framework preset should auto-detect as "Next.js"
5. Add all environment variables in the Environment Variables section
6. Click "Deploy"

### 3. Configure Environment Variables in Vercel
1. Go to your project dashboard on Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate values
4. Redeploy the project after adding variables

### 4. Update Application URLs
After deployment, update any hardcoded URLs in your application to use the new Vercel domain.

## Post-Deployment Checklist
- [ ] Test all API endpoints
- [ ] Verify Stripe payments work
- [ ] Check Google Sheets integration
- [ ] Test OpenAI chat functionality
- [ ] Verify all environment variables are set correctly

## Troubleshooting

### Common Issues:
1. **Build failures**: Check that all dependencies are in package.json
2. **API errors**: Verify environment variables are set correctly
3. **404 errors**: Check that rewrites are working for /haven-chat paths
4. **Google Sheets errors**: Verify base64 encoding of service account JSON

### Debugging:
- Check Vercel function logs in the dashboard
- Use the `/api/test-env` endpoint to verify environment variables
- Use the `/api/test-stripe` endpoint to verify Stripe configuration

## Security Notes
- Never commit sensitive environment variables to Git
- Use Vercel's environment variable encryption
- Rotate API keys regularly
- Use different Stripe keys for production vs development

