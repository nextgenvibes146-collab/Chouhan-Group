
import React from 'react';
import { HomeIcon, UsersIcon, CalendarIcon, ChartBarIcon, DocumentTextIcon, CogIcon, MapPinIcon } from './Icons';
import type { User } from '../types';


interface BottomNavBarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  currentUser: User;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-content'}`}
  >
    {icon}
    <span className="text-xs font-medium mt-1">{label}</span>
  </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, onNavigate, currentUser }) => {
  const isAdmin = currentUser.role === 'Admin';
  
  const navItems = isAdmin 
    ? [
        { name: 'Dashboard', icon: <HomeIcon className="w-6 h-6" /> },
        { name: 'Leads', icon: <UsersIcon className="w-6 h-6" /> },
        { name: 'Reports', icon: <ChartBarIcon className="w-6 h-6" /> },
        { name: 'Tasks', icon: <DocumentTextIcon className="w-6 h-6" /> },
        { name: 'Settings', icon: <CogIcon className="w-6 h-6" /> },
      ]
    : [
        { name: 'Leads', icon: <UsersIcon className="w-6 h-6" /> },
        { name: 'Calendar', icon: <CalendarIcon className="w-6 h-6" /> },
        { name: 'Attendance', icon: <MapPinIcon className="w-6 h-6" /> },
        { name: 'Tasks', icon: <DocumentTextIcon className="w-6 h-6" /> },
      ];

  // Show only on mobile
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-base-100 border-t border-border-color shadow-lg flex z-20">
      {navItems.map(item => (
        <NavItem
          key={item.name}
          label={item.name}
          icon={item.icon}
          isActive={activeView === item.name}
          onClick={() => onNavigate(item.name)}
        />
      ))}
    </div>
  );
};

export default BottomNavBar;
