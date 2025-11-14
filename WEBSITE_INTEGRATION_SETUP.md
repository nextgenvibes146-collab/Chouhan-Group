# Website Lead Integration Setup
## For: https://chouhan-park-view-xi.vercel.app

This guide explains how to integrate your website with the CRM to automatically capture leads.

## Quick Setup

### Step 1: Deploy the Webhook API

1. **If using Vercel:**
   - The file `api/webhook-website.ts` is already created
   - Deploy your CRM to Vercel
   - The webhook will be available at: `https://your-crm-domain.vercel.app/api/webhook-website`

2. **If using another platform:**
   - Copy the code from `api/webhook-website.ts`
   - Adapt it to your platform (Netlify Functions, AWS Lambda, etc.)
   - Deploy and get the webhook URL

### Step 2: Add Code to Your Website

1. **Open your website project** (chouhan-park-view-xi.vercel.app)

2. **Copy the integration code:**
   - Open `website-integration-code.js`
   - Copy the `sendLeadToCRM` function

3. **Add to your form submission handler:**

#### For React/Next.js:

```javascript
// In your contact form component
import { sendLeadToCRM } from './utils/crm-integration';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = {
    customerName: form.name.value,
    mobile: form.mobile.value,
    email: form.email.value,
    city: form.city.value,
    interestedProject: form.project.value,
    propertyType: form.propertyType.value,
    investmentTimeline: form.timeline.value,
    remarks: form.message.value,
  };

  // Send to CRM
  await sendLeadToCRM(formData);
  
  // Your existing form submission...
};
```

#### For Vanilla JavaScript:

```html
<!-- Add this script to your HTML -->
<script>
  // Update this URL with your webhook URL
  const CRM_WEBHOOK_URL = 'https://your-crm-domain.vercel.app/api/webhook-website';
  
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form'); // Your form ID
    
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = {
        customerName: form.querySelector('[name="name"]').value,
        mobile: form.querySelector('[name="mobile"]').value,
        email: form.querySelector('[name="email"]').value,
        city: form.querySelector('[name="city"]').value,
        interestedProject: form.querySelector('[name="project"]').value,
        propertyType: form.querySelector('[name="propertyType"]').value,
        investmentTimeline: form.querySelector('[name="timeline"]').value,
        remarks: form.querySelector('[name="message"]').value,
        sourceUrl: 'chouhan-park-view-xi.vercel.app',
        pageUrl: window.location.href,
      };

      try {
        const response = await fetch(CRM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          alert('Thank you! We will contact you soon.');
          form.reset();
        }
      } catch (error) {
        console.error('Error sending lead:', error);
        // Still allow form submission even if CRM fails
      }
      
      // Your existing form submission logic...
    });
  });
</script>
```

### Step 3: Configure Environment Variables

In your CRM project, add to `.env.local`:

```env
# Google Sheets (for saving leads)
VITE_USE_GOOGLE_SHEETS=true
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id
VITE_GOOGLE_SHEETS_API_KEY=your_api_key
VITE_GOOGLE_SHEETS_ACCESS_TOKEN=your_oauth_token

# Webhook Security (optional but recommended)
WEBHOOK_SECRET=your_secret_token_here
```

### Step 4: Test the Integration

1. **Test from your website:**
   - Fill out the contact form
   - Submit it
   - Check the browser console for any errors
   - Check your CRM - the lead should appear automatically

2. **Test the webhook directly:**

```bash
curl -X POST https://your-crm-domain.vercel.app/api/webhook-website \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "mobile": "9876543210",
    "email": "test@example.com",
    "city": "Raipur",
    "interestedProject": "Singapour P4",
    "propertyType": "3BHK",
    "investmentTimeline": "Within 3 months",
    "remarks": "Test lead from website",
    "sourceUrl": "chouhan-park-view-xi.vercel.app"
  }'
```

## Form Field Mapping

