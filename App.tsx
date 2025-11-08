import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LeadsPage from './components/LeadsPage';
import CalendarPage from './components/CalendarPage';
import AttendancePage from './components/AttendancePage';
import ReportsPage from './components/ReportsPage';
import TasksPage from './components/TasksPage';
import LoginPage from './components/LoginPage';
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


const App: React.FC = () => {
  const [activeView, setActiveView] = useState('Dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
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
    setLeads(prevLeads => prevLeads.map(lead => 
      lead.id === updatedLead.id ? { ...updatedLead, isRead: true, lastActivityDate: new Date().toISOString() } : lead
    ));
  };

  const handleAddActivity = (lead: Lead, activityType: ActivityType, remarks: string) => {
    if (!currentUser) return;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      leadId: lead.id,
      salespersonId: currentUser.id,
      type: activityType,
      date: new Date().toISOString(),
      remarks: remarks,
      customerName: lead.customerName,
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

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('Dashboard');
  };

  const filteredLeadsForSearch = leads.filter(lead =>
    lead.interestedProject?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const visibleLeads = currentUser?.role === 'Admin' ? leads : leads.filter(l => l.assignedSalespersonId === currentUser?.id);
  const visibleActivities = currentUser?.role === 'Admin' ? activities : activities.filter(a => a.salespersonId === currentUser?.id);
  const visibleTasks = currentUser?.role === 'Admin' ? tasks : tasks.filter(t => t.assignedToId === currentUser?.id);

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full"><p className="animate-pulse">Loading CRM data...</p></div>;
    }
    switch (activeView) {
      case 'Dashboard':
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
               />;
      case 'Calendar':
        return <CalendarPage leads={visibleLeads} tasks={visibleTasks} />;
      case 'Attendance':
        return <AttendancePage />;
      case 'Reports':
        return <ReportsPage />;
      case 'Tasks':
        return <TasksPage 
                tasks={visibleTasks}
                users={users}
                currentUser={currentUser!}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                />;
      default:
        return <Dashboard leads={visibleLeads} users={users} activities={visibleActivities} salesTargets={salesTargets} currentUser={currentUser!} tasks={visibleTasks} />;
    }
  };
  
  if (!currentUser) {
    return <LoginPage users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-brand-light text-brand-dark font-sans">
      <Sidebar activeView={activeView} onNavigate={setActiveView} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
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
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-light p-4 md:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;