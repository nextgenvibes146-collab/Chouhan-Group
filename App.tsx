

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BottomNavBar from './components/BottomNavBar';
import Dashboard from './components/Dashboard';
import LeadsPage from './components/LeadsPage';
import CalendarPage from './components/CalendarPage';
import AttendancePage from './components/AttendancePage';
import ReportsPage from './components/ReportsPage';
import TasksPage from './components/TasksPage';
import LoginPage from './components/LoginPage';
import SettingsPage from './components/SettingsPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { fetchSheetData } from './services/googleSheetService';
import { Lead, User, Activity, SalesTarget, Task, LeadStatus, ActivityType, ModeOfEnquiry } from './types';

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
    <div className="flex justify-center items-center h-screen bg-base-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
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
  
  const handleUpdateLead = (updatedLead: Lead) => {
    if (!currentUser) return;

    const admin = users.find(u => u.role === 'Admin');
    const adminId = admin?.id || 'admin-0';
    const activitiesToCreate: Activity[] = [];

    const newLeads = leads.map(lead => {
      if (lead.id === updatedLead.id) {
        const originalLead = { ...lead };
        
        if (originalLead.assignedSalespersonId !== updatedLead.assignedSalespersonId) {
            const newAssignee = users.find(u => u.id === updatedLead.assignedSalespersonId);
            const assignmentActivity: Activity = {
                id: `act-assign-${Date.now()}`,
                leadId: updatedLead.id,
                salespersonId: currentUser.id,
                type: ActivityType.Note,
                date: new Date().toISOString(),
                remarks: `Lead assigned to ${newAssignee?.name || 'N/A'}.`,
                customerName: updatedLead.customerName,
            };
            activitiesToCreate.push(assignmentActivity);
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
          const lostActivity = {
            id: `act-${Date.now()}`,
            leadId: leadToUpdate.id,
            salespersonId: currentUser.id,
            type: ActivityType.Note,
            date: new Date().toISOString(),
            remarks: `Lead status set to Lost and automatically reassigned to ${admin?.name || 'Admin'}.`,
            customerName: leadToUpdate.customerName,
          };
          activitiesToCreate.push(lostActivity);
        }
        return leadToUpdate;
      }
      return lead;
    });

    setLeads(newLeads);
    if (activitiesToCreate.length > 0) {
        setActivities(prev => [...activitiesToCreate, ...prev]);
    }
  };

    const handleAddActivity = (lead: Lead, activityType: ActivityType, remarks: string, duration?: number) => {
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
        
        // Also update the lead's last activity date and remark
        const updatedLead = { 
            ...lead, 
            lastActivityDate: newActivity.date,
            lastRemark: remarks
        };
        setLeads(leads.map(l => l.id === lead.id ? updatedLead : l));
    };

    const handleAssignLead = (newLeadData: NewLeadData) => {
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

        // Add corresponding activity
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            leadId: newLead.id,
            salespersonId: 'admin-0', // Assuming admin assigns
            type: ActivityType.Note,
            date: new Date().toISOString(),
            remarks: `Lead created and assigned to ${users.find(u => u.id === newLead.assignedSalespersonId)?.name}.`,
            customerName: newLead.customerName
        };
        setActivities(prev => [newActivity, ...prev]);
    };

    const handleBulkUpdate = (leadIds: string[], newStatus?: LeadStatus, newAssignedSalespersonId?: string) => {
        let updatedLeads = [...leads];
        const newActivities: Activity[] = [];

        leadIds.forEach(id => {
            const originalLead = leads.find(l => l.id === id);
            if (!originalLead) return;

            const updatedFields: Partial<Lead> = { lastActivityDate: new Date().toISOString() };
            if (newStatus) {
                updatedFields.status = newStatus;
                newActivities.push({
                    id: `act-bulk-status-${id}-${Date.now()}`,
                    leadId: id,
                    salespersonId: currentUser!.id,
                    type: ActivityType.Note,
                    date: new Date().toISOString(),
                    remarks: `Bulk updated status to ${newStatus}.`,
                    customerName: originalLead.customerName
                });
            }
            if (newAssignedSalespersonId) {
                updatedFields.assignedSalespersonId = newAssignedSalespersonId;
                const assigneeName = users.find(u => u.id === newAssignedSalespersonId)?.name || 'N/A';
                newActivities.push({
                    id: `act-bulk-assign-${id}-${Date.now()}`,
                    leadId: id,
                    salespersonId: currentUser!.id,
                    type: ActivityType.Note,
                    date: new Date().toISOString(),
                    remarks: `Bulk assigned to ${assigneeName}.`,
                    customerName: originalLead.customerName
                });
            }
            updatedLeads = updatedLeads.map(l => l.id === id ? { ...l, ...updatedFields } : l);
        });
        setLeads(updatedLeads);
        setActivities(prev => [...newActivities, ...prev]);
    };

    const handleImportLeads = (newLeadsData: Omit<Lead, 'id' | 'isRead' | 'missedVisitsCount' | 'lastActivityDate' | 'month'>[]) => {
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
    };

    const handleAddTask = (taskData: Omit<Task, 'id'>) => {
        const newTask: Task = {
            id: `task-${Date.now()}`,
            ...taskData,
        };
        setTasks(prev => [newTask, ...prev]);
    };

    const handleToggleTask = (taskId: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const handleCreateUser = (userData: { name: string }) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: userData.name,
            role: 'Salesperson',
            avatarUrl: `https://i.pravatar.cc/40?u=${userData.name}`
        };
        setUsers(prev => [...prev, newUser]);
    };

    const handleDeleteUser = (userId: string) => {
        const admin = users.find(u => u.role === 'Admin');
        if (!admin) return;

        // Re-assign leads and tasks to admin
        setLeads(prev => prev.map(l => l.assignedSalespersonId === userId ? { ...l, assignedSalespersonId: admin.id } : l));
        setTasks(prev => prev.map(t => t.assignedToId === userId ? { ...t, assignedToId: admin.id } : t));

        // Delete user
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        const isAdmin = user.role === 'Admin';
        setActiveView(isAdmin ? 'Dashboard' : 'Leads');
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setActiveView('Dashboard');
    };
    
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

    if (!currentUser) {
        return <LoginPage users={users} onLogin={handleLogin} />;
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const renderView = () => {
        const commonProps = { 
            users, 
            currentUser, 
            onLogout: handleLogout,
            onNavigate: setActiveView,
        };

        switch (activeView) {
            case 'Dashboard':
                return <Dashboard leads={visibleLeads} activities={activities} {...commonProps} />;
            case 'Leads':
                return <LeadsPage 
                    leads={visibleLeads} 
                    activities={activities}
                    onUpdateLead={handleUpdateLead} 
                    onAddActivity={handleAddActivity}
                    onAssignLead={handleAssignLead}
                    onBulkUpdate={handleBulkUpdate}
                    onImportLeads={handleImportLeads}
                    {...commonProps} 
                />;
            case 'Calendar':
                return <CalendarPage leads={visibleLeads} tasks={visibleTasks} />;
            case 'Attendance':
                return <AttendancePage />;
            case 'Reports':
                return <ReportsPage 
                    leads={leads} 
                    activities={activities}
                    onUpdateLead={handleUpdateLead} 
                    onAddActivity={handleAddActivity}
                    {...commonProps} 
                />;
            case 'Tasks':
                return <TasksPage 
                    tasks={visibleTasks} 
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    {...commonProps} 
                />;
            case 'Settings':
                 return <SettingsPage 
                    onCreateUser={handleCreateUser}
                    onDeleteUser={handleDeleteUser}
                    {...commonProps} 
                />;
            default:
                return <Dashboard leads={visibleLeads} activities={activities} {...commonProps} />;
        }
    };

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