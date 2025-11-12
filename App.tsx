
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LeadsPage from './components/LeadsPage';
import CalendarPage from './components/CalendarPage';
import AttendancePage from './components/AttendancePage';
import ReportsPage from './components/ReportsPage';
import TasksPage from './components/TasksPage';
import LoginPage from './components/LoginPage';
import SettingsPage from './components/SettingsPage';
import { fetchSheetData } from './services/googleSheetService';
import { Lead, User, Activity, SalesTarget, Task, LeadStatus, ActivityType, ModeOfEnquiry, Notification } from './types';

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
    <div className="flex justify-center items-center h-full">
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
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
    let newActivity: Activity | null = null;

    const newLeads = leads.map(lead => {
      if (lead.id === updatedLead.id) {
        const leadToUpdate = {
          ...updatedLead,
          isRead: true,
          lastActivityDate: new Date().toISOString(),
        };

        if (updatedLead.status === LeadStatus.Cancelled && lead.assignedSalespersonId !== adminId) {
          leadToUpdate.assignedSalespersonId = adminId;
          newActivity = {
            id: `act-${Date.now()}`,
            leadId: leadToUpdate.id,
            salespersonId: currentUser.id,
            type: ActivityType.Note,
            date: new Date().toISOString(),
            remarks: `Lead status set to Cancelled and automatically reassigned to ${admin?.name || 'Admin'}.`,
            customerName: leadToUpdate.customerName,
          };
        }
        return leadToUpdate;
      }
      return lead;
    });

    setLeads(newLeads);
    if (newActivity) {
      setActivities(prevActivities => [newActivity, ...prevActivities]);
    }
  };

  const handleBulkUpdateLeads = (leadIds: string[], newStatus?: LeadStatus, newAssignedSalespersonId?: string) => {
    if (!currentUser) return;
    
    const admin = users.find(u => u.role === 'Admin');
    const adminId = admin?.id || 'admin-0';

    const wasCancelled = newStatus === LeadStatus.Cancelled;
    const finalAssignedSalespersonId = wasCancelled ? adminId : newAssignedSalespersonId;

    const newActivities: Activity[] = [];

    const newLeads = leads.map(lead => {
        if (leadIds.includes(lead.id)) {
            const updatedLead = { 
                ...lead, 
                isRead: true, 
                lastActivityDate: new Date().toISOString() 
            };

            const changes = [];
            if (newStatus && lead.status !== newStatus) {
                updatedLead.status = newStatus;
                changes.push(`Status changed to ${newStatus}`);
            }
            
            if (finalAssignedSalespersonId && lead.assignedSalespersonId !== finalAssignedSalespersonId) {
                updatedLead.assignedSalespersonId = finalAssignedSalespersonId;
                if (wasCancelled) {
                    changes.push(`Automatically reassigned to ${admin?.name || 'Admin'}`);
                } else {
                    const newAssignee = users.find(u => u.id === finalAssignedSalespersonId);
                    changes.push(`Assigned to ${newAssignee?.name || 'N/A'}`);
                }
            }

            if (changes.length > 0) {
                const remarkText = `Bulk Update: ${changes.join(', ')}.`;
                const newActivity: Activity = {
                    id: `act-${Date.now()}-${lead.id}`,
                    leadId: lead.id,
                    salespersonId: currentUser.id,
                    type: ActivityType.Note,
                    date: new Date().toISOString(),
                    remarks: remarkText,
                    customerName: lead.customerName,
                };
                newActivities.push(newActivity);
                updatedLead.lastRemark = remarkText;
            }
            return updatedLead;
        }
        return lead;
    });
    
    setLeads(newLeads);

    if (newActivities.length > 0) {
        setActivities(prev => [...newActivities, ...prev]);
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
      remarks: remarks,
      customerName: lead.customerName,
      duration: duration,
    };
    setActivities(prevActivities => [newActivity, ...prevActivities]);
    // Also update the lead
    setLeads(prevLeads => prevLeads.map(l => 
      l.id === lead.id ? { ...l, lastActivityDate: new Date().toISOString(), isRead: true, lastRemark: remarks } : l
    ));
  };
  
  const handleAddTask = (task: Omit<Task, 'id'>) => {
      const newTask: Task = { ...task, id: `task-${Date.now()}`};
      setTasks(prev => [newTask, ...prev]);
  };
  
  const handleToggleTask = (taskId: string) => {
      setTasks(prev => prev.map(t => t.id === taskId ? {...t, isCompleted: !t.isCompleted} : t));
  };

  const handleAssignLead = (newLeadData: NewLeadData) => {
    const newLead: Lead = {
        id: `lead-${Date.now()}`,
        customerName: newLeadData.customerName,
        mobile: newLeadData.mobile,
        email: newLeadData.email,
        city: newLeadData.city,
        platform: newLeadData.platform,
        interestedProject: newLeadData.interestedProject,
        interestedUnit: newLeadData.interestedUnit,
        investmentTimeline: newLeadData.investmentTimeline,
        assignedSalespersonId: newLeadData.assignedSalespersonId,
        status: LeadStatus.New,
        leadDate: new Date().toISOString(),
        lastActivityDate: new Date().toISOString(),
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        modeOfEnquiry: (newLeadData.platform as ModeOfEnquiry) || ModeOfEnquiry.Digital,
        visitStatus: 'No',
        lastRemark: newLeadData.remarks || 'New lead assigned by admin.',
        isRead: false,
        missedVisitsCount: 0,
    };
    setLeads(prevLeads => [newLead, ...prevLeads]);

    if (currentUser) {
        const assignedToUser = users.find(u => u.id === newLeadData.assignedSalespersonId);
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            leadId: newLead.id,
            salespersonId: currentUser.id, // Logged as the admin who did the action
            type: ActivityType.Note,
            date: new Date().toISOString(),
            remarks: newLeadData.remarks ? `Initial Remark: ${newLeadData.remarks}` : `Lead assigned to ${assignedToUser?.name || 'N/A'}.`,
            customerName: newLead.customerName,
        };
        setActivities(prevActivities => [newActivity, ...prevActivities]);
    }
  };

  const handleImportLeads = (newLeads: Omit<Lead, 'id' | 'isRead' | 'missedVisitsCount' | 'lastActivityDate' | 'month'>[]) => {
      const salespersonNameToId = new Map(users.map(u => [u.name.toLowerCase(), u.id]));

      const createdLeads: Lead[] = newLeads.map((l, index) => {
          // Attempt to find user, default to current user if not found
          const assignedSalespersonId = salespersonNameToId.get(l.assignedSalespersonId.toLowerCase()) || currentUser!.id;
          
          return {
              ...l,
              id: `imported-${Date.now()}-${index}`,
              assignedSalespersonId,
              isRead: false,
              missedVisitsCount: 0,
              lastActivityDate: new Date().toISOString(),
              month: new Date(l.leadDate).toLocaleString('default', { month: 'long', year: 'numeric' }),
          };
      });
      setLeads(prev => [...createdLeads, ...prev]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role !== 'Admin') {
      setActiveView('Leads');
    } else {
      setActiveView('Dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('Dashboard');
  };

  const handleAddNotification = (message: string, targetUserId?: string) => {
      const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          message,
          targetUserId,
          createdDate: new Date().toISOString(),
          isRead: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
  };

  const handleMarkNotificationsAsRead = () => {
      if (!currentUser) return;
      setNotifications(prev => prev.map(n => {
          const isOwnNotification = !n.targetUserId || n.targetUserId === currentUser.id;
          if (isOwnNotification) {
              return { ...n, isRead: true };
          }
          return n;
      }));
  };

   const handleCreateUser = (userData: { name: string; role: 'Salesperson' | 'Sales Manager'; reportsTo?: string }) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: userData.name,
            role: userData.role,
            reportsTo: userData.reportsTo,
            avatarUrl: `https://i.pravatar.cc/40?u=${userData.name.replace(/\s/g, '')}`,
        };
        setUsers(prev => [...prev, newUser]);
    };

    const handleDeleteUser = (userId: string) => {
        if (!currentUser || currentUser.role !== 'Admin') return;

        const admin = users.find(u => u.role === 'Admin');
        const userToDelete = users.find(u => u.id === userId);
        if (!admin || !userToDelete) return;

        // Reassign leads
        const newActivities: Activity[] = [];
        const updatedLeads = leads.map(lead => {
            if (lead.assignedSalespersonId === userId) {
                newActivities.push({
                    id: `act-${Date.now()}-${lead.id}`,
                    leadId: lead.id,
                    salespersonId: currentUser.id,
                    type: ActivityType.Note,
                    date: new Date().toISOString(),
                    remarks: `Lead reassigned from ${userToDelete.name} to ${admin.name} due to account deletion.`,
                    customerName: lead.customerName,
                });
                return { ...lead, assignedSalespersonId: admin.id };
            }
            return lead;
        });
        setLeads(updatedLeads);
        if (newActivities.length > 0) {
            setActivities(prev => [...newActivities, ...prev]);
        }

        // Reassign tasks
        const updatedTasks = tasks.map(task => {
            if (task.assignedToId === userId) {
                return { ...task, assignedToId: admin.id };
            }
            return task;
        });
        setTasks(updatedTasks);

        // Delete user and update reporting structure for their team
        const remainingUsers = users.filter(u => u.id !== userId);
        const fullyUpdatedUsers = remainingUsers.map(u => {
            if (u.reportsTo === userId) {
                return { ...u, reportsTo: admin.id };
            }
            return u;
        });
        setUsers(fullyUpdatedUsers);
    };

  const { visibleLeads, visibleActivities, visibleTasks } = useMemo(() => {
    if (!currentUser) {
        return { visibleLeads: [], visibleActivities: [], visibleTasks: [] };
    }

    if (currentUser.role === 'Admin') {
        return { visibleLeads: leads, visibleActivities: activities, visibleTasks: tasks };
    }

    if (currentUser.role === 'Sales Manager') {
        const managedUserIds = users
            .filter(u => u.reportsTo === currentUser.id)
            .map(u => u.id);
        const teamIds = [currentUser.id, ...managedUserIds];

        return {
            visibleLeads: leads.filter(l => teamIds.includes(l.assignedSalespersonId)),
            visibleActivities: activities.filter(a => teamIds.includes(a.salespersonId)),
            visibleTasks: tasks.filter(t => teamIds.includes(t.assignedToId)),
        };
    }

    // Default is 'Salesperson'
    return {
        visibleLeads: leads.filter(l => l.assignedSalespersonId === currentUser.id),
        visibleActivities: activities.filter(a => a.salespersonId === currentUser.id),
        visibleTasks: tasks.filter(t => t.assignedToId === currentUser.id),
    };
  }, [currentUser, users, leads, activities, tasks]);

  const filteredLeadsForSearch = useMemo(() => visibleLeads.filter(lead =>
    lead.interestedProject?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [searchTerm, visibleLeads]);
  
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    switch (activeView) {
      case 'Dashboard':
        if (currentUser?.role !== 'Admin') {
          return <LeadsPage 
                    leads={visibleLeads} 
                    users={users}
                    currentUser={currentUser!}
                    onUpdateLead={handleUpdateLead}
                    onAddActivity={handleAddActivity}
                    activities={visibleActivities}
                    onAssignLead={handleAssignLead}
                    onBulkUpdate={handleBulkUpdateLeads}
                    onImportLeads={handleImportLeads}
                 />;
        }
        return <Dashboard leads={visibleLeads} users={users} activities={visibleActivities} salesTargets={salesTargets} currentUser={currentUser!} tasks={visibleTasks} />;
      case 'Leads':
        return <LeadsPage 
                  leads={visibleLeads} 
                  users={users}
                  currentUser={currentUser!}
                  onUpdateLead={handleUpdateLead}
                  onAddActivity={handleAddActivity}
                  activities={visibleActivities}
                  onAssignLead={handleAssignLead}
                  onBulkUpdate={handleBulkUpdateLeads}
                  onImportLeads={handleImportLeads}
               />;
      case 'Calendar':
        return <CalendarPage leads={visibleLeads} tasks={visibleTasks} />;
      case 'Attendance':
        return <AttendancePage />;
      case 'Reports':
        return <ReportsPage 
                    leads={visibleLeads} 
                    users={users} 
                    currentUser={currentUser!} 
                    onUpdateLead={handleUpdateLead}
                    onAddActivity={handleAddActivity}
                    activities={activities}
                />;
      case 'Tasks':
        return <TasksPage 
                tasks={visibleTasks}
                users={users}
                currentUser={currentUser!}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                />;
       case 'Settings':
         if (currentUser?.role !== 'Admin') {
            setActiveView('Dashboard');
            return null;
         }
         return <SettingsPage
                    users={users}
                    onCreateUser={handleCreateUser}
                    onDeleteUser={handleDeleteUser}
                />;
      default:
        if (currentUser?.role === 'Admin') {
            return <Dashboard leads={visibleLeads} users={users} activities={visibleActivities} salesTargets={salesTargets} currentUser={currentUser!} tasks={visibleTasks} />;
        }
        return <LeadsPage 
                  leads={visibleLeads} 
                  users={users}
                  currentUser={currentUser!}
                  onUpdateLead={handleUpdateLead}
                  onAddActivity={handleAddActivity}
                  activities={visibleActivities}
                  onAssignLead={handleAssignLead}
                  onBulkUpdate={handleBulkUpdateLeads}
                  onImportLeads={handleImportLeads}
               />;
    }
  };
  
  if (!currentUser) {
    return <LoginPage users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background text-text-primary font-sans">
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView} 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen} 
        currentUser={currentUser} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          searchResults={filteredLeadsForSearch}
          users={users}
          currentUser={currentUser}
          onLogout={handleLogout}
          onRefresh={loadData}
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          notifications={notifications}
          onAddNotification={handleAddNotification}
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
