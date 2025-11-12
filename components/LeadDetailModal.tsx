


import React, { useState, useMemo } from 'react';
import { type Lead, type User, LeadStatus, ActivityType, type Activity } from '../types';
import { PhoneIcon, MailIcon, MapPinIcon, ChatBubbleIcon } from './Icons';
import ActivityFeed from './ActivityFeed';

interface LeadDetailModalProps {
  lead: Lead;
  users: User[];
  onClose: () => void;
  onUpdateLead: (lead: Lead) => void;
  onAddActivity: (lead: Lead, activityType: ActivityType, remarks: string, duration?: number) => void;
  currentUser: User;
  activities: Activity[];
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, users, onClose, onUpdateLead, onAddActivity, currentUser, activities }) => {
  const [newStatus, setNewStatus] = useState<LeadStatus>(lead.status);
  const [temperature, setTemperature] = useState<Lead['temperature']>(lead.temperature);
  const [nextFollowUp, setNextFollowUp] = useState(lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0] : '');
  const [activityType, setActivityType] = useState<ActivityType>(ActivityType.Call);
  const [remarks, setRemarks] = useState('');
  const [duration, setDuration] = useState<string>('');
  const [transferToId, setTransferToId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  
  const salesperson = users.find(u => u.id === lead.assignedSalespersonId);
  const isManagerOrAdmin = currentUser.role === 'Admin' || currentUser.role === 'Sales Manager';
  const isAdmin = currentUser.role === 'Admin';

  const assignableUsers = useMemo(() => {
    if (currentUser.role === 'Admin') {
      return users.filter(u => u.role !== 'Admin' && u.id !== lead.assignedSalespersonId);
    }
    if (currentUser.role === 'Sales Manager') {
      // Manager can assign to themselves or their reports, excluding the current assignee
      return users.filter(u => 
        (u.id === currentUser.id || u.reportsTo === currentUser.id) && u.id !== lead.assignedSalespersonId
      );
    }
    return [];
  }, [currentUser, users, lead.assignedSalespersonId]);


  const handleUpdate = () => {
    const updatedLead: Lead = { 
        ...lead, 
        status: newStatus, 
        nextFollowUpDate: nextFollowUp ? new Date(nextFollowUp).toISOString() : undefined,
        temperature: temperature,
    };
     // If we are scheduling a visit, also update the visitDate field for clarity
    if (newStatus === LeadStatus.VisitScheduled && updatedLead.nextFollowUpDate) {
        updatedLead.visitDate = updatedLead.nextFollowUpDate;
    }

    onUpdateLead(updatedLead);
  };
  
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (remarks.trim()) {
      const callDuration = activityType === ActivityType.Call && duration ? parseInt(duration, 10) : undefined;
      onAddActivity(lead, activityType, remarks, callDuration);
      setRemarks('');
      setDuration('');
    }
  };
  
  const handleTransfer = () => {
      if (transferToId) {
          onUpdateLead({ ...lead, assignedSalespersonId: transferToId });
          setTransferToId('');
      }
  };

  const handleMarkVisitDone = () => {
    onUpdateLead({ ...lead, status: LeadStatus.VisitDone });
    onAddActivity(lead, ActivityType.Visit, 'Visit marked as completed.');
  };

  const handleRescheduleVisit = () => {
    if (!rescheduleDate) return;
    const updatedLead = { 
      ...lead, 
      nextFollowUpDate: new Date(rescheduleDate).toISOString(),
      visitDate: new Date(rescheduleDate).toISOString(),
      status: LeadStatus.VisitScheduled,
      missedVisitsCount: (lead.missedVisitsCount || 0) + 1,
    };
    onUpdateLead(updatedLead);
    onAddActivity(
      lead, 
      ActivityType.Note, 
      `Visit rescheduled to ${new Date(rescheduleDate).toLocaleDateString()}. This is the ${updatedLead.missedVisitsCount} missed visit.`
    );
    setRescheduleDate('');
  };

  const getTemperatureBadge = (temp?: 'Hot' | 'Warm' | 'Cold') => {
    if (!temp) return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-800">Not Set</span>;
    const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full";
    switch (temp) {
        case 'Hot': return <span className={`${baseClasses} bg-red-100 text-red-800`}>Hot 🔥</span>;
        case 'Warm': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Warm 🟠</span>;
        case 'Cold': return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Cold 🔵</span>;
        default: return null;
    }
  };

  const isVisitScheduled = lead.status === LeadStatus.VisitScheduled;
  const visitDateString = lead.nextFollowUpDate || lead.visitDate;
  const isVisitMissed = isVisitScheduled && visitDateString && new Date(new Date(visitDateString).toDateString()) < new Date(new Date().toDateString());


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 md:p-6 border-b flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-bold text-brand-dark">{lead.customerName}</h2>
                    {getTemperatureBadge(lead.temperature)}
                </div>
              <p className="text-sm text-brand-gray">Project: {lead.interestedProject || 'N/A'}</p>
            </div>
            <button onClick={onClose} className="text-2xl text-brand-gray hover:text-brand-dark">&times;</button>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-brand-gray">
            <span className="flex items-center"><PhoneIcon className="w-4 h-4 mr-1.5" /> {lead.mobile}</span>
            {lead.email && <span className="flex items-center"><MailIcon className="w-4 h-4 mr-1.5" /> {lead.email}</span>}
            {lead.city && <span className="flex items-center"><MapPinIcon className="w-4 h-4 mr-1.5" /> {lead.city}</span>}
          </div>
           <div className="flex items-center space-x-2 mt-3">
                <a href={`tel:${lead.mobile}`} className="action-button bg-green-100 text-green-700 hover:bg-green-200"><PhoneIcon className="w-5 h-5"/></a>
                <a href={`https://wa.me/${lead.mobile.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="action-button bg-teal-100 text-teal-700 hover:bg-teal-200"><ChatBubbleIcon className="w-5 h-5"/></a>
                {lead.email && <a href={`mailto:${lead.email}`} className="action-button bg-blue-100 text-blue-700 hover:bg-blue-200"><MailIcon className="w-5 h-5"/></a>}
           </div>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
          {/* Left Column: Actions */}
          <div className="space-y-6">
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-brand-dark">Update Lead</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label-style">Status</label>
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as LeadStatus)} className="input-style">
                            {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label-style">Temperature</label>
                        <select value={temperature || ''} onChange={(e) => setTemperature(e.target.value as Lead['temperature'])} className="input-style">
                            <option value="">Not Set</option>
                            <option value="Hot">Hot</option>
                            <option value="Warm">Warm</option>
                            <option value="Cold">Cold</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="label-style">Next Follow-up / Visit Date</label>
                    <input type="date" value={nextFollowUp} onChange={e => setNextFollowUp(e.target.value)} className="input-style" />
                </div>
                <button onClick={handleUpdate} className="w-full button-primary">Save Changes</button>
            </div>
            
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-brand-dark">Log Follow-up</h3>
                <form onSubmit={handleAddActivity} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select value={activityType} onChange={e => setActivityType(e.target.value as ActivityType)} className="input-style">
                            {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {activityType === ActivityType.Call && (
                            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration (min)" className="input-style"/>
                        )}
                    </div>
                    <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add remarks..." rows={2} className="input-style" />
                    <button type="submit" className="w-full button-success">Add Activity</button>
                </form>
            </div>
            
            {isAdmin && isVisitScheduled && (
              <div className="space-y-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800">Visit Management</h3>
                
                {isVisitMissed && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
                    <p className="font-bold">This visit was missed.</p>
                  </div>
                )}
                
                <p className="text-sm text-brand-gray">
                  Scheduled Visit Date: <span className="font-semibold text-brand-dark">{visitDateString ? new Date(visitDateString).toLocaleDateString() : 'Not Set'}</span>
                </p>
                <p className="text-sm text-brand-gray">
                  Total Missed Visits: <span className="font-semibold text-brand-dark">{lead.missedVisitsCount || 0}</span>
                </p>

                <button onClick={handleMarkVisitDone} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Mark as Visit Done
                </button>

                <div className="space-y-2 pt-2">
                  <label className="label-style">Reschedule to a new date:</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="date" 
                      value={rescheduleDate} 
                      onChange={e => setRescheduleDate(e.target.value)} 
                      className="input-style mt-0"
                    />
                    <button 
                      onClick={handleRescheduleVisit} 
                      disabled={!rescheduleDate} 
                      className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {isManagerOrAdmin && (
                 <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-brand-dark">Transfer Lead</h3>
                    <div className="flex items-center space-x-2">
                        <select value={transferToId} onChange={e => setTransferToId(e.target.value)} className="input-style">
                            <option value="">Select salesperson...</option>
                            {assignableUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                         <button onClick={handleTransfer} disabled={!transferToId} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md shadow-sm hover:bg-orange-600 disabled:bg-gray-400">
                            Transfer
                        </button>
                    </div>
                 </div>
            )}
          </div>

          {/* Right Column: Info & History */}
          <div className="space-y-4">
            <div className="text-xs text-brand-gray bg-gray-50 p-4 rounded-lg">
                <p>Assigned to: <span className="font-medium text-brand-dark">{salesperson?.name || 'N/A'}</span></p>
                <p>Lead Date: <span className="font-medium text-brand-dark">{new Date(lead.leadDate).toLocaleDateString()}</span></p>
                <p>Last Activity: <span className="font-medium text-brand-dark">{new Date(lead.lastActivityDate).toLocaleString()}</span></p>
                <p>Enquiry Mode: <span className="font-medium text-brand-dark">{lead.modeOfEnquiry}</span></p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <ActivityFeed activities={activities} users={users} title="Lead History" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeadDetailModal;