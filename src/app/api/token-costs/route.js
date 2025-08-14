import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

// Initialize Google Sheets API
const auth = new GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Token costs spreadsheet ID - use the same sheet as other data
const TOKEN_COSTS_SHEET_ID = process.env.GOOGLE_SHEETS_ID_KB || '1f43DZOZ7oB5kFzu3bn4gEv_M1acBSGXJUHXfIWN0TY0';

// Model cost structure (per 1K tokens)
const MODEL_COSTS = {
  'gpt-4o': 5.00,        // $5.00 per 1K tokens
  'gpt-4o-mini': 0.15,   // $0.15 per 1K tokens
  'gpt-3.5-turbo': 0.50, // $0.50 per 1K tokens
  'default': 0.50         // Default fallback
};

// Log token cost to Google Sheets
async function logTokenCost(entry) {
  try {
    if (!TOKEN_COSTS_SHEET_ID) {
      console.log('Token costs sheet not configured, skipping log');
      return true;
    }

    const timestamp = new Date().toISOString();
    const cost = calculateCost(entry.tokensUsed, entry.model);
    
    const row = [
      timestamp,                    // A: Timestamp
      entry.userId || 'anonymous',  // B: User ID
      entry.sessionId || '',        // C: Session ID
      entry.conversationTitle || '', // D: Conversation Title
      timestamp,                    // E: Save Timestamp
      'auto',                      // F: Save Type (manual/auto)
      'conversation',              // G: Type (conversation)
      JSON.stringify([{            // H: Messages (JSON)
        user: entry.userMessage || '',
        ai: entry.aiResponse || '',
        timestamp: timestamp
      }]),
      entry.status || 'success',   // I: Status
      entry.tokensUsed || 0,       // J: Tokens Used
      entry.model === 'gpt-4o' ? cost.toFixed(4) : '', // K: Cost Per Message 4
      entry.model === 'gpt-4o-mini' ? cost.toFixed(4) : '', // L: Cost Per Message mini
      cost.toFixed(4)              // M: Total Cost
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: TOKEN_COSTS_SHEET_ID,
      range: 'Sheet1!A:M',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [row]
      }
    });

    console.log(`Token cost logged: ${entry.tokensUsed} tokens, $${cost.toFixed(4)} cost`);
    return true;
    
  } catch (error) {
    console.error('Error logging token cost:', error);
    return false;
  }
}

// Calculate cost based on tokens and model
function calculateCost(tokens, model) {
  const costPer1K = MODEL_COSTS[model] || MODEL_COSTS.default;
  return (tokens / 1000) * costPer1K;
}

// GET: Retrieve token cost analytics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days')) || 30;
    
    if (!TOKEN_COSTS_SHEET_ID) {
      return NextResponse.json({
        success: false,
        error: 'Token costs sheet not configured'
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: TOKEN_COSTS_SHEET_ID,
      range: 'Sheet1!A:M',
    });

    const rows = response.data.values || [];
    const data = rows.slice(1);

    // Filter by date range and user if specified
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredData = data.filter(row => {
      const timestamp = new Date(row[0]);
      const matchesUser = !userId || row[1] === userId;
      const matchesDate = timestamp >= cutoffDate;
      return matchesUser && matchesDate;
    });

    // Calculate analytics
    const analytics = {
      totalRequests: filteredData.length,
      totalTokens: 0,
      totalCost: 0,
      averageTokensPerRequest: 0,
      averageCostPerRequest: 0,
      models: {},
      responseTypes: {},
      dailyBreakdown: {}
    };

    filteredData.forEach(row => {
      const tokens = parseInt(row[9]) || 0; // J: Tokens Used
      const cost = parseFloat(row[12]) || 0; // M: Total Cost
      // Derive model from cost columns K and L
      let model = 'unknown';
      if (row[10] && parseFloat(row[10]) > 0) model = 'gpt-4o'; // K: Cost Per Message 4
      else if (row[11] && parseFloat(row[11]) > 0) model = 'gpt-4o-mini'; // L: Cost Per Message mini
      const responseType = row[6] || 'unknown'; // G: Type (conversation)
      const date = new Date(row[0]).toDateString();

      analytics.totalTokens += tokens;
      analytics.totalCost += cost;
      
      analytics.models[model] = (analytics.models[model] || 0) + 1;
      analytics.responseTypes[responseType] = (analytics.responseTypes[responseType] || 0) + 1;
      analytics.dailyBreakdown[date] = (analytics.dailyBreakdown[date] || 0) + cost;
    });

    if (analytics.totalRequests > 0) {
      analytics.averageTokensPerRequest = Math.round(analytics.totalTokens / analytics.totalRequests);
      analytics.averageCostPerRequest = analytics.totalCost / analytics.totalRequests;
    }

    return NextResponse.json({
      success: true,
      analytics,
      period: `${days} days`
    });

  } catch (error) {
    console.error('Token costs GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST: Log a new token cost entry
export async function POST(request) {
  try {
    const entry = await request.json();
    
    // Validate required fields
    if (!entry.tokensUsed || !entry.model) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: tokensUsed, model'
      }, { status: 400 });
    }

    // Log to Google Sheets
    const logged = await logTokenCost(entry);
    
    if (!logged) {
      return NextResponse.json({
        success: false,
        error: 'Failed to log token cost'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cost: calculateCost(entry.tokensUsed, entry.model),
      message: 'Token cost logged successfully'
    });

  } catch (error) {
    console.error('Token costs POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 