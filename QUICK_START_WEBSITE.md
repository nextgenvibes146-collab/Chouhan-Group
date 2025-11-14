# Quick Start: Website Lead Integration
## For: chouhan-park-view-xi.vercel.app

## 🚀 3-Step Setup

### Step 1: Deploy Webhook (5 minutes)

1. Deploy your CRM to Vercel (or your hosting platform)
2. The webhook will be at: `https://your-crm-domain.vercel.app/api/webhook-website`
3. Copy this URL - you'll need it in Step 2

### Step 2: Add Code to Website (10 minutes)

Add this to your website's form submission:

```javascript
// Replace YOUR_WEBHOOK_URL with your actual webhook URL from Step 1
const WEBHOOK_URL = 'https://your-crm-domain.vercel.app/api/webhook-website';

// Add this function to your form submit handler
async function sendToCRM(formData) {
  const leadData = {
    customerName: formData.name || formData.customerName,
    mobile: formData.mobile || formData.phone,
    email: formData.email,
    city: formData.city,
    interestedProject: formData.project,
    propertyType: formData.propertyType,
    investmentTimeline: formData.timeline,
    remarks: formData.message,
    sourceUrl: 'chouhan-park-view-xi.vercel.app',
    pageUrl: window.location.href,
  };

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });
  } catch (error) {
    console.error('CRM error:', error);
  }
}
```

### Step 3: Test (2 minutes)

1. Fill out your website form
2. Submit it
3. Check your CRM - lead should appear automatically!

## ✅ That's it!

Leads will now:
- ✅ Automatically appear in CRM
- ✅ Automatically save to Google Sheets
- ✅ Show source as "Website"
- ✅ Be assigned to default salesperson

## 📝 Form Field Names

Make sure your form has these fields (or adjust the mapping):

- **Name**: `name`, `customerName`, or `fullName`
- **Mobile**: `mobile` or `phone` (required)
- **Email**: `email` (optional)
- **City**: `city` (optional)
- **Project**: `project` (optional)
- **Property Type**: `propertyType` (optional)
- **Message**: `message` or `remarks` (optional)

## 🔧 Troubleshooting

**Lead not appearing?**
- Check browser console for errors
- Verify webhook URL is correct
- Make sure name and mobile fields are being sent

**Need help?**
- See `WEBSITE_INTEGRATION_SETUP.md` for detailed instructions
- Check `website-integration-code.js` for more examples


