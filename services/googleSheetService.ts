

import { LeadStatus, ActivityType, ModeOfEnquiry, Task } from '../types';
import type { User, Lead, Activity, SalesTarget } from '../types';
import { newRawData } from '../data/mockData';

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


// This function simulates fetching and processing data from a Google Sheet.
export const fetchSheetData = async (): Promise<{
    users: User[];
    leads: Lead[];
    activities: Activity[];
    salesTargets: SalesTarget[];
    tasks: Task[];
}> => {
    // Adding an Admin user to the list of users
    const users: User[] = [
      { id: 'admin-0', name: 'Admin', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/40?u=admin' },
      { id: 'user-1', name: 'Amit Naithani', role: 'Sales Manager', avatarUrl: 'https://i.pravatar.cc/40?u=amit' },
      { id: 'user-2', name: 'Neeraj Tripathi', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=neeraj', reportsTo: 'user-1' },
      { id: 'user-3', name: 'Pinki Sahu', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=pinki', reportsTo: 'user-1' },
      { id: 'user-4', name: 'Sher Singh', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=sher' },
      { id: 'user-5', name: 'Umakant Sharma', role: 'Sales Manager', avatarUrl: 'https://i.pravatar.cc/40?u=umakant' },
      { id: 'user-6', name: 'Vimal Shrivastav', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=vimal', reportsTo: 'user-5' },
      { id: 'user-7', name: 'Parth Das', role: 'Salesperson', avatarUrl: 'https://i.pravatar.cc/40?u=parth', reportsTo: 'user-5' },
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