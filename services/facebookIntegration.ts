/**
 * Facebook Lead Ads Integration Service
 * 
 * This service handles leads from Facebook Lead Ads campaigns.
 * 
 * Setup:
 * 1. Create a Facebook App at https://developers.facebook.com
 * 2. Set up a Webhook subscription for Lead Ads
 * 3. Configure the webhook URL in your Facebook App settings
 * 4. Add LEAD_AD webhook subscription
 * 5. Verify the webhook token matches FACEBOOK_WEBHOOK_VERIFY_TOKEN
 */

import type { IncomingLead } from './leadIngestionService';

export interface FacebookLeadData {
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      value: {
        lead_id: string;
        form_id: string;
        ad_id?: string;
        ad_name?: string;
        adset_id?: string;
        adset_name?: string;
        campaign_id?: string;
        campaign_name?: string;
        created_time: number;
        field_data: Array<{
          name: string;
          values: string[];
        }>;
      };
      field: string;
    }>;
  }>;
}

/**
 * Parse Facebook webhook payload
 */
export const parseFacebookWebhook = (payload: FacebookLeadData): IncomingLead[] => {
  const leads: IncomingLead[] = [];

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field === 'leadgen') {
        const leadData = change.value;
        
        // Extract field data
        const fieldMap: Record<string, string> = {};
        for (const field of leadData.field_data) {
          fieldMap[field.name] = field.values[0] || '';
        }

        // Map Facebook fields to our lead format
        const lead: IncomingLead = {
          source: 'facebook',
          campaignId: leadData.campaign_id,
          adId: leadData.ad_id,
          customerName: fieldMap.full_name || fieldMap.first_name + ' ' + fieldMap.last_name || 'Unknown',
          mobile: fieldMap.phone_number || fieldMap.mobile || '',
          email: fieldMap.email || '',
          city: fieldMap.city || '',
          interestedProject: fieldMap.project || fieldMap.interested_project || '',
          interestedUnit: fieldMap.property_type || fieldMap.unit || '',
          investmentTimeline: fieldMap.timeline || fieldMap.investment_timeline || '',
          remarks: `Facebook Lead Ad: ${leadData.ad_name || 'N/A'} - Campaign: ${leadData.campaign_name || 'N/A'}`,
          timestamp: new Date(leadData.created_time * 1000).toISOString(),
          formData: fieldMap,
        };

        leads.push(lead);
      }
    }
  }

  return leads;
};

/**
 * Verify Facebook webhook (for initial setup)
 */
export const verifyFacebookWebhook = (
  mode: string,
  token: string,
  challenge: string,
  verifyToken: string
): string | null => {
  if (mode === 'subscribe' && token === verifyToken) {
    return challenge;
  }
  return null;
};

/**
 * Fetch leads from Facebook Lead Ads API
 * Use this for polling if webhooks are not available
 */
export const fetchFacebookLeads = async (
  accessToken: string,
  formId?: string
): Promise<IncomingLead[]> => {
  try {
    // Build API URL
    let url = `https://graph.facebook.com/v18.0/${formId || 'me'}/leads?access_token=${accessToken}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.statusText}`);
    }

    const data = await response.json();
    const leads: IncomingLead[] = [];

    for (const lead of data.data || []) {
      // Fetch lead details
      const leadDetailsUrl = `https://graph.facebook.com/v18.0/${lead.id}?access_token=${accessToken}&fields=id,created_time,field_data,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name`;
      const detailsResponse = await fetch(leadDetailsUrl);
      const leadDetails = await detailsResponse.json();

      const fieldMap: Record<string, string> = {};
      for (const field of leadDetails.field_data || []) {
        fieldMap[field.name] = field.values?.[0] || '';
      }

      const incomingLead: IncomingLead = {
        source: 'facebook',
        campaignId: leadDetails.campaign_id,
        adId: leadDetails.ad_id,
        customerName: fieldMap.full_name || fieldMap.first_name + ' ' + fieldMap.last_name || 'Unknown',
        mobile: fieldMap.phone_number || fieldMap.mobile || '',
        email: fieldMap.email || '',
        city: fieldMap.city || '',
        interestedProject: fieldMap.project || '',
        interestedUnit: fieldMap.property_type || '',
        investmentTimeline: fieldMap.timeline || '',
        remarks: `Facebook Lead Ad: ${leadDetails.ad_name || 'N/A'}`,
        timestamp: new Date(leadDetails.created_time * 1000).toISOString(),
        formData: fieldMap,
      };

      leads.push(incomingLead);
    }

    return leads;
  } catch (error) {
    console.error('Error fetching Facebook leads:', error);
    throw error;
  }
};


