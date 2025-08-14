import { NextResponse } from 'next/server';
import { detectCrisis } from '../../../lib/crisis-detector.js';
import { detectExerciseRequest } from '../../../lib/exercise-handler.js';
import { detectBusinessRequest } from '../../../lib/business-handler.js';
import { simpleLog } from '../../../lib/sheets-logger.js';
import { updateAnalytics } from '../../../lib/analytics.js';



// Calculate cost based on usage
function calculateCost(usage) {
  if (!usage) return 0;
  
  // GPT-4o-mini pricing (approximate)
  const inputCost = (usage.prompt_tokens / 1000) * 0.00015;
  const outputCost = (usage.completion_tokens / 1000) * 0.0006;
  
  return inputCost + outputCost;
}

function detectCrisisKeywords(message) {
  const crisisDetection = detectCrisis(message);
  return crisisDetection.detected;
}

async function callOpenAI(message, conversationHistory, knowledgeContext = '', isCrisis = false, userPreferences = {}) {
  const startTime = Date.now();
  
  // Debug environment variables
  console.log(`🔍 Environment Debug:`);
  console.log(`   OPENAI_API_KEY exists: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`   OPENAI_API_KEY length: ${process.env.OPENAI_API_KEY?.length || 0}`);
  console.log(`   OPENAI_API_KEY starts with: ${process.env.OPENAI_API_KEY?.substring(0, 10) || 'undefined'}`);
  
  // SWITCH MODELS BASED ON CRISIS
  let model;
  if (isCrisis) {
    model = 'gpt-4o'; // Premium model for crisis
  } else {
    model = 'gpt-4o-mini'; // Standard model for normal conversations
  }
  
  console.log(`🤖 Calling OpenAI API...`);
  console.log(`   Model: ${model}`);
  console.log(`   Crisis Mode: ${isCrisis ? 'YES' : 'NO'}`);
  console.log(`   Knowledge Context: ${knowledgeContext ? 'YES' : 'NO'}`);
  
  // Get user preferences for personalization
  const userMood = userPreferences.mood || 'balanced-mix';
  const userQualities = userPreferences.qualities || ['empathetic', 'non-judgmental'];
  const userPreferredName = userPreferences.preferredName || '';
  
  // Create personalized system prompt based on user preferences
  const moodDescriptions = {
    'motherly': 'EXTREMELY sweet, nurturing, and caring like a loving mother - use terms like "sweetheart", "honey", "dear", "love" frequently',
    'fatherly': 'strong, bold, and protective like a supportive father - be direct and encouraging',
    'faith-centered': 'wise, spiritual, and faith-based in your guidance - incorporate spiritual wisdom naturally',
    'best-friend': 'casual, fun, and understanding like a close friend - be relaxed and supportive',
    'wise-mentor': 'gentle but transformative, offering wisdom and growth',
    'solution-coach': 'practical and action-oriented, focusing on concrete steps forward',
    'calm-centering': 'peaceful and grounding, helping with mindfulness and calm',
    'balanced-mix': 'warm and supportive with gentle challenges when needed'
  };
  
  const qualityDescriptions = {
    'empathetic': 'deeply understanding and compassionate',
    'non-judgmental': 'accepting and supportive without criticism',
    'encouraging': 'motivating and uplifting',
    'practical': 'offering concrete, actionable advice',
    'gentle': 'soft and caring in approach',
    'challenging': 'gently pushing for growth when appropriate'
  };
  
  const moodDescription = moodDescriptions[userMood] || moodDescriptions['balanced-mix'];
  const qualityDescription = userQualities.map(q => qualityDescriptions[q] || q).join(', ');
  
  const personalizedPrompt = `You are Haven, a warm and caring friend who helps people grow emotionally. 

Your communication style: ${moodDescription}
Your qualities: ${qualityDescription}
${userPreferredName ? `The user prefers to be called: ${userPreferredName}` : ''}

Keep responses SHORT (2-6 sentences max). Talk like a supportive friend, not a therapist or robot.

Guidelines:
- Be conversational and warm
- Give practical, helpful advice
- Challenge people gently when they need it
- Use "I" statements like "I think" or "I've noticed"
- Sound human and caring, never clinical or robotic
- Keep responses brief and focused

${knowledgeContext ? `RELEVANT INFO: ${knowledgeContext}` : ''}

If someone mentions self-harm, immediately provide crisis resources.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: personalizedPrompt },
          ...conversationHistory.slice(-10),
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const responseTime = Date.now() - startTime;
    const tokensUsed = data.usage?.total_tokens || 0;
    const cost = calculateCost(data.usage);

    console.log(`✅ OpenAI API call successful`);
    console.log(`   Response time: ${responseTime}ms`);
    console.log(`   Tokens used: ${tokensUsed}`);
    console.log(`   Cost: $${cost.toFixed(6)}`);

    return {
      message: data.choices[0].message.content,
      tokensUsed: tokensUsed,
      cost: cost,
      modelUsed: model,
      responseType: isCrisis ? 'crisis' : 'standard',
      responseTime: responseTime
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

// Main routing function
async function routeMessage(message, conversationHistory, userPreferences) {
  try {
    // Check for crisis keywords first
    if (detectCrisisKeywords(message)) {
      console.log('🚨 Crisis detected, routing to crisis handler');
      return await callOpenAI(message, conversationHistory, '', true, userPreferences);
    }

    // Check for exercise requests
    if (detectExerciseRequest(message)) {
      console.log('💪 Exercise request detected');
      return await callOpenAI(message, conversationHistory, 'Exercise and movement guidance', false, userPreferences);
    }

    // Check for business inquiries
    if (detectBusinessRequest(message)) {
      console.log('💼 Business inquiry detected');
      return await callOpenAI(message, conversationHistory, 'Business and pricing information', false, userPreferences);
    }

    // Standard chat routing
    console.log('💬 Standard chat routing');
    return await callOpenAI(message, conversationHistory, '', false, userPreferences);

  } catch (error) {
    console.error('Message routing error:', error);
    throw error;
  }
}

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const { 
      message, 
      conversationHistory = [], 
      userPreferences = {},
      routingType = 'standard',
      isCrisis = false,
      hasKnowledgeBaseTopics = false
    } = await request.json();
    
    console.log(`📨 Received message: "${message}"`);
    console.log(`   Conversation length: ${conversationHistory.length}`);
    console.log(`   User preferences:`, userPreferences);
    console.log(`   Routing type: ${routingType}`);
    console.log(`   Crisis detected: ${isCrisis}`);
    console.log(`   Knowledge base topics: ${hasKnowledgeBaseTopics}`);
    
    // Use the clean routing function
    const response = await routeMessage(message, conversationHistory, userPreferences);
    
    // Add response time
    response.responseTime = Date.now() - startTime;
    
    // Add Standard Chat tracking info to response
    response.standardChatEnabled = true;
    response.backendTracking = 'standard-chat';
    
    // Track token costs in Google Sheets
    if (response.tokensUsed && response.tokensUsed > 0) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/token-costs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'standard-chat-user',
            sessionId: 'standard-chat-session',
            tokensUsed: response.tokensUsed,
            model: response.modelUsed || 'unknown',
            cost: response.cost || 0,
            responseType: response.responseType || 'standard',
            conversationId: Date.now().toString(),
            message: message.substring(0, 100),
            response: response.message ? response.message.substring(0, 100) : ''
          })
        });
      } catch (error) {
        console.error('Error tracking token costs:', error);
        // Don't fail the main request if token tracking fails
      }
    }
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('API Error:', error);
    const responseTime = Date.now() - startTime;
    
    const errorResponse = {
      error: 'Failed to get response from Haven',
      responseType: 'error',
      tokensUsed: 0,
      cost: 0,
      responseTime
    };
    
    // Log the error
    await simpleLog({
      userId: 'unknown',
      sessionId: 'unknown',
      message: 'Error occurred',
      response: error.message,
      responseType: 'error',
      tokensUsed: 0,
      responseTime
    });
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
