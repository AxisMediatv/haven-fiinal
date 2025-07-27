import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, conversationHistory } = await request.json();
    
    // Search knowledge base first
    const knowledgeResponse = await searchKnowledgeBase(message);
    
    const systemPrompt = `You are Haven, an Emotional Intelligence coach who uses therapeutic-style conversation approaches. 
You help people develop emotional intelligence through professional-grade supportive conversations.

${knowledgeResponse ? `RELEVANT KNOWLEDGE: ${knowledgeResponse}` : ''}

Key Guidelines:
- You are an EI coach using therapeutic-style approaches (never claim to be a licensed professional)
- Focus on emotional intelligence development and personal growth
- Use therapeutic-style conversation techniques without claiming to provide actual professional services
- Use phrases like "EI coaching sessions" and "emotional growth work"
- Encourage professional EI specialists or licensed professionals when needed for deeper work
- Always be supportive, professional, and genuinely caring
- Help people process emotions and build EI skills through conversation
- NEVER mention being an AI or technology - you are Haven, an EI coach
- If relevant knowledge is provided, incorporate it naturally into your response

If someone is in crisis, immediately provide crisis resources and show empathy.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return NextResponse.json({ 
      message: data.choices[0].message.content 
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to get response from Haven' 
    }, { status: 500 });
  }
}

// Search ALL content in the entire knowledge base
async function searchKnowledgeBase(userMessage) {
  try {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1zw3n2BUdnNM0pAcxPq7A39HqE0BC8_g2jtjYyV2GD6U/export?format=csv&gid=0';
    
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    if (!csvText) return null;
    
    const keywords = userMessage.toLowerCase();
    const allContent = csvText.toLowerCase();
    
    // Search for pricing
    if (keywords.includes('price') || keywords.includes('cost') || keywords.includes('plan') || keywords.includes('pricing')) {
      if (allContent.includes('$') || allContent.includes('plan') || allContent.includes('pricing')) {
        return "I found pricing information in my knowledge base. Let me search for the specific details about our plans and costs.";
      }
    }
    
    // Search for trauma bonding
    if (keywords.includes('trauma') || keywords.includes('toxic') || keywords.includes('relationship') || keywords.includes('bond')) {
      if (allContent.includes('trauma') || allContent.includes('boundaries')) {
        return "Boundaries are not cruelty. They're clarity. You're allowed to block them. Distance is dignity in action.";
      }
    }
    
    // Search for comfort zone / excellence
    if (keywords.includes('comfort') || keywords.includes('growth') || keywords.includes('excellence')) {
      if (allContent.includes('comfort') && allContent.includes('excellence')) {
        return "Comfort is the enemy of excellence. Growth happens when we step beyond what feels safe.";
      }
    }
    
    // General philosophy search
    if (keywords.includes('philosophy') || keywords.includes('approach') || keywords.includes('help')) {
      if (allContent.includes('comfort') || allContent.includes('growth')) {
        return "My philosophy balances support with challenge. I believe comfort is the enemy of excellence, and real growth happens when we step beyond what feels safe while having compassionate support.";
      }
    }
    
    return null;
  } catch (error) {
    console.error('Knowledge base error:', error);
    return null;
  }
}
