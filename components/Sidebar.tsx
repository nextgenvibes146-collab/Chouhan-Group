import React from 'react';
import { HomeIcon, UsersIcon, ChartBarIcon, CalendarIcon, CogIcon, MapPinIcon, DocumentTextIcon } from './Icons';
import type { User } from '../types';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-brand-blue text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </a>
  );
};

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
    currentUser: User;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isOpen, setOpen, currentUser }) => {
    const handleNavigate = (view: string) => {
        onNavigate(view);
        setOpen(false); // Close sidebar on navigation in mobile
    };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => setOpen(false)}
      ></div>
      
      <div className={`fixed md:relative z-40 md:z-auto flex flex-col w-64 bg-brand-dark text-white h-full transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between h-20 border-b border-gray-700 px-4">
          <h1 className="text-xl font-bold text-center">Chouhan Housing</h1>
          <button onClick={() => setOpen(false)} className="md:hidden text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {currentUser.role === 'Admin' && (
              <NavLink icon={<HomeIcon className="w-6 h-6" />} label="Dashboard" isActive={activeView === 'Dashboard'} onClick={() => handleNavigate('Dashboard')} />
            )}
            <NavLink icon={<UsersIcon className="w-6 h-6" />} label="Leads" isActive={activeView === 'Leads'} onClick={() => handleNavigate('Leads')} />
            <NavLink icon={<DocumentTextIcon className="w-6 h-6" />} label="Tasks" isActive={activeView === 'Tasks'} onClick={() => handleNavigate('Tasks')} />
            <NavLink icon={<CalendarIcon className="w-6 h-6" />} label="Calendar" isActive={activeView === 'Calendar'} onClick={() => handleNavigate('Calendar')} />
            <NavLink icon={<MapPinIcon className="w-6 h-6" />} label="Attendance" isActive={activeView === 'Attendance'} onClick={() => handleNavigate('Attendance')} />
            <NavLink icon={<ChartBarIcon className="w-6 h-6" />} label="Reports" isActive={activeView === 'Reports'} onClick={() => handleNavigate('Reports')} />
          </nav>
        </div>
         <div className="p-4 border-t border-gray-700">
            <NavLink icon={<CogIcon className="w-6 h-6" />} label="Settings" isActive={false} onClick={() => {}} />
         </div>
      </div>
    </>
  );
};

export default Sidebar;