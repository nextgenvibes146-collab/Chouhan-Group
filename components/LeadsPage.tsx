import React, { useState, useMemo, useCallback } from 'react';
import LeadsTable from './LeadsTable';
import LeadDetailModal from './LeadDetailModal';
import AssignLeadForm from './AssignLeadForm';
import type { Lead, User, ActivityType, Activity } from '../types';
import { LeadStatus, ModeOfEnquiry } from '../types';
import type { NewLeadData } from '../App';

interface LeadsPageProps {
  leads: Lead[];
  users: User[];
  currentUser: User;
  onUpdateLead: (lead: Lead) => void;
  onAddActivity: (lead: Lead, activityType: ActivityType, remarks: string, duration?: number) => void;
  activities: Activity[];
  onAssignLead: (newLeadData: NewLeadData) => void;
  onBulkUpdate: (leadIds: string[], newStatus?: LeadStatus, newAssignedSalespersonId?: string) => void;
  onImportLeads: (newLeads: Omit<Lead, 'id' | 'isRead' | 'missedVisitsCount' | 'lastActivityDate' | 'month'>[]) => void;
}

const ImportCSV: React.FC<{onImport: Function, users: User[]}> = ({ onImport, users }) => {
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        setError('');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                try {
                    const lines = text.split(/\r\n|\n/);
                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    
                    // Simple validation of headers
                    const requiredHeaders = ['Customer Name', 'Mobile', 'Status', 'Sales Person', 'Lead Date'];
                    const hasHeaders = requiredHeaders.every(h => headers.includes(h));
                    if (!hasHeaders) {
                        throw new Error(`CSV must include headers: ${requiredHeaders.join(', ')}`);
                    }

                    const leadsToImport = lines.slice(1).map(line => {
                        const data = line.split(',');
                        if (data.length < headers.length) return null;

                        const leadData = headers.reduce((obj, header, index) => {
                            obj[header] = data[index]?.trim().replace(/"/g, '');
                            return obj;
                        }, {} as {[key: string]: any});

                        // Basic data validation
                        if (!leadData['Customer Name'] || !leadData['Mobile']) return null;

                        return {
                            customerName: leadData['Customer Name'],
                            mobile: leadData['Mobile'],
                            email: leadData['Email'] || '',
                            city: leadData['City'] || '',
                            platform: leadData['Source / Platform'] || 'Imported',
                            interestedProject: leadData['Interested Project'] || '',
                            interestedUnit: leadData['Property Type'] || '',
                            investmentTimeline: '',
                            lastRemark: leadData['Last Remark'] || 'Imported lead.',
                            assignedSalespersonId: leadData['Sales Person'] || users[0].name, // a bit of a hack
                            status: (leadData['Status'] as LeadStatus) || LeadStatus.New,
                            // FIX: Handle cases where the date string from the CSV might be missing, empty, or invalid.
                            // This resolves the type error and prevents potential runtime crashes.
                            leadDate: (leadData['Lead Date'] && !isNaN(new Date(leadData['Lead Date'] as string).getTime()) ? new Date(leadData['Lead Date'] as string) : new Date()).toISOString(),
                            modeOfEnquiry: ModeOfEnquiry.Digital,
                            visitStatus: 'No',
                        };
                    }).filter(Boolean);

                    onImport(leadsToImport);

                } catch (err: any) {
                    setError(err.message || 'Failed to parse CSV file.');
                } finally {
                    setIsParsing(false);
                }
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="csv-importer" className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 cursor-pointer ${isParsing ? 'opacity-50' : ''}`}>
                {isParsing ? 'Importing...' : 'Import from CSV'}
            </label>
            <input id="csv-importer" type="file" accept=".csv" onChange={handleFileChange} className="hidden" disabled={isParsing} />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

const LeadsPage: React.FC<LeadsPageProps> = ({ leads, users, currentUser, onUpdateLead, onAddActivity, activities, onAssignLead, onBulkUpdate, onImportLeads }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkAssignee, setBulkAssignee] = useState('');

  const [filters, setFilters] = useState({
    status: '',
    salesperson: '',
    dateRange: '', // e.g., 'today', 'this_week'
    showUnread: false,
    showOverdue: false,
    showVisits: false,
    enquiryType: '',
    month: '',
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
  
  const uniqueMonths = useMemo(() => {
    const months = new Set(leads.map(l => l.month).filter(Boolean));
    return Array.from(months).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let filtered = [...leads];
    
    if (filters.status) {
        filtered = filtered.filter(l => l.status === filters.status);
    }
    if (filters.salesperson) {
        filtered = filtered.filter(l => l.assignedSalespersonId === filters.salesperson);
    }
    if (filters.month) {
        filtered = filtered.filter(l => l.month === filters.month);
    }
    if (filters.enquiryType) {
        filtered = filtered.filter(l => l.modeOfEnquiry === filters.enquiryType);
    }
    if (filters.showUnread) {
        filtered = filtered.filter(l => !l.isRead);
    }
    if (filters.showOverdue) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the current day
        filtered = filtered.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) < today);
    }
    if(filters.showVisits) {
        filtered = filtered.filter(l => l.status === LeadStatus.VisitScheduled);
    }

    return filtered.sort((a, b) => new Date(b.leadDate).getTime() - new Date(a.leadDate).getTime());
  }, [leads, filters]);

  const allVisibleLeadsSelected = useMemo(() => {
    if (filteredLeads.length === 0) return false;
    return filteredLeads.every(lead => selectedLeadIds.has(lead.id));
  }, [filteredLeads, selectedLeadIds]);

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(leadId)) {
            newSet.delete(leadId);
        } else {
            newSet.add(leadId);
        }
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      const visibleIds = filteredLeads.map(l => l.id);
      if (e.target.checked) {
          setSelectedLeadIds(prev => new Set([...Array.from(prev), ...visibleIds]));
      } else {
          setSelectedLeadIds(prev => {
              const newSet = new Set(prev);
              visibleIds.forEach(id => newSet.delete(id));
              return newSet;
          });
      }
  };

  const handleApplyBulkAction = () => {
    const leadIds = Array.from(selectedLeadIds);
    if (leadIds.length === 0 || (!bulkStatus && !bulkAssignee)) return;

    onBulkUpdate(
        leadIds,
        bulkStatus ? (bulkStatus as LeadStatus) : undefined,
        bulkAssignee || undefined
    );

    // Reset selections and form
    setSelectedLeadIds(new Set());
    setBulkStatus('');
    setBulkAssignee('');
  };

  const exportToCSV = () => {
    const headers = ['Customer Name', 'Mobile', 'Email', 'City', 'Source / Platform', 'Interested Project', 'Property Type', 'Status', 'Sales Person', 'Lead Date', 'Next Follow-up', 'Last Remark'];
    const userMap = new Map(users.map(u => [u.id, u.name]));
    const rows = filteredLeads.map(lead => [
        `"${lead.customerName}"`,
        lead.mobile,
        lead.email || '',
        lead.city || '',
        lead.platform || '',
        `"${lead.interestedProject || ''}"`,
        lead.interestedUnit || '',
        lead.status,
        `"${userMap.get(lead.assignedSalespersonId) || 'N/A'}"`,
        new Date(lead.leadDate).toLocaleDateString(),
        lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'N/A',
        `"${(lead.lastRemark || '').replace(/"/g, '""')}"`
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
        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${filters[filterKey] ? 'bg-primary text-white' : 'bg-gray-200 text-text-secondary hover:bg-gray-300'}`}
      >
        {label}
      </button>
  );

  const isAdmin = currentUser.role === 'Admin';

  const manageableUsers = useMemo(() => {
    if (currentUser.role === 'Admin') {
      return users.filter(u => u.role !== 'Admin');
    }
    return [];
  }, [currentUser, users]);

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Leads Management</h2>
            <div className="flex items-center space-x-2">
                {currentUser.role === 'Admin' && <ImportCSV onImport={onImportLeads} users={users} />}
                <button onClick={exportToCSV} className="px-4 py-2 text-sm font-medium text-text-secondary border border-border-color bg-surface rounded-md hover:bg-background">Export to CSV</button>
            </div>
        </div>
        
        {currentUser.role === 'Admin' && (
            <AssignLeadForm 
                salesAgents={users.filter(u => u.role === 'Salesperson')} 
                onAssignLead={onAssignLead}
            />
        )}

        <div className="space-y-4">
            {/* Filters */}
            <div className="card p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <div>
                        <label className="text-xs font-medium text-text-secondary">Status</label>
                        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="filter-select w-full mt-1">
                            <option value="">All Statuses</option>
                            {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    {isAdmin && (
                        <>
                            <div>
                                <label className="text-xs font-medium text-text-secondary">Salesperson</label>
                                <select value={filters.salesperson} onChange={e => setFilters({...filters, salesperson: e.target.value})} className="filter-select w-full mt-1">
                                    <option value="">All Salespersons</option>
                                    {manageableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-secondary">Month</label>
                                <select value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} className="filter-select w-full mt-1">
                                    <option value="">All Months</option>
                                    {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-secondary">Enquiry Type</label>
                                <select value={filters.enquiryType} onChange={e => setFilters({...filters, enquiryType: e.target.value})} className="filter-select w-full mt-1">
                                    <option value="">All Enquiry Types</option>
                                    {Object.values(ModeOfEnquiry).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-color flex-wrap">
                    <span className="text-sm font-medium text-text-secondary mr-2">Quick Filters:</span>
                    <FilterButton label="Unread" filterKey="showUnread" />
                    <FilterButton label="Overdue" filterKey="showOverdue" />
                    <FilterButton label="Visits" filterKey="showVisits" />
                </div>
            </div>

            {selectedLeadIds.size > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl shadow-md flex flex-wrap items-center gap-4 border border-primary">
                    <p className="font-semibold text-text-primary">{selectedLeadIds.size} lead(s) selected.</p>
                    <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="filter-select">
                        <option value="">Change Status...</option>
                        {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {isAdmin && (
                        <select value={bulkAssignee} onChange={e => setBulkAssignee(e.target.value)} className="filter-select">
                            <option value="">Assign To...</option>
                            {manageableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    )}
                    <button onClick={handleApplyBulkAction} disabled={!bulkStatus && !bulkAssignee} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed">
                        Apply Changes
                    </button>
                    <button onClick={() => setSelectedLeadIds(new Set())} className="text-sm text-text-secondary hover:text-text-primary ml-auto">
                        Clear Selection
                    </button>
                </div>
            )}

            <LeadsTable 
              leads={filteredLeads} 
              users={users} 
              onOpenModal={handleOpenModal}
              selectedLeadIds={selectedLeadIds}
              onSelectLead={handleSelectLead}
              onSelectAll={handleSelectAll}
              allVisibleLeadsSelected={allVisibleLeadsSelected}
            />
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