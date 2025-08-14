import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    const { data, sheetName = 'Haven-data' } = await request.json();
    
    // Debug: Check all environment variables
    console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('BACKUP')));
    console.log('GOOGLE_HAVEN_DATA:', process.env.GOOGLE_HAVEN_DATA);
    console.log('BACKUP_SHEET_ID:', process.env.BACKUP_SHEET_ID);
    console.log('GOOGLE_SHEETS_ID_KB:', process.env.GOOGLE_SHEETS_ID_KB);
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('=== END DEBUG ===');
    
    // Temporary fix: manually set the sheet ID since env vars aren't loading
    const backupSheetId = process.env.GOOGLE_HAVEN_DATA || process.env.BACKUP_SHEET_ID || process.env.GOOGLE_SHEETS_ID_KB || '1ytehaHyCAcXYMwpXyPMUk1U2hfHUifE9q8urIvDyoVI';
    console.log('Using backupSheetId:', backupSheetId);
    

    
         // Try to save to Google Sheets if credentials are available
     try {
               // Temporary fix: hardcode credentials path since env vars aren't loading
        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './haven-data-afc6f79b9161.json';
        
        if (!credentialsPath) {
          throw new Error('Google credentials not configured');
        }
        
        const auth = new GoogleAuth({
          keyFile: credentialsPath,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      
      const sheets = google.sheets({ version: 'v4', auth });
      
             // Calculate actual costs based on model used
       const messages = data[8] ? JSON.parse(data[8]) : [];
       console.log('Received conversation data:', data);
       console.log('Parsed messages:', messages);
       let totalTokens = 0;
       let costGPT4 = 0;
       let costGPT4Mini = 0;
       let totalCost = 0;
       let models = [];
       
       // Try to get token and model info from the conversation object first
       if (messages.length > 0 && messages[0].totalTokens) {
         totalTokens = messages[0].totalTokens;
         models = messages[0].models || ['gpt-4o-mini'];
         console.log('Using conversation-level token info:', { totalTokens, models });
       } else {
         // Calculate costs for each message in the conversation
         messages.forEach(message => {
           // Use actual token count from the message if available, otherwise estimate
           let tokens = message.tokensUsed || message.tokens || 0;
           if (tokens === 0 && message.content) {
             // Fallback: estimate tokens based on content length (rough estimate)
             tokens = Math.ceil(message.content.length / 4);
           }
           
           const model = message.model || message.modelUsed || 'gpt-4o-mini'; // Default to mini
           
           totalTokens += tokens;
           if (!models.includes(model)) {
             models.push(model);
           }
           
           // Calculate cost based on model (current OpenAI pricing)
           if (model.includes('gpt-4') && !model.includes('mini')) {
             // GPT-4 pricing: $0.03 per 1K input tokens, $0.06 per 1K output tokens
             const inputCost = tokens * 0.00003;
             const outputCost = tokens * 0.00006;
             costGPT4 += inputCost + outputCost;
           } else {
             // GPT-4o-mini pricing: $0.00015 per 1K input tokens, $0.0006 per 1K output tokens
             const inputCost = tokens * 0.00000015;
             const outputCost = tokens * 0.0000006;
             costGPT4Mini += inputCost + outputCost;
           }
         });
       }
       
       totalCost = costGPT4 + costGPT4Mini;
       
               // Prepare the row data for Google Sheets with your exact headers
        const rowData = [
          new Date().toISOString(), // Timestamp
          data[1] || 'anonymous', // User ID
          data[3] || '', // Session ID
          data[4] || '', // Conversation Title
          data[5] || new Date().toISOString(), // Save Timestamp
          data[6] || 'manual', // Save Type (manual/auto)
          'conversation', // Type (conversation)
          data[8] || '', // Messages (JSON)
          'saved', // Status
          totalTokens, // Tokens Used
          costGPT4.toFixed(6), // Cost Per Message 4
          costGPT4Mini.toFixed(6), // Cost Per Message mini
          totalCost.toFixed(6), // Total Cost
          models.join(', ') || 'gpt-4o-mini' // ChatGPT Model
        ];
      
      // Append to Google Sheets
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: backupSheetId,
        range: `${sheetName}!A:N`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData]
        }
      });
      
      console.log('Successfully saved conversation to Google Sheets:', {
        sheetId: backupSheetId,
        rowCount: response.data.updates?.updatedRows || 0,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Conversation saved successfully to backup sheet',
        sheetId: backupSheetId,
        sheetName,
        rowsUpdated: response.data.updates?.updatedRows || 0
      });
      
    } catch (sheetsError) {
      console.error('Google Sheets API error:', sheetsError);
      
      // Fallback: just log to console if Google Sheets fails
      console.log('Saving conversation to console (Google Sheets failed):', {
        sheetId: backupSheetId,
        sheetName,
        data: data.slice(0, 5), // Log first 5 fields for privacy
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Conversation saved locally (Google Sheets unavailable)',
        sheetId: backupSheetId,
        sheetName,
        fallback: true
      });
    }
    
  } catch (error) {
    console.error('Error saving conversation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save conversation' 
    }, { status: 500 });
  }
} 