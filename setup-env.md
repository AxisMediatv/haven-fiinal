# Environment Variables Setup

## Create .env.local file

Create a `.env.local` file in your project root with the following content:

```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_BETA_PRICE_ID=price_1RptShIwaWv1ScRrXyVMOCjX

# Gmail Configuration (for Google Sheets)
GMAIL_USER=your_gmail_user_here
GMAIL_APP_PASSWORD=your_gmail_app_password_here

# Google Sheets Configuration
GOOGLE_SHEETS_ID_KB=1f43DZOZ7oB5kFzu3bn4gEv_M1acBSGXJUHXfIWN0TY0

# Backup Sheet ID (for user conversations)
BACKUP_SHEET_ID=your_backup_sheet_id_here

# Token Costs Sheet ID (for tracking token usage and costs)
TOKEN_COSTS_SHEET_ID=1ytehaHyCAcXYMwpXyPMUk1U2hfHUifE9q8urIvDyoVI
```

## What was fixed:

1. **Removed hardcoded Google Sheets ID** from `public/haven-chat/index.html`
2. **Updated backend** to use environment variable `GOOGLE_SHEETS_ID_KB`
3. **Updated frontend** to not send sheetId (now handled server-side)

## Security improvements:

- ✅ No more hardcoded sensitive data in HTML files
- ✅ All sensitive IDs now use environment variables
- ✅ Backend properly handles environment variables
- ✅ Frontend no longer exposes sensitive data

## Next steps:

1. Create the `.env.local` file with your actual API keys
2. Test that the application still works
3. Commit and push to GitHub - should work now!

The GitHub error should be resolved since we removed the hardcoded Google Sheets ID from the HTML file. 