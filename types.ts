

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  VisitScheduled = 'Visit Scheduled',
  VisitDone = 'Visit Done',
  Negotiation = 'Negotiation',
  Booked = 'Booked',
  Cancelled = 'Cancelled', // Was 'Junk'
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
  visitStatus: 'Yes' | 'No' | 'Planned';
  visitDate?: string;
  city?: string;
  platform?: string;
  nextFollowUpDate?: string;
  lastRemark: string;
  bookingStatus?: string;
  isRead: boolean;
  investmentTimeline?: string;
}

export interface Activity {
  id: string;
  leadId: string;
  salespersonId: string;
  type: ActivityType;
  date: string;
  remarks: string;
  customerName: string; 
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