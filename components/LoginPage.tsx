
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
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-card border border-gray-100">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Chouhan Housing Private Limited</h1>
            <p className="mt-2 text-sm text-slate-500">CRM Portal Login</p>
        </div>
        <div className="space-y-6">
            <div>
                <label htmlFor="user-select" className="label-style">
                    Select User
                </label>
                <div className="relative">
                  <select
                      id="user-select"
                      value={selectedUserId}
                      onChange={(e) => {
                          setSelectedUserId(e.target.value);
                          setError('');
                      }}
                      className="input-style appearance-none"
                  >
                      <option value="" disabled>-- Select your profile --</option>
                      {users.map((user) => (
                          <option key={user.id} value={user.id}>
                              {user.name} ({user.role})
                          </option>
                      ))}
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
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
                <p className="text-xs text-gray-500 mt-2 font-medium">Hint: Use 'password123'</p>
            </div>
            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-semibold text-center border border-red-100">{error}</div>}
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