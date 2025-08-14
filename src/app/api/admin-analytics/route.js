import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

// Initialize Google Sheets API
const auth = new GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Spreadsheet ID - using single tab for all data
const SHEET_ID = process.env.GOOGLE_HAVEN_DATA || '1ytehaHyCAcXYMwpXyPMUk1U2hfHUifE9q8urIvDyoVI';

// GET: Retrieve comprehensive admin analytics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 30;
    
        if (!SHEET_ID) {
      return NextResponse.json({
        success: false,
        error: 'Admin analytics not configured'
      });
    }

    // Fetch data from single tab
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Haven-data!A:O',
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No data found in sheet'
      });
    }

    const data = rows.slice(1);

    // Calculate comprehensive analytics
    const analytics = calculateAdminAnalytics(data, days);

    return NextResponse.json({
      success: true,
      analytics,
      period: `${days} days`,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

function calculateAdminAnalytics(data, days) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  // Filter data by date range
  const filteredData = data.filter(row => {
    const timestamp = new Date(row[0]);
    return timestamp >= cutoffDate;
  });

  // User analytics
  const uniqueUsers = new Set();
  const userCosts = {};

  filteredData.forEach(row => {
    const userId = row[1] || 'anonymous';
    const tokens = parseInt(row[9]) || 0; // Column J: Tokens Used
    const cost = parseFloat(row[12]) || 0; // Column M: Total Cost
    const timestamp = new Date(row[0]);
    
    // Calculate message count from Messages JSON (Column H)
    let messageCount = 0;
    try {
      const messages = row[7] ? JSON.parse(row[7]) : [];
      messageCount = Array.isArray(messages) ? messages.length : 0;
    } catch (_e) {
      messageCount = 0;
    }

    uniqueUsers.add(userId);
    
    if (!userCosts[userId]) {
      userCosts[userId] = { tokens: 0, cost: 0, requests: 0, lastActive: timestamp, conversations: 0 };
    }
    
    userCosts[userId].tokens += tokens;
    userCosts[userId].cost += cost;
    userCosts[userId].requests += 1;
    userCosts[userId].conversations += messageCount > 0 ? 1 : 0; // Count as conversation if has messages
    
    if (timestamp > userCosts[userId].lastActive) {
      userCosts[userId].lastActive = timestamp;
    }
  });

  // Calculate business metrics
  const totalTokens = filteredData.reduce((sum, row) => sum + (parseInt(row[9]) || 0), 0);
  const totalCost = filteredData.reduce((sum, row) => sum + (parseFloat(row[12]) || 0), 0);
  const totalRequests = filteredData.length;
  const totalConversations = filteredData.reduce((sum, row) => {
    try {
      const messages = row[7] ? JSON.parse(row[7]) : [];
      return sum + (Array.isArray(messages) && messages.length > 0 ? 1 : 0);
    } catch (_e) {
      return sum;
    }
  }, 0);
  
  // Model usage breakdown
  const modelUsage = {};
  filteredData.forEach(row => {
    const model = row[13] || 'unknown'; // Column N: ChatGPT Model
    const tokens = parseInt(row[9]) || 0;
    modelUsage[model] = (modelUsage[model] || 0) + tokens;
  });

  // Daily breakdown for cost trends
  const dailyBreakdown = {};
  const dailyTokens = {};
  filteredData.forEach(row => {
    const date = new Date(row[0]).toDateString();
    const cost = parseFloat(row[12]) || 0;
    const tokens = parseInt(row[9]) || 0;
    dailyBreakdown[date] = (dailyBreakdown[date] || 0) + cost;
    dailyTokens[date] = (dailyTokens[date] || 0) + tokens;
  });

  // Convert to arrays for charts
  const costTrends = Object.entries(dailyBreakdown).map(([date, cost]) => ({
    date: new Date(date).toISOString(),
    cost: cost,
    tokens: dailyTokens[date] || 0
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  // User engagement over time
  const userEngagement = Object.entries(dailyBreakdown).map(([date, _cost]) => {
    const dateObj = new Date(date);
    const activeUsers = Object.values(userCosts).filter(user => 
      user.lastActive.toDateString() === date
    ).length;
    
    const newUsers = Object.values(userCosts).filter(user => 
      user.lastActive.toDateString() === date && 
      user.requests === 1
    ).length;
    
    return {
      date: dateObj.toISOString(),
      activeUsers,
      newUsers
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Top users by usage
  const topUsers = Object.entries(userCosts)
    .map(([userId, data]) => ({
      userId,
      tokens: data.tokens,
      cost: data.cost,
      requests: data.requests,
      conversations: data.conversations || 0,
      lastActive: data.lastActive,
      status: getStatus(data.lastActive)
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  // User activity for dashboard
  const userActivity = Object.entries(userCosts)
    .map(([userId, data]) => ({
      userId,
      tokens: data.tokens,
      cost: data.cost,
      conversations: data.conversations || 0,
      lastActive: data.lastActive.toISOString(),
      status: getStatus(data.lastActive)
    }))
    .sort((a, b) => b.cost - a.cost);

  // Recent activity
  const recentActivity = filteredData
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .slice(0, 20)
    .map(row => ({
      time: new Date(row[0]).toLocaleString(),
      userId: row[1] || 'anonymous',
      action: 'Chat Request',
      tokens: parseInt(row[9]) || 0,
      cost: parseFloat(row[12]) || 0,
      model: row[13] || 'unknown' // Column N: ChatGPT Model
    }));

  // Business intelligence
  const activeUsers = Object.values(userCosts).filter(user => 
    (new Date() - user.lastActive) < (7 * 24 * 60 * 60 * 1000)
  ).length;

  const newUsersToday = Object.values(userCosts).filter(user => 
    user.lastActive.toDateString() === new Date().toDateString()
  ).length;

  // Mock revenue data (replace with real payment data)
  const estimatedRevenue = totalCost * 3; // Assuming 3x markup
  const profitMargin = estimatedRevenue > 0 ? ((estimatedRevenue - totalCost) / estimatedRevenue * 100) : 0;
  const roi = totalCost > 0 ? ((estimatedRevenue - totalCost) / totalCost * 100) : 0;

  return {
    // Core metrics
    totalUsers: uniqueUsers.size,
    totalConversations,
    totalTokens,
    totalCost,
    totalRequests,
    activeUsers,
    newUsersToday,
    
    // Dashboard-specific data
    userActivity,
    costTrends,
    userEngagement,
    
    // Business metrics
    revenue: estimatedRevenue,
    profitMargin,
    roi,
    costPerUser: uniqueUsers.size > 0 ? totalCost / uniqueUsers.size : 0,
    revenuePerUser: uniqueUsers.size > 0 ? estimatedRevenue / uniqueUsers.size : 0,
    
    // Usage patterns
    modelUsage,
    dailyBreakdown,
    
    // User insights
    topUsers,
    recentActivity,
    
    // Engagement metrics
    retentionRate: calculateRetentionRate(userCosts, days),
    avgSessionTime: '15m', // Mock data
    conversionRate: 23, // Mock data
    
    // Cost analysis
    requestsByModel: Object.entries(modelUsage).reduce((acc, [model, tokens]) => {
      acc[model] = Math.round(tokens / 1000); // Convert to requests
      return acc;
    }, {}),
    
    requestsByType: {
      'conversation': totalConversations,
      'crisis': Math.round(totalRequests * 0.1),
      'exercise': Math.round(totalRequests * 0.2),
      'business': Math.round(totalRequests * 0.15),
      'knowledge': Math.round(totalRequests * 0.55)
    }
  };
}

function getStatus(lastActive) {
  const daysSinceActive = (new Date() - lastActive) / (1000 * 60 * 60 * 24);
  
  if (daysSinceActive <= 1) return 'active';
  if (daysSinceActive <= 7) return 'recent';
  if (daysSinceActive <= 30) return 'inactive';
  return 'dormant';
}

function calculateRetentionRate(userCosts, days) {
  const totalUsers = Object.keys(userCosts).length;
  if (totalUsers === 0) return 0;
  
  const activeUsers = Object.values(userCosts).filter(user => 
    (new Date() - user.lastActive) < (days * 24 * 60 * 60 * 1000)
  ).length;
  
  return Math.round((activeUsers / totalUsers) * 100);
}
