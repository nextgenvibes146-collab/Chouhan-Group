import React from 'react';
import { HomeIcon, UsersIcon, ChartBarIcon, CalendarIcon, CogIcon, MapPinIcon, DocumentTextIcon, BuildingOfficeIcon, TargetIcon, CheckCircleIcon } from './Icons';
import type { User } from '../types';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const Sidebar: React.FC<{
    activeView: string;
    onNavigate: (view: string) => void;
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
    currentUser: User;
}> = ({ activeView, onNavigate, isOpen, setOpen, currentUser }) => {
    const isAdmin = currentUser.role === 'Admin';
    const navItems = [
        { name: 'Dashboard', icon: <HomeIcon className="w-5 h-5" />, adminOnly: true },
        { name: 'Leads', icon: <UsersIcon className="w-5 h-5" />, adminOnly: false },
        { name: 'Opportunities', icon: <TargetIcon className="w-5 h-5" />, adminOnly: false },
        { name: 'Clients', icon: <CheckCircleIcon className="w-5 h-5" />, adminOnly: false },
        { name: 'Inventory', icon: <BuildingOfficeIcon className="w-5 h-5" />, adminOnly: false },
        { name: 'Calendar', icon: <CalendarIcon className="w-5 h-5" />, adminOnly: false },
        { name: 'Attendance', icon: <MapPinIcon className="w-5 h-5" />, adminOnly: false },
        { name: 'Reports', icon: <ChartBarIcon className="w-5 h-5" />, adminOnly: true },
        { name: 'Tasks', icon: <DocumentTextIcon className="w-5 h-5" />, adminOnly: false },
        { name: 'Settings', icon: <CogIcon className="w-5 h-5" />, adminOnly: true },
    ];

    const NavLink: React.FC<NavLinkProps> = ({ icon, label, isActive, onClick }) => (
      <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium transition-all duration-200 rounded-xl group ${
          isActive
            ? 'bg-primary text-white shadow-md shadow-primary/25'
            : 'text-slate-600 hover:bg-white hover:text-primary hover:shadow-sm'
        }`}
      >
        <span className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`}>
            {icon}
        </span>
        <span className="ml-3 font-medium tracking-wide">{label}</span>
      </button>
    );

    const visibleNavItems = navItems.filter(item => isAdmin || !item.adminOnly);

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setOpen(false)}
            />
            
            <aside className={`fixed top-0 left-0 h-full bg-base-200 md:bg-transparent text-base-content w-64 p-4 transform transition-transform duration-300 ease-out z-40 md:relative md:transform-none md:flex-shrink-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center mb-10 px-4 mt-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30 text-white font-bold text-xl mr-3">
                            CH
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 leading-tight">Chouhan Housing</h1>
                            <p className="text-xs text-slate-500 font-medium">CRM Portal</p>
                        </div>
                    </div>
                    
                    <nav className="flex-1 space-y-1">
                        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Menu</p>
                        {visibleNavItems.map(item => (
                            <NavLink
                                key={item.name}
                                icon={item.icon}
                                label={item.name}
                                isActive={activeView === item.name}
                                onClick={() => {
                                    onNavigate(item.name);
                                    if (isOpen) setOpen(false);
                                }}
                            />
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-200/60">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-3">
                            <img src={currentUser.avatarUrl} alt="Profile" className="w-10 h-10 rounded-full border border-slate-200" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                                <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;