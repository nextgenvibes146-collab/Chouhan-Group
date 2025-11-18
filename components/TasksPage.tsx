
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Task, User } from '../types';
import { TrashIcon, AdjustmentsHorizontalIcon, CogIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from './Icons';

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

    return (
        <div className="group flex items-center justify-between p-3 bg-base-300/50 rounded-lg hover:bg-base-300/70 transition-colors duration-200">
            <div className="flex items-center cursor-pointer flex-grow min-w-0" onClick={() => onToggle(task.id)}>
                <input
                    type="checkbox"
                    checked={task.isCompleted}
                    readOnly
                    className="h-5 w-5 rounded border-gray-400 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                />
                <div className="ml-3 min-w-0">
                    <p className={`font-medium truncate ${task.isCompleted ? 'text-muted-content line-through' : 'text-base-content'}`}>
                        {task.title}
                    </p>
                    <div className="text-xs text-muted-content flex items-center space-x-2">
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        {user && <span>To: {user.name}</span>}
                    </div>
                </div>
            </div>
            <button
                onClick={handleDeleteClick}
                className="ml-4 p-1 rounded-full text-muted-content hover:bg-red-100 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete task ${task.title}`}
            >
                <TrashIcon className="w-5 h-5" />
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
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-base-content">My Tasks</h1>
                <UserControlPanel user={currentUser} onLogout={onLogout} onNavigate={onNavigate} />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="card p-6 h-fit sticky top-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-4">Add a New Task</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="taskTitle" className="label-style">Task Title</label>
                                <input id="taskTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-style" placeholder="e.g., Follow up with Client X" />
                            </div>
                            <div>
                                <label htmlFor="taskDueDate" className="label-style">Due Date</label>
                                <input id="taskDueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-style" />
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
                            <button type="submit" className="button-primary !w-auto px-6">Add Task</button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2 card p-6">
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold text-text-primary">Pending Tasks ({pendingTasks.length})</h3>
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
                            <p className="text-center text-muted-content py-4">No pending tasks. Great job!</p>
                        )}
                    </div>

                    <div className="mt-8">
                        <button onClick={() => setShowCompleted(!showCompleted)} className="text-lg font-semibold text-text-primary w-full text-left py-2">
                            {showCompleted ? '▼' : '►'} Completed Tasks ({completedTasks.length})
                        </button>
                        {showCompleted && (
                            <div className="mt-4 space-y-3">
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
                                    <p className="text-center text-muted-content py-4">No tasks have been completed yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TasksPage;
