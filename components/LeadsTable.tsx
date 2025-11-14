import React from 'react';
import type { Lead, User } from '../types';
import { LeadStatus, ModeOfEnquiry } from '../types';
import { PhoneIcon, MailIcon, ChatBubbleIcon } from './Icons';

interface LeadsTableProps {
  leads: Lead[];
  users: User[];
  onOpenModal: (lead: Lead) => void;
  selectedLeadIds: Set<string>;
  onSelectLead: (leadId: string) => void;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  allVisibleLeadsSelected: boolean;
}

const getStatusBadge = (status: LeadStatus) => {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full leading-tight";
  switch (status) {
    case LeadStatus.New:
      return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>New</span>;
    case LeadStatus.Contacted:
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Contacted</span>;
    case LeadStatus.VisitScheduled:
      return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Visit Scheduled</span>;
    case LeadStatus.VisitDone:
      return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>Visit Done</span>;
    case LeadStatus.Negotiation:
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>Negotiation</span>;
    case LeadStatus.Booked:
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>Booked</span>;
    case LeadStatus.Cancelled:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Cancelled</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
  }
};

const getTemperatureIndicator = (temperature?: 'Hot' | 'Warm' | 'Cold') => {
    switch (temperature) {
        case 'Hot':
            return <span className="h-2.5 w-2.5 bg-red-500 rounded-full ml-2 flex-shrink-0" title="Hot"></span>;
        case 'Warm':
            return <span className="h-2.5 w-2.5 bg-yellow-400 rounded-full ml-2 flex-shrink-0" title="Warm"></span>;
        case 'Cold':
            return <span className="h-2.5 w-2.5 bg-blue-400 rounded-full ml-2 flex-shrink-0" title="Cold"></span>;
        default:
            return null;
    }
};

const getSourceBadge = (source: ModeOfEnquiry) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full leading-tight inline-flex items-center";
    switch (source) {
        case ModeOfEnquiry.Website:
            return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>🌐 Website</span>;
        case ModeOfEnquiry.Facebook:
            return <span className={`${baseClasses} bg-blue-600 text-white`}>📘 Facebook</span>;
        case ModeOfEnquiry.Instagram:
            return <span className={`${baseClasses} bg-pink-500 text-white`}>📷 Instagram</span>;
        case ModeOfEnquiry.WalkIn:
            return <span className={`${baseClasses} bg-green-100 text-green-800`}>🚶 Walk-in</span>;
        case ModeOfEnquiry.IVR:
            return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>📞 IVR</span>;
        case ModeOfEnquiry.Call:
            return <span className={`${baseClasses} bg-teal-100 text-teal-800`}>☎️ Call</span>;
        case ModeOfEnquiry.Reference:
            return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>👥 Reference</span>;
        case ModeOfEnquiry.Digital:
            return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>💻 Digital</span>;
        default:
            return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{source}</span>;
    }
};

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, users, onOpenModal, selectedLeadIds, onSelectLead, onSelectAll, allVisibleLeadsSelected }) => {
  // FIX: Explicitly type the Map to ensure proper type inference for 'salesperson'.
  const userMap = new Map<string, User>(users.map(user => [user.id, user]));

  return (
    <div className="card">
       <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-color">
          <thead className="bg-background">
            <tr>
              <th scope="col" className="px-6 py-3">
                 <input 
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    onChange={onSelectAll}
                    checked={allVisibleLeadsSelected}
                    aria-label="Select all visible leads"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Source</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Follow-up</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border-color">
            {leads.map(lead => {
              const salesperson = userMap.get(lead.assignedSalespersonId);
              const isOverdue = lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) < new Date();
              return (
                <tr key={lead.id} className={`transition-colors duration-200 ${selectedLeadIds.has(lead.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <input 
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedLeadIds.has(lead.id)}
                        onChange={() => onSelectLead(lead.id)}
                        aria-label={`Select lead for ${lead.customerName}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        {!lead.isRead && <span className="h-2 w-2 bg-primary rounded-full mr-2 flex-shrink-0" title="Unread"></span>}
                        <div>
                            <div className="flex items-center">
                               <div className="text-sm font-medium text-text-primary">{lead.customerName}</div>
                               {getTemperatureIndicator(lead.temperature)}
                            </div>
                            <div className="text-sm text-text-secondary">{lead.mobile}</div>
                            <div className="text-xs text-text-secondary">Assigned: {salesperson?.name || 'N/A'}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSourceBadge(lead.modeOfEnquiry)}
                  </td>
                  <td className="px-6 py-4 whitespace-normal max-w-xs">
                     <div className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-text-primary'}`}>
                        {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'Not set'}
                     </div>
                     <p className="text-xs text-text-secondary truncate italic">"{lead.lastRemark}"</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(lead.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                        <a href={`tel:${lead.mobile}`} title="Call" className="action-button text-gray-400 hover:text-green-500 hover:bg-green-100"><PhoneIcon className="w-5 h-5"/></a>
                        <a href={`https://wa.me/${lead.mobile}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="action-button text-gray-400 hover:text-green-500 hover:bg-green-100"><ChatBubbleIcon className="w-5 h-5"/></a>
                        {lead.email && <a href={`mailto:${lead.email}`} title="Email" className="action-button text-gray-400 hover:text-blue-500 hover:bg-blue-100"><MailIcon className="w-5 h-5"/></a>}
                        <button onClick={() => onOpenModal(lead)} className="text-primary hover:text-primary-hover font-semibold ml-2">
                            Update
                        </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {leads.length === 0 && <p className="text-center text-text-secondary py-8">No leads match the current filters.</p>}
       </div>
    </div>
  );
};

export default LeadsTable;