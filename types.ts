export enum LeadStatus {
  New = 'New Lead',
  Qualified = 'Qualified',
  Disqualified = 'Disqualified',
  SiteVisitPending = 'Site Visit Pending',
  SiteVisitScheduled = 'Site Visit Scheduled',
  SiteVisitDone = 'Site Visit Done',
  ProposalSent = 'Proposal Sent',
  ProposalFinalized = 'Proposal Finalized',
  Negotiation = 'Negotiation',
  Booking = 'Booking',
  Lost = 'Lost',
  // Below are legacy statuses for mapping
  Contacted = 'Contacted',
  Booked = 'Booked', // Legacy
  Cancelled = 'Cancelled'
}

export enum ActivityType {
  Call = 'Call',
  Visit = 'Visit',
  Note = 'Note',
  Email = 'Email',
  WhatsApp = 'WhatsApp',
}

export enum ModeOfEnquiry {
  Website = 'Website',
  WalkIn = 'Walk-in',
  Call = 'Call',
  Reference = 'Reference',
  Digital = 'Digital',
  IVR = 'IVR',
  Telephone = 'Telephone',
  Refrence = 'Refrence', // Typo from sheet data
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Salesperson';
  avatarUrl: string;
}

export type VisitStatus = 'Yes' | 'No' | 'Will Come' | 'Planned';

export interface Lead {
  id: string;
  customerName: string;
  status: LeadStatus;
  assignedSalespersonId: string;
  lastActivityDate: string;
  leadDate: string;
  month: string;
  modeOfEnquiry: ModeOfEnquiry;
  mobile: string;
  email?: string;
  occupation?: string;
  interestedProject?: string;
  interestedUnit?: string;
  temperature?: 'Hot' | 'Warm' | 'Cold';
  remarks?: string;
  visitStatus: VisitStatus;
  visitDate?: string;
  city?: string;
  platform?: string;
  nextFollowUpDate?: string;
  lastRemark: string;
  bookingStatus?: string;
  isRead: boolean;
  investmentTimeline?: string;
  missedVisitsCount: number;
  labels?: string[];
}

export interface Activity {
  id: string;
  leadId: string;
  salespersonId: string;
  type: ActivityType;
  date: string;
  remarks: string;
  customerName: string; 
  duration?: number; // in minutes
}

export interface SalesTarget {
  salespersonId: string;
  name: string;
  targets: {
    bookings: number;
    visits: number;
  };
  achieved: {
    bookings: number;
    visits: number;
  };
}

export interface Task {
    id: string;
    title: string;
    assignedToId: string;
    dueDate: string;
    isCompleted: boolean;
    createdBy: string;
}

export interface Notification {
  id: string;
  message: string;
  createdDate: string;
  isRead: boolean;
  targetUserId?: string; // If undefined, it's for all users
}