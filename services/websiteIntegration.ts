/**
 * Website Form Integration Service
 * 
 * This service handles leads from multiple Chouhan Group websites.
 * 
 * Setup for each website:
 * 1. Add a webhook URL to your website form submission handler
 * 2. Configure the form to POST to the webhook endpoint
 * 3. Include sourceUrl to identify which website the lead came from
 */

import type { IncomingLead } from './leadIngestionService';

export interface WebsiteFormData {
  // Website identification
  sourceUrl: string; // e.g., "chouhangroup.com", "chouhanhousing.com", etc.
  formId?: string;
  pageUrl?: string;
  
  // Lead information
  customerName: string;
  mobile: string;
  email?: string;
  city?: string;
  interestedProject?: string;
  interestedUnit?: string;
  investmentTimeline?: string;
  remarks?: string;
  
  // Additional form fields
  [key: string]: any;
}

/**
 * Parse website form submission
 */
export const parseWebsiteForm = (payload: WebsiteFormData): IncomingLead => {
  return {
    source: 'website',
    sourceUrl: payload.sourceUrl,
    customerName: payload.customerName,
    mobile: payload.mobile,
    email: payload.email,
    city: payload.city,
    interestedProject: payload.interestedProject,
    interestedUnit: payload.interestedUnit,
    investmentTimeline: payload.investmentTimeline,
    remarks: payload.remarks || `Form submission from ${payload.sourceUrl}`,
    timestamp: new Date().toISOString(),
    formData: {
      formId: payload.formId,
      pageUrl: payload.pageUrl,
      ...payload,
    },
  };
};

/**
 * Handle website form webhook
 */
export const handleWebsiteWebhook = async (
  payload: WebsiteFormData | WebsiteFormData[]
): Promise<IncomingLead[]> => {
  const forms = Array.isArray(payload) ? payload : [payload];
  return forms.map(parseWebsiteForm);
};

/**
 * Example website form integration code
 * Add this to your website's form submission handler:
 * 
 * ```javascript
 * // Example: Contact form submission
 * async function handleFormSubmit(formData) {
 *   const webhookUrl = 'https://your-crm-api.com/api/webhooks/website';
 *   
 *   const payload = {
 *     sourceUrl: 'chouhangroup.com', // Your website domain
 *     customerName: formData.name,
 *     mobile: formData.phone,
 *     email: formData.email,
 *     city: formData.city,
 *     interestedProject: formData.project,
 *     interestedUnit: formData.propertyType,
 *     investmentTimeline: formData.timeline,
 *     remarks: formData.message,
 *     formId: 'contact-form',
 *     pageUrl: window.location.href,
 *   };
 * 
 *   try {
 *     await fetch(webhookUrl, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(payload),
 *     });
 *   } catch (error) {
 *     console.error('Failed to submit lead:', error);
 *   }
 * }
 * ```
 */


