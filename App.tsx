
import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import BottomNavBar from './components/BottomNavBar';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import { db } from './services/database'; // Use new DB service
import { Lead, User, Activity, SalesTarget, Task, LeadStatus, ActivityType, ModeOfEnquiry } from './types';
import { Project } from './data/inventoryData';

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
                Content = <Dashboard leads={visibleLeads} activities={activities} {...commonProps} />;
                break;
            case 'Leads':
                Content = <LeadsPage 
                    leads={visibleLeads} 
                    activities={activities}
                    onUpdateLead={handleUpdateLead} 
                    onAddActivity={handleAddActivity}
                    onAssignLead={handleAssignLead}
                    onBulkUpdate={handleBulkUpdate}
                    onImportLeads={handleImportLeads}
                    {...commonProps} 
                />;
                break;
            case 'Inventory':
                Content = <InventoryPage projects={inventory} onBookUnit={handleBookUnit} />;
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
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
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
                Content = <Dashboard leads={visibleLeads} activities={activities} {...commonProps} />;
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
