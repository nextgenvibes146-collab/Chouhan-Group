# Google Sheets Integration Setup Guide

This guide explains how to set up Google Sheets integration for the CRM to store and retrieve lead information.

## Overview

The CRM can now:
- ✅ Display lead source (Website, Facebook, Instagram, Walk-in, IVR) with visual badges
- ✅ Read leads from Google Sheets
- ✅ Write new leads to Google Sheets
- ✅ Track lead sources in the leads management page

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it (e.g., "CRM Leads Database")
4. Set up the header row in Row 1 with these columns:
   ```
   S. No. | Customer Name | Mobile | Email | City | Mode of Enquiry | 
   Project | Unit | Status | Sales Person | Lead Date | Remark Date | 
   Status H/W/C | Visit YES/No | Visit Date | Date | Followup | 
   Booking Status | Investment Timeline | Occupation
   ```
5. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - The `SPREADSHEET_ID` is the long string between `/d/` and `/edit`

## Step 2: Set Up Google Cloud Project

### Option A: Using API Key (Read-Only Access)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create an API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key
   - (Optional) Restrict the API key to Google Sheets API only
5. Make your Google Sheet publicly readable (for read-only access):
   - In Google Sheets, click "Share" button
   - Change access to "Anyone with the link" > "Viewer"
   - Click "Done"

### Option B: Using OAuth 2.0 (Read & Write Access)

1. Follow steps 1-3 from Option A
2. Configure OAuth Consent Screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" (unless you have Google Workspace)
   - Fill in required information
   - Add scopes: `https://www.googleapis.com/auth/spreadsheets`
   - Add test users (your email)
3. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs (e.g., `http://localhost:3000`)
   - Copy the Client ID and Client Secret

## Step 3: Configure Environment Variables

Create or update `.env.local` file in the project root:

```env
# Enable Google Sheets integration
VITE_USE_GOOGLE_SHEETS=true

# Your Google Sheet ID (from Step 1)
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id_here

# For read-only access (Option A)
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here

# For read/write access (Option B) - OAuth token will be obtained dynamically
# You'll need to implement OAuth flow in your app
```

## Step 4: Google Sheet Column Mapping

The system expects these columns in your Google Sheet:

| Column Name | Description | Example |
|------------|-------------|---------|
| S. No. | Serial number | 1, 2, 3... |
| Customer Name | Lead's name | John Doe |
| Mobile | Phone number | 9876543210 |
| Email | Email address | john@example.com |
| City | City name | Raipur |
| Mode of Enquiry | Lead source | Website, Facebook, Instagram, Walk-in, IVR, Call, Reference, Digital |
| Project | Interested project | Singapour P4 |
| Unit | Property type | Plot, Rowhouse |
| Status | Lead status | New, Contacted, Visit Scheduled, Visit Done, Negotiation, Booked, Cancelled |
| Sales Person | Assigned salesperson | Amit Naithani |
| Lead Date | Date when lead was created | 15/10/2024 |
| Remark Date | Last activity date | 20/10/2024 |
| Status H/W/C | Temperature | Hot, Warm, Cold |
| Visit YES/No | Visit status | Yes, No |
| Visit Date | Visit date | 25/10/2024 |
| Date | Next follow-up date | 30/10/2024 |
| Followup | Last remark/note | Called customer, interested in 3BHK |
| Booking Status | Booking status | Booked, Dropped |
| Investment Timeline | Timeline | Within 3 months |
| Occupation | Customer occupation | Engineer |

## Step 5: Lead Source Options

The CRM now supports these lead sources (displayed with visual badges):

- 🌐 **Website** - Leads from your website
- 📘 **Facebook** - Leads from Facebook ads/posts
- 📷 **Instagram** - Leads from Instagram ads/posts
- 🚶 **Walk-in** - Customers who visit your office
- 📞 **IVR** - Interactive Voice Response system
- ☎️ **Call** - Phone calls
- 👥 **Reference** - Referrals
- 💻 **Digital** - Other digital sources

## Step 6: Testing the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. The app will:
   - Try to read from Google Sheets if `VITE_USE_GOOGLE_SHEETS=true`
   - Fall back to mock data if Google Sheets is unavailable
   - Display lead sources with colored badges in the leads table

3. To write leads to Google Sheets:
   - You need OAuth 2.0 access token
   - Implement OAuth flow in your app (see implementation notes)
   - Call `saveLeadToGoogleSheets()` function when creating new leads

## Troubleshooting

### "Failed to read from Google Sheets"
- Check that your API key is correct
- Verify the Spreadsheet ID is correct
- Ensure Google Sheets API is enabled
- Check that the sheet is publicly readable (for API key method)

### "Access token required"
- Writing to Google Sheets requires OAuth 2.0
- Implement OAuth authentication flow
- Get access token with `https://www.googleapis.com/auth/spreadsheets` scope

### "No data found in Google Sheet"
- Verify your sheet has data
- Check that the first row contains headers
- Ensure column names match expected format

## Implementation Notes

### Reading from Google Sheets
The system automatically reads from Google Sheets when:
- `VITE_USE_GOOGLE_SHEETS=true`
- `VITE_GOOGLE_SHEETS_ID` is set
- `VITE_GOOGLE_SHEETS_API_KEY` is set (for read-only)

### Writing to Google Sheets
To enable writing:
1. Implement OAuth 2.0 flow
2. Get access token with write permissions
3. Call `saveLeadToGoogleSheets(lead, users, accessToken)` from `services/googleSheetService.ts`

### Example: Adding OAuth Flow
```typescript
// In your App.tsx or auth service
import { saveLeadToGoogleSheets } from './services/googleSheetService';

const handleAssignLead = async (newLeadData: NewLeadData) => {
  // ... create lead ...
  
  // Save to Google Sheets if OAuth token is available
  const accessToken = getOAuthToken(); // Your OAuth implementation
  if (accessToken) {
    try {
      await saveLeadToGoogleSheets(newLead, users, accessToken);
    } catch (error) {
      console.error('Failed to save to Google Sheets:', error);
    }
  }
};
```

## Security Notes

- ⚠️ **Never commit API keys or access tokens to version control**
- ✅ Use `.env.local` (already in `.gitignore`)
- ✅ Restrict API keys to specific APIs and domains
- ✅ Use OAuth 2.0 for production (more secure than API keys)
- ✅ Regularly rotate credentials

## Next Steps

1. Set up your Google Sheet with the required columns
2. Configure environment variables
3. Test reading from Google Sheets
4. (Optional) Implement OAuth for writing leads
5. Start tracking your leads with source information!

For questions or issues, refer to:
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com)


