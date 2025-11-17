

import React from 'react';
import { LeadStatus, Lead, User, Activity, SalesTarget, Task } from '../types';
import MetricCard from './MetricCard';
import PerformanceChart from './PerformanceChart';
import ActivityFeed from './ActivityFeed';
import FollowUpChart from './FollowUpChart';
import LeadSourceChart from './LeadSourceChart'; // New
import { BriefcaseIcon, CheckCircleIcon, ExclamationTriangleIcon, CalendarDaysIcon, UsersIcon, DocumentTextIcon } from './Icons';

interface DashboardProps {
    leads: Lead[];
    users: User[];
    activities: Activity[];
    salesTargets: SalesTarget[];
    currentUser: User;
    tasks: Task[];
}

const TasksSummary: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const openTasks = tasks.filter(t => !t.isCompleted);
    return (
        <div className="card p-6 h-full">
            <h3 className="text-lg font-bold text-base-content mb-4">My Open Tasks</h3>
            {openTasks.length > 0 ? (
                <ul className="space-y-3">
                    {openTasks.slice(0, 5).map(task => (
                        <li key={task.id} className="flex items-start space-x-3">
                            <DocumentTextIcon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-base-content">{task.title}</p>
                                <p className="text-xs text-muted-content">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-content">No open tasks. Well done!</p>
            )}
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ leads, users, activities, salesTargets, currentUser, tasks }) => {
    const totalLeads = leads.length;
    const bookingsThisMonth = leads.filter(l => l.status === LeadStatus.Booked).length;
    const overdueFollowUps = leads.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) < new Date()).length;
    const upcomingVisits = leads.filter(l => l.status === LeadStatus.VisitScheduled).length;
    
    const isAdmin = currentUser.role === 'Admin';
    const welcomeMessage = isAdmin ? 'Admin Dashboard' : `Welcome back, ${currentUser.name}!`;
    const leadCardTitle = isAdmin ? 'Total Leads' : 'My Leads';

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-extrabold text-base-content">{welcomeMessage}</h1>
            <p className="text-muted-content mt-1">Here's a snapshot of your sales activity.</p>
        </div>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title={leadCardTitle} value={totalLeads.toString()} icon={<BriefcaseIcon />} color="blue" />
            <MetricCard title="Bookings" value={bookingsThisMonth.toString()} icon={<CheckCircleIcon />} color="green" />
            <MetricCard title="Overdue" value={overdueFollowUps.toString()} icon={<ExclamationTriangleIcon />} color="red" />
            <MetricCard title="Visits Scheduled" value={upcomingVisits.toString()} icon={<CalendarDaysIcon />} color="purple" />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (Main Charts) */}
            <div className="lg:col-span-2 space-y-6">
                {isAdmin ? (
                    <>
                        <div className="card p-6">
                            <PerformanceChart targets={salesTargets} />
                        </div>
                        <div className="card p-6">
                           <FollowUpChart activities={activities} users={users} />
                        </div>
                    </>
                ) : (
                    <div className="card p-6">
                        <ActivityFeed activities={activities} users={users} title="My Recent Activity" />
                    </div>
                )}
            </div>

            {/* Right Column (Side Info) */}
            <div className="space-y-6">
                 {isAdmin && (
                    <div className="card p-6">
                        <LeadSourceChart leads={leads} />
                    </div>
                 )}
                <TasksSummary tasks={tasks} />
                {!isAdmin && (
                     <div className="card p-6">
                        <LeadSourceChart leads={leads} />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Dashboard;