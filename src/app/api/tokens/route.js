import { NextResponse } from 'next/server';

// Simple in-memory token storage (in production, use a database)
let userTokens = new Map();

// Token limits for each plan
const TOKEN_LIMITS = {
  beta: 50,
  starter: 300,
  regular: 1500,
  family: 4000
};

// Check if monthly reset is needed
function checkMonthlyReset(userData) {
  if (!userData.lastReset) return false;
  
  const lastReset = new Date(userData.lastReset);
  const now = new Date();
  
  // Check if a month has passed since last reset
  const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                     (now.getMonth() - lastReset.getMonth());
  
  return monthsDiff >= 1;
}

// Initialize user tokens based on their plan
function initializeUserTokens(userId, plan = 'starter') {
  const limit = TOKEN_LIMITS[plan] || TOKEN_LIMITS.starter;
  
  const userData = {
    remaining: limit,
    plan: plan,
    lastReset: new Date().toISOString(),
    totalUsed: 0
  };
  
  userTokens.set(userId, userData);
  return userData;
}

// Get user tokens with automatic monthly reset
function getUserTokensWithReset(userId, plan = 'starter') {
  let userData = userTokens.get(userId);
  
  // Initialize user if they don't exist
  if (!userData) {
    console.log(`🆕 Initializing new user: ${userId} with plan: ${plan}`);
    userData = initializeUserTokens(userId, plan);
    return userData;
  }
  
  // Check if monthly reset is needed
  if (checkMonthlyReset(userData)) {
    console.log(`🔄 Monthly reset triggered for user: ${userId}`);
    userData.remaining = TOKEN_LIMITS[userData.plan] || TOKEN_LIMITS.starter;
    userData.lastReset = new Date().toISOString();
    userData.totalUsed = 0; // Reset total used count for the new month
    userTokens.set(userId, userData);
    console.log(`✅ Tokens reset for ${userId}. New balance: ${userData.remaining}`);
  }
  
  return userData;
}

// Get user tokens
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const plan = searchParams.get('plan') || 'starter';
    
    console.log(`🔍 Token GET request:`, { userId, plan });
    
    const tokens = getUserTokensWithReset(userId, plan);
    
    console.log(`👤 User ${userId}, tokens: ${tokens.remaining}, plan: ${tokens.plan}`);
    
    return NextResponse.json({
      success: true,
      tokens: tokens.remaining,
      plan: tokens.plan,
      lastReset: tokens.lastReset,
      totalUsed: tokens.totalUsed,
      limit: TOKEN_LIMITS[tokens.plan] || 0
    });
  } catch (error) {
    console.error('GET tokens error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Use a token (called when user sends a message)
export async function POST(request) {
  try {
    const { userId = 'anonymous', action, plan } = await request.json();
    
    console.log(`🔍 Token POST request:`, { userId, action, plan });
    
    let userData = getUserTokensWithReset(userId, plan || 'starter');
    
    if (action === 'use') {
      if (userData.remaining <= 0) {
        console.log(`❌ User ${userId} has no tokens remaining`);
        return NextResponse.json({
          success: false,
          error: 'No tokens remaining',
          needsTopUp: true
        }, { status: 402 });
      }
      
      userData.remaining--;
      userData.totalUsed++;
      console.log(`✅ Token used for ${userId}. Remaining: ${userData.remaining}, Total used: ${userData.totalUsed}`);
      
    } else if (action === 'add') {
      const { amount, newPlan } = await request.json();
      userData.remaining += amount;
      if (newPlan) userData.plan = newPlan;
      console.log(`➕ Added ${amount} tokens for ${userId}. New total: ${userData.remaining}`);
      
    } else if (action === 'reset') {
      const { newPlan } = await request.json();
      userData.remaining = TOKEN_LIMITS[newPlan] || TOKEN_LIMITS.starter;
      userData.plan = newPlan;
      userData.lastReset = new Date().toISOString();
      console.log(`🔄 Reset tokens for ${userId} to ${userData.remaining} (plan: ${newPlan})`);
    }
    
    userTokens.set(userId, userData);
    
    return NextResponse.json({
      success: true,
      tokens: userData.remaining,
      plan: userData.plan,
      totalUsed: userData.totalUsed
    });
    
  } catch (error) {
    console.error('Token management error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Emergency top-up endpoint
export async function PUT(request) {
  try {
    const { userId = 'anonymous', tokens = 100 } = await request.json();
    
    let userData = userTokens.get(userId);
    
    // Initialize user if they don't exist
    if (!userData) {
      userData = initializeUserTokens(userId, 'emergency');
    }
    
    userData.remaining += tokens;
    userTokens.set(userId, userData);
    
    return NextResponse.json({
      success: true,
      tokens: userData.remaining,
      message: `Added ${tokens} emergency tokens`
    });
    
  } catch (error) {
    console.error('Emergency top-up error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Debug endpoint to view all users and reset tokens
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    
    if (action === 'reset' && userId) {
      // Reset specific user
      userTokens.delete(userId);
      console.log(`🔄 Reset tokens for user: ${userId}`);
      return NextResponse.json({
        success: true,
        message: `Reset tokens for user: ${userId}`
      });
    } else if (action === 'view') {
      // View all users
      const allUsers = {};
      userTokens.forEach((value, key) => {
        allUsers[key] = value;
      });
      return NextResponse.json({
        success: true,
        users: allUsers
      });
    } else if (action === 'clear') {
      // Clear all users
      userTokens.clear();
      console.log(`🗑️ Cleared all user tokens`);
      return NextResponse.json({
        success: true,
        message: 'Cleared all user tokens'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 