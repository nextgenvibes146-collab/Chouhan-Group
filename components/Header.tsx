
import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, UserCircleIcon, CogIcon, ArrowLeftOnRectangleIcon } from './Icons';
import SearchResults from './SearchResults';
import type { Lead, User } from '../types';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchResults: Lead[];
  users: User[];
  currentUser: User;
  onLogout: () => void;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  onResultClick: (lead: Lead) => void;
  onNavigate: (view: string) => void;
}

const UserMenu: React.FC<{ user: User, onLogout: () => void, onNavigate: (view: string) => void }> = ({ user, onLogout, onNavigate }) => {
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
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-base-300 transition-colors">
                <img 
                    src={user.avatarUrl}
                    alt={`${user.name}'s Avatar`} 
                    className="w-9 h-9 rounded-full border border-gray-200"
                />
                <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-base-content">{user.name}</p>
                    <p className="text-xs text-muted-content">{user.role}</p>
                </div>
                <svg className={`hidden md:block w-4 h-4 text-muted-content transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="p-2">
                         <div className="flex items-center p-3 mb-2 bg-base-200 rounded-xl">
                            <img src={user.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full border border-white shadow-sm" />
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.role}</p>
                            </div>
                        </div>
                         <a href="#" onClick={(e) => { e.preventDefault(); setIsOpen(false); }} className="flex items-center w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                            <UserCircleIcon className="w-5 h-5 mr-3 text-slate-400" />
                            <span>My Profile</span>
                        </a>
                        {user.role === 'Admin' && (
                            <button onClick={handleSettingsClick} className="flex items-center w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                                <CogIcon className="w-5 h-5 mr-3 text-slate-400" />
                                <span>Team Settings</span>
                            </button>
                        )}
                        <div className="my-2 h-px bg-slate-100" />
                        <button onClick={(e) => { e.preventDefault(); onLogout(); }} className="flex items-center w-full text-left px-3 py-2.5 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                             <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange, searchResults, users, currentUser, onLogout, onRefresh, onToggleSidebar, onResultClick, onNavigate }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm, onSearchChange]);

  // Update local state if parent state changes externally (e.g., clear search)
  useEffect(() => {
    if (searchTerm !== localSearchTerm) {
        setLocalSearchTerm(searchTerm);
    }
  }, [searchTerm]);

  return (
    <header className="flex items-center justify-between h-20 px-4 md:px-6 bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center flex-1">
         <button onClick={onToggleSidebar} className="md:hidden mr-4 p-2 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
         </button>
        <div className="relative w-full md:w-96 max-w-lg">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="Search by name, phone, project..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full py-2.5 pl-11 pr-4 text-black bg-white border border-gray-400 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 placeholder-gray-500 shadow-sm"
          />
          {searchTerm && <SearchResults results={searchResults} users={users} onResultClick={onResultClick} />}
        </div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4 ml-4">
        <button
          onClick={onRefresh}
          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hidden sm:block transition-colors border border-transparent hover:border-gray-300"
        >
          Refresh
        </button>
        <UserMenu user={currentUser} onLogout={onLogout} onNavigate={onNavigate} />
      </div>
    </header>
  );
};

export default Header;
