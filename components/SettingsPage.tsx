
import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { AdjustmentsHorizontalIcon, CogIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from './Icons';

interface SettingsPageProps {
  users: User[];
  onCreateUser: (userData: { name: string; }) => void;
  onDeleteUser: (userId: string) => void;
  currentUser: User;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const UserControlPanel: React.FC<{ 
    user: User; 
    onLogout: () => void;
    onNavigate: (view: string) => void;
}> = ({ user, onLogout, onNavigate }) => {
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
            <div className="flex items-center space-x-2">
                <span className="font-semibold text-base-content hidden sm:block">{user.name}</span>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-primary rounded-md bg-blue-100/80 hover:bg-blue-100 transition-colors">
                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                </button>
            </div>

            <div className={`absolute right-0 mt-2 w-64 bg-base-100 rounded-xl shadow-card border border-border-color z-20 origin-top-right transition-all duration-200 ease-out transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="p-2">
                    <div className="flex items-center p-2">
                        <img src={user.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full" />
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-base-content">{user.name}</p>
                            <p className="text-xs text-muted-content">{user.role}</p>
                        </div>
                    </div>
                    <div className="my-1 h-px bg-border-color" />
                    <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center w-full text-left px-3 py-2 text-sm text-base-content rounded-md hover:bg-base-300/70 transition-colors">
                        <UserCircleIcon className="w-5 h-5 mr-3 text-muted-content" />
                        <span>My Profile</span>
                    </a>
                    {user.role === 'Admin' && (
                        <button onClick={handleSettingsClick} className="flex items-center w-full text-left px-3 py-2 text-sm text-base-content rounded-md hover:bg-base-300/70 transition-colors">
                            <CogIcon className="w-5 h-5 mr-3 text-muted-content" />
                            <span>Team Settings</span>
                        </button>
                    )}
                    <div className="my-1 h-px bg-border-color" />
                    <button onClick={onLogout} className="flex items-center w-full text-left px-3 py-2 text-sm text-danger rounded-md hover:bg-red-50 transition-colors">
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const SettingsPage: React.FC<SettingsPageProps> = ({ users, onCreateUser, onDeleteUser, currentUser, onLogout, onNavigate }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const teamMembers = users.filter(u => u.role !== 'Admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('User name cannot be empty.');
      return;
    }
    setError('');

    onCreateUser({ name });

    // Reset form
    setName('');
  };

  const handleDelete = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? All their leads and tasks will be reassigned to the Admin.`)) {
      onDeleteUser(userId);
    }
  };


  return (
    <div className="p-4 space-y-4">
        <header className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-base-content">Team Management</h1>
            <UserControlPanel user={currentUser} onLogout={onLogout} onNavigate={onNavigate} />
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create User Form */}
            <div className="lg:col-span-1 card p-6 h-fit">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Create New User</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="userName" className="label-style">Full Name</label>
                        <input id="userName" type="text" value={name} onChange={e => setName(e.target.value)} className="input-style" placeholder="e.g., Jane Doe" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button type="submit" className="button-primary !w-auto px-6">Add User</button>
                </form>
            </div>

            {/* User List Table */}
            <div className="lg:col-span-2 card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-color">
                        <thead className="bg-background">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-border-color">
                            {teamMembers.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="" />
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-text-primary">{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                        {user.role}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-4">
                                            <button onClick={() => handleDelete(user.id, user.name)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {teamMembers.length === 0 && <p className="text-center text-text-secondary py-8">No team members found.</p>}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SettingsPage;
