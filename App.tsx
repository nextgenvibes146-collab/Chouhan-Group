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
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
        const originalLead = lead;
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
          newActivity = {
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

    setLeads(newLeads);
    if (newActivity) {
      setActivities(prevActivities => [newActivity, ...prevActivities]);
    }
  };

  const handleBulkUpdateLeads = (leadIds: string[], newStatus?: LeadStatus, newAssignedSalespersonId?: string) => {
    if (!currentUser) return;
    
    const admin = users.find(u => u.role === 'Admin');
    const adminId = admin?.id || 'admin-0';

    const wasCancelled = newStatus === LeadStatus.Lost;
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
  
  const handleDeleteTask = (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
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
        labels: ['Hot'],
    };
    setLeads(prevLeads => [newLead, ...prevLeads]);

    if (currentUser) {
        const assignedToUser = users.find(u => u.id === newLeadData.assignedSalespersonId);
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            leadId: newLead.id,
            salespersonId: currentUser.id,
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
    setActiveView('Dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const { visibleLeads, visibleActivities, visibleTasks } = useMemo(() => {
    if (!currentUser) {
        return { visibleLeads: [], visibleActivities: [], visibleTasks: [] };
    }

    if (currentUser.role === 'Admin') {
        return { visibleLeads: leads, visibleActivities: activities, visibleTasks: tasks };
    }
    
    return {
        visibleLeads: leads.filter(l => l.assignedSalespersonId === currentUser.id),
        visibleActivities: activities.filter(a => a.salespersonId === currentUser.id),
        visibleTasks: tasks.filter(t => t.assignedToId === currentUser.id),
    };
  }, [currentUser, leads, activities, tasks]);
  
  const renderContent = () => {
    if (isLoading) {
      return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>;
    }
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard leads={visibleLeads} users={users} activities={visibleActivities} currentUser={currentUser!} />;
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
      case 'Tasks':
        return <TasksPage 
                tasks={visibleTasks}
                users={users}
                currentUser={currentUser!}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                />;
      default:
        return <Dashboard leads={visibleLeads} users={users} activities={visibleActivities} currentUser={currentUser!} />;
    }
  };
  
  if (!currentUser) {
    return <LoginPage users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-base-200 text-base-content font-sans">
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20">
          {renderContent()}
        </main>
        <BottomNavBar activeView={activeView} onNavigate={setActiveView} />
    </div>
  );
};

export default App;