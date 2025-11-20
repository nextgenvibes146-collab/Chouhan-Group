


import React, { useState, useMemo } from 'react';
import { 
    PhoneIcon, 
    ChatBubbleIcon, 
    UsersIcon, 
    CurrencyRupeeIcon,
    PresentationChartLineIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    ArrowLeftOnRectangleIcon
} from './Icons';
import { Lead, User, LeadStatus, Activity, ActivityType } from '../types';
import LeadDetailModal from './LeadDetailModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// --- types specific to Reports ---

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

interface ReportsPageProps {
    leads: Lead[];
    users: User[];
    currentUser: User;
    onUpdateLead: (lead: Lead) => void;
    onAddActivity: (lead: Lead, activityType: ActivityType, remarks: string, duration?: number) => void;
    activities: Activity[];
}

// --- Sub-components ---

const KPICard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, color }) => {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="card p-5 flex items-start justify-between transition-all hover:shadow-md">
            <div>
                <p className="text-sm font-medium text-muted-content">{title}</p>
                <h3 className="text-2xl font-bold text-base-content mt-1">{value}</h3>
                {subtitle && <p className="text-xs text-muted-content mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
                {icon}
            </div>
        </div>
    );
};

const RevenueChart: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const data = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        
        const revenueData = months.map(month => ({ name: month, Revenue: 0, Projected: 0 }));
        
        leads.forEach(lead => {
            const leadDate = new Date(lead.leadDate);
            if (leadDate.getFullYear() !== currentYear) return;
            
            const monthIndex = leadDate.getMonth();
            
            // Simulate revenue based on unit type for demo purposes
            let value = 0;
            if (lead.interestedUnit?.toLowerCase().includes('plot')) value = 15; // 15 Lacs
            else if (lead.interestedUnit?.toLowerCase().includes('flat')) value = 35; // 35 Lacs
            else if (lead.interestedUnit?.toLowerCase().includes('villa')) value = 80; // 80 Lacs
            else value = 20; // Avg

            if (lead.status === LeadStatus.Booked || lead.status === LeadStatus.Booking) {
                revenueData[monthIndex].Revenue += value;
            } else if (['Negotiation', 'Proposal Finalized'].includes(lead.status)) {
                revenueData[monthIndex].Projected += (value * 0.5); // 50% probability
            }
        });

        return revenueData;
    }, [leads]);

    return (
        <div className="card p-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-base-content">Revenue Trends (in Lacs)</h3>
                <p className="text-sm text-muted-content">Booked Revenue vs. Pipeline Projection</p>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            formatter={(value: number) => [`₹${value.toFixed(1)} L`, '']}
                        />
                        <Legend />
                        <Bar dataKey="Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} name="Booked Revenue" />
                        <Bar dataKey="Projected" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Projected Pipeline" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const LostReasonChart: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const data = useMemo(() => {
        const lostLeads = leads.filter(l => l.status === LeadStatus.Lost || l.status === LeadStatus.Cancelled || l.status === LeadStatus.Disqualified);
        const reasons: Record<string, number> = {};
        
        lostLeads.forEach(lead => {
            let reason = 'Other';
            const remark = (lead.lastRemark || '').toLowerCase();
            
            if (remark.includes('price') || remark.includes('budget') || remark.includes('expensive')) reason = 'Budget Issue';
            else if (remark.includes('location') || remark.includes('distance') || remark.includes('area')) reason = 'Location Preference';
            else if (remark.includes('plan') || remark.includes('drop')) reason = 'Plan Dropped';
            else if (remark.includes('competitor') || remark.includes('bought') || remark.includes('other project')) reason = 'Lost to Competitor';
            else if (remark.includes('loan') || remark.includes('finance')) reason = 'Loan Rejected';
            else if (lead.status === LeadStatus.Disqualified) reason = 'Disqualified';

            reasons[reason] = (reasons[reason] || 0) + 1;
        });

        return Object.entries(reasons).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    }, [leads]);

    const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#8b5cf6', '#64748b', '#94a3b8'];

    return (
        <div className="card p-6">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-base-content">Lost Opportunity Analysis</h3>
                <p className="text-sm text-muted-content">Why are deals falling through?</p>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
                <p className="text-xs text-muted-content">Based on {data.reduce((acc, curr) => acc + curr.value, 0)} lost leads</p>
            </div>
        </div>
    );
};

