import React from 'react';
import type { Lead, User } from '../types';
import { LeadStatus } from '../types';
import { PhoneIcon, MailIcon, ChatBubbleIcon } from './Icons';

interface LeadsTableProps {
  leads: Lead[];
  users: User[];
  onOpenModal: (lead: Lead) => void;
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

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, users, onOpenModal }) => {
  const userMap = new Map(users.map(user => [user.id, user]));

  return (
    <div className="bg-white rounded-xl shadow-md">
       <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">Follow-up</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map(lead => {
              const salesperson = userMap.get(lead.assignedSalespersonId);
              const isOverdue = lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) < new Date();
              return (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        {!lead.isRead && <span className="h-2 w-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>}
                        <div>
                            <div className="text-sm font-medium text-brand-dark">{lead.customerName}</div>
                            <div className="text-sm text-brand-gray">{lead.mobile}</div>
                            <div className="text-xs text-brand-gray">Assigned: {salesperson?.name || 'N/A'}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal max-w-xs">
                     <div className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-brand-dark'}`}>
                        {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'Not set'}
                     </div>
                     <p className="text-xs text-brand-gray truncate italic">"{lead.lastRemark}"</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(lead.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                        <a href={`tel:${lead.mobile}`} title="Call" className="text-gray-400 hover:text-green-500"><PhoneIcon className="w-5 h-5"/></a>
                        <a href={`https://wa.me/${lead.mobile}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="text-gray-400 hover:text-green-500"><ChatBubbleIcon className="w-5 h-5"/></a>
                        {lead.email && <a href={`mailto:${lead.email}`} title="Email" className="text-gray-400 hover:text-blue-500"><MailIcon className="w-5 h-5"/></a>}
                        <button onClick={() => onOpenModal(lead)} className="text-brand-blue hover:text-blue-700 font-semibold">
                            Update
                        </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {leads.length === 0 && <p className="text-center text-brand-gray py-8">No leads match the current filters.</p>}
       </div>
    </div>
  );
};

export default LeadsTable;
