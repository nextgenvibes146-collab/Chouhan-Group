import React from 'react';
import { LeadStatus, Lead, User, Activity, SalesTarget, Task } from '../types';
import MetricCard from './MetricCard';
import SalesPipelineChart from './SalesPipelineChart';
import PerformanceChart from './PerformanceChart';
import ActivityFeed from './ActivityFeed';
import AttendanceCard from './AttendanceCard';
import FollowUpChart from './FollowUpChart';

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
        <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">{welcomeMessage}</h2>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <MetricCard title={leadCardTitle} value={totalLeads.toString()} />
            <MetricCard title="Bookings This Month" value={bookingsThisMonth.toString()} />
            <MetricCard title="Overdue Follow-ups" value={overdueFollowUps.toString()} isAlert={overdueFollowUps > 0} />
            <MetricCard title="Upcoming Visits" value={upcomingVisits.toString()} />
        </div>
        
        {/* Charts and Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                <SalesPipelineChart leads={leads} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col space-y-6">
                <AttendanceCard />
                <ActivityFeed activities={activities} users={users} />
            </div>
        </div>
        
        {/* Performance Charts (Admin only) */}
        {isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <PerformanceChart targets={salesTargets} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <FollowUpChart activities={activities} users={users} />
                </div>
            </div>
        )}
    </div>
  );
};

export default Dashboard;
