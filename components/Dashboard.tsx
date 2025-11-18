

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Lead, User, Activity, LeadStatus } from '../types';
import { InformationCircleIcon, AdjustmentsHorizontalIcon, CogIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from './Icons';

interface DashboardProps {
    leads: Lead[];
    users: User[];
    activities: Activity[];
    currentUser: User;
    onLogout: () => void;
    onNavigate: (view: string) => void;
}

const UserControlPanel: React.FC<{ 
    user: User; 
    onLogout: () => void;
    onNavigate: (view: string) => void;
}> = ({ user, onLogout, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSettingsClick = () => {
        onNavigate('Settings');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <div className="flex items-center space-x-2">
                <span className="font-semibold text-base-content hidden sm:block">{user.name}</span>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-primary rounded-md bg-blue-100/80 hover:bg-blue-100 transition-colors">
                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                </button>
            </div>

            <div className={`absolute right-0 mt-2 w-64 bg-base-100 rounded-xl shadow-card border border-border-color z-20 origin-top-right transition-all duration-200 ease-out transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="p-2">
                    <div className="flex items-center p-2">
                        <img src={user.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full" />
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-base-content">{user.name}</p>
                            <p className="text-xs text-muted-content">{user.role}</p>
                        </div>
                    </div>
                    <div className="my-1 h-px bg-border-color" />
                    <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center w-full text-left px-3 py-2 text-sm text-base-content rounded-md hover:bg-base-300/70 transition-colors">
                        <UserCircleIcon className="w-5 h-5 mr-3 text-muted-content" />
                        <span>My Profile</span>
                    </a>
                    {user.role === 'Admin' && (
                        <button onClick={handleSettingsClick} className="flex items-center w-full text-left px-3 py-2 text-sm text-base-content rounded-md hover:bg-base-300/70 transition-colors">
                            <CogIcon className="w-5 h-5 mr-3 text-muted-content" />
                            <span>Team Settings</span>
                        </button>
                    )}
                    <div className="my-1 h-px bg-border-color" />
                    <button onClick={onLogout} className="flex items-center w-full text-left px-3 py-2 text-sm text-danger rounded-md hover:bg-red-50 transition-colors">
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const KpiCard: React.FC<{ title: string, value: string | number, className?: string }> = ({ title, value, className = '' }) => (
    <div className={`bg-white p-4 rounded-lg shadow-subtle border border-border-color ${className}`}>
        <p className="text-sm text-muted-content">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-base-content mt-1">{value}</p>
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
        <div className="bg-white p-4 rounded-lg shadow-subtle border border-border-color">
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}/>
                    <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
             <p className="text-center text-xs text-muted-content mt-2">Showing data from last 7 days</p>
        </div>
    );
};

const SalesFunnelView: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const funnelStages = [
        { name: LeadStatus.New, color: 'bg-purple-600' },
        { name: LeadStatus.Qualified, color: 'bg-green-500' },
        { name: LeadStatus.Disqualified, color: 'bg-orange-500' },
        { name: LeadStatus.SiteVisitPending, color: 'bg-pink-500' },
        { name: LeadStatus.SiteVisitScheduled, color: 'bg-blue-500' },
        { name: LeadStatus.ProposalSent, color: 'bg-amber-500' },
        { name: LeadStatus.ProposalFinalized, color: 'bg-lime-600' },
        { name: LeadStatus.Negotiation, color: 'bg-indigo-600' },
        { name: LeadStatus.Booking, color: 'bg-teal-500' },
        { name: LeadStatus.Lost, color: 'bg-red-500' },
    ];
    
    const leadCounts = useMemo(() => {
        return funnelStages.map(stage => {
            const count = leads.filter(l => l.status === stage.name).length;
            return { ...stage, count };
        });
    }, [leads]);

    return (
        <div className="p-4 space-y-2">
            {leadCounts.map((stage, index) => (
                <div
                    key={index}
                    className={`w-full h-10 flex items-center justify-between px-4 rounded-md text-white text-sm font-semibold ${stage.color}`}
                    style={{
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
                    }}
                >
                    <span>{stage.count} {stage.name} Leads</span>
                    <span>₹0 Sale Value</span>
                </div>
            ))}
        </div>
    );
};

const LabelwiseView: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    
    const labelData = useMemo(() => {
        const counts: Record<string, number> = {};
        leads.forEach(lead => {
            (lead.labels || []).forEach(label => {
                counts[label] = (counts[label] || 0) + 1;
            });
        });
        
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [leads]);

    const total = labelData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="p-4">
             <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie data={labelData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" >
                        {labelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
                {labelData.map((entry, index) => (
                    <div key={entry.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="text-base-content font-medium">{entry.name}</span>
                        </div>
                        <div className="text-muted-content font-semibold">
                            {total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}% | {entry.value}
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

    const conversionRate = total > 0 ? (leads.filter(l => l.status === LeadStatus.Booking).length / total * 100).toFixed(0) : 0;
    const contactedRate = total > 0 ? (contacted / total * 100).toFixed(0) : 0;
    
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <KpiCard title="Total Leads" value={total} className="col-span-2" />
                <KpiCard title="Conversion ratio" value={`${conversionRate}%`} />
                <KpiCard title="Contacted" value={`${contactedRate}%`} />
                <KpiCard title="Created" value={total} />
                <KpiCard title="Assigned" value={0} /> {/* Mocked as per screenshot */}
                <KpiCard title="Untouched" value={newLeads} />
            </div>
            
            <LeadsTrendChart leads={leads} />

            <div className="bg-white rounded-lg shadow-subtle border border-border-color">
                <div className="flex border-b border-border-color">
                    {['Sales funnels', 'Sourcewise', 'Labelwise'].map(tab => (
                        <button key={tab} onClick={() => setActiveSubTab(tab)} className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors ${activeSubTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-content hover:bg-base-200'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div>
                    {activeSubTab === 'Sales funnels' && <SalesFunnelView leads={leads} />}
                    {activeSubTab === 'Labelwise' && <LabelwiseView leads={leads} />}
                    {activeSubTab === 'Sourcewise' && <p className="p-8 text-center text-muted-content">Sourcewise data will be shown here.</p>}
                </div>
            </div>
        </div>
    );
};

const SalesDashboardTab: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full pt-16">
            <p className="text-lg font-semibold text-base-content">No data found!</p>
            <button className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded-full shadow-md hover:bg-primary-focus transition-colors">
                Set Targets
            </button>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ leads, users, activities, currentUser, onLogout, onNavigate }) => {
    const [activeTab, setActiveTab] = useState('Leads');

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-base-content">Dashboard</h1>
                    <InformationCircleIcon className="w-5 h-5 text-muted-content" />
                </div>
                <UserControlPanel user={currentUser} onLogout={onLogout} onNavigate={onNavigate} />
            </header>

            {/* Main Tabs */}
            <div className="flex border-b border-border-color bg-white rounded-t-lg shadow-subtle">
                {['Leads', 'Calls', 'Checkin', 'Sales'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-content hover:bg-base-200'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="pb-4">
                {activeTab === 'Leads' && <LeadsDashboardTab leads={leads} />}
                {activeTab === 'Sales' && <SalesDashboardTab />}
                {activeTab === 'Calls' && <p className="p-8 text-center text-muted-content">Call logs will be displayed here.</p>}
                {activeTab === 'Checkin' && <p className="p-8 text-center text-muted-content">Check-in information will be displayed here.</p>}
            </div>
        </div>
    );
};

export default Dashboard;