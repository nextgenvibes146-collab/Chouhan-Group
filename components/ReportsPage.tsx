



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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">Customer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">Project</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">Cancelled On</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">Reason</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leads.map(lead => (
                            <tr key={lead.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-brand-dark">{lead.customerName}</div>
                                    <div className="text-sm text-brand-gray">{lead.mobile}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray">{lead.interestedProject || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray">{new Date(lead.lastActivityDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-normal text-sm text-brand-gray max-w-sm">{lead.lastRemark}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-3">
                                        <a href={`tel:${lead.mobile}`} title="Call" className="text-gray-400 hover:text-green-500"><PhoneIcon className="w-5 h-5"/></a>
                                        <a href={`httpshttps://wa.me/${lead.mobile.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="text-gray-400 hover:text-green-500"><ChatBubbleIcon className="w-5 h-5"/></a>
                                        <button onClick={() => onOpenModal(lead)} className="text-brand-blue hover:text-blue-700 font-semibold">
                                            Update
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {leads.length === 0 && <p className="text-center text-brand-gray py-8">No cancelled leads found.</p>}
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
                <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">Reporting</h2>
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <p className="text-brand-gray">This page is available for Admins only.</p>
                </div>
            </div>
        );
    }

    const cancelledLeads = leads.filter(lead => lead.status === LeadStatus.Cancelled);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">Reporting</h2>

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
                <h3 className="text-xl font-semibold text-brand-dark">Cancelled Leads Report</h3>
                <p className="text-sm text-brand-gray">A log of all leads that have been marked as cancelled.</p>
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