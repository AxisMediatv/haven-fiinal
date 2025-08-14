import { NextResponse } from 'next/server';
import { getAnalytics } from '../../../lib/analytics.js';

export async function GET() {
  try {
    const analyticsData = getAnalytics();
    
    return NextResponse.json({
      success: true,
      ...analyticsData
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 