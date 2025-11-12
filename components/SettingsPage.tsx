import React, { useState } from 'react';
import type { User } from '../types';

interface SettingsPageProps {
  users: User[];
  onCreateUser: (userData: { name: string; role: 'Salesperson' | 'Sales Manager'; reportsTo?: string }) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUser: (userId: string, updates: Partial<Pick<User, 'role' | 'reportsTo'>>) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ users, onCreateUser, onDeleteUser, onUpdateUser }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Salesperson' | 'Sales Manager'>('Salesperson');
  const [reportsTo, setReportsTo] = useState('');
  const [error, setError] = useState('');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ role: 'Salesperson' | 'Sales Manager'; reportsTo: string }>({
    role: 'Salesperson',
    reportsTo: '',
  });

  const managers = users.filter(u => u.role === 'Sales Manager' || u.role === 'Admin');
  const teamMembers = users.filter(u => u.role !== 'Admin');
  const userMap = new Map(users.map(u => [u.id, u.name]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('User name cannot be empty.');
      return;
    }
    if (role === 'Salesperson' && !reportsTo) {
      setError('A salesperson must report to a manager.');
      return;
    }
    setError('');

    onCreateUser({
      name,
      role,
      reportsTo: role === 'Salesperson' ? reportsTo : undefined,
    });

    // Reset form
    setName('');
    setRole('Salesperson');
    setReportsTo('');
  };

  const handleDelete = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? All their leads and tasks will be reassigned to the Admin.`)) {
      onDeleteUser(userId);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({
        role: user.role as 'Salesperson' | 'Sales Manager', // Admins cannot be edited
        reportsTo: user.reportsTo || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleSaveEdit = (userId: string) => {
    if (editFormData.role === 'Salesperson' && !editFormData.reportsTo) {
        alert('A salesperson must report to a manager.');
        return;
    }
    const updates: Partial<Pick<User, 'role' | 'reportsTo'>> = {
        role: editFormData.role,
        reportsTo: editFormData.role === 'Salesperson' ? editFormData.reportsTo : undefined
    };
    onUpdateUser(userId, updates);
    setEditingUserId(null);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };


  return (
    <div className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Team Management</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create User Form */}
            <div className="lg:col-span-1 card p-6 h-fit">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Create New User</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="userName" className="label-style">Full Name</label>
                        <input id="userName" type="text" value={name} onChange={e => setName(e.target.value)} className="input-style" placeholder="e.g., Jane Doe" />
                    </div>
                    <div>
                        <label htmlFor="userRole" className="label-style">Role</label>
                        <select id="userRole" value={role} onChange={e => setRole(e.target.value as any)} className="input-style">
                            <option value="Salesperson">Salesperson</option>
                            <option value="Sales Manager">Sales Manager</option>
                        </select>
                    </div>
                    {role === 'Salesperson' && (
                        <div>
                            <label htmlFor="reportsTo" className="label-style">Reports To</label>
                            <select id="reportsTo" value={reportsTo} onChange={e => setReportsTo(e.target.value)} className="input-style">
                                <option value="">Select a manager...</option>
                                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    )}
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Reports To</th>
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
                                      {editingUserId === user.id ? (
                                          <select name="role" value={editFormData.role} onChange={handleEditFormChange} className="input-style !mt-0 py-1.5">
                                              <option value="Salesperson">Salesperson</option>
                                              <option value="Sales Manager">Sales Manager</option>
                                          </select>
                                      ) : (
                                          user.role
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                       {editingUserId === user.id ? (
                                            <select 
                                                name="reportsTo" 
                                                value={editFormData.reportsTo} 
                                                onChange={handleEditFormChange} 
                                                className="input-style !mt-0 py-1.5"
                                                disabled={editFormData.role === 'Sales Manager'}
                                            >
                                                <option value="">Select a manager...</option>
                                                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                            </select>
                                        ) : (
                                            userMap.get(user.reportsTo || '') || 'N/A'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {editingUserId === user.id ? (
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleSaveEdit(user.id)} className="text-green-600 hover:text-green-900 font-semibold">Save</button>
                                                <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end space-x-4">
                                                <button onClick={() => handleEditClick(user)} className="text-primary hover:text-primary-hover font-semibold">Edit</button>
                                                <button onClick={() => handleDelete(user.id, user.name)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </div>
                                        )}
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