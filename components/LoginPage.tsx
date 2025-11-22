
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
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-2xl border border-white/50 backdrop-blur-xl">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-2xl shadow-lg mb-4">
                CH
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="mt-2 text-sm text-slate-500">Chouhan Housing CRM Portal</p>
        </div>
        <div className="space-y-6">
            <div>
                <label htmlFor="user-select" className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase">
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
                      className="input-style appearance-none bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                      style={{ backgroundImage: 'none' }} 
                  >
                      <option value="" disabled>-- Select your profile --</option>
                      {users.map((user) => (
                          <option key={user.id} value={user.id}>
                              {user.name} ({user.role})
                          </option>
                      ))}
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
            </div>
             <div>
                <label htmlFor="password-input" className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase">
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
                    className="input-style bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                    placeholder="Enter password"
                />
                <p className="text-xs text-slate-400 mt-2 font-medium">Hint: Use 'password123'</p>
            </div>
            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-semibold text-center border border-red-100 animate-pulse">{error}</div>}
        </div>
        <div>
            <button
                onClick={handleLogin}
                className="w-full flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl shadow-lg shadow-blue-600/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform active:scale-[0.98]"
            >
                Login to Dashboard
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;