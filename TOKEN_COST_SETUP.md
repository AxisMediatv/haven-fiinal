# 🎯 Haven Token Cost Tracking Setup Guide

Your Haven app now has a comprehensive token cost tracking system that automatically syncs with Google Sheets! Here's how to set it up:

## ✅ **What's Already Implemented:**

### **1. Token Cost API** (`/api/token-costs`)
- ✅ **POST**: Logs token usage and costs to Google Sheets
- ✅ **GET**: Retrieves analytics with filtering by user and date range
- ✅ **Automatic cost calculation** based on model used
- ✅ **Real-time tracking** from chat conversations

### **2. Chat Integration** (`/api/chat`)
- ✅ **Automatic token tracking** after each conversation
- ✅ **Model detection** (GPT-4o, GPT-4o-mini, etc.)
- ✅ **Cost calculation** and logging to Google Sheets
- ✅ **Fallback logging** if Google Sheets is unavailable

### **3. Account Page Analytics** (`account.html`)
- ✅ **Token cost dashboard** with beautiful visualizations
- ✅ **Real-time analytics** showing total tokens, costs, and usage
- ✅ **Model breakdown** showing requests by AI model
- ✅ **Response type tracking** (crisis, standard, knowledge-base)

## 🚀 **Setup Steps:**

### **Step 1: Create Google Sheet for Token Costs**

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet called "Haven Token Costs"
3. Copy the Sheet ID from the URL (the long string after `/d/` and before `/edit`)

### **Step 2: Set Up Sheet Structure**

Create these columns in your "TokenCosts" sheet:

| Column | Header | Description |
|--------|--------|-------------|
| A | Timestamp | When the request was made |
| B | User ID | User identifier |
| C | Session ID | Session identifier |
| D | Conversation ID | Conversation identifier |
| E | Model Used | AI model (gpt-4o, gpt-4o-mini, etc.) |
| F | Tokens Used | Number of tokens consumed |
| G | Cost | Calculated cost in USD |
| H | Response Type | Type of response (crisis, standard, knowledge) |
| I | User Message | User's message (truncated to 100 chars) |
| J | AI Response | AI's response (truncated to 100 chars) |
| K | Status | Request status (success, error, etc.) |

### **Step 3: Update Environment Variables**

Add this to your `.env.local` file:

```bash
# Token Costs Sheet ID (for tracking token usage and costs)
TOKEN_COSTS_SHEET_ID=your_token_costs_sheet_id_here
```

### **Step 4: Test the System**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Send a test message** in the chat interface

3. **Check Google Sheets** - you should see the token cost data appear

4. **Visit Account page** - click "Load Token Costs" to see analytics

## 📊 **How It Works:**

### **Automatic Tracking:**
- Every chat request automatically tracks token usage
- Costs are calculated based on the model used:
  - **GPT-4o**: $5.00 per 1K tokens
  - **GPT-4o-mini**: $0.15 per 1K tokens  
  - **GPT-3.5-turbo**: $0.50 per 1K tokens
- Data is saved to your Google Sheet in real-time
- Includes user ID, session ID, and conversation context

### **Analytics Dashboard:**
- **Total tokens used** and costs
- **Requests by model type** (which AI models are being used)
- **Response types** (crisis, standard, knowledge-base)
- **Average costs per request**
- **Daily breakdown** of costs
- **Filter by date range** (last 30 days by default)

### **Access Points:**
- **Account Page**: Go to Account → "💰 Token Cost Analytics" section
- **API Endpoint**: `/api/token-costs` for programmatic access
- **Google Sheet**: Direct access to all raw data

## 🔧 **API Endpoints:**

### **POST /api/token-costs**
Log a new token cost entry:
```javascript
{
  "userId": "user123",
  "sessionId": "session456", 
  "tokensUsed": 150,
  "model": "gpt-4o-mini",
  "responseType": "standard",
  "conversationId": "conv789",
  "userMessage": "Hello",
  "aiResponse": "Hi there!"
}
```

### **GET /api/token-costs**
Get analytics with optional filters:
```
/api/token-costs?userId=user123&days=30
```

## 🎨 **Features:**

- **Real-time tracking**: Every chat automatically logs token usage
- **Cost calculation**: Automatic cost calculation based on model
- **Analytics dashboard**: Beautiful visual analytics in the Account page
- **Google Sheets sync**: All data backed up to your sheet
- **Fallback logging**: Works even if Google Sheets is unavailable
- **Model breakdown**: See which AI models are being used most
- **Response type tracking**: Track crisis vs standard vs knowledge responses

## 🚨 **Troubleshooting:**

### **If token costs aren't appearing:**
1. Check that `TOKEN_COSTS_SHEET_ID` is set in your `.env.local`
2. Verify your Google Sheets credentials are working
3. Check the browser console for any errors
4. Ensure the "TokenCosts" sheet exists in your spreadsheet

### **If analytics aren't loading:**
1. Make sure you have some token cost data in your sheet
2. Check the API endpoint is accessible
3. Verify the date range filter isn't excluding all data

## 📈 **Next Steps:**

Once set up, you'll be able to:
- Track costs in real-time
- Analyze usage patterns
- Optimize model selection
- Monitor crisis response costs
- Export data for further analysis

Your token cost tracking system is now ready to help you monitor and optimize your Haven app's AI usage! 🎉 