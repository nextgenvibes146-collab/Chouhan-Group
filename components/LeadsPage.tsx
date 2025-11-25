
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import LeadsTable from './LeadsTable';
import LeadDetailModal from './LeadDetailModal';
import AssignLeadForm from './AssignLeadForm';
import type { Lead, User, ActivityType, Activity } from '../types';
import { LeadStatus, ModeOfEnquiry } from '../types';
import type { NewLeadData } from '../App';
import { 
    FunnelIcon,
    XMarkIcon,
    SearchIcon,
    PlusIcon,
    MinusIcon
} from './Icons';

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
  onLogout: () => void;
  onNavigate: (view: string) => void;
  targetLeadId?: string | null;
  onClearTargetLead?: () => void;
}

const TABS = [
    { id: 'all', label: 'All Leads' },
    { id: 'new', label: 'New' },
    { id: 'followup', label: 'Follow-up' },
    { id: 'visit', label: 'Visits' },
    { id: 'negotiation', label: 'Negotiation' },
    { id: 'booked', label: 'Booked' },
    { id: 'lost', label: 'Lost' },
];

const getStatusesForTab = (tabId: string): LeadStatus[] | null => {
    switch (tabId) {
        case 'new': return [LeadStatus.New];
        case 'followup': return [LeadStatus.Contacted, LeadStatus.Qualified, LeadStatus.SiteVisitPending, LeadStatus.ProposalSent];
        case 'visit': return [LeadStatus.SiteVisitScheduled, LeadStatus.SiteVisitDone];
        case 'negotiation': return [LeadStatus.Negotiation, LeadStatus.ProposalFinalized];
        case 'booked': return [LeadStatus.Booking, LeadStatus.Booked];
        case 'lost': return [LeadStatus.Lost, LeadStatus.Cancelled, LeadStatus.Disqualified];
        default: return null;
    }
};

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
                    
                    const requiredHeaders = ['Customer Name', 'Mobile', 'Status', 'Sales Person', 'Lead Date'];
                    const hasHeaders = requiredHeaders.every(h => headers.includes(h));
                    if (!hasHeaders) {
                        throw new Error(`CSV must include headers: ${requiredHeaders.join(', ')}`);
                    }

                    const leadsToImport = lines.slice(1).map(line => {
                        const data = line.split(',');
                        if (data.length < headers.length) return null;

                        const leadData: Record<string, string> = {};
                        headers.forEach((header, index) => {
                            leadData[header] = data[index]?.trim().replace(/"/g, '') ?? '';
                        });

                        if (!leadData['Customer Name'] || !leadData['Mobile']) return null;

                        const leadDateStr = leadData['Lead Date'];
                        let leadDateISO = new Date().toISOString();
                        if (leadDateStr) {
                             const parsedDate = new Date(leadDateStr as string);
                             if (!isNaN(parsedDate.getTime())) {
                                 leadDateISO = parsedDate.toISOString();
                             }
                        }

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
                            assignedSalespersonId: leadData['Sales Person'] || users[0].name,
                            status: (leadData['Status'] as LeadStatus) || LeadStatus.New,
                            leadDate: leadDateISO,
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
        event.target.value = '';
    };

    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="csv-importer" className={`px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer ${isParsing ? 'opacity-50' : ''}`}>
                {isParsing ? 'Importing...' : 'Import CSV'}
            </label>
            <input id="csv-importer" type="file" accept=".csv" onChange={handleFileChange} className="hidden" disabled={isParsing} />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

const FilterChip: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${
            isActive 
                ? 'bg-primary text-white border-primary' 
                : 'bg-base-100 text-muted-content border-border-color hover:bg-base-200'
        }`}
    >
        {label}
    </button>
);

const LeadsPage: React.FC<LeadsPageProps> = ({ leads, users, currentUser, onUpdateLead, onAddActivity, activities, onAssignLead, onBulkUpdate, onImportLeads, onLogout, onNavigate, targetLeadId, onClearTargetLead }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkAssignee, setBulkAssignee] = useState('');
  
  const [filters, setFilters] = useState({
    salesperson: '',
    dateRange: '',
    showUnread: false,
    showOverdue: false,
    showVisits: false,
    enquiryType: '',
    month: '',
  });

  const handleOpenModal = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    if (!lead.isRead) {
        onUpdateLead({ ...lead, isRead: true });
    }
  }, [onUpdateLead]);

  const handleCloseModal = useCallback(() => {
    setSelectedLead(null);
  }, []);

  // Effect to handle navigation from global search
  useEffect(() => {
    if (targetLeadId) {
        const lead = leads.find(l => l.id === targetLeadId);
        if (lead) {
            handleOpenModal(lead);
        }
        if (onClearTargetLead) {
            onClearTargetLead();
        }
    }
  }, [targetLeadId, leads, handleOpenModal, onClearTargetLead]);
  
  const uniqueMonths = useMemo(() => {
    const months = new Set(leads.map(l => l.month).filter(Boolean));
    return Array.from(months).sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime());
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let filtered = [...leads];
    
    // Tab Filter
    const tabStatuses = getStatusesForTab(activeTab);
    if (tabStatuses) {
        filtered = filtered.filter(l => tabStatuses.includes(l.status));
    }

    // Local Search
    if (localSearch) {
        const term = localSearch.toLowerCase();
        filtered = filtered.filter(l => 
            l.customerName.toLowerCase().includes(term) ||
            l.mobile.includes(term) ||
            (l.interestedProject && l.interestedProject.toLowerCase().includes(term))
        );
    }
    
    // Advanced Filters
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
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) < today);
    }
    if(filters.showVisits) {
        filtered = filtered.filter(l => l.status === LeadStatus.SiteVisitScheduled);
    }

    return filtered.sort((a, b) => new Date(b.leadDate).getTime() - new Date(a.leadDate).getTime());
  }, [leads, activeTab, localSearch, filters]);

  const allVisibleLeadsSelected = useMemo(() => {
    if (filteredLeads.length === 0) return false;
    return filteredLeads.every(lead => selectedLeadIds.has(lead.id));
  }, [filteredLeads, selectedLeadIds]);

  const handleSelectLead = useCallback((leadId: string) => {
    setSelectedLeadIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(leadId)) {
            newSet.delete(leadId);
        } else {
            newSet.add(leadId);
        }
        return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
           const visibleIds = filteredLeads.map(l => l.id);
           setSelectedLeadIds(prev => new Set([...Array.from(prev), ...visibleIds]));
      } else {
           const visibleIds = filteredLeads.map(l => l.id);
           setSelectedLeadIds(prev => {
              const newSet = new Set(prev);
              visibleIds.forEach(id => newSet.delete(id));
              return newSet;
          });
      }
  }, [filteredLeads]);

  const handleApplyBulkAction = () => {
    const leadIds = Array.from(selectedLeadIds);
    if (leadIds.length === 0 || (!bulkStatus && !bulkAssignee)) return;

    onBulkUpdate(
        leadIds,
        bulkStatus ? (bulkStatus as LeadStatus) : undefined,
        bulkAssignee || undefined
    );

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

  const isAdmin = currentUser.role === 'Admin';

  const manageableUsers = useMemo(() => {
    if (currentUser.role === 'Admin') {
      return users.filter(u => u.role !== 'Admin');
    }
    return [];
  }, [currentUser, users]);
  
  const resetFilters = () => {
      setFilters({
        salesperson: '',
        dateRange: '',
        showUnread: false,
        showOverdue: false,
        showVisits: false,
        enquiryType: '',
        month: '',
      });
      setLocalSearch('');
  };

  return (
    <div className="p-4 space-y-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-base-content">Leads Management</h1>
            <div className="flex items-center gap-2 self-end md:self-auto">
                {/* Enabled for all users */}
                <button 
                    onClick={() => setShowAddLead(true)} 
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors bg-primary text-white hover:bg-primary-focus shadow-sm"
                >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Lead
                </button>
                
                {isAdmin && <ImportCSV onImport={onImportLeads} users={users} />}
                <button onClick={exportToCSV} className="px-4 py-2 text-sm font-medium text-gray-700 border border-border-color bg-white rounded-md hover:bg-gray-50 transition-colors">Export</button>
            </div>
        </div>
        
        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-card border border-border-color overflow-hidden">
            {/* Status Tabs */}
            <div className="border-b border-border-color overflow-x-auto scrollbar-hide">
                <div className="flex min-w-max px-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-muted-content hover:text-base-content hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search and Filter Toolbar */}
            <div className="p-4 border-b border-border-color flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-gray-50/50">
                <div className="relative w-full lg:w-96">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="w-4 h-4 text-gray-500" />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search in list..." 
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full py-2 pl-9 pr-4 text-sm bg-white border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder-gray-500 text-black"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <FilterChip label="Unread" isActive={filters.showUnread} onClick={() => setFilters(f => ({...f, showUnread: !f.showUnread}))} />
                    <FilterChip label="Overdue" isActive={filters.showOverdue} onClick={() => setFilters(f => ({...f, showOverdue: !f.showOverdue}))} />
                    <FilterChip label="Visits Today" isActive={filters.showVisits} onClick={() => setFilters(f => ({...f, showVisits: !f.showVisits}))} />
                    
                    <div className="h-6 w-px bg-border-color mx-1 hidden sm:block"></div>
                    
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            showFilters 
                                ? 'bg-blue-50 text-primary border-primary' 
                                : 'bg-white text-base-content border-border-color hover:bg-gray-50'
                        }`}
                    >
                        {showFilters ? <XMarkIcon className="w-4 h-4 mr-2" /> : <FunnelIcon className="w-4 h-4 mr-2" />}
                        Filters
                    </button>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="p-4 bg-gray-50 border-b border-border-color animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {isAdmin && (
                            <div>
                                <label className="block text-xs font-semibold text-muted-content mb-1">Salesperson</label>
                                <select value={filters.salesperson} onChange={e => setFilters({...filters, salesperson: e.target.value})} className="filter-select w-full">
                                    <option value="">All Salespersons</option>
                                    {manageableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-semibold text-muted-content mb-1">Month</label>
                            <select value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} className="filter-select w-full">
                                <option value="">All Months</option>
                                {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted-content mb-1">Source</label>
                            <select value={filters.enquiryType} onChange={e => setFilters({...filters, enquiryType: e.target.value})} className="filter-select w-full">
                                <option value="">All Sources</option>
                                {Object.values(ModeOfEnquiry).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         <div className="flex items-end">
                            <button onClick={resetFilters} className="text-sm text-danger hover:underline py-2">Clear all filters</button>
                         </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedLeadIds.size > 0 && (
                <div className="bg-blue-50/80 backdrop-blur-sm p-3 border-b border-blue-100 flex flex-wrap items-center gap-3 sticky top-0 z-10">
                    <p className="text-sm font-semibold text-primary">{selectedLeadIds.size} selected</p>
                    <div className="h-4 w-px bg-blue-200 mx-1"></div>
                    <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="text-sm py-1.5 px-3 rounded-md border-blue-200 focus:ring-primary">
                        <option value="">Change Status...</option>
                        {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {isAdmin && (
                        <select value={bulkAssignee} onChange={e => setBulkAssignee(e.target.value)} className="text-sm py-1.5 px-3 rounded-md border-blue-200 focus:ring-primary">
                            <option value="">Assign To...</option>
                            {manageableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    )}
                    <button onClick={handleApplyBulkAction} disabled={!bulkStatus && !bulkAssignee} className="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-focus disabled:opacity-50">
                        Apply
                    </button>
                    <button onClick={() => setSelectedLeadIds(new Set())} className="ml-auto text-sm text-muted-content hover:text-base-content">
                        Cancel
                    </button>
                </div>
            )}

            {/* Table Content */}
            <LeadsTable 
              leads={filteredLeads} 
              users={users} 
              onOpenModal={handleOpenModal}
              selectedLeadIds={selectedLeadIds}
              onSelectLead={handleSelectLead}
              onSelectAll={handleSelectAll}
              allVisibleLeadsSelected={allVisibleLeadsSelected}
            />
            
            <div className="p-3 border-t border-border-color bg-gray-50 text-xs text-center text-muted-content">
                Showing {filteredLeads.length} leads based on current filters.
            </div>
        </div>
      
        {/* Add Lead Modal */}
        {showAddLead && (
            <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddLead(false)}></div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                        <AssignLeadForm 
                            users={users}
                            currentUser={currentUser}
                            onAssignLead={(data) => {
                                onAssignLead(data);
                                setShowAddLead(false);
                            }}
                            onCancel={() => setShowAddLead(false)}
                        />
                    </div>
                </div>
            </div>
        )}

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
