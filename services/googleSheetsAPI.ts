/**
 * Google Sheets API Integration Service
 * 
 * This service handles reading from and writing to Google Sheets.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Cloud Project at https://console.cloud.google.com
 * 2. Enable Google Sheets API
 * 3. Create credentials (Service Account or OAuth 2.0)
 * 4. For Service Account: Download JSON key file
 * 5. For OAuth: Set up OAuth consent screen
 * 6. Share your Google Sheet with the service account email (if using service account)
 * 7. Set environment variables:
 *    - GOOGLE_SHEETS_API_KEY (for API key method)
 *    - GOOGLE_SHEETS_SPREADSHEET_ID (your sheet ID from the URL)
 * 
 * Sheet Structure Expected:
 * Columns: S. No., Customer Name, Mobile, Email, City, Mode of Enquiry, 
 *          Project, Unit, Status, Sales Person, Lead Date, etc.
 */

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey?: string;
  accessToken?: string;
  serviceAccountKey?: string; // JSON string or path
}

// Helper to format date for Google Sheets (DD/MM/YYYY)
const formatDateForSheet = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper to parse date from Google Sheets (DD/MM/YYYY or DD.MM.YYYY)
const parseDateFromSheet = (dateStr: string | undefined): string | undefined => {
  if (!dateStr || typeof dateStr !== 'string') return undefined;
  const parts = dateStr.replace(/\./g, '/').split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const fullYear = parseInt(year, 10) > 2000 ? year : `20${year}`;
    const date = new Date(`${fullYear}-${month}-${day}`);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return undefined;
};

/**
 * Read data from Google Sheets using the Sheets API
 * This uses the public API with API key (read-only) or OAuth token
 */
export const readFromGoogleSheets = async (
  config: GoogleSheetsConfig,
  range: string = 'Sheet1!A:Z'
): Promise<any[][]> => {
  try {
    const { spreadsheetId, apiKey, accessToken } = config;
    
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    // Method 1: Using API Key (for public sheets or service account)
    if (apiKey) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to read from Google Sheets: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.values || [];
    }

    // Method 2: Using OAuth Access Token
    if (accessToken) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to read from Google Sheets: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.values || [];
    }

    throw new Error('Either API key or access token is required');
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    throw error;
  }
};

/**
 * Write data to Google Sheets
 * Requires OAuth token with write permissions
 */
export const writeToGoogleSheets = async (
  config: GoogleSheetsConfig,
  range: string,
  values: any[][],
  accessToken: string
): Promise<void> => {
  try {
    const { spreadsheetId } = config;
    
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    if (!accessToken) {
      throw new Error('Access token is required for writing to Google Sheets');
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: values,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to write to Google Sheets: ${errorData.error?.message || response.statusText}`);
    }
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    throw error;
  }
};

/**
 * Append a new row to Google Sheets
 */
export const appendToGoogleSheets = async (
  config: GoogleSheetsConfig,
  range: string,
  values: any[],
  accessToken: string
): Promise<void> => {
  try {
    const { spreadsheetId } = config;
    
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    if (!accessToken) {
      throw new Error('Access token is required for writing to Google Sheets');
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [values],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to append to Google Sheets: ${errorData.error?.message || response.statusText}`);
    }
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    throw error;
  }
};

/**
 * Convert Lead data to Google Sheets row format
 */
export const leadToSheetRow = (lead: any, users: any[]): any[] => {
  const salesperson = users.find(u => u.id === lead.assignedSalespersonId);
  const salespersonName = salesperson?.name || '';
  
  return [
    '', // S. No. (auto-increment)
    lead.customerName || '',
    lead.mobile || '',
    lead.email || '',
    lead.city || '',
    lead.modeOfEnquiry || '',
    lead.interestedProject || '',
    lead.interestedUnit || '',
    lead.status || 'New',
    salespersonName,
    formatDateForSheet(lead.leadDate || new Date()),
    formatDateForSheet(lead.lastActivityDate || new Date()),
    lead.temperature || '',
    lead.visitStatus || 'No',
    lead.visitDate ? formatDateForSheet(lead.visitDate) : '',
    lead.nextFollowUpDate ? formatDateForSheet(lead.nextFollowUpDate) : '',
    lead.lastRemark || '',
    lead.bookingStatus || '',
    lead.investmentTimeline || '',
    lead.occupation || '',
  ];
};

/**
 * Convert Google Sheets row to Lead data format
 */
export const sheetRowToLead = (row: any[], headers: string[], users: any[]): any => {
  const rowData: { [key: string]: any } = {};
  headers.forEach((header, index) => {
    rowData[header] = row[index] || '';
  });

  const salespersonName = (rowData['Sales Person'] || '').toLowerCase();
  const salesperson = users.find(u => u.name.toLowerCase() === salespersonName);
  const assignedSalespersonId = salesperson?.id || users[1]?.id || '';

  return {
    customerName: rowData['Customer Name'] || '',
    mobile: String(rowData['Mobile'] || ''),
    email: rowData['Email'] || '',
    city: rowData['City'] || '',
    modeOfEnquiry: rowData['Mode of Enquiry'] || 'Digital',
    interestedProject: rowData['Project'] || '',
    interestedUnit: rowData['Unit'] || '',
    status: rowData['Status'] || 'New',
    assignedSalespersonId,
    leadDate: parseDateFromSheet(rowData['Lead Date']) || new Date().toISOString(),
    lastActivityDate: parseDateFromSheet(rowData['Remark Date']) || new Date().toISOString(),
    temperature: rowData['Status H/W/C'] || undefined,
    visitStatus: rowData['Visit YES/No']?.toLowerCase() === 'yes' ? 'Yes' : 'No',
    visitDate: rowData['Visit Date'] || undefined,
    nextFollowUpDate: parseDateFromSheet(rowData['Date']) || undefined,
    lastRemark: rowData['Followup'] || rowData['Visit Remark'] || 'New lead created.',
    bookingStatus: rowData['Booking Status'] || '',
    investmentTimeline: rowData['Investment Timeline'] || '',
    occupation: rowData['Occupation'] || '',
  };
};

export { formatDateForSheet, parseDateFromSheet };


