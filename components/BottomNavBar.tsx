import React from 'react';
import { HomeIcon, UsersIcon, DocumentIcon, DocumentTextIcon, EllipsisHorizontalIcon, ChartBarIcon } from './Icons';

interface BottomNavBarProps {
  activeView: string;
  onNavigate: (view: string) => void;
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
    {isActive && <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>}
  </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { name: 'Leads', icon: <UsersIcon className="w-6 h-6" /> },
    { name: 'Content', icon: <DocumentIcon className="w-6 h-6" /> },
    { name: 'Dashboard', icon: <ChartBarIcon className="w-6 h-6" /> },
    { name: 'Tasks', icon: <DocumentTextIcon className="w-6 h-6" /> },
    { name: 'More', icon: <EllipsisHorizontalIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-base-100 border-t border-border-color shadow-lg flex z-20">
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
