import { NextResponse } from 'next/server';
import { simpleLog } from '../../../lib/sheets-logger.js';
import { updateAnalytics } from '../../../lib/analytics.js';

// Standard Chat tracking endpoint
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const { 
      message, 
      conversationHistory = [], 
      userPreferences = {},
      userId = 'standard-chat-user',
      sessionId = 'standard-chat-session'
    } = await request.json();
    
    console.log(`💬 Standard Chat tracking request received`);
    console.log(`   Message: "${message}"`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Conversation length: ${conversationHistory.length}`);
    
    // Log the interaction for backend tracking
    const logResult = await simpleLog({
      userId: userId,
      sessionId: sessionId,
      message: message,
      response: 'Standard Chat interaction tracked',
      responseType: 'standard-chat',
      tokensUsed: 0, // Standard Chat doesn't use tokens
      responseTime: Date.now()
    });

    // Update analytics for Standard Chat usage
    const analyticsResult = await updateAnalytics({
      event: 'standard_chat_interaction',
      userId: userId,
      data: {
        message: message,
        conversationLength: conversationHistory.length,
        userPreferences: userPreferences,
        sessionId: sessionId,
        timestamp: Date.now()
      }
    });

    const responseTime = Date.now() - startTime;
    
    const response = {
      success: true,
      trackingType: 'standard-chat',
      tracked: true,
      timestamp: Date.now(),
      responseTime: responseTime,
      logResult: logResult,
      analyticsResult: analyticsResult,
      message: 'Standard Chat interaction tracked successfully'
    };
    
    console.log(`💬 Standard Chat tracking completed in ${responseTime}ms`);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Standard Chat tracking error:', error);
    const responseTime = Date.now() - startTime;
    
    const errorResponse = {
      success: false,
      trackingType: 'standard-chat',
      tracked: false,
      error: error.message,
      responseTime: responseTime
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET endpoint for checking Standard Chat status
export async function GET() {
  return NextResponse.json({
    status: 'active',
    trackingType: 'standard-chat',
    description: 'Standard Chat backend tracking endpoint',
    timestamp: Date.now()
  });
} 