The CRM expects these fields (adjust based on your form):

| CRM Field | Form Field Names (any of these) |
|----------|--------------------------------|
| customerName | `name`, `customerName`, `fullName` |
| mobile | `mobile`, `phone`, `phoneNumber` |
| email | `email`, `emailAddress` |
| city | `city`, `location` |
| interestedProject | `project`, `interestedProject`, `propertyName` |
| interestedUnit | `unit`, `propertyType`, `unitType` |
| investmentTimeline | `timeline`, `investmentTimeline`, `whenToInvest` |
| remarks | `message`, `remarks`, `comments`, `query` |

## Security (Optional but Recommended)

Add webhook secret authentication:

1. **Set secret in environment:**
   ```env
   WEBHOOK_SECRET=your_random_secret_here
   ```

2. **Add to website code:**
   ```javascript
   const response = await fetch(CRM_WEBHOOK_URL, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'x-webhook-secret': 'your_random_secret_here', // Same as in .env
     },
     body: JSON.stringify(formData),
   });
   ```

## Troubleshooting

### Lead not appearing in CRM:
1. Check browser console for errors
2. Verify webhook URL is correct
3. Check webhook endpoint logs
4. Verify required fields (name, mobile) are being sent

### Google Sheets not saving:
1. Check `VITE_GOOGLE_SHEETS_ACCESS_TOKEN` is set
2. Verify token has write permissions
3. Check spreadsheet ID is correct

### CORS errors:
- If you get CORS errors, add CORS headers to your webhook endpoint
- Or use a proxy/CORS service

## Example: Complete Integration

Here's a complete example for a Next.js contact form:

```typescript
// pages/contact.tsx or components/ContactForm.tsx
'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    city: '',
    project: '',
    propertyType: '',
    timeline: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Send to CRM
    try {
      const response = await fetch('https://your-crm-domain.vercel.app/api/webhook-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          city: formData.city,
          interestedProject: formData.project,
          propertyType: formData.propertyType,
          investmentTimeline: formData.timeline,
          remarks: formData.message,
          sourceUrl: 'chouhan-park-view-xi.vercel.app',
          pageUrl: window.location.href,
        }),
      });

      if (response.ok) {
        alert('Thank you! We will contact you soon.');
        setFormData({
          name: '',
          mobile: '',
          email: '',
          city: '',
          project: '',
          propertyType: '',
          timeline: '',
          message: '',
        });
      }
    } catch (error) {
      console.error('Error sending lead:', error);
    }

    // Your existing form submission logic...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
        placeholder="Your Name"
      />
      <input
        name="mobile"
        type="tel"
        value={formData.mobile}
        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
        required
        placeholder="Mobile Number"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
      />
      <input
        name="city"
        value={formData.city}
        onChange={(e) => setFormData({...formData, city: e.target.value})}
        placeholder="City"
      />
      <select
        name="project"
        value={formData.project}
        onChange={(e) => setFormData({...formData, project: e.target.value})}
      >
        <option value="">Select Project</option>
        <option value="Singapour P4">Singapour P4</option>
        {/* Add your projects */}
      </select>
      <select
        name="propertyType"
        value={formData.propertyType}
        onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
      >
        <option value="">Select Property Type</option>
        <option value="2BHK">2BHK</option>
        <option value="3BHK">3BHK</option>
        <option value="Plot">Plot</option>
      </select>
      <textarea
        name="message"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        placeholder="Your Message"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Next Steps

1. ✅ Deploy webhook endpoint
2. ✅ Add integration code to your website
3. ✅ Test with a real form submission
4. ✅ Verify leads appear in CRM
5. ✅ Verify leads are saved to Google Sheets
6. ✅ Monitor for any errors

Once set up, all leads from your website will automatically:
- Appear in the CRM Leads Management page
- Be saved to Google Sheets
- Show notifications to admin users
- Be assigned to the default salesperson

