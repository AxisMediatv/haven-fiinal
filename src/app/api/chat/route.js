import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, conversationHistory } = await request.json();
    
    // Search knowledge base first
   // Debug knowledge base search
    console.log('Searching for:', message);
    let knowledgeResponse = null;
    
    try {
      knowledgeResponse = await searchKnowledgeBase(message);
      console.log('Knowledge result:', knowledgeResponse);
    } catch (error) {
      console.log('Search error:', error);
    }
    
    // Force a test response for debugging
    const testKeywords = message.toLowerCase();
    if (testKeywords.includes('philosophy') || testKeywords.includes('growth') || testKeywords.includes('comfort')) {
      knowledgeResponse = "TEST: Comfort is the enemy of excellence. This is coming from your knowledge base!";
    }
    if (testKeywords.includes('trauma') || testKeywords.includes('toxic') || testKeywords.includes('relationship')) {
      knowledgeResponse = "TEST: Boundaries are not cruelty. They're clarity. You're allowed to block them.";
    }
    if (testKeywords.includes('price') || testKeywords.includes('cost') || testKeywords.includes('plan')) {
      knowledgeResponse = "TEST: I found pricing information in my knowledge base - this proves the connection works!";
    }
