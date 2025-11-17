import React from 'react';
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

const StatusBadge: React.FC<{ type: 'visit' | 'temp' | 'status', value?: string }> = ({ type, value }) => {
    if (!value) return null;

    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    let text = value;

    if (type === 'visit') {
        switch (value.toLowerCase()) {
            case 'yes': bgColor = 'bg-green-100'; textColor = 'text-green-800'; break;
            case 'no': bgColor = 'bg-red-100'; textColor = 'text-red-800'; break;
            case 'will come': bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; text = 'Will Come'; break;
        }
    } else if (type === 'temp') {
        switch (value.toLowerCase()) {
            case 'hot': bgColor = 'bg-red-100'; textColor = 'text-red-800'; break;
            case 'warm': bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; break;
            case 'cold': bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; break;
        }
    } else if (type === 'status') {
         switch (value) {
            case LeadStatus.New: bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; break;
            case LeadStatus.Contacted: bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; break;
            case LeadStatus.VisitScheduled: bgColor = 'bg-purple-100'; textColor = 'text-purple-800'; text = 'Visit'; break;
            case LeadStatus.VisitDone: bgColor = 'bg-indigo-100'; textColor = 'text-indigo-800'; text = 'Visit Done'; break;
            case LeadStatus.Negotiation: bgColor = 'bg-orange-100'; textColor = 'text-orange-800'; break;
            case LeadStatus.Booked: bgColor = 'bg-green-100'; textColor = 'text-green-800'; break;
            case LeadStatus.Cancelled: bgColor = 'bg-gray-100'; textColor = 'text-gray-800'; break;
        }
    }
    
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${bgColor} ${textColor}`}>{text}</span>;
}


const LeadsTable: React.FC<LeadsTableProps> = ({ leads, users, onOpenModal, selectedLeadIds, onSelectLead, onSelectAll, allVisibleLeadsSelected }) => {
  const userMap = new Map<string, User>(users.map(user => [user.id, user]));

  if (leads.length === 0) {
    return <div className="card text-center text-text-secondary py-8 px-4">No leads match the current filters.</div>;
  }

  return (
    <div className="card overflow-hidden">
        {/* Mobile View - Cards */}
        <div className="md:hidden">
            <div className="p-4">
                <div className="flex items-center pb-4 border-b border-border-color mb-4">
                    <input 
                        type="checkbox"
                        id="select-all-mobile"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        onChange={onSelectAll}
                        checked={allVisibleLeadsSelected}
                        aria-label="Select all visible leads"
                    />
                    <label htmlFor="select-all-mobile" className="ml-3 text-sm font-medium text-text-primary">
                        Select all ({leads.length})
                    </label>
                </div>
            </div>
            <div className="space-y-3 px-4 pb-4">
                {leads.map(lead => {
                    const salesperson = userMap.get(lead.assignedSalespersonId);
                    return (
                        <div key={lead.id} className={`p-3 rounded-lg border transition-colors ${selectedLeadIds.has(lead.id) ? 'bg-blue-50 border-primary' : 'bg-surface border-border-color'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                        {!lead.isRead && <span className="h-2 w-2 bg-primary rounded-full mr-2 flex-shrink-0" title="Unread"></span>}
                                        <p className="font-bold text-text-primary truncate" title={lead.customerName}>{lead.customerName}</p>
                                    </div>
                                    <p className="text-sm text-text-secondary">{lead.mobile}</p>
                                </div>
                                <input 
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary ml-2 flex-shrink-0"
                                    checked={selectedLeadIds.has(lead.id)}
                                    onChange={() => onSelectLead(lead.id)}
                                    aria-label={`Select lead for ${lead.customerName}`}
                                />
                            </div>
                            <div className="mt-3 flex justify-between items-center text-sm">
                               <StatusBadge type="status" value={lead.status} />
                               <p className="text-text-secondary truncate ml-2">{salesperson?.name || 'N/A'}</p>
                            </div>
                            <div className="mt-3">
                                <p className="text-xs text-text-secondary italic truncate">"{lead.lastRemark}"</p>
                            </div>
                            <button onClick={() => onOpenModal(lead)} className="mt-3 w-full text-center py-2 text-sm font-semibold text-primary bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                                View Details
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color text-sm">
            <thead className="bg-green-50">
                <tr>
                <th scope="col" className="px-4 py-2">
                    <input 
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        onChange={onSelectAll}
                        checked={allVisibleLeadsSelected}
                        aria-label="Select all visible leads"
                    />
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">S.No.</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Lead Info</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Sales Person</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Visit</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Project</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Temperature</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Last Remark</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border-color">
                {leads.map((lead, index) => {
                const salesperson = userMap.get(lead.assignedSalespersonId);
                return (
                    <tr key={lead.id} className={`transition-colors duration-200 ${selectedLeadIds.has(lead.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-2">
                        <input 
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={selectedLeadIds.has(lead.id)}
                            onChange={() => onSelectLead(lead.id)}
                            aria-label={`Select lead for ${lead.customerName}`}
                        />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-text-secondary">{index + 1}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                            {!lead.isRead && <span className="h-2 w-2 bg-primary rounded-full mr-2 flex-shrink-0" title="Unread"></span>}
                            <div>
                                <div className="font-medium text-text-primary">{lead.customerName}</div>
                                <div className="text-text-secondary">{lead.mobile}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-text-secondary">
                        <div>{new Date(lead.leadDate).toLocaleDateString()}</div>
                        <div>{lead.month}</div>
                        <div>{lead.modeOfEnquiry}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-text-secondary">{salesperson?.name || 'N/A'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-text-secondary">
                        <StatusBadge type="visit" value={lead.visitStatus} />
                        <div className="mt-1">{lead.visitDate || ''}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-text-secondary">{lead.interestedProject || 'N/A'}</td>
                    <td className="px-4 py-2 whitespace-nowrap"><StatusBadge type="status" value={lead.status} /></td>
                    <td className="px-4 py-2 whitespace-nowrap"><StatusBadge type="temp" value={lead.temperature} /></td>
                    <td className="px-4 py-2 text-text-secondary whitespace-normal max-w-xs truncate" title={lead.lastRemark}>{lead.lastRemark}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => onOpenModal(lead)} className="text-primary hover:text-primary-hover font-semibold">
                            Details
                        </button>
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>
    </div>
  );
};

export default LeadsTable;
