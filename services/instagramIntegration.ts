/**
 * Instagram Lead Ads Integration Service
 * 
 * Instagram Lead Ads use the same Facebook Lead Ads API
 * since Instagram is owned by Meta/Facebook.
 * 
 * Setup is similar to Facebook integration.
 */

import type { IncomingLead } from './leadIngestionService';
import { parseFacebookWebhook, fetchFacebookLeads } from './facebookIntegration';

/**
 * Parse Instagram webhook payload (uses same format as Facebook)
 */
export const parseInstagramWebhook = (payload: any): IncomingLead[] => {
  // Instagram uses the same webhook format as Facebook
  const facebookLeads = parseFacebookWebhook(payload);
  
  // Convert to Instagram source
  return facebookLeads.map(lead => ({
    ...lead,
    source: 'instagram' as const,
  }));
};

/**
 * Fetch leads from Instagram Lead Ads
 * Uses Facebook Graph API with Instagram form IDs
 */
export const fetchInstagramLeads = async (
  accessToken: string,
  formId?: string
): Promise<IncomingLead[]> => {
  // Instagram uses the same API as Facebook
  const facebookLeads = await fetchFacebookLeads(accessToken, formId);
  
  // Convert to Instagram source
  return facebookLeads.map(lead => ({
    ...lead,
    source: 'instagram' as const,
  }));
};


