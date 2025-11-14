/**
 * Lead Ingestion Service
 * 
 * This service handles automatic lead generation from multiple sources:
 * - Multiple Chouhan Group websites
 * - Facebook Lead Ads
 * - Instagram Lead Ads
 * - IVR system
 * 
 * Leads are automatically created in the CRM and saved to Google Sheets
 */

import type { Lead, User } from '../types';
import { LeadStatus, ModeOfEnquiry } from '../types';
import { saveLeadToGoogleSheets } from './googleSheetService';

export interface IncomingLead {
  // Source identification
  source: 'website' | 'facebook' | 'instagram' | 'ivr';
  sourceUrl?: string; // Which website/URL the lead came from
  campaignId?: string; // Facebook/Instagram campaign ID
  adId?: string; // Facebook/Instagram ad ID
  
  // Lead information
  customerName: string;
  mobile: string;
  email?: string;
  city?: string;
  interestedProject?: string;
  interestedUnit?: string;
  investmentTimeline?: string;
  remarks?: string;
  
  // Additional metadata
  timestamp?: string;
  formData?: Record<string, any>; // Additional form fields
}

/**
 * Convert incoming lead to CRM Lead format
 */
export const convertToLead = (
  incomingLead: IncomingLead,
  defaultSalespersonId: string
): Omit<Lead, 'id'> => {
  // Map source to ModeOfEnquiry
  let modeOfEnquiry: ModeOfEnquiry;
  switch (incomingLead.source) {
    case 'website':
      modeOfEnquiry = ModeOfEnquiry.Website;
      break;
    case 'facebook':
      modeOfEnquiry = ModeOfEnquiry.Facebook;
      break;
    case 'instagram':
      modeOfEnquiry = ModeOfEnquiry.Instagram;
      break;
    case 'ivr':
      modeOfEnquiry = ModeOfEnquiry.IVR;
      break;
    default:
      modeOfEnquiry = ModeOfEnquiry.Website;
  }

  const now = new Date().toISOString();
  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // Build remarks with source information
  let remarks = incomingLead.remarks || 'New lead from ';
  if (incomingLead.sourceUrl) {
    remarks += `${incomingLead.source} (${incomingLead.sourceUrl})`;
  } else {
    remarks += incomingLead.source;
  }
  if (incomingLead.campaignId) {
    remarks += ` - Campaign: ${incomingLead.campaignId}`;
  }

  return {
    customerName: incomingLead.customerName,
    mobile: incomingLead.mobile,
    email: incomingLead.email,
    city: incomingLead.city,
    status: LeadStatus.New,
    assignedSalespersonId: defaultSalespersonId,
    lastActivityDate: now,
    leadDate: incomingLead.timestamp || now,
    month: month,
    modeOfEnquiry: modeOfEnquiry,
    interestedProject: incomingLead.interestedProject,
    interestedUnit: incomingLead.interestedUnit,
    investmentTimeline: incomingLead.investmentTimeline,
    visitStatus: 'No',
    lastRemark: remarks,
    isRead: false,
    missedVisitsCount: 0,
  };
};

/**
 * Process and save incoming lead
 */
export const processIncomingLead = async (
  incomingLead: IncomingLead,
  users: User[],
  accessToken?: string
): Promise<Lead> => {
  // Find admin or first salesperson as default assignee
  const admin = users.find(u => u.role === 'Admin');
  const defaultSalespersonId = admin?.id || users.find(u => u.role === 'Salesperson')?.id || users[0]?.id || '';

  // Convert to Lead format
  const leadData = convertToLead(incomingLead, defaultSalespersonId);
  
  // Generate unique ID
  const lead: Lead = {
    ...leadData,
    id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  // Save to Google Sheets if access token is provided
  if (accessToken) {
    try {
      await saveLeadToGoogleSheets(lead, users, accessToken);
    } catch (error) {
      console.error('Failed to save lead to Google Sheets:', error);
      // Continue even if Google Sheets save fails
    }
  }

  return lead;
};

/**
 * Webhook endpoint handler for receiving leads
 * This should be called by external services (websites, Facebook, Instagram, IVR)
 */
export const handleWebhookLead = async (
  payload: IncomingLead | IncomingLead[],
  users: User[],
  accessToken?: string
): Promise<Lead[]> => {
  const leads = Array.isArray(payload) ? payload : [payload];
  const processedLeads: Lead[] = [];

  for (const incomingLead of leads) {
    try {
      // Validate required fields
      if (!incomingLead.customerName || !incomingLead.mobile) {
        console.warn('Invalid lead data:', incomingLead);
        continue;
      }

      const lead = await processIncomingLead(incomingLead, users, accessToken);
      processedLeads.push(lead);
    } catch (error) {
      console.error('Error processing lead:', error);
    }
  }

  return processedLeads;
};


