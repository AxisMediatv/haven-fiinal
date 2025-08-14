// Analytics utility functions

// Simple in-memory analytics (in production, use a database)
let analytics = {
  totalRequests: 0,
  responseTypes: {
    crisis: 0,
    exercise: 0,
    business: 0,
    knowledge: 0,
    openai: 0,
    error: 0
  },
  totalTokensUsed: 0,
  totalResponseTime: 0,
  averageTokensPerRequest: 0,
  averageResponseTime: 0,
  costSavings: {
    crisisResponses: 0,
    exerciseResponses: 0,
    businessResponses: 0,
    knowledgeResponses: 0,
    estimatedTokensSaved: 0,
    estimatedCostSaved: 0
  }
};

// Function to update analytics (called from chat route)
export function updateAnalytics(responseData) {
  analytics.totalRequests++;
  analytics.responseTypes[responseData.responseType] = (analytics.responseTypes[responseData.responseType] || 0) + 1;
  analytics.totalTokensUsed += responseData.tokensUsed || 0;
  analytics.totalResponseTime += responseData.responseTime || 0;
  
  console.log('Analytics updated:', {
    totalRequests: analytics.totalRequests,
    responseType: responseData.responseType,
    tokensUsed: responseData.tokensUsed,
    responseTime: responseData.responseTime
  });
}

// Function to get analytics data
export function getAnalytics() {
  // Calculate averages
  if (analytics.totalRequests > 0) {
    analytics.averageTokensPerRequest = Math.round(analytics.totalTokensUsed / analytics.totalRequests);
    analytics.averageResponseTime = Math.round(analytics.totalResponseTime / analytics.totalRequests);
  }
  
  // Calculate cost savings (assuming $0.03 per 1K tokens for GPT-4)
  const estimatedTokensPerOpenAIResponse = 500; // Average tokens per OpenAI response
  const costPerToken = 0.00003; // $0.03 per 1K tokens
  
  analytics.costSavings.estimatedTokensSaved = 
    (analytics.responseTypes.crisis + analytics.responseTypes.exercise + analytics.responseTypes.business + analytics.responseTypes.knowledge) * estimatedTokensPerOpenAIResponse;
  
  analytics.costSavings.estimatedCostSaved = 
    analytics.costSavings.estimatedTokensSaved * costPerToken;
  
  return {
    analytics,
    summary: {
      totalRequests: analytics.totalRequests,
      openaiUsage: `${analytics.responseTypes.openai}/${analytics.totalRequests} (${Math.round(analytics.responseTypes.openai / analytics.totalRequests * 100)}%)`,
      costSavings: `$${analytics.costSavings.estimatedCostSaved.toFixed(2)}`,
      tokensSaved: analytics.costSavings.estimatedTokensSaved,
      averageResponseTime: `${analytics.averageResponseTime}ms`
    }
  };
} 