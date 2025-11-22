
import { Lead, User, Activity, SalesTarget, Task, LeadStatus, ActivityType, ModeOfEnquiry, VisitStatus } from '../types';
import { Project } from '../data/inventoryData';
import { mockProjects } from '../data/inventoryData';
import { newRawData } from '../data/mockData';

// Storage Keys
const DB_KEY = 'chouhan_crm_db_v1';

interface DatabaseSchema {
    leads: Lead[];
    users: User[];
    activities: Activity[];
    inventory: Project[];
    tasks: Task[];
    salesTargets: SalesTarget[];
}

// Helper to parse raw mock data into clean objects (Same logic as the old GoogleSheetService)
const parseDate = (dateStr: string | undefined): string | undefined => {
    if (!dateStr || typeof dateStr !== 'string' ) return undefined;
    const parts = dateStr.replace(/\./g, '/').split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        const fullYear = parseInt(year, 10) > 2000 ? year : `20${year}`;
        const date = new Date(`${fullYear}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    return undefined;
};

const seedData = (): DatabaseSchema => {
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
    const mockLabels = ['First-Time Buyer', 'Investor', 'Nri', 'Government Employee'];

    const leads: Lead[] = [];
    const activities: Activity[] = [];

    newRawData.forEach((d, index) => {
        if (!d['Customer Name']) return;

        const salesPersonName = d['Sales Person']?.toLowerCase();
        const assignedSalespersonId = salespersonNameMap.get(salesPersonName) || users[1].id;

        const temperatureStr = (d['Status H/W/C'] || '').toLowerCase();
        let temperature: 'Hot' | 'Warm' | 'Cold' | undefined;
        if (temperatureStr === 'hot') temperature = 'Hot';
        else if (temperatureStr === 'warm') temperature = 'Warm';
        else if (temperatureStr === 'cold') temperature = 'Cold';
        
        let status: LeadStatus = LeadStatus.New;
        const bookingStatus = (d['Booking Status'] || '').toLowerCase();
        
        if (bookingStatus.includes('book') || bookingStatus.includes('done')) status = LeadStatus.Booking;
        else if (bookingStatus.includes('drop') || temperatureStr === 'cancel') status = LeadStatus.Lost;
        else if (d['Visit YES/No']?.toLowerCase() === 'yes') status = LeadStatus.SiteVisitDone;
        else if (d['Visit Date'] && d['Visit Date'].match(/\d{1,2}[./]\d{1,2}[./]\d{4}/)) status = LeadStatus.SiteVisitScheduled;
        else if (d['Followup'] || d['Visit Remark']) status = LeadStatus.Qualified;
        
        const leadDate = parseDate(d['Lead Date']);
        const lastRemarkDate = parseDate(d['Remark Date']);
        
        const lead: Lead = {
            id: `lead-${index + 1}`,
            customerName: d['Customer Name'],
            status: status,
            assignedSalespersonId: assignedSalespersonId,
            lastActivityDate: lastRemarkDate || leadDate || new Date().toISOString(),
            leadDate: leadDate || new Date().toISOString(),
            month: d['Month'] || 'October 2025',
            modeOfEnquiry: d['Mode of Enquiry'] as ModeOfEnquiry || ModeOfEnquiry.Digital,
            mobile: String(d['Mobile'] || ''),
            occupation: d['Occupation'],
            interestedProject: d['Project'],
            interestedUnit: d['Unit'],
            temperature: temperature,
            visitStatus: (d['Visit YES/No']?.toLowerCase() === 'yes' ? 'Yes' : 'No') as VisitStatus,
            visitDate: d['Visit Date'],
            nextFollowUpDate: parseDate(d['Date']),
            lastRemark: d['Followup'] || d['Visit Remark'] || 'New lead created.',
            bookingStatus: d['Booking Status'],
            isRead: false,
            missedVisitsCount: 0,
            labels: temperature ? [temperature] : [],
            budget: '',
            purpose: undefined
        };

        leads.push(lead);

        activities.push({
            id: `act-${index + 1}`,
            leadId: lead.id,
            salespersonId: assignedSalespersonId,
            type: d['Visit YES/No']?.toLowerCase() === 'yes' ? ActivityType.Visit : ActivityType.Call,
            date: lastRemarkDate || leadDate || new Date().toISOString(),
            remarks: d['Followup'] || d['Visit Remark'] || `Initial enquiry via ${lead.modeOfEnquiry}`,
            customerName: lead.customerName,
        });
    });

    const tasks: Task[] = [
        { id: 'task-1', title: 'Follow up with Mithlesh Tiwari', assignedToId: 'user-1', dueDate: new Date().toISOString(), isCompleted: false, createdBy: 'Admin', hasReminded: true },
        { id: 'task-2', title: 'Prepare report for October leads', assignedToId: 'admin-0', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: false, createdBy: 'Admin' },
    ];

    const salesTargets: SalesTarget[] = users.filter(u => u.role === 'Salesperson').map(u => ({
        salespersonId: u.id,
        name: u.name,
        targets: { bookings: 5, visits: 15 },
        achieved: { bookings: 0, visits: 0 } // Will calculate dynamically
    }));

    return {
        leads,
        users,
        activities,
        inventory: mockProjects,
        tasks,
        salesTargets
    };
};

class DatabaseService {
    private data: DatabaseSchema;

    constructor() {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
            try {
                this.data = JSON.parse(stored);
            } catch (e) {
                console.error("Database corrupted, resetting", e);
                this.data = seedData();
                this.save();
            }
        } else {
            this.data = seedData();
            this.save();
        }
    }

    private save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    }

    // --- Public API ---

    async getAllData() {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 600));
        return { ...this.data };
    }

    async getLeads() {
        return [...this.data.leads];
    }

    async addLead(lead: Lead) {
        this.data.leads.unshift(lead);
        this.save();
        return lead;
    }

    async updateLead(updatedLead: Lead) {
        const index = this.data.leads.findIndex(l => l.id === updatedLead.id);
        if (index !== -1) {
            this.data.leads[index] = updatedLead;
            this.save();
        }
        return updatedLead;
    }

    async bulkUpdateLeads(ids: string[], updates: Partial<Lead>) {
        this.data.leads = this.data.leads.map(l => {
            if (ids.includes(l.id)) {
                return { ...l, ...updates };
            }
            return l;
        });
        this.save();
    }

    async addActivity(activity: Activity) {
        this.data.activities.unshift(activity);
        // Update lead's last activity
        const leadIdx = this.data.leads.findIndex(l => l.id === activity.leadId);
        if (leadIdx !== -1) {
            this.data.leads[leadIdx].lastActivityDate = activity.date;
            this.data.leads[leadIdx].lastRemark = activity.remarks;
        }
        this.save();
        return activity;
    }

    async getInventory() {
        return [...this.data.inventory];
    }

    async bookUnit(unitId: string) {
        this.data.inventory = this.data.inventory.map(proj => ({
            ...proj,
            units: proj.units.map(unit => 
                unit.id === unitId ? { ...unit, status: 'Booked' } : unit
            )
        }));
        this.save();
    }

    async addTask(task: Task) {
        this.data.tasks.unshift(task);
        this.save();
    }

    async toggleTask(taskId: string) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (task) {
            task.isCompleted = !task.isCompleted;
            this.save();
        }
    }

    async deleteTask(taskId: string) {
        this.data.tasks = this.data.tasks.filter(t => t.id !== taskId);
        this.save();
    }

    async markTaskReminded(taskId: string) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (task) {
            task.hasReminded = true;
            this.save();
        }
        return [...this.data.tasks];
    }

    async addUser(user: User) {
        this.data.users.push(user);
        this.save();
    }

    async deleteUser(userId: string, reassignToId: string) {
        this.data.users = this.data.users.filter(u => u.id !== userId);
        // Reassign leads
        this.data.leads = this.data.leads.map(l => 
            l.assignedSalespersonId === userId ? { ...l, assignedSalespersonId: reassignToId } : l
        );
        this.save();
    }

    async resetDatabase() {
        this.data = seedData();
        this.save();
        return this.getAllData();
    }
}

export const db = new DatabaseService();