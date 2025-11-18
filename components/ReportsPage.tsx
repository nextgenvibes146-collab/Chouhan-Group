

import React, { useState } from 'react';
import { PhoneIcon, ChatBubbleIcon, UsersIcon } from './Icons';
import { Lead, User, LeadStatus, Activity, ActivityType } from '../types';
import LeadDetailModal from './LeadDetailModal';
import SalesPipelineChart from './SalesPipelineChart';
import SalesFunnelChart from './SalesFunnelChart';

interface TeamPerformanceTableProps {
    users: User[];
    leads: Lead[];
}

const TeamPerformanceTable: React.FC<TeamPerformanceTableProps> = ({ users, leads }) => {
    const salespersons = users.filter(u => u.role === 'Salesperson');
    const performanceData = salespersons.map(user => {
        const userLeads = leads.filter(l => l.assignedSalespersonId === user.id);
        return {
            ...user,
            totalLeads: userLeads.length,
            bookings: userLeads.filter(l => l.status === LeadStatus.Booked).length,
            visits: userLeads.filter(l => l.visitStatus === 'Yes').length,
            conversionRate: userLeads.length > 0 ? (userLeads.filter(l => l.status === LeadStatus.Booked).length / userLeads.length * 100).toFixed(1) : 0,
        };
    });

    return (
        <div className="card">
            <h3 className="text-lg font-bold text-base-content p-6 border-b border-border-color">Team Performance</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-base-300">
                        <tr>
                            <th scope="col" className="px-2 py-3 md:px-6 text-left text-xs font-bold text-muted-content uppercase tracking-wider">Salesperson</th>
                            <th scope="col" className="px-2 py-3 md:px-6 text-center text-xs font-bold text-muted-content uppercase tracking-wider">Total Leads</th>
                            <th scope="col" className="px-2 py-3 md:px-6 text-center text-xs font-bold text-muted-content uppercase tracking-wider">Visits</th>
                            <th scope="col" className="px-2 py-3 md:px-6 text-center text-xs font-bold text-muted-content uppercase tracking-wider">Bookings</th>
                            <th scope="col" className="px-2 py-3 md:px-6 text-center text-xs font-bold text-muted-content uppercase tracking-wider">Conv. Rate</th>
                        </tr>
                    </thead>
                    <tbody className="bg-base-100 divide-y divide-border-color">
                        {performanceData.map(user => (
                            <tr key={user.id}>
                                <td className="px-2 py-4 md:px-6 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-9 w-9 rounded-full" src={user.avatarUrl} alt="" />
                                        <div className="ml-3">
                                            <div className="text-sm font-semibold text-base-content">{user.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 md:px-6 whitespace-nowrap text-center text-sm text-base-content font-medium">{user.totalLeads}</td>
                                <td className="px-2 py-4 md:px-6 whitespace-nowrap text-center text-sm text-base-content font-medium">{user.visits}</td>
                                <td className="px-2 py-4 md:px-6 whitespace-nowrap text-center text-sm text-accent-green font-bold">{user.bookings}</td>
                                <td className="px-2 py-4 md:px-6 whitespace-nowrap text-center text-sm text-accent-blue font-bold">{user.conversionRate}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const CancelledLeadsTable: React.FC<{ leads: Lead[], onOpenModal: (lead: Lead) => void }> = ({ leads, onOpenModal }) => {
    return (
        <div className="card">
             <h3 className="text-lg font-bold text-base-content p-6 border-b border-border-color">Cancelled Leads Report</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-base-300">
                        <tr>
                            <th scope="col" className="px-2 py-3 md:px-6 text-left text-xs font-bold text-muted-content uppercase tracking-wider">Customer</th>
                            <th scope="col" className="px-2 py-3 md:px-6 text-left text-xs font-bold text-muted-content uppercase tracking-wider">Reason</th>
                            <th scope="col" className="px-2 py-3 md:px-6 text-right text-xs font-bold text-muted-content uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-base-100 divide-y divide-border-color">
                        {leads.map(lead => (
                            <tr key={lead.id}>
                                <td className="px-2 py-4 md:px-6 whitespace-nowrap">
                                    <div className="text-sm font-medium text-base-content">{lead.customerName}</div>
                                    <div className="text-sm text-muted-content">{new Date(lead.lastActivityDate).toLocaleDateString()}</div>
                                </td>
                                <td className="px-2 py-4 md:px-6 whitespace-normal text-sm text-muted-content max-w-sm">{lead.lastRemark}</td>
                                <td className="px-2 py-4 md:px-6 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-3">
                                        <button onClick={() => onOpenModal(lead)} className="text-primary hover:text-primary-focus font-semibold">
                                            View Details
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {leads.length === 0 && <p className="text-center text-muted-content py-8">No cancelled leads to report.</p>}
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

    if (currentUser.role !== 'Admin') {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">Reports</h1>
                <div className="card text-center py-16">
                     <UsersIcon className="w-16 h-16 text-primary opacity-50 mx-auto mb-4" />
                    <p className="text-muted-content font-semibold">Access Denied</p>
                    <p className="text-muted-content">The reporting section is available for Admins only.</p>
                </div>
            </div>
        );
    }

    const cancelledLeads = leads.filter(lead => lead.status === LeadStatus.Cancelled);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">Sales Reports</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <SalesPipelineChart leads={leads} />
                </div>
                <div className="card p-6">
                    <SalesFunnelChart leads={leads} />
                </div>
            </div>

            <TeamPerformanceTable users={users} leads={leads} />

            <CancelledLeadsTable leads={cancelledLeads} onOpenModal={setSelectedLead} />

            {selectedLead && (
                <LeadDetailModal 
                    lead={selectedLead} 
                    onClose={() => setSelectedLead(null)}
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