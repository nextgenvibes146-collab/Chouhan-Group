import React from 'react';
import { SearchIcon, BellIcon } from './Icons';
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

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange, searchResults, users, currentUser, onLogout, onRefresh, onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between h-20 px-4 md:px-6 bg-white border-b border-brand-border flex-shrink-0">
      <div className="flex items-center">
         <button onClick={onToggleSidebar} className="md:hidden mr-4 p-2 text-brand-gray rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
         </button>
        <div className="relative w-48 md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="w-5 h-5 text-brand-gray" />
          </span>
          <input
            type="text"
            placeholder="Search by project..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-2 pl-10 pr-4 text-brand-dark bg-brand-light border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          {searchTerm && searchResults.length > 0 && <SearchResults results={searchResults} users={users} />}
        </div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          onClick={onRefresh}
          className="px-3 py-2 text-sm font-medium text-brand-gray bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue hidden sm:block"
        >
          Refresh
        </button>
        <button className="p-2 text-brand-gray rounded-full hover:bg-gray-100 hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
            <span className="relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </span>
        </button>
        <div className="flex items-center">
            <img 
                src={currentUser.avatarUrl}
                alt={`${currentUser.name}'s Avatar`} 
                className="w-10 h-10 rounded-full"
            />
            <div className="ml-3 hidden md:block">
                <p className="text-sm font-semibold text-brand-dark">{currentUser.name}</p>
                <p className="text-xs text-brand-gray">{currentUser.role}</p>
            </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-3 py-2 text-sm font-medium text-brand-blue hover:text-white border border-brand-blue hover:bg-brand-blue rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
        >
            Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
