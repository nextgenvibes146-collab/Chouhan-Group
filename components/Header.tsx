import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SearchIcon, BellIcon } from './Icons';
import SearchResults from './SearchResults';
import type { Lead, User, Notification } from '../types';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchResults: Lead[];
  users: User[];
  currentUser: User;
  onLogout: () => void;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  notifications: Notification[];
  onAddNotification: (message: string, targetUserId?: string) => void;
  onMarkNotificationsAsRead: () => void;
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
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-base-300">
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
                <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-lg shadow-lg border border-border-color z-20">
                    <div className="p-2">
                        <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="block w-full text-left px-4 py-2 text-sm text-base-content rounded-md hover:bg-base-300">
                            Logout
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

const BroadcastModal: React.FC<{ users: User[], onSend: (message: string, targetUserId?: string) => void, onClose: () => void }> = ({ users, onSend, onClose }) => {
    const [message, setMessage] = useState('');
    const [targetUserId, setTargetUserId] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSend(message, targetUserId || undefined);
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-base-content">Broadcast Message</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="broadcastMessage" className="label-style">Message</label>
                        <textarea id="broadcastMessage" value={message} onChange={e => setMessage(e.target.value)} rows={4} className="input-style" placeholder="Type your message here..."></textarea>
                    </div>
                    <div>
                        <label htmlFor="broadcastTarget" className="label-style">Recipient</label>
                        <select id="broadcastTarget" value={targetUserId} onChange={e => setTargetUserId(e.target.value)} className="input-style">
                            <option value="">All Users</option>
                            {users.filter(u => u.role !== 'Admin').map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-gray bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSend} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-focus">Send</button>
                </div>
            </div>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange, searchResults, users, currentUser, onLogout, onRefresh, onToggleSidebar, notifications, onAddNotification, onMarkNotificationsAsRead }) => {
  const [isBroadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  
  const userNotifications = useMemo(() => {
      return notifications
          .filter(n => !n.targetUserId || n.targetUserId === currentUser.id)
          .sort((a,b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }, [notifications, currentUser]);

  const unreadCount = useMemo(() => {
      return userNotifications.filter(n => !n.isRead).length;
  }, [userNotifications]);

  const handleToggleNotifications = () => {
      setNotificationsOpen(prev => !prev);
      if (!isNotificationsOpen) {
          onMarkNotificationsAsRead();
      }
  };

  return (
    <header className="flex items-center justify-between h-20 px-4 md:px-6 bg-base-100 border-b border-border-color flex-shrink-0">
      <div className="flex items-center">
         <button onClick={onToggleSidebar} className="md:hidden mr-4 p-2 text-muted-content rounded-full hover:bg-base-300">
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
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-2 pl-10 pr-4 text-base-content bg-base-200 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchTerm && <SearchResults results={searchResults} users={users} />}
        </div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        {currentUser.role === 'Admin' && (
            <button onClick={() => setBroadcastModalOpen(true)} className="px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-focus hidden sm:block">
                Broadcast
            </button>
        )}
        <button
          onClick={onRefresh}
          className="px-3 py-2 text-sm font-medium text-muted-content bg-base-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hidden sm:block"
        >
          Refresh
        </button>
        <div className="relative">
            <button onClick={handleToggleNotifications} className="p-2 text-muted-content rounded-full hover:bg-base-300 hover:text-base-content focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <span className="relative">
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>}
                </span>
            </button>
            {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-base-100 border border-border-color rounded-lg shadow-lg z-20">
                    <div className="p-3 border-b font-semibold text-base-content">Notifications</div>
                    <ul className="max-h-96 overflow-y-auto">
                        {userNotifications.length > 0 ? userNotifications.map(n => (
                            <li key={n.id} className={`p-3 border-b border-border-color last:border-b-0 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                                <p className="text-sm text-base-content">{n.message}</p>
                                <p className="text-xs text-muted-content mt-1">{new Date(n.createdDate).toLocaleString()}</p>
                            </li>
                        )) : <li className="p-4 text-center text-sm text-muted-content">No new notifications.</li>}
                    </ul>
                </div>
            )}
        </div>
        
        <UserMenu user={currentUser} onLogout={onLogout} />

      </div>
      {isBroadcastModalOpen && <BroadcastModal users={users} onSend={onAddNotification} onClose={() => setBroadcastModalOpen(false)} />}
    </header>
  );
};

export default Header;