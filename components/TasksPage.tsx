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
            <div className="flex items-center flex-1 min-w-0">
                <input 
                    type="checkbox" 
                    checked={task.isCompleted} 
                    onChange={() => onToggle(task.id)}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                    aria-label={`Mark task ${task.title} as ${task.isCompleted ? 'incomplete' : 'complete'}`}
                />
                <div className="ml-3 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.isCompleted ? 'line-through text-muted-content' : 'text-base-content'}`}>{task.title}</p>
                    <p className="text-xs text-muted-content">
                        Due: {new Date(task.dueDate).toLocaleDateString()} | Assignee: {user?.name || 'N/A'}
                    </p>
                </div>
            </div>
            <button
                onClick={handleDeleteClick}
                className="ml-2 p-1 text-muted-content hover:text-danger opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex-shrink-0"
                aria-label={`Delete task ${task.title}`}
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

const AddTaskForm: React.FC<{users: User[], currentUser: User, onAddTask: (task: Omit<Task, 'id'>) => void}> = ({ users, currentUser, onAddTask }) => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assignedToId, setAssignedToId] = useState(currentUser.id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !dueDate) return;
        onAddTask({
            title,
            dueDate,
            assignedToId,
            isCompleted: false,
            createdBy: currentUser.name
        });
        setTitle('');
        setDueDate('');
    };

    return (
        <>
            <h3 className="text-lg font-bold text-base-content mb-4">Create a New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="taskTitle" className="label-style">Task Title</label>
                    <input id="taskTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Follow up with high-priority leads" className="input-style" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="dueDate" className="label-style">Due Date</label>
                        <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="assignTo" className="label-style">Assign To</label>
                        <select id="assignTo" value={assignedToId} onChange={e => setAssignedToId(e.target.value)} className="input-style" disabled={currentUser.role !== 'Admin'}>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                </div>
                <button type="submit" className="button-primary !w-auto px-6">Add Task</button>
            </form>
        </>
    );
};

const TasksPage: React.FC<TasksPageProps> = ({ tasks, users, currentUser, onAddTask, onToggleTask, onDeleteTask, onLogout, onNavigate }) => {
    const userMap = new Map(users.map(u => [u.id, u]));

    const { todaysTasks, openTasks, completedTasks } = useMemo(() => {
        const today = new Date().toDateString();
        const todays: Task[] = [];
        const open: Task[] = [];
        const completed: Task[] = [];

        [...tasks].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).forEach(task => {
            if (task.isCompleted) {
                completed.push(task);
            } else if (new Date(task.dueDate).toDateString() === today) {
                todays.push(task);
            } else {
                open.push(task);
            }
        });
        return { todaysTasks: todays, openTasks: open, completedTasks: completed.reverse().slice(0, 10) }; // show last 10 completed
    }, [tasks]);

    return (
        <div className="p-4 space-y-4">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-base-content">Task Management</h1>
                <UserControlPanel user={currentUser} onLogout={onLogout} onNavigate={onNavigate} />
            </header>
            
            <div className="card p-6">
                <AddTaskForm users={users} currentUser={currentUser} onAddTask={onAddTask} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="card p-6">
                    <h3 className="text-lg font-bold text-base-content mb-4">Today's Tasks ({todaysTasks.length})</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {todaysTasks.length > 0 ? todaysTasks.map(t => <TaskItem key={t.id} task={t} user={userMap.get(t.assignedToId)} onToggle={onToggleTask} onDelete={onDeleteTask} />) : <p className="text-muted-content text-sm text-center py-4">No tasks due today.</p>}
                    </div>
                </div>
                 <div className="card p-6">
                    <h3 className="text-lg font-bold text-base-content mb-4">Open Tasks ({openTasks.length})</h3>
                     <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {openTasks.length > 0 ? openTasks.map(t => <TaskItem key={t.id} task={t} user={userMap.get(t.assignedToId)} onToggle={onToggleTask} onDelete={onDeleteTask} />) : <p className="text-muted-content text-sm text-center py-4">No other open tasks.</p>}
                    </div>
                </div>
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-base-content mb-4">Recently Completed</h3>
                     <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {completedTasks.length > 0 ? completedTasks.map(t => <TaskItem key={t.id} task={t} user={userMap.get(t.assignedToId)} onToggle={onToggleTask} onDelete={onDeleteTask}/>) : <p className="text-muted-content text-sm text-center py-4">No tasks completed recently.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TasksPage;