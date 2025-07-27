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

// Function to search Google Sheets using proper API
async function searchKnowledgeBase(userMessage) {
  try {
    const { GoogleAuth } = require('google-auth-library');
    const { google } = require('googleapis');
    
    // Set up authentication
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/spreadsheets/readonly'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1zw3n2BUdnNM0pAcxPq7A39HqE0BC8_g2jtjYyV2GD6U';
    
    // Search KB sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'KB!A:M', // All columns A through M
    });
    
    const rows = response.data.values;
    if (!rows || rows.length < 2) return null;
    
    const keywords = userMessage.toLowerCase();
    let bestMatch = '';
    let bestScore = 0;
    
    // Search through rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 3) continue;
      
      const category = row[0] || '';
      const title = row[1] || '';
      const content = row[2] || '';
      const rowKeywords = row[3] || '';
      
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
        if (word.length > 2) {
          if (content.toLowerCase().includes(word)) score += 3;
          if (rowKeywords.toLowerCase().includes(word)) score += 5;
          if (category.toLowerCase().includes(word)) score += 2;
          if (title.toLowerCase().includes(word)) score += 4;
        }
      }
      
      if (score > bestScore && score > 0) {
        bestScore = score;
        bestMatch = content;
      }
    }
    
    return bestMatch || null;
  } catch (error) {
    console.error('Google Sheets API error:', error);
    return null;
  }
}
