import React, { useState, useMemo } from 'react';
import LeadsTable from './LeadsTable';
import LeadDetailModal from './LeadDetailModal';
import AssignLeadForm from './AssignLeadForm';
import type { Lead, User, ActivityType, Activity } from '../types';
import { LeadStatus } from '../types';
import type { NewLeadData } from '../App';

interface LeadsPageProps {
  leads: Lead[];
  users: User[];
  currentUser: User;
  onUpdateLead: (lead: Lead) => void;
  onAddActivity: (lead: Lead, activityType: ActivityType, remarks: string) => void;
  activities: Activity[];
  onAssignLead: (newLeadData: NewLeadData) => void;
}

const LeadsPage: React.FC<LeadsPageProps> = ({ leads, users, currentUser, onUpdateLead, onAddActivity, activities, onAssignLead }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    salesperson: '',
    dateRange: '', // e.g., 'today', 'this_week'
    showUnread: false,
    showOverdue: false,
    showVisits: false
  });

  const handleOpenModal = (lead: Lead) => {
    setSelectedLead(lead);
    if (!lead.isRead) {
        onUpdateLead({ ...lead, isRead: true });
    }
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
  };
  
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];
    
    if (filters.status) {
        filtered = filtered.filter(l => l.status === filters.status);
    }
    if (filters.salesperson) {
        filtered = filtered.filter(l => l.assignedSalespersonId === filters.salesperson);
    }
    if (filters.showUnread) {
        filtered = filtered.filter(l => !l.isRead);
    }
    if (filters.showOverdue) {
        filtered = filtered.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) < new Date());
    }
    if(filters.showVisits) {
        filtered = filtered.filter(l => l.status === LeadStatus.VisitScheduled);
    }

    return filtered.sort((a, b) => new Date(b.leadDate).getTime() - new Date(a.leadDate).getTime());
  }, [leads, filters]);

  const exportToCSV = () => {
    const headers = ['Customer Name', 'Mobile', 'Status', 'Sales Person', 'Lead Date', 'Next Follow-up', 'Last Remark'];
    const userMap = new Map(users.map(u => [u.id, u.name]));
    const rows = filteredLeads.map(lead => [
        `"${lead.customerName}"`,
        lead.mobile,
        lead.status,
        `"${userMap.get(lead.assignedSalespersonId) || 'N/A'}"`,
        new Date(lead.leadDate).toLocaleDateString(),
        lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'N/A',
        `"${lead.lastRemark.replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const FilterButton: React.FC<{label: string; filterKey: 'showUnread' | 'showOverdue' | 'showVisits'}> = ({label, filterKey}) => (
      <button 
        onClick={() => setFilters(f => ({...f, [filterKey]: !f[filterKey]}))}
        className={`px-3 py-1.5 text-sm rounded-full ${filters[filterKey] ? 'bg-brand-blue text-white' : 'bg-gray-200 text-brand-gray'}`}
      >
        {label}
      </button>
  );

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">Leads Management</h2>
            <button onClick={exportToCSV} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Export to CSV</button>
        </div>
        
        {currentUser.role === 'Admin' && (
            <AssignLeadForm 
                salesAgents={users.filter(u => u.role === 'Salesperson')} 
                onAssignLead={onAssignLead}
            />
        )}

        <div className="space-y-4">
             {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-md flex flex-wrap items-center gap-4">
                <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="filter-select">
                    <option value="">All Statuses</option>
                    {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {currentUser.role === 'Admin' && (
                    <select value={filters.salesperson} onChange={e => setFilters({...filters, salesperson: e.target.value})} className="filter-select">
                        <option value="">All Salespersons</option>
                        {users.filter(u => u.role === 'Salesperson').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                )}
                <div className="flex items-center gap-2">
                    <FilterButton label="Unread" filterKey="showUnread" />
                    <FilterButton label="Overdue" filterKey="showOverdue" />
                    <FilterButton label="Visits" filterKey="showVisits" />
                </div>
            </div>

            <LeadsTable leads={filteredLeads} users={users} onOpenModal={handleOpenModal} />
        </div>
      
        {selectedLead && (
            <LeadDetailModal 
            lead={selectedLead} 
            onClose={handleCloseModal}
            users={users}
            onUpdateLead={onUpdateLead}
            onAddActivity={onAddActivity}
            currentUser={currentUser}
            activities={activities.filter(a => a.leadId === selectedLead.id)}
            />
        )}
    </div>
  );
};

export default LeadsPage;