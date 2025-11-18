
import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import BottomNavBar from './components/BottomNavBar';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import { fetchSheetData } from './services/googleSheetService';
import { Lead, User, Activity, SalesTarget, Task, LeadStatus, ActivityType, ModeOfEnquiry } from './types';

// Lazy load components for better initial load performance
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const LeadsPage = React.lazy(() => import('./components/LeadsPage'));
const CalendarPage = React.lazy(() => import('./components/CalendarPage'));
const AttendancePage = React.lazy(() => import('./components/AttendancePage'));
const ReportsPage = React.lazy(() => import('./components/ReportsPage'));
const TasksPage = React.lazy(() => import('./components/TasksPage'));
const SettingsPage = React.lazy(() => import('./components/SettingsPage'));

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
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setSearchTerm('');
    const data = await fetchSheetData();
    setLeads(data.leads);
    setUsers(data.users);
    setActivities(data.activities);
    setSalesTargets(data.salesTargets);
    setTasks(data.tasks);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleUpdateLead = useCallback((updatedLead: Lead) => {
    if (!currentUser) return;

    // We need the latest users state, so we use the functional update or dependency
    // Since users rarely change, using it in dependency is fine, but let's be safe inside
    setLeads(prevLeads => {
        const admin = users.find(u => u.role === 'Admin');
        const adminId = admin?.id || 'admin-0';
        
        // We need to queue side effects (activities) to be set after map
        // However, doing state updates inside a state update callback for another atom is tricky.
        // We will calculate the new leads and the new activities, then set them.
        // To avoid complex closure issues, we'll just do the mapping logic here.
        
        let activityToAdd: Activity | null = null;
        let assignmentActivity: Activity | null = null;

        const newLeads = prevLeads.map(lead => {
            if (lead.id === updatedLead.id) {
                const originalLead = { ...lead };
                
                if (originalLead.assignedSalespersonId !== updatedLead.assignedSalespersonId) {
                    const newAssignee = users.find(u => u.id === updatedLead.assignedSalespersonId);
                    assignmentActivity = {
                        id: `act-assign-${Date.now()}`,
                        leadId: updatedLead.id,
                        salespersonId: currentUser.id,
                        type: ActivityType.Note,
                        date: new Date().toISOString(),
                        remarks: `Lead assigned to ${newAssignee?.name || 'N/A'}.`,
                        customerName: updatedLead.customerName,
                    };
                }

                let finalUpdatedLead = { ...updatedLead };

                const visitDateStr = originalLead.visitDate || originalLead.nextFollowUpDate;
                const wasVisitScheduled = originalLead.status === LeadStatus.SiteVisitScheduled;
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isVisitDatePast = visitDateStr && new Date(visitDateStr) < today;
                
                const didVisitNotHappen = finalUpdatedLead.status !== LeadStatus.SiteVisitDone && finalUpdatedLead.status !== LeadStatus.Booking;

                if (wasVisitScheduled && isVisitDatePast && didVisitNotHappen) {
                    if (originalLead.status !== finalUpdatedLead.status) {
                        finalUpdatedLead.missedVisitsCount = (originalLead.missedVisitsCount || 0) + 1;
                    }
                }
                
                const leadToUpdate = {
                ...finalUpdatedLead,
                isRead: true,
                lastActivityDate: new Date().toISOString(),
                };

                if (updatedLead.status === LeadStatus.Lost && lead.assignedSalespersonId !== adminId) {
                    leadToUpdate.assignedSalespersonId = adminId;
                    activityToAdd = {
                        id: `act-${Date.now()}`,
                        leadId: leadToUpdate.id,
                        salespersonId: currentUser.id,
                        type: ActivityType.Note,
                        date: new Date().toISOString(),
                        remarks: `Lead status set to Lost and automatically reassigned to ${admin?.name || 'Admin'}.`,
                        customerName: leadToUpdate.customerName,
                    };
                }
                return leadToUpdate;
            }
            return lead;
        });

        // Side effect: Update activities
        if (activityToAdd || assignmentActivity) {
             setActivities(prev => {
                 const newActs = [...prev];
                 if(assignmentActivity) newActs.unshift(assignmentActivity);
                 if(activityToAdd) newActs.unshift(activityToAdd);
                 return newActs;
             });
        }

        return newLeads;
    });
  }, [currentUser, users]);

    const handleAddActivity = useCallback((lead: Lead, activityType: ActivityType, remarks: string, duration?: number) => {
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
        setActivities(prev => [newActivity, ...prev]);
        
        setLeads(prevLeads => prevLeads.map(l => l.id === lead.id ? { 
            ...l, 
            lastActivityDate: newActivity.date,
            lastRemark: remarks
        } : l));
    }, [currentUser]);

    const handleAssignLead = useCallback((newLeadData: NewLeadData) => {
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
        };
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
        setActivities(prev => [newActivity, ...prev]);
    }, [users]);

    const handleBulkUpdate = useCallback((leadIds: string[], newStatus?: LeadStatus, newAssignedSalespersonId?: string) => {
        if (!currentUser) return;
        
        // We need to access current leads to generate activities
        setLeads(prevLeads => {
            const newActivities: Activity[] = [];
            const updatedLeads = prevLeads.map(l => {
                if (!leadIds.includes(l.id)) return l;

                const updatedFields: Partial<Lead> = { lastActivityDate: new Date().toISOString() };
                
                if (newStatus) {
                    updatedFields.status = newStatus;
                    newActivities.push({
                        id: `act-bulk-status-${l.id}-${Date.now()}`,
                        leadId: l.id,
                        salespersonId: currentUser.id,
                        type: ActivityType.Note,
                        date: new Date().toISOString(),
                        remarks: `Bulk updated status to ${newStatus}.`,
                        customerName: l.customerName
                    });
                }
                if (newAssignedSalespersonId) {
                    updatedFields.assignedSalespersonId = newAssignedSalespersonId;
                    const assigneeName = users.find(u => u.id === newAssignedSalespersonId)?.name || 'N/A';
                    newActivities.push({
                        id: `act-bulk-assign-${l.id}-${Date.now()}`,
                        leadId: l.id,
                        salespersonId: currentUser.id,
                        type: ActivityType.Note,
                        date: new Date().toISOString(),
                        remarks: `Bulk assigned to ${assigneeName}.`,
                        customerName: l.customerName
                    });
                }
                return { ...l, ...updatedFields };
            });
            
            setActivities(prev => [...newActivities, ...prev]);
            return updatedLeads;
        });
    }, [currentUser, users]);

    const handleImportLeads = useCallback((newLeadsData: Omit<Lead, 'id' | 'isRead' | 'missedVisitsCount' | 'lastActivityDate' | 'month'>[]) => {
      const salespersonNameToId = new Map(users.map(u => [u.name, u.id]));
      const importedLeads = newLeadsData.map((data, index) => {
          const salespersonId = salespersonNameToId.get(data.assignedSalespersonId) || 'admin-0';
          return {
              ...data,
              id: `imported-${Date.now()}-${index}`,
              isRead: false,
              missedVisitsCount: 0,
              lastActivityDate: data.leadDate,
              month: new Date(data.leadDate).toLocaleString('default', { month: 'long', year: 'numeric' }),
              assignedSalespersonId: salespersonId,
          };
      });
      setLeads(prev => [...importedLeads, ...prev]);
    }, [users]);

    const handleAddTask = useCallback((taskData: Omit<Task, 'id'>) => {
        const newTask: Task = {
            id: `task-${Date.now()}`,
            ...taskData,
        };
        setTasks(prev => [newTask, ...prev]);
    }, []);

    const handleToggleTask = useCallback((taskId: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
    }, []);

    const handleDeleteTask = useCallback((taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    }, []);

    const handleCreateUser = useCallback((userData: { name: string }) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: userData.name,
            role: 'Salesperson',
            avatarUrl: `https://i.pravatar.cc/40?u=${userData.name}`
        };
        setUsers(prev => [...prev, newUser]);
    }, []);

    const handleDeleteUser = useCallback((userId: string) => {
        const admin = users.find(u => u.role === 'Admin');
        if (!admin) return;

        setLeads(prev => prev.map(l => l.assignedSalespersonId === userId ? { ...l, assignedSalespersonId: admin.id } : l));
        setTasks(prev => prev.map(t => t.assignedToId === userId ? { ...t, assignedToId: admin.id } : t));
        setUsers(prev => prev.filter(u => u.id !== userId));
    }, [users]);

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
        // Memoize common props to prevent re-renders of lazy loaded components
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
        <div className="flex h-screen bg-base-200">
            <Sidebar 
                activeView={activeView} 
                onNavigate={setActiveView} 
                isOpen={isSidebarOpen} 
                setOpen={setSidebarOpen}
                currentUser={currentUser} 
            />
            <div className="flex-1 flex flex-col">
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
                    <div className="container mx-auto p-4 md:p-6 pb-20 md:pb-6">
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
