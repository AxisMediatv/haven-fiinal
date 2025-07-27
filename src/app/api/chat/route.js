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

// Function to search the Google Sheets knowledge base
async function searchKnowledgeBase(userMessage) {
  try {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1zw3n2BUdnNM0pAcxPq7A39HqE0BC8_g2jtjYyV2GD6U/export?format=csv&gid=0';
    
    const response = await fetch(sheetUrl);
    const csvData = await response.text();
    
    // Better CSV parsing
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    const keywords = userMessage.toLowerCase();
    let bestMatch = '';
    
    // Search through each row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Simple search - if user message contains "price" or "cost" or "plan"
      if (keywords.includes('price') || keywords.includes('cost') || keywords.includes('plan') || keywords.includes('pricing')) {
        if (line.toLowerCase().includes('price') || line.toLowerCase().includes('plan') || line.toLowerCase().includes('cost')) {
          // Extract the content (assuming it's in column 3, index 2)
          const columns = line.split(',');
          if (columns.length >= 3) {
            bestMatch = columns[2]; // Content column
            break;
          }
        }
      }
      
      // General keyword search
      if (line.toLowerCase().includes(keywords)) {
        const columns = line.split(',');
        if (columns.length >= 3) {
          bestMatch = columns[2]; // Content column
          break;
        }
      }
    }
    
    return bestMatch || null;
  } catch (error) {
    console.error('Knowledge base search error:', error);
    return null;
  }
}
