// Google Sheets Knowledge Base Utility
// Handles fetching and searching the knowledge base from Google Sheets

export async function fetchKnowledgeBase() {
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/1zw3n2BUdnNM0pAcxPq7A39HqE0BC8_g2jtjYyV2GD6U/export?format=csv&gid=0';
  
  try {
    console.log('Fetching knowledge base from Google Sheets...');
    const response = await fetch(sheetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
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

function parseCSVLine(line) {
  // Handle CSV parsing with proper quote handling
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

export function searchKnowledgeBase(rows, query) {
  if (!rows || rows.length === 0) {
    console.log('No knowledge base rows to search');
    return [];
  }
  
  const queryLower = query.toLowerCase();
  console.log(`Searching knowledge base for: "${query}"`);
  
  // Simple keyword-based search
  const relevantRows = rows.filter(row => {
    return Object.values(row).some(value => {
      if (!value || typeof value !== 'string') return false;
      return value.toLowerCase().includes(queryLower);
    });
  });
  
  console.log(`Found ${relevantRows.length} relevant entries`);
  return relevantRows;
}

export function formatKnowledgeContext(rows) {
  if (!rows || rows.length === 0) {
    return '';
  }
  
  const formattedEntries = rows.map(row => {
    const fields = Object.entries(row)
      .filter(([key, value]) => value && value.trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join(' | ');
    
    return `• ${fields}`;
  });
  
  return `\n\nRelevant Knowledge Base Information:\n${formattedEntries.join('\n')}`;
}

// Enhanced search with multiple strategies
export function advancedSearch(rows, query) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(' ').filter(word => word.length > 2);
  
  return rows.filter(row => {
    const rowText = Object.values(row).join(' ').toLowerCase();
    
    // Exact phrase match
    if (rowText.includes(queryLower)) {
      return true;
    }
    
    // Multiple word match (all words must be present)
    if (queryWords.length > 1) {
      return queryWords.every(word => rowText.includes(word));
    }
    
    // Single word match
    return queryWords.some(word => rowText.includes(word));
  });
} 