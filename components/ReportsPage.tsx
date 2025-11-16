



import React, { useState } from 'react';
import { ChartBarIcon, PhoneIcon, ChatBubbleIcon } from './Icons';
import { Lead, User, LeadStatus, Activity, ActivityType } from '../types';
import LeadDetailModal from './LeadDetailModal';
import SalesPipelineChart from './SalesPipelineChart';
import SalesFunnelChart from './SalesFunnelChart';
import ActivityFeed from './ActivityFeed';

interface CancelledLeadsTableProps {
    leads: Lead[];
    onOpenModal: (lead: Lead) => void;
}

const CancelledLeadsTable: React.FC<CancelledLeadsTableProps> = ({ leads, onOpenModal }) => {
    return (
        <div className="bg-white rounded-xl shadow-md">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Customer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Project</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Cancelled On</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Reason</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leads.map(lead => (
                            <tr key={lead.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-text-primary">{lead.customerName}</div>
                                    <div className="text-sm text-text-secondary">{lead.mobile}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{lead.interestedProject || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(lead.lastActivityDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-normal text-sm text-text-secondary max-w-sm">{lead.lastRemark}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-3">
                                        <a href={`tel:${lead.mobile}`} title="Call" className="text-gray-400 hover:text-green-500"><PhoneIcon className="w-5 h-5"/></a>
                                        <a href={`https://wa.me/${lead.mobile.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="text-gray-400 hover:text-green-500"><ChatBubbleIcon className="w-5 h-5"/></a>
                                        <button onClick={() => onOpenModal(lead)} className="text-primary hover:text-primary-hover font-semibold">
                                            Update
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {leads.length === 0 && <p className="text-center text-text-secondary py-8">No cancelled leads found.</p>}
            </div>
        </div>
    );
};


interface ReportsPageProps {
    leads: Lead[];
    users: User[];
    currentUser: User;
    onUpdateLead: (lead: Lead) => void;
    onAddActivity: (lead: Lead, activityType: ActivityType, remarks: string, duration?: number) => void;
    activities: Activity[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ leads, users, currentUser, onUpdateLead, onAddActivity, activities }) => {
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const handleOpenModal = (lead: Lead) => {
        setSelectedLead(lead);
    };

    const handleCloseModal = () => {
        setSelectedLead(null);
    };
    
    if (currentUser.role !== 'Admin') {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Reporting</h2>
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <p className="text-text-secondary">This page is available for Admins only.</p>
                </div>
            </div>
        );
    }

    const cancelledLeads = leads.filter(lead => lead.status === LeadStatus.Cancelled);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Reporting</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <SalesPipelineChart leads={leads} />
                </div>
                <div className="card p-6">
                    <SalesFunnelChart leads={leads} />
                </div>
            </div>

            <div className="card p-6">
                <ActivityFeed activities={activities} users={users} title="Full Activity Log" />
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary">Cancelled Leads Report</h3>
                <p className="text-sm text-text-secondary">A log of all leads that have been marked as cancelled.</p>
                <CancelledLeadsTable leads={cancelledLeads} onOpenModal={handleOpenModal} />
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

export default ReportsPage;