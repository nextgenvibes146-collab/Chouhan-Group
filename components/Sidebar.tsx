

import React from 'react';
import { HomeIcon, UsersIcon, ChartBarIcon, CalendarIcon, CogIcon, MapPinIcon, DocumentTextIcon, BuildingOfficeIcon } from './Icons';
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
        className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
          isActive
            ? 'bg-primary text-white'
            : 'text-muted-content hover:bg-base-300 hover:text-base-content'
        }`}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </button>
    );

    const visibleNavItems = navItems.filter(item => isAdmin || !item.adminOnly);

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity md:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setOpen(false)}
            />
            
            <aside className={`fixed top-0 left-0 h-full bg-base-100 text-base-content w-64 p-4 transform transition-transform duration-300 ease-in-out z-40 md:relative md:transform-none md:flex-shrink-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center mb-8 px-2">
                        <h1 className="text-xl font-bold text-primary">Chouhan Housing Private Limited</h1>
                    </div>
                    
                    <nav className="flex-1 space-y-2">
                        {visibleNavItems.map(item => (
                            <NavLink
                                key={item.name}
                                icon={item.icon}
                                label={item.name}
                                isActive={activeView === item.name}
                                onClick={() => {
                                    onNavigate(item.name);
                                    if (isOpen) setOpen(false); // Close on mobile navigation
                                }}
                            />
                        ))}
                    </nav>

                    <div className="mt-auto">
                        <p className="text-xs text-center text-muted-content">&copy; {new Date().getFullYear()} Chouhan Housing Private Limited</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;