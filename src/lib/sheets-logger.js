// Google Sheets Logger for Chat History
// Stores conversation data in Google Sheets for analysis and continuity

import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

// Initialize Google Sheets API
const auth = new GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Chat history spreadsheet ID (you'll need to create this)
const CHAT_HISTORY_SHEET_ID = process.env.CHAT_HISTORY_SHEET_ID || 'your-chat-history-sheet-id';

export async function logChatEntry(entry) {
  try {
    const timestamp = new Date().toISOString();
    
    // Determine conversation type based on crisis detection and response type
    let conversationType = 'standard';
    if (entry.crisisLevel && entry.crisisLevel !== '') {
      conversationType = 'crisis';
    } else if (entry.responseType === 'crisis') {
      conversationType = 'crisis';
    }
    
    const row = [
      timestamp,
      entry.userId || 'anonymous',
      entry.message,
      entry.response,
      entry.responseType, // 'crisis', 'exercise', 'openai', 'knowledge'
      entry.crisisLevel || '',
      entry.exerciseType || '',
      entry.tokensUsed || 0,
      entry.responseTime || 0,
      entry.sessionId || '',
      entry.userAgent || '',
      entry.ipAddress || '',
      '', // Column M (existing)
      '', // Column N (existing)
      conversationType // New column O for conversation type
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: CHAT_HISTORY_SHEET_ID,
      range: 'Google_Haven_Data!A:O',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [row]
      }
    });

    console.log('Chat entry logged successfully');
    return true;
    
  } catch (error) {
    console.error('Error logging chat entry:', error);
    return false;
  }
}

export async function getChatHistory(userId, limit = 10) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CHAT_HISTORY_SHEET_ID,
      range: 'ChatHistory!A:L',
    });

    const rows = response.data.values || [];
    const headers = rows[0];
    const data = rows.slice(1);

    // Filter by user ID and sort by timestamp
    const userHistory = data
      .filter(row => row[1] === userId)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .slice(0, limit)
      .map(row => {
        const entry = {};
        headers.forEach((header, index) => {
          entry[header] = row[index] || '';
        });
        return entry;
      });

    return userHistory;
    
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
}

export async function getSessionHistory(sessionId) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CHAT_HISTORY_SHEET_ID,
      range: 'ChatHistory!A:L',
    });

    const rows = response.data.values || [];
    const headers = rows[0];
    const data = rows.slice(1);

    // Filter by session ID and sort by timestamp
    const sessionHistory = data
      .filter(row => row[9] === sessionId) // sessionId is in column J
      .sort((a, b) => new Date(a[0]) - new Date(b[0])) // chronological order
      .map(row => {
        const entry = {};
        headers.forEach((header, index) => {
          entry[header] = row[index] || '';
        });
        return entry;
      });

    return sessionHistory;
    
  } catch (error) {
    console.error('Error getting session history:', error);
    return [];
  }
}

export async function getAnalytics() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CHAT_HISTORY_SHEET_ID,
      range: 'ChatHistory!A:L',
    });

    const rows = response.data.values || [];
    const data = rows.slice(1);

    const analytics = {
      totalConversations: data.length,
      responseTypes: {},
      crisisLevels: {},
      exerciseTypes: {},
      averageTokens: 0,
      averageResponseTime: 0
    };

    let totalTokens = 0;
    let totalResponseTime = 0;
    let validEntries = 0;

    data.forEach(row => {
      const responseType = row[4] || 'unknown';
      const crisisLevel = row[5] || '';
      const exerciseType = row[6] || '';
      const tokens = parseInt(row[7]) || 0;
      const responseTime = parseInt(row[8]) || 0;

      analytics.responseTypes[responseType] = (analytics.responseTypes[responseType] || 0) + 1;
      
      if (crisisLevel) {
        analytics.crisisLevels[crisisLevel] = (analytics.crisisLevels[crisisLevel] || 0) + 1;
      }
      
      if (exerciseType) {
        analytics.exerciseTypes[exerciseType] = (analytics.exerciseTypes[exerciseType] || 0) + 1;
      }

      if (tokens > 0) {
        totalTokens += tokens;
        validEntries++;
      }

      if (responseTime > 0) {
        totalResponseTime += responseTime;
      }
    });

    if (validEntries > 0) {
      analytics.averageTokens = Math.round(totalTokens / validEntries);
      analytics.averageResponseTime = Math.round(totalResponseTime / validEntries);
    }

    return analytics;
    
  } catch (error) {
    console.error('Error getting analytics:', error);
    return {};
  }
}

// Simple fallback logger if Google Sheets is not configured
export async function simpleLog(entry) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      userId: entry.userId || 'anonymous',
      message: entry.message,
      response: entry.response,
      responseType: entry.responseType,
      crisisLevel: entry.crisisLevel || '',
      exerciseType: entry.exerciseType || '',
      tokensUsed: entry.tokensUsed || 0,
      responseTime: entry.responseTime || 0
    };

    console.log('Chat Entry:', JSON.stringify(logEntry, null, 2));
    return true;
    
  } catch (error) {
    console.error('Error in simple logging:', error);
    return false;
  }
} 