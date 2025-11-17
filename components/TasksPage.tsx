import React, { useState, useMemo } from 'react';
import type { Task, User } from '../types';
import { TrashIcon } from './Icons';

interface TasksPageProps {
    tasks: Task[];
    users: User[];
    currentUser: User;
    onAddTask: (task: Omit<Task, 'id'>) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
}

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

const TasksPage: React.FC<TasksPageProps> = ({ tasks, users, currentUser, onAddTask, onToggleTask, onDeleteTask }) => {
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
        <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-base-content">Task Management</h2>
            
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