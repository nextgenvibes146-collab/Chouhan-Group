# Automatic Lead Integration Setup Guide

This guide explains how to set up automatic lead generation from multiple sources and save them to Google Sheets.

## Overview

The CRM can now automatically:
- ✅ Receive leads from multiple Chouhan Group websites
- ✅ Receive leads from Facebook Lead Ads
- ✅ Receive leads from Instagram Lead Ads
- ✅ Receive leads from IVR systems
- ✅ Automatically create leads in the CRM
- ✅ Automatically save leads to Google Sheets
- ✅ Show notifications when new leads arrive

## Architecture

### Two Methods Available:

1. **Webhooks (Recommended)** - Real-time lead capture
   - External systems POST leads directly to your webhook endpoint
   - Instant lead creation
   - Best for production

2. **Polling** - Periodic checking for new leads
   - CRM periodically checks for new leads
   - Configurable intervals (default: 15 minutes)
   - Good backup or when webhooks aren't available

## Setup Instructions

### Step 1: Environment Variables

Add these to your `.env.local` file:

```env
# Google Sheets (for saving leads)
VITE_USE_GOOGLE_SHEETS=true
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id
VITE_GOOGLE_SHEETS_API_KEY=your_api_key
VITE_GOOGLE_SHEETS_ACCESS_TOKEN=your_oauth_token  # For writing

# Facebook Lead Ads (optional)
VITE_FACEBOOK_ACCESS_TOKEN=your_facebook_token
VITE_FACEBOOK_FORM_ID=your_form_id

# Instagram Lead Ads (optional)
VITE_INSTAGRAM_ACCESS_TOKEN=your_instagram_token
VITE_INSTAGRAM_FORM_ID=your_form_id
```

### Step 2: Website Integration

#### For Each Chouhan Group Website:

Add this JavaScript code to your website's form submission handler:

```javascript
// Example: Contact form submission
async function handleFormSubmit(formData) {
  // Your existing form handling code...
  
  // Send lead to CRM
  const webhookUrl = 'https://your-crm-domain.com/api/webhooks/website';
  
  const payload = {
    sourceUrl: 'chouhangroup.com', // Your website domain
    customerName: formData.name,
    mobile: formData.phone,
    email: formData.email,
    city: formData.city,
    interestedProject: formData.project,
    interestedUnit: formData.propertyType,
    investmentTimeline: formData.timeline,
    remarks: formData.message || 'Website form submission',
    formId: 'contact-form',
    pageUrl: window.location.href,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_WEBHOOK_SECRET' // Optional security
      },
      body: JSON.stringify(payload),
    });
    
    if (response.ok) {
      console.log('Lead sent to CRM successfully');
    }
  } catch (error) {
    console.error('Failed to send lead to CRM:', error);
    // Don't block form submission if CRM is down
  }
}
```

#### Example for WordPress:

```php
// Add to functions.php or a custom plugin
add_action('wpcf7_mail_sent', 'send_lead_to_crm');
function send_lead_to_crm($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    $posted_data = $submission->get_posted_data();
    
    $payload = array(
        'sourceUrl' => $_SERVER['HTTP_HOST'],
        'customerName' => $posted_data['your-name'],
        'mobile' => $posted_data['your-phone'],
        'email' => $posted_data['your-email'],
        'city' => $posted_data['your-city'],
        'interestedProject' => $posted_data['project'],
        'remarks' => $posted_data['your-message'],
    );
    
    wp_remote_post('https://your-crm-domain.com/api/webhooks/website', array(
        'body' => json_encode($payload),
        'headers' => array('Content-Type' => 'application/json'),
        'timeout' => 5,
    ));
}
```

### Step 3: Facebook Lead Ads Integration

#### Option A: Webhook (Recommended)

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create or select your app
3. Add "Lead Ads" product
4. Go to Webhooks settings
5. Add webhook URL: `https://your-crm-domain.com/api/webhooks/facebook`
6. Subscribe to `leadgen` events
7. Set verify token (store in environment variable)
8. Facebook will send leads in real-time

#### Option B: Polling

1. Get Facebook Access Token:
   - Go to Graph API Explorer
   - Select your app
   - Get token with `leads_retrieval` permission
   - Add to `VITE_FACEBOOK_ACCESS_TOKEN`

2. Get Form ID:
   - Go to Facebook Ads Manager
   - Find your Lead Ad form
   - Copy the Form ID
   - Add to `VITE_FACEBOOK_FORM_ID`

