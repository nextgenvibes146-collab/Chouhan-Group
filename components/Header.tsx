
import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon } from './Icons';
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
}

const UserMenu: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
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

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-base-300 transition-colors">
                <img 
                    src={user.avatarUrl}
                    alt={`${user.name}'s Avatar`} 
                    className="w-9 h-9 rounded-full"
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
                <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-lg shadow-lg border border-border-color z-20 animate-in fade-in zoom-in duration-200">
                    <div className="p-2">
                        <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="block w-full text-left px-4 py-2 text-sm text-base-content rounded-md hover:bg-base-300 transition-colors">
                            Logout
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange, searchResults, users, currentUser, onLogout, onRefresh, onToggleSidebar }) => {
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
    <header className="flex items-center justify-between h-20 px-4 md:px-6 bg-base-100 border-b border-border-color flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center">
         <button onClick={onToggleSidebar} className="md:hidden mr-4 p-2 text-muted-content rounded-full hover:bg-base-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
         </button>
        <div className="relative w-48 md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="w-5 h-5 text-muted-content" />
          </span>
          <input
            type="text"
            placeholder="Search by name, phone, project..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 text-base-content bg-base-200 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
          />
          {searchTerm && <SearchResults results={searchResults} users={users} />}
        </div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          onClick={onRefresh}
          className="px-3 py-2 text-sm font-medium text-muted-content bg-base-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hidden sm:block transition-colors"
        >
          Refresh
        </button>
        <UserMenu user={currentUser} onLogout={onLogout} />
      </div>
    </header>
  );
};

export default Header;
