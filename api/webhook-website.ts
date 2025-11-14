/**
 * Website Webhook API Endpoint
 * 
 * This is a serverless function (Vercel/Netlify) that receives leads from the website
 * and processes them into the CRM.
 * 
 * Deploy this as:
 * - Vercel: api/webhook-website.ts
 * - Netlify: netlify/functions/webhook-website.ts
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { WebsiteLeadData } from '../services/websiteLeadCapture';
import { processWebsiteLead, validateWebsiteLead } from '../services/websiteLeadCapture';
import { fetchSheetData } from '../services/googleSheetService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Get webhook secret for security (optional but recommended)
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const providedSecret = req.headers['x-webhook-secret'] || req.headers['authorization'];
    
    if (webhookSecret && providedSecret !== `Bearer ${webhookSecret}` && providedSecret !== webhookSecret) {
      return res.status(401).json({ error: 'Unauthorized. Invalid webhook secret.' });
    }

    // Get lead data from request body
    const websiteLead: WebsiteLeadData = req.body;

    // Validate lead data
    const validation = validateWebsiteLead(websiteLead);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Get users and Google Sheets token
    const data = await fetchSheetData();
    const users = data.users;
    const accessToken = process.env.GOOGLE_SHEETS_ACCESS_TOKEN;

    // Process and save lead
    const lead = await processWebsiteLead(websiteLead, users, accessToken);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Lead processed successfully',
      leadId: lead.id,
      lead: {
        id: lead.id,
        customerName: lead.customerName,
        mobile: lead.mobile,
        status: lead.status,
      },
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to process lead',
    });
  }
}

// For CORS (if needed)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};


