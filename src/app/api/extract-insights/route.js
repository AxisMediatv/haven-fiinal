import { NextResponse } from 'next/server';

// Function to analyze conversation patterns and extract insights
function analyzeConversations(conversations) {
  const insights = {
    growthPatterns: [],
    strengthDiscoveries: [],
    nextGrowthEdges: [],
    moodTrends: [],
    topicsOfInterest: [],
    emotionalPatterns: []
  };

  if (!conversations || conversations.length === 0) {
    return {
      insights: {
        growthPatterns: ["Start your journey with Haven to discover your growth patterns"],
        strengthDiscoveries: ["Your strengths will emerge as you engage with Haven"],
        nextGrowthEdges: ["Begin conversations to identify your next growth opportunities"]
      },
      hasData: false
    };
  }

  // Analyze conversation content
  const allMessages = conversations.flatMap(conv => conv.messages || []);
  const userMessages = allMessages.filter(msg => msg.role === 'user').map(msg => msg.content.toLowerCase());
  
  // Extract topics and themes
  const topics = {
    career: ['work', 'job', 'career', 'professional', 'boss', 'colleague', 'office'],
    relationships: ['friend', 'partner', 'family', 'relationship', 'dating', 'marriage'],
    emotions: ['feel', 'emotion', 'sad', 'happy', 'angry', 'anxious', 'stressed'],
    growth: ['learn', 'grow', 'improve', 'better', 'change', 'progress'],
    challenges: ['problem', 'difficult', 'struggle', 'hard', 'challenge', 'issue'],
    goals: ['goal', 'want', 'achieve', 'dream', 'aspire', 'plan']
  };

  const topicCounts = {};
  Object.keys(topics).forEach(topic => {
    topicCounts[topic] = 0;
    topics[topic].forEach(keyword => {
      userMessages.forEach(message => {
        if (message.includes(keyword)) {
          topicCounts[topic]++;
        }
      });
    });
  });

  // Identify dominant topics
  const dominantTopics = Object.entries(topicCounts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);

  // Generate insights based on patterns
  if (dominantTopics.includes('career')) {
    insights.growthPatterns.push("You show the most breakthrough moments when discussing career challenges");
  }
  
  if (dominantTopics.includes('relationships')) {
    insights.strengthDiscoveries.push("You demonstrate strong emotional awareness in relationship conversations");
  }
  
  if (dominantTopics.includes('emotions')) {
    insights.strengthDiscoveries.push("You consistently show self-reflection and emotional intelligence");
  }

  // Calculate conversation frequency and engagement
  const recentConversations = conversations.filter(conv => {
    const convDate = new Date(conv.timestamp || conv.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return convDate > weekAgo;
  });

  if (recentConversations.length > 3) {
    insights.growthPatterns.push("Your engagement has increased significantly over the past week");
  }

  // Identify emotional patterns
  const emotionalKeywords = {
    positive: ['happy', 'excited', 'confident', 'proud', 'grateful', 'peaceful'],
    challenging: ['sad', 'anxious', 'stressed', 'frustrated', 'overwhelmed', 'worried'],
    growth: ['learning', 'growing', 'improving', 'progressing', 'developing']
  };

  const emotionalCounts = {};
  Object.keys(emotionalKeywords).forEach(emotion => {
    emotionalCounts[emotion] = 0;
    emotionalKeywords[emotion].forEach(keyword => {
      userMessages.forEach(message => {
        if (message.includes(keyword)) {
          emotionalCounts[emotion]++;
        }
      });
    });
  });

  // Generate emotional insights
  if (emotionalCounts.positive > emotionalCounts.challenging) {
    insights.moodTrends.push("You've been expressing more positive emotions recently");
  } else if (emotionalCounts.challenging > emotionalCounts.positive) {
    insights.nextGrowthEdges.push("Consider exploring self-compassion practices to support your emotional well-being");
  }

  if (emotionalCounts.growth > 0) {
    insights.growthPatterns.push("You consistently demonstrate a growth mindset in your conversations");
  }

  // Add default insights if none were generated
  if (insights.growthPatterns.length === 0) {
    insights.growthPatterns.push("Your conversations show a natural curiosity and willingness to explore");
  }
  
  if (insights.strengthDiscoveries.length === 0) {
    insights.strengthDiscoveries.push("You demonstrate resilience and self-awareness in your interactions");
  }
  
  if (insights.nextGrowthEdges.length === 0) {
    insights.nextGrowthEdges.push("Based on your conversations, exploring boundary-setting could unlock your next level of growth");
  }

  return {
    insights,
    hasData: true,
    conversationCount: conversations.length,
    dominantTopics,
    emotionalPatterns: emotionalCounts
  };
}

export async function POST(request) {
  try {
    const { userId, conversationHistory = [], pageType = 'journal' } = await request.json();
    
    console.log(`🔍 Extracting insights for user: ${userId}`);
    console.log(`   Page type: ${pageType}`);
    console.log(`   Conversation count: ${conversationHistory.length}`);

    // Analyze the conversation history
    const analysis = analyzeConversations(conversationHistory);
    
    // Customize insights based on page type
    if (pageType === 'adding') {
      // Modify insights for the adding page
      analysis.insights.growthPatterns = analysis.insights.growthPatterns.map(insight => 
        insight.replace('discussing', 'adding').replace('conversations', 'additions')
      );
      analysis.insights.strengthDiscoveries = analysis.insights.strengthDiscoveries.map(insight => 
        insight.replace('conversations', 'learning experiences')
      );
      analysis.insights.nextGrowthEdges = analysis.insights.nextGrowthEdges.map(insight => 
        insight.replace('boundary-setting', 'new skill development')
      );
    }

    return NextResponse.json({
      success: true,
      insights: analysis.insights,
      hasData: analysis.hasData,
      conversationCount: analysis.conversationCount,
      dominantTopics: analysis.dominantTopics,
      emotionalPatterns: analysis.emotionalPatterns
    });

  } catch (error) {
    console.error('Error extracting insights:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to extract insights',
      insights: {
        growthPatterns: ["Start your journey to discover insights"],
        strengthDiscoveries: ["Your strengths will emerge as you engage"],
        nextGrowthEdges: ["Begin conversations to identify opportunities"]
      }
    }, { status: 500 });
  }
} 