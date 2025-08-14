import { NextResponse } from 'next/server';

// Function to fetch and parse CSV from Google Sheets
async function fetchKnowledgeBase() {
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/1zw3n2BUdnNM0pAcxPq7A39HqE0BC8_g2jtjYyV2GD6U/export?format=csv&gid=0';
  
  try {
    console.log('Fetching knowledge base from Google Sheets...');
    const response = await fetch(sheetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log('CSV data fetched successfully, length:', csvText.length);
    
    return parseCSV(csvText);
    
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    throw error;
  }
}

// Robust CSV parsing function
function parseCSV(csvText) {
  try {
    // Split into lines and filter out empty lines
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    // Parse headers (first line)
    const headers = parseCSVLine(lines[0]);
    console.log('CSV headers:', headers);
    
    // Parse data rows
    const rows = lines.slice(1).map((line, index) => {
      const values = parseCSVLine(line);
      const row = {};
      
      headers.forEach((header, colIndex) => {
        row[header] = values[colIndex] || '';
      });
      
      return row;
    });
    
    console.log(`Successfully parsed ${rows.length} rows from knowledge base`);
    return { headers, rows };
    
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
}

// Handle CSV parsing with proper quote handling
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result.map(field => field.replace(/^"|"$/g, '')); // Remove surrounding quotes
}

// Enhanced search function that searches ALL text in the CSV
function searchKnowledgeBase(rows, query) {
  if (!rows || rows.length === 0) {
    console.log('No knowledge base rows to search');
    return [];
  }
  
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(' ').filter(word => word.length > 2);
  
  console.log(`Searching knowledge base for: "${query}"`);
  console.log(`Query words: ${queryWords.join(', ')}`);
  
  // Enhanced search with multiple strategies
  const relevantRows = rows.filter(row => {
    // Combine all text from the row into a single searchable string
    const rowText = Object.values(row).join(' ').toLowerCase();
    
    // Strategy 1: Exact phrase match
    if (rowText.includes(queryLower)) {
      console.log('Found exact phrase match');
      return true;
    }
    
    // Strategy 2: All query words must be present (for multi-word queries)
    if (queryWords.length > 1) {
      const allWordsPresent = queryWords.every(word => rowText.includes(word));
      if (allWordsPresent) {
        console.log('Found all words match');
        return true;
      }
    }
    
    // Strategy 3: Any query word present (for single words or partial matches)
    const anyWordPresent = queryWords.some(word => rowText.includes(word));
    if (anyWordPresent) {
      console.log('Found partial word match');
      return true;
    }
    
    return false;
  });
  
  console.log(`Found ${relevantRows.length} relevant entries`);
  return relevantRows;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'trauma';
    
    console.log('Testing knowledge base search for query:', query);
    
    const { rows } = await fetchKnowledgeBase();
    const relevantRows = searchKnowledgeBase(rows, query);
    
    return NextResponse.json({
      success: true,
      query: query,
      totalRows: rows.length,
      foundRows: relevantRows.length,
      sampleResults: relevantRows.slice(0, 3), // Show first 3 results
      headers: Object.keys(rows[0] || {})
    });
    
  } catch (error) {
    console.error('Test knowledge base error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 