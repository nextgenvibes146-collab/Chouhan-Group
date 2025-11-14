/**
 * IVR (Interactive Voice Response) Integration Service
 * 
 * This service handles leads from IVR systems.
 * 
 * Setup:
 * 1. Configure your IVR system to send webhook POST requests
 * 2. Set the webhook URL in your IVR system settings
 * 3. IVR should send lead data in the expected format
 */

import type { IncomingLead } from './leadIngestionService';

export interface IVRLeadData {
  // Call information
  callId?: string;
  callerNumber: string;
  callerName?: string;
  callDuration?: number;
  callTimestamp: string;
  
  // IVR responses
  responses?: Record<string, string>;
  
  // Lead information collected during call
  customerName?: string;
  email?: string;
  city?: string;
  interestedProject?: string;
  interestedUnit?: string;
  investmentTimeline?: string;
  remarks?: string;
  
  // IVR system metadata
  ivrSystemId?: string;
  campaignId?: string;
}

/**
 * Parse IVR webhook payload
 */
export const parseIVRWebhook = (payload: IVRLeadData): IncomingLead => {
  // Extract customer name from caller name or responses
  const customerName = payload.customerName || 
                      payload.callerName || 
                      payload.responses?.name || 
                      'Unknown';

  // Extract mobile from caller number
  const mobile = payload.callerNumber.replace(/\D/g, ''); // Remove non-digits

  // Build remarks from IVR responses
  let remarks = payload.remarks || 'IVR Call - ';
  if (payload.responses) {
    const responseText = Object.entries(payload.responses)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    remarks += responseText;
  }
  if (payload.callDuration) {
    remarks += ` (Duration: ${payload.callDuration}s)`;
  }

  return {
    source: 'ivr',
    customerName: customerName,
    mobile: mobile,
    email: payload.email || payload.responses?.email,
    city: payload.city || payload.responses?.city,
    interestedProject: payload.interestedProject || payload.responses?.project,
    interestedUnit: payload.interestedUnit || payload.responses?.unit,
    investmentTimeline: payload.investmentTimeline || payload.responses?.timeline,
    remarks: remarks,
    timestamp: payload.callTimestamp,
    formData: {
      callId: payload.callId,
      callDuration: payload.callDuration,
      ivrSystemId: payload.ivrSystemId,
      campaignId: payload.campaignId,
      ...payload.responses,
    },
  };
};

/**
 * Process IVR callback/webhook
 */
export const handleIVRWebhook = async (
  payload: IVRLeadData | IVRLeadData[]
): Promise<IncomingLead[]> => {
  const leads = Array.isArray(payload) ? payload : [payload];
  return leads.map(parseIVRWebhook);
};


