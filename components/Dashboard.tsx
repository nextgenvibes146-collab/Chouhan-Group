

import React from 'react';
import { LeadStatus, Lead, User, Activity, SalesTarget, Task } from '../types';
import MetricCard from './MetricCard';
import PerformanceChart from './PerformanceChart';
import ActivityFeed from './ActivityFeed';
import AttendanceCard from './AttendanceCard';
import FollowUpChart from './FollowUpChart';
import SalesFunnelChart from './SalesFunnelChart';
import { BriefcaseIcon, CheckCircleIcon, ExclamationTriangleIcon, CalendarDaysIcon } from './Icons';

interface DashboardProps {
    leads: Lead[];
    users: User[];
    activities: Activity[];
    salesTargets: SalesTarget[];
    currentUser: User;
    tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ leads, users, activities, salesTargets, currentUser, tasks }) => {
    const totalLeads = leads.length;
    const bookingsThisMonth = leads.filter(l => l.status === LeadStatus.Booked).length;
    
    const overdueFollowUps = leads.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) < new Date()).length;
    const upcomingVisits = leads.filter(l => l.status === LeadStatus.VisitScheduled).length;
    
    const isAdmin = currentUser.role === 'Admin';
    const welcomeMessage = isAdmin ? 'Dashboard Overview' : `Welcome, ${currentUser.name}!`;
    const leadCardTitle = isAdmin ? 'Total Leads' : 'My Total Leads';

  return (
    <div className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary">{welcomeMessage}</h2>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <MetricCard title={leadCardTitle} value={totalLeads.toString()} icon={<BriefcaseIcon className="w-8 h-8 text-blue-500" />} />
            <MetricCard title="Bookings This Month" value={bookingsThisMonth.toString()} icon={<CheckCircleIcon className="w-8 h-8 text-green-500" />} />
            <MetricCard title="Overdue Follow-ups" value={overdueFollowUps.toString()} isAlert={overdueFollowUps > 0} icon={<ExclamationTriangleIcon className="w-8 h-8 text-red-500" />} />
            <MetricCard title="Upcoming Visits" value={upcomingVisits.toString()} icon={<CalendarDaysIcon className="w-8 h-8 text-purple-500" />} />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
            <div className="card p-6">
                <AttendanceCard />
            </div>
        </div>
        
        {/* Performance Charts (Admin only) */}
        {isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <PerformanceChart targets={salesTargets} />
                </div>
                <div className="card p-6">
                    <FollowUpChart activities={activities} users={users} />
                </div>
            </div>
        )}
    </div>
  );
};

export default Dashboard;