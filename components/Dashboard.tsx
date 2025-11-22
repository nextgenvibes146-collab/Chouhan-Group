
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Lead, User, Activity, LeadStatus } from '../types';
import { InformationCircleIcon } from './Icons';

interface DashboardProps {
    leads: Lead[];
    users: User[];
    activities: Activity[];
    currentUser: User;
    onLogout: () => void;
    onNavigate: (view: string) => void;
}

const KpiCard: React.FC<{ title: string, value: string | number, className?: string }> = ({ title, value, className = '' }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-card border border-slate-100 hover:shadow-card-hover transition-shadow ${className}`}>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{value}</p>
    </div>
);

const LeadsTrendChart: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const chartData = useMemo(() => {
        const last7Days = Array.from({ length: 8 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
        }).reverse();

        const leadsByDay = leads.reduce((acc, lead) => {
            const date = new Date(lead.leadDate).toLocaleDateString('en-CA');
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return last7Days.map(dateStr => {
            const d = new Date(dateStr);
            return {
                name: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
                leads: leadsByDay[dateStr] || 0,
            };
        });
    }, [leads]);
    
    return (
        <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">Lead Acquisition</h3>
                <p className="text-sm text-slate-500">Daily incoming leads over the last 7 days</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="leads" 
                        stroke="#2563eb" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#fff', stroke: '#2563eb', strokeWidth: 2 }} 
                        activeDot={{ r: 8, fill: '#2563eb' }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const SalesFunnelView: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const funnelStages = [
        { name: LeadStatus.New, color: 'bg-indigo-500', width: 'w-full' },
        { name: LeadStatus.Qualified, color: 'bg-blue-500', width: 'w-[90%]' },
        { name: LeadStatus.SiteVisitScheduled, color: 'bg-sky-500', width: 'w-[80%]' },
        { name: LeadStatus.ProposalSent, color: 'bg-teal-500', width: 'w-[70%]' },
        { name: LeadStatus.Negotiation, color: 'bg-emerald-500', width: 'w-[60%]' },
        { name: LeadStatus.Booking, color: 'bg-green-600', width: 'w-[50%]' },
    ];
    
    const leadCounts = useMemo(() => {
        return funnelStages.map(stage => {
            const count = leads.filter(l => l.status === stage.name).length;
            return { ...stage, count };
        });
    }, [leads]);

    return (
        <div className="p-6 space-y-3">
            {leadCounts.map((stage, index) => (
                <div key={index} className="flex items-center group">
                    <div className="w-32 text-sm font-medium text-slate-600 truncate pr-4">{stage.name}</div>
                    <div className="flex-1 h-10 bg-slate-50 rounded-lg overflow-hidden relative">
                        <div 
                            className={`h-full ${stage.color} rounded-lg flex items-center justify-between px-4 text-white text-sm font-bold shadow-sm transition-all duration-500 group-hover:brightness-110`}
                            style={{ width: `${Math.max(stage.count > 0 ? 15 : 0, Math.min(100, (stage.count / leads.length) * 100))}%` }}
                        >
                            <span>{stage.count}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const LabelwiseView: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
    
    const labelData = useMemo(() => {
        const counts: Record<string, number> = {};
        leads.forEach(lead => {
            (lead.labels || []).forEach(label => {
                counts[label] = (counts[label] || 0) + 1;
            });
        });
        
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 6);
    }, [leads]);

    const total = labelData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="p-6 flex flex-col sm:flex-row items-center">
             <div className="w-full sm:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={labelData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value" 
                            stroke="none"
                        >
                            {labelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
             </div>
            <div className="w-full sm:w-1/2 space-y-3 mt-4 sm:mt-0 pl-0 sm:pl-6">
                {labelData.map((entry, index) => (
                    <div key={entry.name} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-3 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="text-slate-700 font-semibold">{entry.name}</span>
                        </div>
                        <div className="text-slate-500 font-medium">
                            {entry.value} <span className="text-xs opacity-60">({total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const LeadsDashboardTab: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const [activeSubTab, setActiveSubTab] = useState('Sales funnels');
    
    const { total, contacted, newLeads } = useMemo(() => {
        const total = leads.length;
        const contacted = leads.filter(l => l.status !== LeadStatus.New).length;
        const newLeads = total - contacted;
        return { total, contacted, newLeads };
    }, [leads]);

    const conversionRate = total > 0 ? (leads.filter(l => l.status === LeadStatus.Booking).length / total * 100).toFixed(1) : 0;
    const contactedRate = total > 0 ? (contacted / total * 100).toFixed(0) : 0;
    
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total Leads" value={total} />
                <KpiCard title="Conversion Rate" value={`${conversionRate}%`} className="text-emerald-600" />
                <KpiCard title="Contact Ratio" value={`${contactedRate}%`} />
                <KpiCard title="Fresh Leads" value={newLeads} className="text-primary" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                     <LeadsTrendChart leads={leads} />
                </div>
                <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden flex flex-col">
                    <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 m-2 rounded-xl">
                        {['Sales funnels', 'Labelwise'].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveSubTab(tab)} 
                                className={`flex-1 py-2 text-xs font-bold text-center rounded-lg transition-all ${activeSubTab === tab ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1">
                        {activeSubTab === 'Sales funnels' && <SalesFunnelView leads={leads} />}
                        {activeSubTab === 'Labelwise' && <LabelwiseView leads={leads} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ leads, users, activities, currentUser, onLogout, onNavigate }) => {
    const [activeTab, setActiveTab] = useState('Leads');

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <header className="flex justify-between items-end pb-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
                    <p className="text-slate-500 mt-1 font-medium">Welcome back, here's what's happening today.</p>
                </div>
            </header>

            {/* Main Tabs */}
            <div className="bg-white p-1 rounded-xl inline-flex shadow-sm border border-slate-100">
                {['Leads', 'Calls', 'Checkin', 'Sales'].map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)} 
                        className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                            activeTab === tab 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === 'Leads' && <LeadsDashboardTab leads={leads} />}
                {activeTab !== 'Leads' && (
                    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-slate-200">
                         <InformationCircleIcon className="w-12 h-12 text-slate-300 mb-4" />
                         <p className="text-slate-500 font-medium">Analytics for {activeTab} are coming soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
