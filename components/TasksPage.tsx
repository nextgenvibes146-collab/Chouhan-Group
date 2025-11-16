import React, { useState, useMemo } from 'react';
import type { Task, User } from '../types';

interface TasksPageProps {
    tasks: Task[];
    users: User[];
    currentUser: User;
    onAddTask: (task: Omit<Task, 'id'>) => void;
    onToggleTask: (taskId: string) => void;
}

const TaskItem: React.FC<{task: Task, user?: User, onToggle: (id: string) => void}> = ({ task, user, onToggle }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center">
            <input 
                type="checkbox" 
                checked={task.isCompleted} 
                onChange={() => onToggle(task.id)}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div className="ml-3">
                <p className={`text-sm font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-text-primary'}`}>{task.title}</p>
                <p className="text-xs text-text-secondary">
                    Due: {new Date(task.dueDate).toLocaleDateString()} | Assignee: {user?.name || 'N/A'}
                </p>
            </div>
        </div>
    </div>
);

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
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Create a New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="taskTitle" className="label-style">Task Title</label>
                    <input id="taskTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Follow up with high-priority leads" className="input-style" />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                <button type="submit" className="button-primary">Add Task</button>
            </form>
        </div>
    );
};

const TasksPage: React.FC<TasksPageProps> = ({ tasks, users, currentUser, onAddTask, onToggleTask }) => {
    const userMap = new Map(users.map(u => [u.id, u]));

    const { todaysTasks, openTasks, completedTasks } = useMemo(() => {
        const today = new Date().toDateString();
        const todays: Task[] = [];
        const open: Task[] = [];
        const completed: Task[] = [];

        tasks.forEach(task => {
            if (task.isCompleted) {
                completed.push(task);
            } else if (new Date(task.dueDate).toDateString() === today) {
                todays.push(task);
            } else {
                open.push(task);
            }
        });
        return { todaysTasks: todays, openTasks: open, completedTasks: completed.slice(0, 10) }; // show last 10 completed
    }, [tasks]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Task Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Today's Tasks ({todaysTasks.length})</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {todaysTasks.length > 0 ? todaysTasks.map(t => <TaskItem key={t.id} task={t} user={userMap.get(t.assignedToId)} onToggle={onToggleTask}/>) : <p className="text-text-secondary text-sm">No tasks due today.</p>}
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Open Tasks ({openTasks.length})</h3>
                         <div className="space-y-3 max-h-60 overflow-y-auto">
                            {openTasks.length > 0 ? openTasks.map(t => <TaskItem key={t.id} task={t} user={userMap.get(t.assignedToId)} onToggle={onToggleTask}/>) : <p className="text-text-secondary text-sm">No open tasks.</p>}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <AddTaskForm users={users} currentUser={currentUser} onAddTask={onAddTask} />
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Recently Completed</h3>
                 <div className="space-y-3 max-h-60 overflow-y-auto">
                    {completedTasks.length > 0 ? completedTasks.map(t => <TaskItem key={t.id} task={t} user={userMap.get(t.assignedToId)} onToggle={onToggleTask}/>) : <p className="text-text-secondary text-sm">No tasks completed recently.</p>}
                </div>
            </div>
        </div>
    );
};

export default TasksPage;