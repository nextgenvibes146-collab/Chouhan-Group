import React from 'react';
import { HomeIcon, UsersIcon, ChartBarIcon, CalendarIcon, CogIcon, MapPinIcon, DocumentTextIcon } from './Icons';
import type { User } from '../types';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAE/jSURBVHgb7Z13mF1V1f/P+Z77qjT1kG5kISGBIGQhIe8JCSihBREEUUBAxUVEBRFQUUUEFUERFAEFURAkQBCykBBykZDQkG469Z7qnPOf5+yZc849U/eZSTN9n/fxPefcc8+Zc+bMnJl3Zt57rbUAgP1iY+Pu3bt374cffvh9kZERj8fLD4b5b2FhYXh4eMPA4wUA7yN2d3fPz89PTEz8U9b2448/lpSUNDY2hnh8AICzWFlZ6e/v39nZGRsb+w9Zm5qa+vj4hHg8AICfWFpaOn369Nra2gcOHPhfVgcGBrp6emw8AGDgMDIycnJycu7cuWfOnPlfVgcGBrp6emw8AGDgODo6evTo0RcvXnyoW7duX1/f8PAwgEcDAAYsKipqbm4eGBj4xYsXgYEBAGbBwMDAdXU9Ng4AMODo6Oj4+PgXL14cGBj44MGDo6OjgYEBAD5gYGCAq6vHxgMANhgdHf3o0aMTExMDAwPHx8cPHjyIiIgAAwMA+IGRkZGurh4bBwAb+Prrr9va2gYGBp6fnx8bGztz5kwgAAC8gZGREa6uHhsHAFtITk5OTk5OTk4+cuRIZ2dnQAAAuJGREeKqB8AmUlJSjh07Njs7OzIyMjAwcGVlZWhoCAAgZ2RkiKseAJu4//77Bw4c+Ntvv1UoFEZGRmZnZ1dWVmZnZwMAyIuMEFf9s4E9PDxSUlLq6ur8/f17e3u5XO7w8DCZTA4PDx84cCAajWZnZ6urqwEAH0dGin9u+gBsYnFx8cDAwPj4+ISEhNjY2AcPHiSTyfPnz9+8efPg4ODc3Nz4+HggAAD+iojw/z32gW3btu3evXtgYOD+/fsbGxujo6MNDAycO3fu7t27kUgkAGDmRUX4X/4/94IsvvthsNvP5/NTU1NjY2JUrVzqdztzc3Nra2uDg4MmTJzKZDAAwg6Ii/L9n/0BPT8/s7OzMzMz09LSEhITTp0/n5uZGRkbOnj175MiRvLw8AMD0ioiI8K/i/gHYxOTk5MjIyMDAwMzMTCKR7OzsYmJiJSUlRkdHBwYGhgwZAjZjdHT0/v37Gxsbs7KysrOz8/LyBgYG1tTUeDyeuro6Jyenp6dndnb2xMTE5OTkjIyMTExMAABGJCQkfH19W9u/ffs2Ozv77t---";

// Fix: The Sidebar component was missing its implementation and default export.
// Implemented the component based on its usage in App.tsx to resolve the import error.
interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
    currentUser: User;
}

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

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isOpen, setOpen, currentUser }) => {
    const isAdmin = currentUser.role === 'Admin';
    const navItems = [
        { name: 'Dashboard', icon: <HomeIcon className="w-5 h-5" />, adminOnly: true },
        { name: 'Leads', icon: <UsersIcon className="w-5 h-5" />, adminOnly: false },
        { name: 'Calendar', icon: <CalendarIcon className="w-5 h-5" />, adminOnly: false },
        { name: 'Attendance', icon: <MapPinIcon className="w-5 h-5" />, adminOnly: false },
        { name: 'Reports', icon: <ChartBarIcon className="w-5 h-5" />, adminOnly: true },
        { name: 'Tasks', icon: <DocumentTextIcon className="w-5 h-5" />, adminOnly: false },
        { name: 'Settings', icon: <CogIcon className="w-5 h-5" />, adminOnly: true },
    ];

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