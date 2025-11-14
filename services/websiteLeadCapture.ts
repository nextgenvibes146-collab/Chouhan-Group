/**
 * Website Lead Capture Service
 * 
 * Specifically for capturing leads from https://chouhan-park-view-xi.vercel.app
 * and automatically saving them to the CRM and Google Sheets.
 */

import type { Lead, User } from '../types';
import { LeadStatus, ModeOfEnquiry } from '../types';
import { saveLeadToGoogleSheets } from './googleSheetService';

export interface WebsiteLeadData {
  // Customer information
  customerName: string;
  mobile: string;
  email?: string;
  city?: string;
  
  // Property interest
  interestedProject?: string;
  interestedUnit?: string;
  propertyType?: string;
  investmentTimeline?: string;
  
  // Additional information
  remarks?: string;
  message?: string;
  
  // Source tracking
  sourceUrl?: string;
  pageUrl?: string;
  formId?: string;
  
  // Metadata
  timestamp?: string;
}

/**
 * Convert website form data to Lead format
 */
export const convertWebsiteLeadToLead = (
  websiteLead: WebsiteLeadData,
  defaultSalespersonId: string
): Omit<Lead, 'id'> => {
  const now = new Date().toISOString();
  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // Build remarks
  let remarks = websiteLead.remarks || websiteLead.message || 'New lead from website';
  if (websiteLead.sourceUrl) {
    remarks += ` (${websiteLead.sourceUrl})`;
  }
  if (websiteLead.pageUrl) {
    remarks += ` - Page: ${websiteLead.pageUrl}`;
  }

  return {
    customerName: websiteLead.customerName,
    mobile: websiteLead.mobile,
    email: websiteLead.email,
    city: websiteLead.city,
    status: LeadStatus.New,
    assignedSalespersonId: defaultSalespersonId,
    lastActivityDate: now,
    leadDate: websiteLead.timestamp || now,
    month: month,
    modeOfEnquiry: ModeOfEnquiry.Website,
    interestedProject: websiteLead.interestedProject,
    interestedUnit: websiteLead.interestedUnit || websiteLead.propertyType,
    investmentTimeline: websiteLead.investmentTimeline,
    visitStatus: 'No',
    lastRemark: remarks,
    isRead: false,
    missedVisitsCount: 0,
  };
};

/**
 * Process and save website lead
 */
export const processWebsiteLead = async (
  websiteLead: WebsiteLeadData,
  users: User[],
  accessToken?: string
): Promise<Lead> => {
  // Find admin or first salesperson as default assignee
  const admin = users.find(u => u.role === 'Admin');
  const defaultSalespersonId = admin?.id || users.find(u => u.role === 'Salesperson')?.id || users[0]?.id || '';

  // Convert to Lead format
  const leadData = convertWebsiteLeadToLead(websiteLead, defaultSalespersonId);
  
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
 * Validate website lead data
 */
export const validateWebsiteLead = (data: WebsiteLeadData): { valid: boolean; error?: string } => {
  if (!data.customerName || data.customerName.trim().length === 0) {
    return { valid: false, error: 'Customer name is required' };
  }
  
  if (!data.mobile || data.mobile.trim().length === 0) {
    return { valid: false, error: 'Mobile number is required' };
  }

  // Basic mobile validation (should be at least 10 digits)
  const mobileDigits = data.mobile.replace(/\D/g, '');
  if (mobileDigits.length < 10) {
    return { valid: false, error: 'Invalid mobile number' };
  }

  return { valid: true };
};


