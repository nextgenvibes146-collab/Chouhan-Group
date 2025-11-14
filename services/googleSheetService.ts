


import { LeadStatus, ActivityType, ModeOfEnquiry, Task } from '../types';
import type { User, Lead, Activity, SalesTarget } from '../types';
import { newRawData } from '../data/mockData';
import { 
  readFromGoogleSheets, 
  appendToGoogleSheets, 
  leadToSheetRow,
  sheetRowToLead,
  type GoogleSheetsConfig 
} from './googleSheetsAPI';

// Helper to parse DD/MM/YYYY or DD.MM.YYYY dates
const parseDate = (dateStr: string | undefined): string | undefined => {
    if (!dateStr || typeof dateStr !== 'string' ) return undefined;
    const parts = dateStr.replace(/\./g, '/').split('/');
    if (parts.length === 3) {
        // Assuming DD/MM/YYYY
        const [day, month, year] = parts;
        const fullYear = parseInt(year, 10) > 2000 ? year : `20${year}`;
        const date = new Date(`${fullYear}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    return undefined;
};


/**
 * Fetch data from Google Sheets or use mock data as fallback
 * Set USE_GOOGLE_SHEETS=true in environment to enable Google Sheets integration
 */
export const fetchSheetData = async (): Promise<{
    users: User[];
    leads: Lead[];
    activities: Activity[];
    salesTargets: SalesTarget[];
    tasks: Task[];
}> => {
    // Check if Google Sheets integration is enabled
    const useGoogleSheets = import.meta.env.VITE_USE_GOOGLE_SHEETS === 'true';
    const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
    
    // Try to fetch from Google Sheets if enabled
    if (useGoogleSheets && spreadsheetId && apiKey) {
        try {
            return await fetchFromGoogleSheets(spreadsheetId, apiKey);
        } catch (error) {
            console.warn('Failed to fetch from Google Sheets, using mock data:', error);
            // Fall through to mock data
        }
    }
    
    // Use mock data (existing implementation)
    return fetchFromMockData();
};

/**
 * Fetch data from Google Sheets
 */
const fetchFromGoogleSheets = async (spreadsheetId: string, apiKey: string): Promise<{
    users: User[];
    leads: Lead[];
    activities: Activity[];
    salesTargets: SalesTarget[];
    tasks: Task[];
}> => {
    const config: GoogleSheetsConfig = { spreadsheetId, apiKey };
    
    // Read data from Google Sheets
    const sheetData = await readFromGoogleSheets(config, 'Sheet1!A:Z');
    
    if (!sheetData || sheetData.length === 0) {
        throw new Error('No data found in Google Sheet');
    }
    
    // First row is headers
    const headers = sheetData[0].map((h: string) => h.trim());
    const dataRows = sheetData.slice(1);
    
    // Users (hardcoded for now, can be read from a separate sheet)
    const users: User[] = [
      { id: 'admin-0', name: 'Admin', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/40?u=admin' },
      { id: 'user-1', name: 'Amit Naithani', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=amit' },
      { id: 'user-2', name: 'Neeraj Tripathi', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=neeraj' },
      { id: 'user-3', name: 'Pinki Sahu', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=pinki' },
      { id: 'user-4', name: 'Sher Singh', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=sher' },
      { id: 'user-5', name: 'Umakant Sharma', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=umakant' },
      { id: 'user-6', name: 'Vimal Shrivastav', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=vimal' },
      { id: 'user-7', name: 'Parth Das', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=parth' },
    ];
    
    const salespersonNameMap = new Map(users.map(u => [u.name.toLowerCase(), u.id]));
    
    // Process rows into leads
    const processedData = dataRows.map((row: any[], index: number) => {
        if (!row || row.length === 0 || !row[headers.indexOf('Customer Name')]) {
            return null;
        }
        
        const rowData = sheetRowToLead(row, headers, users);
        const salesPersonName = (rowData.assignedSalespersonId || '').toLowerCase();
        const assignedSalespersonId = salespersonNameMap.get(salesPersonName) || users[1]?.id || 'user-1';
        
        const temperatureStr = (rowData.temperature || '').toLowerCase();
        let temperature: 'Hot' | 'Warm' | 'Cold' | undefined;
        if (temperatureStr === 'hot') temperature = 'Hot';
        else if (temperatureStr === 'warm') temperature = 'Warm';
        else if (temperatureStr === 'cold') temperature = 'Cold';
        
        let status: LeadStatus = LeadStatus.New;
        const bookingStatus = (rowData.bookingStatus || '').toLowerCase();
        if (bookingStatus.includes('book') || bookingStatus.includes('done')) {
            status = LeadStatus.Booked;
        } else if (bookingStatus.includes('drop') || temperatureStr === 'cancel') {
            status = LeadStatus.Cancelled;
        } else if (rowData.visitStatus?.toLowerCase() === 'yes') {
            status = LeadStatus.VisitDone;
        } else if (rowData.lastRemark) {
            status = LeadStatus.Contacted;
        }
        
        const lead: Lead = {
            id: `lead-${index + 1}`,
            customerName: rowData.customerName,
            status: status,
            assignedSalespersonId: assignedSalespersonId,
            lastActivityDate: rowData.lastActivityDate || new Date().toISOString(),
            leadDate: rowData.leadDate || new Date().toISOString(),
            month: new Date(rowData.leadDate || new Date()).toLocaleString('default', { month: 'long', year: 'numeric' }),
            modeOfEnquiry: (rowData.modeOfEnquiry as ModeOfEnquiry) || ModeOfEnquiry.Digital,
            mobile: rowData.mobile,
            email: rowData.email,
            occupation: rowData.occupation,
            interestedProject: rowData.interestedProject,
            interestedUnit: rowData.interestedUnit,
            temperature: temperature,
            visitStatus: rowData.visitStatus || 'No',
            visitDate: rowData.visitDate,
            nextFollowUpDate: rowData.nextFollowUpDate,
            lastRemark: rowData.lastRemark || 'New lead created.',
            bookingStatus: rowData.bookingStatus,
            isRead: false,
            missedVisitsCount: 0,
        };
        
        const activity: Activity = {
            id: `act-${index + 1}`,
            leadId: lead.id,
            salespersonId: assignedSalespersonId,
            type: rowData.visitStatus?.toLowerCase() === 'yes' ? ActivityType.Visit : ActivityType.Call,
            date: rowData.lastActivityDate || new Date().toISOString(),
            remarks: rowData.lastRemark || `New lead from ${rowData.modeOfEnquiry}.`,
            customerName: rowData.customerName,
        };
        
        return { lead, activity };
    }).filter(Boolean) as { lead: Lead; activity: Activity }[];
    
    const leads: Lead[] = processedData.map(p => p.lead);
    const activities: Activity[] = processedData.map(p => p.activity).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const salesTargets: SalesTarget[] = users
      .filter(u => u.role === 'Salesperson')
      .map(user => ({
        salespersonId: user.id,
        name: user.name,
        targets: { bookings: 5, visits: 10 },
        achieved: { 
            bookings: leads.filter(l => l.assignedSalespersonId === user.id && l.status === LeadStatus.Booked).length,
            visits: leads.filter(l => l.assignedSalespersonId === user.id && l.visitStatus === 'Yes').length
        }
    }));
    
    // Dummy tasks
    const tasks: Task[] = [
        { id: 'task-1', title: 'Follow up with Mithlesh Tiwari', assignedToId: 'user-1', dueDate: new Date().toISOString(), isCompleted: false, createdBy: 'Admin' },
        { id: 'task-2', title: 'Prepare report for October leads', assignedToId: 'admin-0', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: false, createdBy: 'Admin' },
        { id: 'task-3', title: 'Schedule visit for Gahine\'s family', assignedToId: 'user-3', dueDate: new Date().toISOString(), isCompleted: true, createdBy: 'Pinki Sahu' }
    ];
    
    return { users, leads, activities, salesTargets, tasks };
};

/**
 * Fetch data from mock data (original implementation)
 */
const fetchFromMockData = async (): Promise<{
    users: User[];
    leads: Lead[];
    activities: Activity[];
    salesTargets: SalesTarget[];
    tasks: Task[];
}> => {
    // Adding an Admin user to the list of users
    const users: User[] = [
      { id: 'admin-0', name: 'Admin', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/40?u=admin' },
      { id: 'user-1', name: 'Amit Naithani', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=amit' },
      { id: 'user-2', name: 'Neeraj Tripathi', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=neeraj' },
      { id: 'user-3', name: 'Pinki Sahu', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=pinki' },
      { id: 'user-4', name: 'Sher Singh', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=sher' },
      { id: 'user-5', name: 'Umakant Sharma', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=umakant' },
      { id: 'user-6', name: 'Vimal Shrivastav', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=vimal' },
      { id: 'user-7', name: 'Parth Das', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=parth' },
    ];
    
    const salespersonNameMap = new Map(users.map(u => [u.name.toLowerCase(), u.id]));

    const processedData = newRawData.map((d, index) => {
        if (!d['Customer Name']) return null; // Skip empty rows

        const salesPersonName = d['Sales Person']?.toLowerCase();
        const assignedSalespersonId = salespersonNameMap.get(salesPersonName) || users[1].id; // Default to first salesperson

        const temperatureStr = (d['Status H/W/C'] || '').toLowerCase();
        let temperature: 'Hot' | 'Warm' | 'Cold' | undefined;
        if (temperatureStr === 'hot') temperature = 'Hot';
        else if (temperatureStr === 'warm') temperature = 'Warm';
        else if (temperatureStr === 'cold') temperature = 'Cold';
        
        let status: LeadStatus = LeadStatus.New;
        const bookingStatus = (d['Booking Status'] || '').toLowerCase();
        if (bookingStatus.includes('book') || bookingStatus.includes('done')) {
            status = LeadStatus.Booked;
        } else if (bookingStatus.includes('drop') || temperatureStr === 'cancel') {
            status = LeadStatus.Cancelled;
        } else if (d['Visit YES/No']?.toLowerCase() === 'yes') {
            status = LeadStatus.VisitDone;
        } else if (d['Followup'] || d['Visit Remark']) {
            status = LeadStatus.Contacted;
        }
        
        const leadDate = parseDate(d['Lead Date']);
        const lastRemarkDate = parseDate(d['Remark Date']);

        const lead: Lead = {
            id: `lead-${d['S. No.'] || index}`,
            customerName: d['Customer Name'],
            status: status,
            assignedSalespersonId: assignedSalespersonId,
            lastActivityDate: lastRemarkDate || leadDate || new Date().toISOString(),
            leadDate: leadDate || new Date().toISOString(),
            month: d['Month'] || '',
            modeOfEnquiry: d['Mode of Enquiry'] as ModeOfEnquiry,
            mobile: String(d['Mobile'] || ''),
            occupation: d['Occupation'],
            interestedProject: d['Project'],
            interestedUnit: d['Unit'],
            temperature: temperature,
            visitStatus: d['Visit YES/No']?.toLowerCase() === 'yes' ? 'Yes' : 'No',
            visitDate: d['Visit Date'],
            nextFollowUpDate: parseDate(d['Date']),
            lastRemark: d['Followup'] || d['Visit Remark'] || 'New lead created.',
            bookingStatus: d['Booking Status'],
            isRead: false,
            missedVisitsCount: 0,
        };

        const activity: Activity = {
            id: `act-${d['S. No.'] || index}`,
            leadId: lead.id,
            salespersonId: assignedSalespersonId,
            type: d['Visit YES/No']?.toLowerCase() === 'yes' ? ActivityType.Visit : ActivityType.Call,
            date: lastRemarkDate || leadDate || new Date().toISOString(),
            remarks: d['Followup'] || d['Visit Remark'] || `New lead from ${d['Mode of Enquiry']}.`,
            customerName: d['Customer Name'],
        };
        
        return { lead, activity };
    }).filter(Boolean) as { lead: Lead; activity: Activity }[];

    const leads: Lead[] = processedData.map(p => p.lead);
    const activities: Activity[] = processedData.map(p => p.activity).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const salesTargets: SalesTarget[] = users
      .filter(u => u.role === 'Salesperson')
      .map(user => ({
        salespersonId: user.id,
        name: user.name,
        targets: { bookings: 5, visits: 10 },
        achieved: { 
            bookings: leads.filter(l => l.assignedSalespersonId === user.id && l.status === LeadStatus.Booked).length,
            visits: leads.filter(l => l.assignedSalespersonId === user.id && l.visitStatus === 'Yes').length
        }
    }));
    
    // Dummy tasks
    const tasks: Task[] = [
        { id: 'task-1', title: 'Follow up with Mithlesh Tiwari', assignedToId: 'user-1', dueDate: new Date().toISOString(), isCompleted: false, createdBy: 'Admin' },
        { id: 'task-2', title: 'Prepare report for October leads', assignedToId: 'admin-0', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: false, createdBy: 'Admin' },
        { id: 'task-3', title: 'Schedule visit for Gahine\'s family', assignedToId: 'user-3', dueDate: new Date().toISOString(), isCompleted: true, createdBy: 'Pinki Sahu' }
    ];

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { users, leads, activities, salesTargets, tasks };
};

/**
 * Save a new lead to Google Sheets
 * Requires OAuth access token with write permissions
 */
export const saveLeadToGoogleSheets = async (
    lead: Lead,
    users: User[],
    accessToken: string
): Promise<void> => {
    const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    
    if (!spreadsheetId) {
        throw new Error('Google Sheets ID not configured');
    }
    
    if (!accessToken) {
        throw new Error('Access token required to write to Google Sheets');
    }
    
    const config: GoogleSheetsConfig = { spreadsheetId };
    const rowData = leadToSheetRow(lead, users);
    
    // Append to Sheet1 starting from row 2 (row 1 is headers)
    await appendToGoogleSheets(config, 'Sheet1!A2', rowData, accessToken);
};