3. The CRM will automatically poll every 15 minutes

### Step 4: Instagram Lead Ads Integration

Instagram uses the same system as Facebook (Meta platform):

1. Follow the same steps as Facebook
2. Use Instagram form IDs instead
3. Set `VITE_INSTAGRAM_ACCESS_TOKEN` and `VITE_INSTAGRAM_FORM_ID`
4. Leads will be marked with source "Instagram"

### Step 5: IVR Integration

Configure your IVR system to send webhooks:

```json
POST https://your-crm-domain.com/api/webhooks/ivr
Content-Type: application/json

{
  "callerNumber": "+919876543210",
  "callerName": "John Doe",
  "callTimestamp": "2024-10-20T10:30:00Z",
  "callDuration": 120,
  "responses": {
    "name": "John Doe",
    "email": "john@example.com",
    "city": "Raipur",
    "project": "Singapour P4",
    "unit": "3BHK",
    "timeline": "Within 3 months"
  },
  "ivrSystemId": "ivr-001",
  "campaignId": "campaign-123"
}
```

## Webhook Endpoints

You'll need to create these API endpoints (backend/serverless functions):

### 1. Website Webhook
```
POST /api/webhooks/website
Body: WebsiteFormData
```

### 2. Facebook Webhook
```
GET /api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=CHALLENGE
POST /api/webhooks/facebook
Body: FacebookLeadData
```

### 3. Instagram Webhook
```
GET /api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=CHALLENGE
POST /api/webhooks/instagram
Body: InstagramLeadData (same as Facebook)
```

### 4. IVR Webhook
```
POST /api/webhooks/ivr
Body: IVRLeadData
```

## Example Backend Implementation

### Using Vercel Serverless Functions:

Create `api/webhooks/website.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleWebsiteWebhook } from '../../services/websiteIntegration';
import { handleWebhookLead } from '../../services/leadIngestionService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook secret (optional but recommended)
    const secret = req.headers['x-webhook-secret'];
    if (secret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const websiteLeads = await handleWebsiteWebhook(req.body);
    
    // Get users (you'll need to fetch from your database)
    const users = await getUsers();
    const accessToken = process.env.GOOGLE_SHEETS_ACCESS_TOKEN;
    
    const processedLeads = await handleWebhookLead(websiteLeads, users, accessToken);
    
    // Store in database or trigger frontend update
    await saveLeadsToDatabase(processedLeads);
    
    return res.status(200).json({ 
      success: true, 
      leadsProcessed: processedLeads.length 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Testing

### Test Website Integration:

```bash
curl -X POST https://your-crm-domain.com/api/webhooks/website \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -d '{
    "sourceUrl": "test.chouhangroup.com",
    "customerName": "Test User",
    "mobile": "9876543210",
    "email": "test@example.com",
    "city": "Raipur",
    "interestedProject": "Singapour P4",
    "remarks": "Test lead"
  }'
```

### Test Facebook Webhook:

Use Facebook's webhook testing tool in the Developer Console.

## Security

1. **Webhook Secrets**: Always use authentication tokens
2. **HTTPS Only**: Never use HTTP for webhooks
3. **Rate Limiting**: Implement rate limiting on webhook endpoints
4. **IP Whitelisting**: Whitelist Facebook/Meta IPs for their webhooks
5. **Token Rotation**: Regularly rotate access tokens

## Monitoring

The CRM will:
- Show notifications when new leads arrive
- Log errors to console
- Automatically retry failed Google Sheets saves
- Continue working even if one source fails

## Troubleshooting

### Leads not appearing:
1. Check webhook endpoint is accessible
2. Verify environment variables are set
3. Check browser console for errors
4. Verify Google Sheets permissions

### Google Sheets not saving:
1. Check OAuth token is valid
2. Verify spreadsheet ID is correct
3. Check API quotas haven't been exceeded

### Polling not working:
1. Verify access tokens are valid
2. Check form IDs are correct
3. Ensure polling is enabled in config

## Next Steps

1. Set up webhook endpoints (backend/serverless)
2. Configure each website to send leads
3. Set up Facebook/Instagram Lead Ads
4. Configure IVR system
5. Test each integration
6. Monitor lead flow

For questions, refer to:
- [Facebook Lead Ads API](https://developers.facebook.com/docs/marketing-api/leadgen)
- [Google Sheets API](https://developers.google.com/sheets/api)


