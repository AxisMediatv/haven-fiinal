import { NextResponse } from 'next/server';
import { simpleLog } from '../../../lib/sheets-logger.js';
import { updateAnalytics } from '../../../lib/analytics.js';

// OpenAI Assistants API Configuration
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

// Initialize OpenAI client
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create or get thread for user
async function getOrCreateThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}

// Add message to thread
async function addMessageToThread(threadId, message) {
  try {
    const threadMessage = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });
    return threadMessage;
  } catch (error) {
    console.error('Error adding message to thread:', error);
    throw error;
  }
}

// Run assistant with thread
async function runAssistant(threadId, message) {
  try {
    // Add user message to thread
    await addMessageToThread(threadId, message);
    
    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
    });
    
    // Wait for completion
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }
    
    if (runStatus.status === 'failed') {
      throw new Error('Assistant run failed');
    }
    
    // Get the messages from the thread
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data[0]; // Most recent message
    const responseText = lastMessage.content[0].text.value;
    
    // Analyze if the Assistant used knowledge base or indicated no relevant info
    const noKnowledgeIndicators = [
      "i don't have specific information",
      "i don't have relevant information",
      "i don't have knowledge about",
      "i don't have details about",
      "i don't have specific guidance",
      "i don't have expertise in",
      "i don't have information about",
      "i don't have specific advice",
      "i don't have knowledge on",
      "i don't have specific resources",
      "i don't have detailed information",
      "i don't have specific techniques",
      "i don't have information regarding",
      "i don't have specific strategies",
      "i don't have knowledge regarding"
    ];
    
    const lowerResponse = responseText.toLowerCase();
    const hasNoKnowledgeIndicator = noKnowledgeIndicators.some(indicator => 
      lowerResponse.includes(indicator)
    );
    
    // Check if response is too generic or indicates lack of knowledge
    const isGenericResponse = lowerResponse.includes("i'm here to listen") && 
                             lowerResponse.includes("support you") && 
                             responseText.length < 100;
    
    const knowledgeBaseUsed = !hasNoKnowledgeIndicator && !isGenericResponse;
    
    console.log(`🤖 Assistant response analysis:`);
    console.log(`   Response length: ${responseText.length} characters`);
    console.log(`   Has no-knowledge indicators: ${hasNoKnowledgeIndicator}`);
    console.log(`   Is generic response: ${isGenericResponse}`);
    console.log(`   Knowledge base used: ${knowledgeBaseUsed}`);
    
    return {
      response: responseText,
      responseType: 'assistant',
      modelUsed: 'assistant',
      tokensUsed: 0, // Assistant API doesn't provide token usage in the same way
      cost: 0, // Cost tracking would need to be implemented separately
      routingType: 'assistant',
      knowledgeBaseUsed: knowledgeBaseUsed
    };
    
  } catch (error) {
    console.error('Error running assistant:', error);
    throw error;
  }
}

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const { 
      message, 
      conversationHistory = [], 
      userPreferences = {}
    } = await request.json();
    
    console.log(`🤖 Assistant API called for knowledge base query: "${message}"`);
    
    // Get or create thread
    const threadId = await getOrCreateThread('user-session');
    
    // Run assistant
    const response = await runAssistant(threadId, message);
    
    // Add response time
    response.responseTime = Date.now() - startTime;
    
    // Log the interaction
    await simpleLog({
      userId: 'assistant-user',
      sessionId: 'assistant-session',
      message: message,
      response: response.response,
      responseType: 'assistant',
      tokensUsed: response.tokensUsed || 0,
      responseTime: response.responseTime
    });
    
    // Update analytics
    await updateAnalytics({
      event: 'assistant_interaction',
      userId: 'assistant-user',
      data: {
        message: message,
        responseLength: response.response.length,
        conversationLength: conversationHistory.length,
        userPreferences: userPreferences
      }
    });
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Assistant API Error:', error);
    const responseTime = Date.now() - startTime;
    
    const errorResponse = {
      error: 'Failed to get response from Assistant',
      responseType: 'error',
      tokensUsed: 0,
      cost: 0,
      responseTime
    };
    
    // Log the error
    await simpleLog({
      userId: 'unknown',
      sessionId: 'unknown',
      message: 'Assistant API Error',
      response: error.message,
      responseType: 'error',
      tokensUsed: 0,
      responseTime
    });
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 