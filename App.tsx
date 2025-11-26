
import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import BottomNavBar from './components/BottomNavBar';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import { db } from './services/database'; // Use new DB service
import { Lead, User, Activity, SalesTarget, Task, LeadStatus, ActivityType, ModeOfEnquiry } from './types';
import { Project, Unit } from './data/inventoryData';

// Lazy load components for better initial load performance
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const LeadsPage = React.lazy(() => import('./components/LeadsPage'));
const CalendarPage = React.lazy(() => import('./components/CalendarPage'));
const AttendancePage = React.lazy(() => import('./components/AttendancePage'));
const ReportsPage = React.lazy(() => import('./components/ReportsPage'));
const TasksPage = React.lazy(() => import('./components/TasksPage'));
const SettingsPage = React.lazy(() => import('./components/SettingsPage'));
const InventoryPage = React.lazy(() => import('./components/InventoryPage'));

export interface NewLeadData {
    customerName: string;
    mobile: string;
    email: string;
    city: string;
    platform: string;
    interestedProject: string;
    interestedUnit: string;
    investmentTimeline: string;
    remarks: string;
    assignedSalespersonId: string;
    budget?: string;
    purpose?: 'Investment' | 'Self Use';
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full min-h-[50vh] bg-base-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
);

const NotificationToast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white border-l-4 border-primary shadow-2xl rounded-lg pointer-events-auto animate-in slide-in-from-top-2 duration-300">
        <div className="p-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                     <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">Reminder</p>
                    <p className="mt-1 text-sm text-gray-500">{message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button onClick={onClose} className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('Dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inventory, setInventory] = useState<Project[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [targetLeadId, setTargetLeadId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setSearchTerm('');
    // Fetch from local database
    const data = await db.getAllData();
    setLeads(data.leads);
    setUsers(data.users);
    setActivities(data.activities);
    setSalesTargets(data.salesTargets);
    setTasks(data.tasks);
    setInventory(data.inventory);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Reminder Polling Logic
  useEffect(() => {
      if (!currentUser) return;
      
      const checkReminders = async () => {
          const now = new Date();
          // Filter tasks that have a reminder date, haven't fired yet, and the reminder date is passed
          const dueTasks = tasks.filter(t => !t.isCompleted && !t.hasReminded && t.reminderDate && new Date(t.reminderDate) <= now);
          
          if (dueTasks.length > 0) {
              const task = dueTasks[0];
              // Notify only if task is assigned to current user or user is admin
              if (task.assignedToId === currentUser.id || currentUser.role === 'Admin') {
                   setNotification(`Task Due: ${task.title}`);
                   const updatedTasks = await db.markTaskReminded(task.id);
                   setTasks(updatedTasks);
                   
                   // Auto-dismiss toast after 5 seconds
                   setTimeout(() => setNotification(null), 5000);
              }
          }
      };

      const intervalId = setInterval(checkReminders, 10000); // Check every 10 seconds
      return () => clearInterval(intervalId);
  }, [tasks, currentUser]);

  const handleUpdateLead = useCallback(async (updatedLead: Lead) => {
    if (!currentUser) return;

    // Optimistic UI Update
    setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? { ...updatedLead, lastActivityDate: new Date().toISOString(), isRead: true } : l));
    
    await db.updateLead(updatedLead);

    // Handle logic for assigning or changing status that might trigger activities
    const originalLead = leads.find(l => l.id === updatedLead.id);
    if (!originalLead) return;

    if (originalLead.assignedSalespersonId !== updatedLead.assignedSalespersonId) {
        const newAssignee = users.find(u => u.id === updatedLead.assignedSalespersonId);
        const activity: Activity = {
            id: `act-assign-${Date.now()}`,
            leadId: updatedLead.id,
            salespersonId: currentUser.id,
            type: ActivityType.Note,
            date: new Date().toISOString(),
            remarks: `Lead assigned to ${newAssignee?.name || 'N/A'}.`,
            customerName: updatedLead.customerName,
        };
        await db.addActivity(activity);
        setActivities(prev => [activity, ...prev]);
    }
    
    // Re-fetch in background to ensure consistency
    const refreshedLeads = await db.getLeads();
    setLeads(refreshedLeads);

  }, [currentUser, users, leads]);

    const handleAddActivity = useCallback(async (lead: Lead, activityType: ActivityType, remarks: string, duration?: number) => {
        if (!currentUser) return;
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            leadId: lead.id,
            salespersonId: currentUser.id,
            type: activityType,
            date: new Date().toISOString(),
            remarks,
            duration,
            customerName: lead.customerName,
        };
        
        await db.addActivity(newActivity);

        setActivities(prev => [newActivity, ...prev]);
        setLeads(prevLeads => prevLeads.map(l => l.id === lead.id ? { 
            ...l, 
            lastActivityDate: newActivity.date,
            lastRemark: remarks
        } : l));
    }, [currentUser]);

    const handleAssignLead = useCallback(async (newLeadData: NewLeadData) => {
        const newLead: Lead = {
            id: `lead-${Date.now()}`,
            ...newLeadData,
            status: LeadStatus.New,
            leadDate: new Date().toISOString(),
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric'}),
            lastActivityDate: new Date().toISOString(),
            modeOfEnquiry: (newLeadData.platform as ModeOfEnquiry) || ModeOfEnquiry.Reference,
            visitStatus: 'No',
            lastRemark: newLeadData.remarks || 'New lead created.',
            isRead: false,
            missedVisitsCount: 0,
            budget: newLeadData.budget,
            purpose: newLeadData.purpose,
        };

        await db.addLead(newLead);
        setLeads(prev => [newLead, ...prev]);

        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            leadId: newLead.id,
            salespersonId: 'admin-0',
            type: ActivityType.Note,
            date: new Date().toISOString(),
            remarks: `Lead created and assigned to ${users.find(u => u.id === newLead.assignedSalespersonId)?.name}.`,
            customerName: newLead.customerName
        };
        await db.addActivity(newActivity);
        setActivities(prev => [newActivity, ...prev]);
    }, [users]);

    const handleBulkUpdate = useCallback(async (leadIds: string[], newStatus?: LeadStatus, newAssignedSalespersonId?: string) => {
        if (!currentUser) return;
        
        const updates: Partial<Lead> = {};
        if (newStatus) updates.status = newStatus;
        if (newAssignedSalespersonId) updates.assignedSalespersonId = newAssignedSalespersonId;
        updates.lastActivityDate = new Date().toISOString();

        await db.bulkUpdateLeads(leadIds, updates);
        
        // Refresh local state
        const updatedLeads = await db.getLeads();
        setLeads(updatedLeads);
    }, [currentUser]);

    const handleImportLeads = useCallback(async (newLeadsData: Omit<Lead, 'id' | 'isRead' | 'missedVisitsCount' | 'lastActivityDate' | 'month'>[]) => {
      const salespersonNameToId = new Map<string, string>(users.map(u => [u.name, u.id] as [string, string]));
      
      for (const data of newLeadsData) {
           const salespersonId = salespersonNameToId.get(data.assignedSalespersonId) || 'admin-0';
           const lead: Lead = {
              ...data,
              id: `imported-${Date.now()}-${Math.random()}`,
              isRead: false,
              missedVisitsCount: 0,
              lastActivityDate: data.leadDate,
              month: new Date(data.leadDate).toLocaleString('default', { month: 'long', year: 'numeric' }),
              assignedSalespersonId: salespersonId,
          };
          await db.addLead(lead);
      }
      const allLeads = await db.getLeads();
      setLeads(allLeads);
    }, [users]);

    const handleAddTask = useCallback(async (taskData: Omit<Task, 'id'>) => {
        const newTask: Task = {
            id: `task-${Date.now()}`,
            ...taskData,
        };
        await db.addTask(newTask);
        setTasks(prev => [newTask, ...prev]);
    }, []);

    const handleToggleTask = useCallback(async (taskId: string) => {
        await db.toggleTask(taskId);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
    }, []);

    const handleDeleteTask = useCallback(async (taskId: string) => {
        await db.deleteTask(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
    }, []);

    const handleCreateUser = useCallback(async (userData: { name: string }) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: userData.name,
            role: 'Salesperson',
            avatarUrl: `https://i.pravatar.cc/40?u=${userData.name}`
        };
        await db.addUser(newUser);
        setUsers(prev => [...prev, newUser]);
    }, []);

    const handleDeleteUser = useCallback(async (userId: string) => {
        const admin = users.find(u => u.role === 'Admin');
        if (!admin) return;
        
        await db.deleteUser(userId, admin.id);
        
        // Refresh all data to reflect reassignment
        const data = await db.getAllData();
        setUsers(data.users);
        setLeads(data.leads);
        setTasks(data.tasks);
    }, [users]);

    const handleBookUnit = useCallback(async (unitId: string) => {
        await db.bookUnit(unitId);
        const updatedInventory = await db.getInventory();
        setInventory(updatedInventory);
    }, []);

    const handleUpdateUnit = useCallback(async (projectId: string, unit: Unit) => {
        const updatedInventory = await db.updateUnit(projectId, unit);
        setInventory(updatedInventory);
    }, []);

    const handleAddUnit = useCallback(async (projectId: string, unit: Unit) => {
        const updatedInventory = await db.addUnit(projectId, unit);
        setInventory(updatedInventory);
    }, []);

    const handleDeleteUnit = useCallback(async (projectId: string, unitId: string) => {
        const updatedInventory = await db.deleteUnit(projectId, unitId);
        setInventory(updatedInventory);
    }, []);
    
    const handleResetDatabase = useCallback(async () => {
        if (window.confirm("Are you sure? This will delete all new data and restore the demo dataset.")) {
            setIsLoading(true);
            const data = await db.resetDatabase();
            setLeads(data.leads);
            setUsers(data.users);
            setActivities(data.activities);
            setSalesTargets(data.salesTargets);
            setTasks(data.tasks);
            setInventory(data.inventory);
            setIsLoading(false);
        }
    }, []);

    const handleLogin = useCallback((user: User) => {
        setCurrentUser(user);
        const isAdmin = user.role === 'Admin';
        setActiveView(isAdmin ? 'Dashboard' : 'Leads');
    }, []);
    
    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        setActiveView('Dashboard');
    }, []);
    
    const handleSearchResultClick = useCallback((lead: Lead) => {
        setTargetLeadId(lead.id);
        setActiveView('Leads');
        setSearchTerm('');
    }, []);

    const visibleLeads = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'Admin') return leads;
        return leads.filter(lead => lead.assignedSalespersonId === currentUser.id);
    }, [currentUser, leads]);
    
    const visibleTasks = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'Admin') return tasks;
        return tasks.filter(task => task.assignedToId === currentUser.id);
    }, [currentUser, tasks]);

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        const lowercasedTerm = searchTerm.toLowerCase();
        return visibleLeads.filter(lead => 
            lead.customerName.toLowerCase().includes(lowercasedTerm) ||
            lead.mobile.includes(lowercasedTerm) ||
            lead.interestedProject?.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, visibleLeads]);

    const renderView = () => {
        const commonProps = { 
            users, 
            currentUser: currentUser!, 
            onLogout: handleLogout,
            onNavigate: setActiveView,
        };

        let Content;

        switch (activeView) {
            case 'Dashboard':
                Content = <Dashboard leads={visibleLeads} activities={activities} projects={inventory} {...commonProps} />;
                break;
            case 'Leads':
            case 'Opportunities':
            case 'Clients':
                Content = <LeadsPage 
                    viewMode={activeView.toLowerCase() as 'leads' | 'opportunities' | 'clients'}
                    leads={visibleLeads} 
                    activities={activities}
                    onUpdateLead={handleUpdateLead} 
                    onAddActivity={handleAddActivity}
                    onAssignLead={handleAssignLead}
                    onBulkUpdate={handleBulkUpdate}
                    onImportLeads={handleImportLeads}
                    targetLeadId={targetLeadId}
                    onClearTargetLead={() => setTargetLeadId(null)}
                    onAddTask={handleAddTask}
                    {...commonProps} 
                />;
                break;
            case 'Inventory':
                Content = <InventoryPage 
                    projects={inventory} 
                    onBookUnit={handleBookUnit} 
                    onUpdateUnit={handleUpdateUnit}
                    onAddUnit={handleAddUnit}
                    onDeleteUnit={handleDeleteUnit}
                    currentUser={currentUser!}
                />;
                break;
            case 'Calendar':
                Content = <CalendarPage leads={visibleLeads} tasks={visibleTasks} />;
                break;
            case 'Attendance':
                Content = <AttendancePage />;
                break;
            case 'Reports':
                Content = <ReportsPage 
                    leads={leads} 
                    activities={activities}
                    onUpdateLead={handleUpdateLead} 
                    onAddActivity={handleAddActivity}
                    {...commonProps} 
                />;
                break;
            case 'Tasks':
                Content = <TasksPage 
                    tasks={visibleTasks} 
                    leads={visibleLeads}
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onUpdateLead={handleUpdateLead}
                    {...commonProps} 
                />;
                break;
            case 'Settings':
                 Content = <SettingsPage 
                    onCreateUser={handleCreateUser}
                    onDeleteUser={handleDeleteUser}
                    onResetDatabase={handleResetDatabase}
                    {...commonProps} 
                />;
                break;
            default:
                Content = <Dashboard leads={visibleLeads} activities={activities} projects={inventory} {...commonProps} />;
        }

        return (
            <Suspense fallback={<LoadingSpinner />}>
                {Content}
            </Suspense>
        );
    };

    if (!currentUser) {
        return <LoginPage users={users} onLogin={handleLogin} />;
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex h-full w-full bg-base-200 overflow-hidden">
            {notification && <NotificationToast message={notification} onClose={() => setNotification(null)} />}
            <Sidebar 
                activeView={activeView} 
                onNavigate={setActiveView} 
                isOpen={isSidebarOpen} 
                setOpen={setSidebarOpen}
                currentUser={currentUser} 
            />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchResults={searchResults}
                    users={users}
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onRefresh={loadData}
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    onResultClick={handleSearchResultClick}
                    onNavigate={setActiveView}
                />
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto p-4 md:p-6 pb-24 md:pb-6">
                        {renderView()}
                    </div>
                </main>
                 <BottomNavBar 
                    activeView={activeView}
                    onNavigate={setActiveView}
                    currentUser={currentUser}
                />
            </div>
        </div>
    );
};

export default App;
