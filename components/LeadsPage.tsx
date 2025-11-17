import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import LeadsTable from './LeadsTable';
import LeadDetailModal from './LeadDetailModal';
import AssignLeadForm from './AssignLeadForm';
import type { Lead, User, ActivityType, Activity } from '../types';
import { LeadStatus, ModeOfEnquiry } from '../types';
import type { NewLeadData } from '../App';
import { AdjustmentsHorizontalIcon, CogIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from './Icons';

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
}

const UserControlPanel: React.FC<{ 
    user: User; 
    onLogout: () => void;
    onNavigate: (view: string) => void;
}> = ({ user, onLogout, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSettingsClick = () => {
        onNavigate('Settings');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-primary rounded-md bg-blue-100/80 hover:bg-blue-100 transition-colors">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>

            <div className={`absolute right-0 mt-2 w-64 bg-base-100 rounded-xl shadow-card border border-border-color z-20 origin-top-right transition-all duration-200 ease-out transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="p-2">
                    <div className="flex items-center p-2">
                        <img src={user.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full" />
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-base-content">{user.name}</p>
                            <p className="text-xs text-muted-content">{user.role}</p>
                        </div>
                    </div>
                    <div className="my-1 h-px bg-border-color" />
                    <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center w-full text-left px-3 py-2 text-sm text-base-content rounded-md hover:bg-base-300/70 transition-colors">
                        <UserCircleIcon className="w-5 h-5 mr-3 text-muted-content" />
                        <span>My Profile</span>
                    </a>
                    {user.role === 'Admin' && (
                        <button onClick={handleSettingsClick} className="flex items-center w-full text-left px-3 py-2 text-sm text-base-content rounded-md hover:bg-base-300/70 transition-colors">
                            <CogIcon className="w-5 h-5 mr-3 text-muted-content" />
                            <span>Team Settings</span>
                        </button>
                    )}
                    <div className="my-1 h-px bg-border-color" />
                    <button onClick={onLogout} className="flex items-center w-full text-left px-3 py-2 text-sm text-danger rounded-md hover:bg-red-50 transition-colors">
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
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

                        // Fix: The 'leadDate' from CSV could be of an unknown type, causing a type error with the `new Date()` constructor.
                        // By explicitly converting it to a string and validating it, we ensure type safety and handle potential invalid date formats gracefully.
                        const parsedDate = new Date(String(leadData['Lead Date']));
                        const leadDateISO = (leadData['Lead Date'] && !isNaN(parsedDate.getTime()))
                            ? parsedDate.toISOString()
                            : new Date().toISOString();

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
        event.target.value = ''; // Reset file input
    };

    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="csv-importer" className={`px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer ${isParsing ? 'opacity-50' : ''}`}>
                {isParsing ? 'Importing...' : 'Import from CSV'}
            </label>
            <input id="csv-importer" type="file" accept=".csv" onChange={handleFileChange} className="hidden" disabled={isParsing} />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

const LeadsPage: React.FC<LeadsPageProps> = ({ leads, users, currentUser, onUpdateLead, onAddActivity, activities, onAssignLead, onBulkUpdate, onImportLeads, onLogout, onNavigate }) => {
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
// Fix: Corrected enum member access from 'VisitScheduled' to 'SiteVisitScheduled'.
        filtered = filtered.filter(l => l.status === LeadStatus.SiteVisitScheduled);
    }

    // Fix: Corrected the sorting logic to prevent type errors.
    // The previous implementation was attempting to access properties on a Date object incorrectly and calling a method on an array.
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
    <div className="p-4 space-y-4">
        <header className="flex flex-wrap gap-4 justify-between items-center">
            <h1 className="text-2xl font-bold text-base-content">Leads Management</h1>
            <div className="flex items-center space-x-2">
                {currentUser.role === 'Admin' && <ImportCSV onImport={onImportLeads} users={users} />}
                <button onClick={exportToCSV} className="px-4 py-2 text-sm font-medium text-gray-900 border border-border-color bg-surface rounded-md hover:bg-background">Export</button>
                <UserControlPanel user={currentUser} onLogout={onLogout} onNavigate={onNavigate} />
            </div>
        </header>
        
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