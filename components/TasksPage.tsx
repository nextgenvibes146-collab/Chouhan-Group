
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Task, User } from '../types';
import { TrashIcon, AdjustmentsHorizontalIcon, CogIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, CalendarIcon, CheckCircleIcon } from './Icons';

interface TasksPageProps {
    tasks: Task[];
    users: User[];
    currentUser: User;
    onAddTask: (task: Omit<Task, 'id'>) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
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

const TaskItem: React.FC<{
    task: Task;
    user?: User;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ task, user, onToggle, onDelete }) => {
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent toggling the task when clicking delete
        if (window.confirm(`Are you sure you want to delete this task: "${task.title}"?`)) {
            onDelete(task.id);
        }
    };

    // Determine status
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    // Reset time part for accurate date comparison if needed, but basic comparison works for now
    const isOverdue = !task.isCompleted && dueDate < now;
    const isToday = !task.isCompleted && dueDate.toDateString() === now.toDateString();

    return (
        <div className={`group flex items-start justify-between p-4 rounded-lg border transition-all duration-200 ${
            task.isCompleted 
                ? 'bg-gray-50 border-transparent opacity-75' 
                : isOverdue 
                    ? 'bg-red-50 border-red-200 shadow-sm' 
                    : 'bg-white border-border-color hover:border-primary hover:shadow-md'
        }`}>
            <div className="flex items-start cursor-pointer flex-grow min-w-0 gap-3" onClick={() => onToggle(task.id)}>
                <div className="mt-0.5 relative">
                    <input
                        type="checkbox"
                        checked={task.isCompleted}
                        readOnly
                        className={`peer h-5 w-5 rounded border-2 text-primary focus:ring-primary cursor-pointer transition-colors ${
                            isOverdue ? 'border-red-300' : 'border-gray-300'
                        }`}
                    />
                </div>
                
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-medium truncate transition-all ${
                            task.isCompleted ? 'text-muted-content line-through decoration-gray-400' : 'text-base-content'
                        }`}>
                            {task.title}
                        </p>
                        {isOverdue && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 border border-red-200">
                                Overdue
                            </span>
                        )}
                        {isToday && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-orange-100 text-orange-700 border border-orange-200">
                                Today
                            </span>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-content">
                        <span className={`flex items-center font-medium ${
                            isOverdue ? 'text-red-600' : isToday ? 'text-orange-600' : ''
                        }`}>
                            <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                            {isToday ? 'Due Today' : dueDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        
                        {user && (
                            <span className="flex items-center bg-base-200 px-2 py-0.5 rounded text-text-secondary">
                                <UserCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                                {user.name}
                            </span>
                        )}
                        
                        <span className="text-xs text-gray-400 border-l border-gray-300 pl-3">
                            Added by {task.createdBy}
                        </span>
                    </div>
                </div>
            </div>
            
            <button
                onClick={handleDeleteClick}
                className="ml-2 p-2 rounded-full text-muted-content hover:bg-red-100 hover:text-danger opacity-0 group-hover:opacity-100 transition-all duration-200"
                title="Delete Task"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

const TasksPage: React.FC<TasksPageProps> = ({ tasks, users, currentUser, onAddTask, onToggleTask, onDeleteTask, onLogout, onNavigate }) => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assignedToId, setAssignedToId] = useState(currentUser.id);
    const [showCompleted, setShowCompleted] = useState(false);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !dueDate) return;

        onAddTask({
            title,
            dueDate: new Date(dueDate).toISOString(),
            assignedToId,
            isCompleted: false,
            createdBy: currentUser.name,
        });

        setTitle('');
        setDueDate('');
    };

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [tasks]);

    const { pendingTasks, completedTasks } = useMemo(() => {
        const pending = sortedTasks.filter(t => !t.isCompleted);
        const completed = sortedTasks.filter(t => t.isCompleted);
        return { pendingTasks: pending, completedTasks: completed };
    }, [sortedTasks]);

    return (
        <div className="space-y-6 pb-12">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-base-content">My Tasks</h1>
                    <p className="text-sm text-muted-content mt-1">Manage your to-do list and assignments</p>
                </div>
                <UserControlPanel user={currentUser} onLogout={onLogout} onNavigate={onNavigate} />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Task Column */}
                <div className="lg:col-span-1">
                    <div className="card p-6 h-fit sticky top-6 border-t-4 border-primary">
                        <h3 className="text-xl font-bold text-text-primary mb-4">Add New Task</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="taskTitle" className="label-style">Task Description</label>
                                <input 
                                    id="taskTitle" 
                                    type="text" 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    className="input-style" 
                                    placeholder="What needs to be done?" 
                                />
                            </div>
                            <div>
                                <label htmlFor="taskDueDate" className="label-style">Due Date</label>
                                <input 
                                    id="taskDueDate" 
                                    type="date" 
                                    value={dueDate} 
                                    onChange={e => setDueDate(e.target.value)} 
                                    className="input-style" 
                                />
                            </div>
                            {currentUser.role === 'Admin' && (
                                <div>
                                    <label htmlFor="taskAssignee" className="label-style">Assign To</label>
                                    <select id="taskAssignee" value={assignedToId} onChange={e => setAssignedToId(e.target.value)} className="input-style">
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <button type="submit" className="button-primary w-full justify-center">
                                Create Task
                            </button>
                        </form>
                    </div>
                </div>

                {/* Task List Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Pending Tasks Section */}
                    <div className="card p-6 min-h-[300px]">
                        <div className="flex justify-between items-end border-b border-border-color pb-3 mb-4">
                            <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                                Pending Tasks
                                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {pendingTasks.length}
                                </span>
                            </h3>
                        </div>
                        
                        <div className="space-y-3">
                            {pendingTasks.length > 0 ? (
                                pendingTasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        user={userMap.get(task.assignedToId)}
                                        onToggle={onToggleTask}
                                        onDelete={onDeleteTask}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                    <p className="text-muted-content font-medium">No pending tasks!</p>
                                    <p className="text-sm text-gray-400 mt-1">You're all caught up. Enjoy your day!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Completed Tasks Section */}
                    <div className="card bg-gray-50/80 border-gray-200 overflow-hidden">
                        <div 
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            onClick={() => setShowCompleted(!showCompleted)}
                        >
                            <h3 className="text-md font-semibold text-muted-content flex items-center gap-2">
                                <span className="bg-green-100 text-green-600 p-1 rounded-full">
                                    <CheckCircleIcon className="w-4 h-4" />
                                </span>
                                Completed Tasks
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                    {completedTasks.length}
                                </span>
                                <svg 
                                    className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${showCompleted ? 'rotate-180' : ''}`} 
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {showCompleted && (
                            <div className="p-4 pt-0 border-t border-gray-200 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="space-y-3 mt-4">
                                    {completedTasks.length > 0 ? (
                                        completedTasks.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                user={userMap.get(task.assignedToId)}
                                                onToggle={onToggleTask}
                                                onDelete={onDeleteTask}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-center text-sm text-muted-content py-4 italic">No completed tasks yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TasksPage;
