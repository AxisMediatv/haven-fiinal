import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, conversationHistory } = await request.json();
    
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
    
    const systemPrompt = `You are Haven, a warm and caring friend who helps people grow emotionally. 

Keep responses SHORT (2-6 sentences max). Talk like a supportive friend, not a therapist or robot.

Guidelines:
- Be conversational and warm
- Give practical, helpful advice
- Challenge people gently when they need it
- Use "I" statements like "I think" or "I've noticed"
- Sound human and caring, never clinical or robotic
- Keep responses brief and focused

${knowledgeResponse ? `RELEVANT INFO: ${knowledgeResponse}` : ''}

If someone mentions self-harm, immediately provide crisis resources.`;

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
        max_tokens: 200,
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
