
import React, { memo } from 'react';
import type { Lead, User } from '../types';
import { LeadStatus } from '../types';

interface LeadsTableProps {
  leads: Lead[];
  users: User[];
  onOpenModal: (lead: Lead) => void;
  selectedLeadIds: Set<string>;
  onSelectLead: (leadId: string) => void;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  allVisibleLeadsSelected: boolean;
}

const StatusBadge: React.FC<{ type: 'visit' | 'temp' | 'status', value?: string }> = memo(({ type, value }) => {
    if (!value) return null;

    let colorClass = 'bg-slate-100 text-slate-700 ring-slate-600/10';
    let text = value;

    if (type === 'visit') {
        switch (value.toLowerCase()) {
            case 'yes': colorClass = 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'; break;
            case 'no': colorClass = 'bg-rose-50 text-rose-700 ring-rose-600/20'; break;
            case 'will come': colorClass = 'bg-amber-50 text-amber-700 ring-amber-600/20'; text = 'Will Come'; break;
        }
    } else if (type === 'temp') {
        switch (value.toLowerCase()) {
            case 'hot': colorClass = 'bg-rose-50 text-rose-700 ring-rose-600/20'; break;
            case 'warm': colorClass = 'bg-amber-50 text-amber-700 ring-amber-600/20'; break;
            case 'cold': colorClass = 'bg-sky-50 text-sky-700 ring-sky-600/20'; break;
        }
    } else if (type === 'status') {
         switch (value) {
            case LeadStatus.New: colorClass = 'bg-indigo-50 text-indigo-700 ring-indigo-700/10'; break;
            case LeadStatus.Contacted: colorClass = 'bg-amber-50 text-amber-700 ring-amber-600/20'; break;
            case LeadStatus.SiteVisitScheduled: colorClass = 'bg-sky-50 text-sky-700 ring-sky-700/10'; text = 'Visit Planned'; break;
            case LeadStatus.SiteVisitDone: colorClass = 'bg-purple-50 text-purple-700 ring-purple-700/10'; text = 'Visit Done'; break;
            case LeadStatus.Negotiation: colorClass = 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-700/10'; break;
            case LeadStatus.Booked: colorClass = 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'; break;
            case LeadStatus.Booking: colorClass = 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'; break;
            case LeadStatus.Cancelled: colorClass = 'bg-slate-100 text-slate-600 ring-slate-500/10'; break;
            case LeadStatus.Lost: colorClass = 'bg-rose-50 text-rose-700 ring-rose-600/10'; break;
        }
    }
    
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${colorClass}`}>
            {text}
        </span>
    );
});

interface LeadRowProps {
    lead: Lead;
    salespersonName: string;
    isSelected: boolean;
    index: number;
    onSelect: (id: string) => void;
    onOpenModal: (lead: Lead) => void;
}

const MobileLeadCard: React.FC<LeadRowProps> = memo(({ lead, salespersonName, isSelected, onSelect, onOpenModal }) => (
    <div className={`p-4 rounded-2xl border transition-all shadow-sm ${isSelected ? 'bg-blue-50 border-primary/30 ring-1 ring-primary/30' : 'bg-white border-slate-100'}`}>
        <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center">
                    {!lead.isRead && <span className="h-2 w-2 bg-primary rounded-full mr-2 flex-shrink-0 animate-pulse" title="Unread"></span>}
                    <p className="font-bold text-slate-800 truncate text-base" title={lead.customerName}>{lead.customerName}</p>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-0.5">{lead.mobile}</p>
            </div>
            <input 
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary ml-3 mt-1"
                checked={isSelected}
                onChange={() => onSelect(lead.id)}
            />
        </div>
        <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-50">
            <StatusBadge type="status" value={lead.status} />
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{salespersonName}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
             <div className="flex gap-2">
                 {lead.interestedProject && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{lead.interestedProject}</span>}
                 <StatusBadge type="temp" value={lead.temperature} />
             </div>
        </div>
        <button onClick={() => onOpenModal(lead)} className="w-full py-2.5 text-sm font-bold text-primary bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
            View Details
        </button>
    </div>
));

const DesktopLeadRow: React.FC<LeadRowProps> = memo(({ lead, salespersonName, isSelected, index, onSelect, onOpenModal }) => (
    <tr className={`group transition-colors duration-200 border-b border-slate-50 last:border-none ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'}`}>
        <td className="px-4 py-4 pl-6">
            <input 
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                checked={isSelected}
                onChange={() => onSelect(lead.id)}
            />
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center">
                {!lead.isRead && <span className="h-2 w-2 bg-primary rounded-full mr-3 flex-shrink-0" title="Unread"></span>}
                <div>
                    <div className="font-bold text-slate-800 text-sm">{lead.customerName}</div>
                    <div className="text-slate-500 text-xs font-medium mt-0.5">{lead.mobile}</div>
                </div>
            </div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
            <div className="text-slate-600 text-sm">{new Date(lead.leadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
            <div className="text-slate-400 text-xs">{lead.modeOfEnquiry}</div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center">
                 <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-2">
                    {salespersonName.charAt(0)}
                 </div>
                 <span className="text-sm font-medium text-slate-700">{salespersonName}</span>
            </div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
             <StatusBadge type="status" value={lead.status} />
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-center">
            <StatusBadge type="visit" value={lead.visitStatus} />
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
             <span className="text-sm font-medium text-slate-700">{lead.interestedProject || '-'}</span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
             <StatusBadge type="temp" value={lead.temperature} />
        </td>
        <td className="px-4 py-4 max-w-xs truncate text-sm text-slate-500 italic group-hover:text-slate-700">
            {lead.lastRemark}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-right pr-6">
            <button onClick={() => onOpenModal(lead)} className="text-primary hover:text-primary-focus font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                View
            </button>
        </td>
    </tr>
));

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, users, onOpenModal, selectedLeadIds, onSelectLead, onSelectAll, allVisibleLeadsSelected }) => {
  const userMap = new Map<string, string>(users.map(user => [user.id, user.name]));

  if (leads.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-3">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">No leads found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">Try adjusting your filters or add a new lead to get started.</p>
        </div>
    );
  }

  return (
    <div>
        {/* Mobile View */}
        <div className="md:hidden space-y-3 p-1">
             <div className="flex items-center px-2 pb-2">
                <input 
                    type="checkbox"
                    id="select-all-mobile"
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    onChange={onSelectAll}
                    checked={allVisibleLeadsSelected}
                />
                <label htmlFor="select-all-mobile" className="ml-3 text-sm font-bold text-slate-700">
                    Select All
                </label>
            </div>
            {leads.map((lead, index) => (
                <MobileLeadCard 
                    key={lead.id}
                    lead={lead}
                    index={index}
                    salespersonName={userMap.get(lead.assignedSalespersonId) || 'Unknown'}
                    isSelected={selectedLeadIds.has(lead.id)}
                    onSelect={onSelectLead}
                    onOpenModal={onOpenModal}
                />
            ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80 backdrop-blur-sm">
                    <tr>
                        <th scope="col" className="px-4 py-3.5 pl-6 text-left">
                            <input 
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                onChange={onSelectAll}
                                checked={allVisibleLeadsSelected}
                            />
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Source</th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Visit</th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Project</th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Temp</th>
                        <th scope="col" className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Remark</th>
                        <th scope="col" className="relative px-4 py-3.5 pr-6">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                    {leads.map((lead, index) => (
                        <DesktopLeadRow
                            key={lead.id}
                            lead={lead}
                            index={index}
                            salespersonName={userMap.get(lead.assignedSalespersonId) || 'Unknown'}
                            isSelected={selectedLeadIds.has(lead.id)}
                            onSelect={onSelectLead}
                            onOpenModal={onOpenModal}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default LeadsTable;
