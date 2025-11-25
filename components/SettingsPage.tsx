
import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { 
    UsersIcon, 
    BuildingLibraryIcon, 
    TargetIcon, 
    DatabaseIcon, 
    ShieldCheckIcon,
    TrashIcon,
    PlusIcon
} from './Icons';

interface SettingsPageProps {
  users: User[];
  onCreateUser: (userData: { name: string; }) => void;
  onDeleteUser: (userId: string) => void;
  onResetDatabase: () => void;
  currentUser: User;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

// --- Sub-Components for Settings Tabs ---

const TeamSettings: React.FC<{ 
    users: User[]; 
    onCreateUser: (data: { name: string }) => void; 
    onDeleteUser: (id: string) => void; 
}> = ({ users, onCreateUser, onDeleteUser }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const teamMembers = users.filter(u => u.role !== 'Admin');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('User name cannot be empty.');
            return;
        }
        setError('');
        onCreateUser({ name });
        setName('');
    };

    const handleDelete = (userId: string, userName: string) => {
        if (window.confirm(`Are you sure you want to delete ${userName}? All their leads and tasks will be reassigned to the Admin.`)) {
            onDeleteUser(userId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-border-color pb-4">
                <div>
                    <h3 className="text-lg font-bold text-base-content">Team Management</h3>
                    <p className="text-sm text-muted-content">Manage salespersons and access.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 card p-6 h-fit">
                    <h4 className="text-md font-semibold text-text-primary mb-4">Add New Salesperson</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label-style">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-style" placeholder="e.g., Jane Doe" />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button type="submit" className="button-primary !w-auto px-6">Add User</button>
                    </form>
                </div>

                <div className="lg:col-span-2 card overflow-hidden">
                    <table className="min-w-full divide-y divide-border-color">
                        <thead className="bg-base-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-content uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-content uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-content uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-base-100 divide-y divide-border-color">
                            {teamMembers.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                                        <img className="h-8 w-8 rounded-full mr-3" src={user.avatarUrl} alt="" />
                                        <span className="text-sm font-medium text-base-content">{user.name}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-content">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(user.id, user.name)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {teamMembers.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-content">No active salespersons.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ListManager: React.FC<{ title: string; subtitle: string; items: string[]; onAdd: (item: string) => void; onDelete: (index: number) => void; placeholder: string }> = ({ title, subtitle, items, onAdd, onDelete, placeholder }) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItem.trim()) {
            onAdd(newItem.trim());
            setNewItem('');
        }
    };

    return (
        <div className="card p-6">
            <div className="mb-4">
                <h4 className="text-lg font-semibold text-base-content">{title}</h4>
                <p className="text-sm text-muted-content">{subtitle}</p>
            </div>
            
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    value={newItem} 
                    onChange={(e) => setNewItem(e.target.value)} 
                    className="input-style flex-1" 
                    placeholder={placeholder} 
                />
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </form>

            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center p-3 bg-base-200 rounded-md group">
                        <span className="text-sm font-medium">{item}</span>
                        <button onClick={() => onDelete(idx)} className="text-muted-content hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
                {items.length === 0 && <p className="text-sm text-muted-content italic">No items added yet.</p>}
            </ul>
        </div>
    );
};

const MasterDataSettings: React.FC = () => {
    // Initialized with the updated project list
    const [projects, setProjects] = useState([
        'Chouhan Park View', 
        'Chouhan Business Park P1', 
        'Chouhan Business Park P2',
        'Chouhan Business Center',
        'Chouhan Town',
        'Chouhan Green Valley P1',
        'Chouhan Green Valley P2',
        'Chouhan Green Valley P3',
        'Sunrise City',
        'Singapore City P1',
        'Singapore City P2',
        'Singapore City P3',
        'Singapore City P4'
    ]);
    const [sources, setSources] = useState(['Website', 'Walk-in', 'Reference', 'Digital Ad', 'Hoarding', 'Newspaper', 'Telephone']);

    return (
        <div className="space-y-6">
            <div className="border-b border-border-color pb-4">
                <h3 className="text-lg font-bold text-base-content">Master Data</h3>
                <p className="text-sm text-muted-content">Configure dropdown options used in lead forms.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ListManager 
                    title="Project List" 
                    subtitle="Active projects available for sale."
                    items={projects}
                    onAdd={(item) => setProjects([...projects, item])}
                    onDelete={(idx) => setProjects(projects.filter((_, i) => i !== idx))}
                    placeholder="Enter project name..."
                />
                <ListManager 
                    title="Lead Sources" 
                    subtitle="Channels where leads come from."
                    items={sources}
                    onAdd={(item) => setSources([...sources, item])}
                    onDelete={(idx) => setSources(sources.filter((_, i) => i !== idx))}
                    placeholder="Enter source name..."
                />
            </div>
        </div>
    );
};

const SalesTargetSettings: React.FC = () => {
    const [monthlyTarget, setMonthlyTarget] = useState(5);
    const [visitTarget, setVisitTarget] = useState(10);

    return (
        <div className="space-y-6">
             <div className="border-b border-border-color pb-4">
                <h3 className="text-lg font-bold text-base-content">Sales Preferences</h3>
                <p className="text-sm text-muted-content">Set default targets and sales rules.</p>
            </div>

            <div className="card p-6 max-w-2xl">
                <h4 className="text-md font-semibold text-base-content mb-4">Default Monthly Targets</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label-style">Booking Target (Per Salesperson)</label>
                        <div className="flex items-center mt-1">
                            <input 
                                type="number" 
                                value={monthlyTarget} 
                                onChange={(e) => setMonthlyTarget(parseInt(e.target.value) || 0)} 
                                className="input-style w-full" 
                            />
                            <span className="ml-2 text-sm text-muted-content">Units</span>
                        </div>
                    </div>
                    <div>
                        <label className="label-style">Site Visit Target (Per Salesperson)</label>
                        <div className="flex items-center mt-1">
                            <input 
                                type="number" 
                                value={visitTarget} 
                                onChange={(e) => setVisitTarget(parseInt(e.target.value) || 0)} 
                                className="input-style w-full" 
                            />
                            <span className="ml-2 text-sm text-muted-content">Visits</span>
                        </div>
                    </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-md text-sm text-blue-800">
                    <p>Note: Changing these values will update the target dashboard for all salespersons starting next month.</p>
                </div>
                <div className="mt-4 flex justify-end">
                    <button className="button-primary !w-auto">Save Targets</button>
                </div>
            </div>
        </div>
    );
};

const SystemSettings: React.FC<{ onReset: () => void }> = ({ onReset }) => {
    return (
        <div className="space-y-6">
            <div className="border-b border-border-color pb-4">
                <h3 className="text-lg font-bold text-base-content">System Administration</h3>
                <p className="text-sm text-muted-content">Data management and system logs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h4 className="text-md font-semibold text-base-content mb-2">Data Backup</h4>
                    <p className="text-sm text-muted-content mb-4">Download a full backup of all leads, activities, and user data.</p>
                    <button className="px-4 py-2 bg-base-200 text-base-content border border-border-color rounded-md hover:bg-base-300 flex items-center">
                        <DatabaseIcon className="w-4 h-4 mr-2" />
                        Export Database (JSON)
                    </button>
                </div>

                <div className="card p-6">
                    <h4 className="text-md font-semibold text-base-content mb-2">Reset Database</h4>
                    <p className="text-sm text-muted-content mb-4">Wipe all current data and restore the initial demo dataset.</p>
                    <div className="flex items-center justify-between py-2 border-b border-border-color">
                        <span className="text-sm text-base-content">Restore Default Data</span>
                        <button onClick={onReset} className="text-xs text-red-600 hover:underline font-bold">Reset Now</button>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-base-content">Reset System Cache</span>
                        <button className="text-xs text-blue-600 hover:underline">Clear</button>
                    </div>
                </div>
            </div>
            
            <div className="text-center text-xs text-muted-content pt-8">
                <p>CRM Version 2.4.0 | Build 2025-10-27</p>
                <p>&copy; 2025 Chouhan Housing Pvt Ltd.</p>
            </div>
        </div>
    );
};

const SettingsPage: React.FC<SettingsPageProps> = ({ users, onCreateUser, onDeleteUser, onResetDatabase, currentUser, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'team' | 'master' | 'targets' | 'system'>('team');

  const tabs = [
      { id: 'team', label: 'Team', icon: <UsersIcon className="w-5 h-5" /> },
      { id: 'master', label: 'Master Data', icon: <BuildingLibraryIcon className="w-5 h-5" /> },
      { id: 'targets', label: 'Targets', icon: <TargetIcon className="w-5 h-5" /> },
      { id: 'system', label: 'System', icon: <ShieldCheckIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
        <header className="flex justify-between items-center flex-shrink-0">
            <h1 className="text-2xl font-bold text-base-content">Settings & Configuration</h1>
        </header>
        
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            {/* Sidebar Navigation for Settings */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-card border border-border-color overflow-hidden">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-4 ${
                                activeTab === tab.id 
                                ? 'bg-blue-50 text-primary border-primary' 
                                : 'text-muted-content hover:bg-gray-50 border-transparent'
                            }`}
                        >
                            <span className="mr-3">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'team' && (
                    <TeamSettings users={users} onCreateUser={onCreateUser} onDeleteUser={onDeleteUser} />
                )}
                {activeTab === 'master' && (
                    <MasterDataSettings />
                )}
                {activeTab === 'targets' && (
                    <SalesTargetSettings />
                )}
                {activeTab === 'system' && (
                    <SystemSettings onReset={onResetDatabase} />
                )}
            </div>
        </div>
    </div>
  );
};

export default SettingsPage;