const SourcePerformanceTable: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const data = useMemo(() => {
        const sources: Record<string, { total: number, booked: number, visits: number }> = {};
        
        leads.forEach(lead => {
            const source = lead.modeOfEnquiry || 'Unknown';
            if (!sources[source]) sources[source] = { total: 0, booked: 0, visits: 0 };
            
            sources[source].total++;
            if (lead.status === LeadStatus.Booked || lead.status === LeadStatus.Booking) {
                sources[source].booked++;
            }
            if (lead.visitStatus === 'Yes' || lead.status === LeadStatus.SiteVisitDone) {
                sources[source].visits++;
            }
        });

        return Object.entries(sources)
            .map(([name, stats]) => ({
                name,
                ...stats,
                conversion: stats.total > 0 ? (stats.booked / stats.total * 100).toFixed(1) : '0.0',
                visitRatio: stats.total > 0 ? (stats.visits / stats.total * 100).toFixed(1) : '0.0'
            }))
            .sort((a, b) => b.booked - a.booked);
    }, [leads]);

    return (
        <div className="card overflow-hidden">
            <div className="p-6 border-b border-border-color">
                <h3 className="text-lg font-bold text-base-content">Marketing ROI & Lead Quality</h3>
                <p className="text-sm text-muted-content">Which lead sources are generating actual revenue?</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-base-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-muted-content uppercase">Source</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-muted-content uppercase">Total Leads</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-muted-content uppercase">Site Visits</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-muted-content uppercase">Bookings</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-muted-content uppercase">Conversion %</th>
                        </tr>
                    </thead>
                    <tbody className="bg-base-100 divide-y divide-border-color">
                        {data.map((row, idx) => (
                            <tr key={row.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-base-50'}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-base-content">{row.name}</td>
                                <td className="px-6 py-4 text-center text-muted-content">{row.total}</td>
                                <td className="px-6 py-4 text-center text-muted-content">
                                    {row.visits} <span className="text-xs text-gray-400">({row.visitRatio}%)</span>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-green-600">{row.booked}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        parseFloat(row.conversion) > 5 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {row.conversion}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AgentScorecard: React.FC<{ users: User[], leads: Lead[], activities: Activity[] }> = ({ users, leads, activities }) => {
    const salespersons = users.filter(u => u.role === 'Salesperson');
    
    const scorecard = salespersons.map(user => {
        const userLeads = leads.filter(l => l.assignedSalespersonId === user.id);
        const userActivities = activities.filter(a => a.salespersonId === user.id);
        
        const totalLeads = userLeads.length;
        const booked = userLeads.filter(l => l.status === LeadStatus.Booked).length;
        const calls = userActivities.filter(a => a.type === ActivityType.Call).length;
        const visits = userActivities.filter(a => a.type === ActivityType.Visit).length;
        
        // Calculate activity per lead ratio
        const intensity = totalLeads > 0 ? (userActivities.length / totalLeads).toFixed(1) : '0';

        return {
            ...user,
            totalLeads,
            booked,
            calls,
            visits,
            intensity,
            conversionRate: totalLeads > 0 ? (booked / totalLeads * 100).toFixed(1) : '0.0',
        };
    }).sort((a, b) => b.booked - a.booked);

    return (
        <div className="card overflow-hidden">
            <div className="p-6 border-b border-border-color flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-base-content">Agent Activity Scorecard</h3>
                    <p className="text-sm text-muted-content">Operational efficiency and effort metrics.</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-base-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-muted-content uppercase">Agent</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-muted-content uppercase">Leads</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-muted-content uppercase">Calls Logged</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-muted-content uppercase">Visits Done</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-muted-content uppercase">Effort Score</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-muted-content uppercase">Conversion</th>
                        </tr>
                    </thead>
                    <tbody className="bg-base-100 divide-y divide-border-color">
                        {scorecard.map(user => (
                            <tr key={user.id} className="hover:bg-base-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                                    <img className="h-8 w-8 rounded-full mr-3" src={user.avatarUrl} alt="" />
                                    <span className="text-sm font-medium text-base-content">{user.name}</span>
                                </td>
                                <td className="px-6 py-4 text-center text-sm">{user.totalLeads}</td>
                                <td className="px-6 py-4 text-center text-sm">{user.calls}</td>
                                <td className="px-6 py-4 text-center text-sm font-medium text-blue-600">{user.visits}</td>
                                <td className="px-6 py-4 text-center text-sm">
                                    <span className="text-xs font-medium text-gray-500">Avg {user.intensity} act/lead</span>
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-bold text-green-600">{user.conversionRate}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ReportsPage: React.FC<ReportsPageProps> = ({ leads, users, currentUser, onUpdateLead, onAddActivity, activities }) => {
    const [dateRange, setDateRange] = useState('This Month');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // --- Data Processing for Executive Summary ---
    const stats = useMemo(() => {
        const totalLeads = leads.length;
        const bookedLeads = leads.filter(l => l.status === LeadStatus.Booked || l.status === LeadStatus.Booking);
        const bookingCount = bookedLeads.length;
        
        // Mock Revenue Calculation (Estimate: 25L per booking avg)
        const revenueValue = bookingCount * 25.5; 
        
        // Pipeline Value (Hot/Warm/Negotiation leads * avg ticket size * probability)
        const pipelineLeads = leads.filter(l => ['Negotiation', 'Proposal Finalized', 'Qualified'].includes(l.status));
        const pipelineValue = pipelineLeads.length * 25.5 * 0.4; // 40% probability

        const activeLeads = leads.filter(l => ![LeadStatus.Lost, LeadStatus.Booked, LeadStatus.Cancelled, LeadStatus.Disqualified].includes(l.status)).length;

        return {
            revenue: revenueValue.toFixed(1),
            pipeline: pipelineValue.toFixed(1),
            bookings: bookingCount,
            activeLeads: activeLeads
        };
    }, [leads]);

    if (currentUser.role !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                <UsersIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-base-content">Access Restricted</h2>
                <p className="text-muted-content mt-2 max-w-md">Detailed business reports are available for Administrators only. Please focus on your individual Dashboard.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-base-content">Business Reports</h1>
                    <p className="text-sm text-muted-content">Operational intelligence and financial insights.</p>
                </div>
                <div className="flex items-center bg-white rounded-lg border border-border-color p-1 shadow-sm">
                    {['This Month', 'Last Month', 'This Quarter', 'This Year'].map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                dateRange === range 
                                ? 'bg-base-200 text-base-content font-bold' 
                                : 'text-muted-content hover:text-base-content hover:bg-gray-50'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Executive Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                    title="Booked Revenue (Est.)" 
                    value={`₹${stats.revenue} L`} 
                    subtitle={`${stats.bookings} units sold`} 
                    icon={<CurrencyRupeeIcon className="w-6 h-6" />} 
                    color="green" 
                />
                <KPICard 
                    title="Pipeline Value (Est.)" 
                    value={`₹${stats.pipeline} L`} 
                    subtitle="Weighted probability" 
                    icon={<PresentationChartLineIcon className="w-6 h-6" />} 
                    color="blue" 
                />
                <KPICard 
                    title="Active Leads" 
                    value={stats.activeLeads} 
                    subtitle="Currently in funnel" 
                    icon={<UsersIcon className="w-6 h-6" />} 
                    color="purple" 
                />
                <KPICard 
                    title="Site Visit Ratio" 
                    value="18.4%" 
                    subtitle="Leads to Visits" 
                    icon={<ClipboardDocumentListIcon className="w-6 h-6" />} 
                    color="orange" 
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart leads={leads} />
                </div>
                <div>
                    <LostReasonChart leads={leads} />
                </div>
            </div>

            {/* Detailed Data Tables */}
            <div className="space-y-8">
                <SourcePerformanceTable leads={leads} />
                <AgentScorecard users={users} leads={leads} activities={activities} />
            </div>

            {/* Cancelled Leads Summary (Collapsible or smaller) */}
            <div className="card bg-red-50 border-red-100">
                <div className="p-4 cursor-pointer flex justify-between items-center">
                    <div>
                        <h3 className="text-md font-bold text-red-900">Cancelled Bookings Audit</h3>
                        <p className="text-xs text-red-700">Review leads that cancelled after booking to identify service gaps.</p>
                    </div>
                    <button className="text-xs font-bold text-red-600 hover:underline">View {leads.filter(l => l.status === LeadStatus.Cancelled).length} Records</button>
                </div>
            </div>

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