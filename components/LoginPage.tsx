import React, { useState } from 'react';
import type { User } from '../types';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedUserId) {
      setError('Please select a user to log in.');
      return;
    }
    // Simple password check for demo purposes
    if (password !== 'password123') {
        setError('Incorrect password.');
        return;
    }
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      onLogin(user);
    } else {
      setError('Selected user not found.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-sm p-8 space-y-8 bg-surface rounded-2xl shadow-card">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">Chouhan Housing Private Limited</h1>
            <p className="mt-2 text-sm text-text-secondary">CRM Portal Login</p>
        </div>
        <div className="space-y-6">
            <div>
                <label htmlFor="user-select" className="label-style">
                    Select User
                </label>
                <select
                    id="user-select"
                    value={selectedUserId}
                    onChange={(e) => {
                        setSelectedUserId(e.target.value);
                        setError('');
                    }}
                    className="input-style"
                >
                    <option value="" disabled>-- Select your profile --</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name} ({user.role})
                        </option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="password-input" className="label-style">
                    Password
                </label>
                <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    className="input-style"
                    placeholder="Enter password"
                />
                <p className="text-xs text-gray-400 mt-1">Hint: Use 'password123'</p>
            </div>
            {error && <p className="text-xs text-red-600 text-center">{error}</p>}
        </div>
        <div>
            <button
                onClick={handleLogin}
                className="button-primary"
            >
                Login
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;