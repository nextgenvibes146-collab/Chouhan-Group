import React, { useState } from 'react';
import type { User } from '../types';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedUserId) {
      setError('Please select a user to log in.');
      return;
    }
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      onLogin(user);
    } else {
      setError('Selected user not found.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-brand-light">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-brand-dark">Chouhan Housing Group</h1>
            <p className="mt-2 text-sm text-brand-gray">CRM Portal Login</p>
        </div>
        <div className="space-y-4">
            <div>
                <label htmlFor="user-select" className="block text-sm font-medium text-brand-gray">
                    Select User
                </label>
                <select
                    id="user-select"
                    value={selectedUserId}
                    onChange={(e) => {
                        setSelectedUserId(e.target.value);
                        setError('');
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-brand-border focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md"
                >
                    <option value="" disabled>-- Select your profile --</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name} ({user.role})
                        </option>
                    ))}
                </select>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div>
            <button
                onClick={handleLogin}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            >
                Login
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
