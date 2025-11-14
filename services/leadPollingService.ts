/**
 * Lead Polling Service
 * 
 * This service periodically checks for new leads from various sources
 * and automatically creates them in the CRM and saves to Google Sheets.
 * 
 * Use this if webhooks are not available or as a backup mechanism.
 */

import type { User } from '../types';
import { handleWebhookLead, type IncomingLead } from './leadIngestionService';
import { fetchFacebookLeads } from './facebookIntegration';
import { fetchInstagramLeads } from './instagramIntegration';

export interface PollingConfig {
  facebook?: {
    enabled: boolean;
    accessToken: string;
    formId?: string;
    intervalMinutes?: number;
  };
  instagram?: {
    enabled: boolean;
    accessToken: string;
    formId?: string;
    intervalMinutes?: number;
  };
  // Add other sources as needed
}

let pollingIntervals: NodeJS.Timeout[] = [];
let lastPolledTimes: Map<string, number> = new Map();

/**
 * Start polling for new leads
 */
export const startPolling = (
  config: PollingConfig,
  users: User[],
  onNewLeads: (leads: any[]) => void,
  accessToken?: string
) => {
  // Stop any existing polling
  stopPolling();

  // Facebook polling
  if (config.facebook?.enabled && config.facebook.accessToken) {
    const interval = (config.facebook.intervalMinutes || 15) * 60 * 1000;
    const pollFacebook = async () => {
      try {
        const incomingLeads = await fetchFacebookLeads(
          config.facebook!.accessToken,
          config.facebook!.formId
        );
        
        if (incomingLeads.length > 0) {
          const processedLeads = await handleWebhookLead(incomingLeads, users, accessToken);
          onNewLeads(processedLeads);
        }
      } catch (error) {
        console.error('Error polling Facebook leads:', error);
      }
    };

    // Poll immediately, then at intervals
    pollFacebook();
    const intervalId = setInterval(pollFacebook, interval);
    pollingIntervals.push(intervalId);
  }

  // Instagram polling
  if (config.instagram?.enabled && config.instagram.accessToken) {
    const interval = (config.instagram.intervalMinutes || 15) * 60 * 1000;
    const pollInstagram = async () => {
      try {
        const incomingLeads = await fetchInstagramLeads(
          config.instagram!.accessToken,
          config.instagram!.formId
        );
        
        if (incomingLeads.length > 0) {
          const processedLeads = await handleWebhookLead(incomingLeads, users, accessToken);
          onNewLeads(processedLeads);
        }
      } catch (error) {
        console.error('Error polling Instagram leads:', error);
      }
    };

    // Poll immediately, then at intervals
    pollInstagram();
    const intervalId = setInterval(pollInstagram, interval);
    pollingIntervals.push(intervalId);
  }
};

/**
 * Stop all polling
 */
export const stopPolling = () => {
  pollingIntervals.forEach(interval => clearInterval(interval));
  pollingIntervals = [];
};

/**
 * Manual poll (trigger immediately)
 */
export const manualPoll = async (
  config: PollingConfig,
  users: User[],
  onNewLeads: (leads: any[]) => void,
  accessToken?: string
) => {
  const allLeads: IncomingLead[] = [];

  if (config.facebook?.enabled && config.facebook.accessToken) {
    try {
      const leads = await fetchFacebookLeads(
        config.facebook.accessToken,
        config.facebook.formId
      );
      allLeads.push(...leads);
    } catch (error) {
      console.error('Error manual polling Facebook:', error);
    }
  }

  if (config.instagram?.enabled && config.instagram.accessToken) {
    try {
      const leads = await fetchInstagramLeads(
        config.instagram.accessToken,
        config.instagram.formId
      );
      allLeads.push(...leads);
    } catch (error) {
      console.error('Error manual polling Instagram:', error);
    }
  }

  if (allLeads.length > 0) {
    const processedLeads = await handleWebhookLead(allLeads, users, accessToken);
    onNewLeads(processedLeads);
  }
};

