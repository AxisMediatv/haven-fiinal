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

// Function to search all Google Sheets tabs
async function searchKnowledgeBase(userMessage) {
  try {
    const baseUrl = 'https://docs.google.com/spreadsheets/d/1zw3n2BUdnNM0pAcxPq7A39HqE0BC8_g2jtjYyV2GD6U/export?format=csv';
    
    // Sheet IDs for each tab (we'll get these automatically)
    const sheets = ['KB', 'Info', 'Journal'];
    const keywords = userMessage.toLowerCase();
    let bestMatch = '';
    let bestScore = 0;
    
    // Search each sheet
    for (const sheetName of sheets) {
      try {
        const sheetUrl = `${baseUrl}&gid=0`; // We'll search main sheet first
        const response = await fetch(sheetUrl);
        const csvData = await response.text();
        
        const lines = csvData.split('\n');
        if (lines.length < 2) continue; // Skip if no data
        
        // Search through each row (skip header row 1)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          
          const columns = line.split(',');
          if (columns.length < 3) continue;
          
          const content = columns[2] || ''; // Content column
          const rowKeywords = columns[3] || ''; // Keywords column
          const category = columns[0] || ''; // Category column
          
          let score = 0;
          
          // Pricing search
          if (keywords.includes('price') || keywords.includes('cost') || keywords.includes('plan') || keywords.includes('pricing')) {
            if (content.toLowerCase().includes('price') || 
                content.toLowerCase().includes('plan') || 
                content.toLowerCase().includes('cost') ||
                content.toLowerCase().includes('$') ||
                category.toLowerCase().includes('pricing')) {
              score += 10;
            }
          }
          
          // General keyword matching
          const messageWords = keywords.split(' ');
          for (const word of messageWords) {
            if (word.length > 2) { // Skip short words
              if (content.toLowerCase().includes(word)) score += 3;
              if (rowKeywords.toLowerCase().includes(word)) score += 5;
              if (category.toLowerCase().includes(word)) score += 2;
            }
          }
          
          // If this is our best match so far
          if (score > bestScore && score > 0) {
            bestScore = score;
            bestMatch = content;
          }
        }
      } catch (sheetError) {
        console.log(`Error searching sheet ${sheetName}:`, sheetError);
        continue;
      }
    }
    
    return bestMatch || null;
  } catch (error) {
    console.error('Knowledge base search error:', error);
    return null;
  }
}
