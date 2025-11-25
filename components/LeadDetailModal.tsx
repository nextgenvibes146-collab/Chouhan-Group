
import React, { useState, useMemo, useEffect } from 'react';
import { type Lead, type User, LeadStatus, ActivityType, type Activity, type Task } from '../types';
import { PhoneIcon, MailIcon, MapPinIcon, ChatBubbleIcon, ChatBubbleLeftRightIcon, CurrencyRupeeIcon, DocumentTextIcon, XMarkIcon } from './Icons';
import ActivityFeed from './ActivityFeed';
import { communicationService } from '../services/communicationService';

interface LeadDetailModalProps {
  lead: Lead;
  users: User[];
  onClose: () => void;
  onUpdateLead: (lead: Lead) => void;
  onAddActivity: (lead: Lead, activityType: ActivityType, remarks: string, duration?: number) => void;
  currentUser: User;
  activities: Activity[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

// --- Sub-Components ---

const TabButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-primary text-white' : 'text-muted-content hover:bg-gray-100'}`}
    >
        {label}
    </button>
);

const DetailItem: React.FC<{label: string, value?: string | null}> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="bg-white p-3 rounded-lg border border-border-color">
            <p className="text-xs text-muted-content font-semibold uppercase tracking-wider">{label}</p>
            <p className="font-medium text-base-content mt-1">{value}</p>
        </div>
    );
};

const CostEstimator: React.FC = () => {
    const [size, setSize] = useState(1000);
    const [rate, setRate] = useState(2500);
    const [plc, setPlc] = useState(0);
    const [amenities, setAmenities] = useState(200000);
    
    const basicCost = size * rate;
    const totalCost = basicCost + plc + amenities;
    const gst = totalCost * 0.05;
    const finalAmount = totalCost + gst;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-base-content mb-4">Cost Sheet Estimator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label-style">Area (Sq.ft)</label>
                    <input type="number" value={size} onChange={e => setSize(Number(e.target.value))} className="input-style" />
                </div>
                <div>
                    <label className="label-style">Base Rate (₹/Sq.ft)</label>
                    <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="input-style" />
                </div>
                <div>
                    <label className="label-style">PLC / Location Charges (₹)</label>
                    <input type="number" value={plc} onChange={e => setPlc(Number(e.target.value))} className="input-style" />
                </div>
                <div>
                    <label className="label-style">Amenities & Development (₹)</label>
                    <input type="number" value={amenities} onChange={e => setAmenities(Number(e.target.value))} className="input-style" />
                </div>
            </div>
            <div className="mt-6 bg-blue-50 p-4 rounded-xl space-y-2 border border-blue-100">
                <div className="flex justify-between text-sm">
                    <span>Basic Cost</span>
                    <span>₹ {basicCost.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span>Other Charges</span>
                    <span>₹ {(plc + amenities).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>GST (5%)</span>
                    <span>₹ {gst.toLocaleString()}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between font-bold text-lg text-blue-900">
                    <span>Grand Total</span>
                    <span>₹ {finalAmount.toLocaleString()}</span>
                </div>
            </div>
            <button className="button-primary mt-2">Download Quotation PDF</button>
        </div>
    );
}

// --- Modals for Communication ---

const EmailModal: React.FC<{ lead: Lead; onClose: () => void; onSend: (subject: string, body: string) => Promise<void> }> = ({ lead, onClose, onSend }) => {
    const [subject, setSubject] = useState(`Information regarding ${lead.interestedProject || 'your enquiry'}`);
    const [body, setBody] = useState(`Dear ${lead.customerName},\n\nThank you for your interest in our project. As discussed, please find the attached brochure and price list.\n\nBest regards,\nChouhan Housing`);
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        setSending(true);
        await onSend(subject, body);
        setSending(false);
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold">Compose Email</h3>
                <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="p-6 flex-1 space-y-4">
                <div>
                    <label className="label-style">To</label>
                    <input type="text" value={lead.email || 'No email provided'} disabled className="input-style bg-gray-100" />
                </div>
                <div>
                    <label className="label-style">Subject</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="input-style" />
                </div>
                <div className="flex-1">
                    <label className="label-style">Message</label>
                    <textarea value={body} onChange={e => setBody(e.target.value)} rows={10} className="input-style h-64" />
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                <button onClick={onClose} className="button-secondary !w-auto">Cancel</button>
                <button onClick={handleSend} disabled={sending || !lead.email} className="button-primary !w-auto min-w-[100px]">
                    {sending ? 'Sending...' : 'Send Email'}
                </button>
            </div>
        </div>
    );
};

const SMSModal: React.FC<{ lead: Lead; onClose: () => void; onSend: (message: string) => Promise<void> }> = ({ lead, onClose, onSend }) => {
    const [message, setMessage] = useState(`Hello ${lead.customerName}, this is regarding your enquiry for ${lead.interestedProject || 'property'}. When is a good time to talk?`);
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        setSending(true);
        await onSend(message);
        setSending(false);
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold">Send SMS</h3>
                <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="p-6 flex-1 space-y-4">
                <div>
                    <label className="label-style">To</label>
                    <input type="text" value={lead.mobile} disabled className="input-style bg-gray-100" />
                </div>
                <div>
                    <label className="label-style">Message</label>
                    <textarea 
                        value={message} 
                        onChange={e => setMessage(e.target.value)} 
                        rows={6} 
                        className="input-style" 
                        maxLength={160}
                    />
                    <p className="text-xs text-right text-gray-500 mt-1">{message.length}/160 characters</p>
                </div>
            </div>
             <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                <button onClick={onClose} className="button-secondary !w-auto">Cancel</button>
                <button onClick={handleSend} disabled={sending || !lead.mobile} className="button-primary !w-auto min-w-[100px]">
                    {sending ? 'Sending...' : 'Send SMS'}
                </button>
            </div>
        </div>
    );
};

// --- Main Modal Component ---

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, users, onClose, onUpdateLead, onAddActivity, currentUser, activities, onAddTask }) => {
  const [activeTab, setActiveTab] = useState('Details');

  const [newStatus, setNewStatus] = useState<LeadStatus>(lead.status);
  const [temperature, setTemperature] = useState<Lead['temperature']>(lead.temperature);
  const [nextFollowUp, setNextFollowUp] = useState(lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0] : '');
  const [createReminder, setCreateReminder] = useState(true);
  
  // Activity Logging State
  const [activityType, setActivityType] = useState<ActivityType>(ActivityType.Call);
  const [remarks, setRemarks] = useState('');
  const [duration, setDuration] = useState<string>('');

  // Communication Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  
  const salesperson = users.find(u => u.id === lead.assignedSalespersonId);
  
  // Auto-set next follow-up date for certain statuses if not set
  useEffect(() => {
    if (!nextFollowUp && (newStatus === LeadStatus.SiteVisitScheduled || newStatus === LeadStatus.SiteVisitDone || newStatus === LeadStatus.Negotiation)) {
         const tmrw = new Date();
         tmrw.setDate(tmrw.getDate() + 1);
         setNextFollowUp(tmrw.toISOString().split('T')[0]);
    }
  }, [newStatus]);

  const handleUpdate = () => {
    const updatedLead: Lead = { 
        ...lead, 
        status: newStatus, 
        nextFollowUpDate: nextFollowUp ? new Date(nextFollowUp).toISOString() : undefined,
        temperature: temperature,
    };
    
    // Auto-update visit date if status implies a visit
    if (newStatus === LeadStatus.SiteVisitScheduled && updatedLead.nextFollowUpDate) {
        updatedLead.visitDate = updatedLead.nextFollowUpDate;
    }

    onUpdateLead(updatedLead);

    // Create a task if reminder requested and date is present
    if (createReminder && nextFollowUp) {
        const isoDate = new Date(nextFollowUp).toISOString();
        const taskDate = new Date(nextFollowUp);
        taskDate.setHours(10, 0, 0, 0); // Default 10 AM

        onAddTask({
            title: `Follow up: ${lead.customerName} (${newStatus})`,
            assignedToId: lead.assignedSalespersonId || currentUser.id,
            dueDate: taskDate.toISOString(),
            isCompleted: false,
            createdBy: currentUser.name,
            reminderDate: taskDate.toISOString(),
            hasReminded: false
        });
    }

    onClose();
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

  // --- Communication Handlers ---

  const handleSendEmail = async (subject: string, body: string) => {
      try {
          await communicationService.sendEmail(lead.email || '', subject, body);
          onAddActivity(lead, ActivityType.Email, `[Email Sent] Subject: ${subject}`, undefined);
          alert("Email sent successfully!");
      } catch (error) {
          alert("Failed to send email. Please check internet connection.");
      }
  };

  const handleSendSMS = async (message: string) => {
      try {
          await communicationService.sendSMS(lead.mobile, message);
          onAddActivity(lead, ActivityType.WhatsApp, `[SMS Sent] ${message}`, undefined); // Mapping SMS to WA/Msg for now
          alert("SMS queued for delivery.");
      } catch (error) {
          alert("Failed to send SMS.");
      }
  };

  const handleInitiateCall = async () => {
      // 1. Log the attempt immediately
      onAddActivity(lead, ActivityType.Call, "Outgoing call initiated", undefined);
      
      // 2. Simulate API bridge
      try {
        await communicationService.initiateCall(lead.mobile, currentUser.name); // Using name as ID for demo
        
        // 3. Open system dialer as fallback/confirmation
        window.location.href = `tel:${lead.mobile}`;
      } catch (e) {
          console.error(e);
      }
  };

  const getTemperatureBadge = (temp?: 'Hot' | 'Warm' | 'Cold') => {
    if (!temp) return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Unqualified</span>;
    const colors = {
        'Hot': 'bg-red-100 text-red-800',
        'Warm': 'bg-orange-100 text-orange-800',
        'Cold': 'bg-blue-100 text-blue-800'
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[temp]}`}>{temp}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
        
        {/* Communication Modals Layer */}
        {showEmailModal && <EmailModal lead={lead} onClose={() => setShowEmailModal(false)} onSend={handleSendEmail} />}
        {showSMSModal && <SMSModal lead={lead} onClose={() => setShowSMSModal(false)} onSend={handleSendSMS} />}

        {/* Header */}
        <div className="px-6 py-4 border-b border-border-color bg-white flex justify-between items-start shrink-0">
          <div>
             <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{lead.customerName}</h2>
                {getTemperatureBadge(lead.temperature)}
             </div>
             <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center"><PhoneIcon className="w-4 h-4 mr-1"/> {lead.mobile}</span>
                <span className="flex items-center"><MapPinIcon className="w-4 h-4 mr-1"/> {lead.city || 'N/A'}</span>
                <span className="flex items-center"><DocumentTextIcon className="w-4 h-4 mr-1"/> {lead.interestedProject || 'No Project'}</span>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        
        {/* Tabs */}
        <div className="px-6 py-2 border-b border-border-color bg-gray-50 flex gap-2 shrink-0 overflow-x-auto">
            <TabButton label="Overview" isActive={activeTab === 'Details'} onClick={() => setActiveTab('Details')} />
            <TabButton label="Activity Log" isActive={activeTab === 'Activity'} onClick={() => setActiveTab('Activity')} />
            <TabButton label="Cost Estimator" isActive={activeTab === 'Cost'} onClick={() => setActiveTab('Cost')} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-base-200">
            {activeTab === 'Details' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Update Section */}
                        <div className="card p-5">
                            <h3 className="text-lg font-bold mb-4">Update Status</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="label-style">Stage</label>
                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as LeadStatus)} className="input-style">
                                        {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-style">Interest Level</label>
                                    <select value={temperature || ''} onChange={(e) => setTemperature(e.target.value as Lead['temperature'])} className="input-style">
                                        <option value="">Select</option>
                                        <option value="Hot">Hot</option>
                                        <option value="Warm">Warm</option>
                                        <option value="Cold">Cold</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-style">Next Action Date</label>
                                    <input type="date" value={nextFollowUp} onChange={e => setNextFollowUp(e.target.value)} className="input-style" />
                                </div>
                            </div>
                            
                            {/* Reminder Option */}
                            {nextFollowUp && (
                                <div className="mt-4 flex items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <input 
                                        type="checkbox" 
                                        id="createReminder" 
                                        checked={createReminder} 
                                        onChange={e => setCreateReminder(e.target.checked)} 
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="createReminder" className="ml-2 block text-sm font-medium text-gray-900">
                                        Create an automated reminder task for this follow-up
                                    </label>
                                </div>
                            )}

                            <div className="mt-4 flex justify-end">
                                <button onClick={handleUpdate} className="button-primary !w-auto">Update Lead</button>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="card p-5">
                            <h3 className="text-lg font-bold mb-4">Lead Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <DetailItem label="Assigned Agent" value={salesperson?.name} />
                                <DetailItem label="Source" value={lead.modeOfEnquiry} />
                                <DetailItem label="Budget" value={lead.budget} />
                                <DetailItem label="Purpose" value={lead.purpose} />
                                <DetailItem label="Property Type" value={lead.interestedUnit} />
                                <DetailItem label="Created On" value={new Date(lead.leadDate).toLocaleDateString()} />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-4">
                        <div className="card p-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Communication</h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={handleInitiateCall} 
                                    className="flex items-center justify-center w-full p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors border border-green-200"
                                >
                                    <PhoneIcon className="w-5 h-5 mr-3" /> Call Customer
                                </button>
                                
                                <button 
                                    onClick={() => setShowSMSModal(true)} 
                                    className="flex items-center justify-center w-full p-3 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-medium transition-colors border border-teal-200"
                                >
                                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3" /> Send SMS / WhatsApp
                                </button>
                                
                                {lead.email ? (
                                    <button 
                                        onClick={() => setShowEmailModal(true)} 
                                        className="flex items-center justify-center w-full p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors border border-blue-200"
                                    >
                                        <MailIcon className="w-5 h-5 mr-3" /> Send Email
                                    </button>
                                ) : (
                                    <button disabled className="flex items-center justify-center w-full p-3 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed">
                                         <MailIcon className="w-5 h-5 mr-3" /> No Email Available
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>
            )}

            {activeTab === 'Activity' && (
                <div className="flex flex-col gap-6 h-full">
                    <div className="card p-5 shrink-0">
                        <h3 className="text-lg font-bold mb-4">Add Note / Activity</h3>
                        <form onSubmit={handleAddActivity} className="space-y-3">
                            <div className="flex gap-4">
                                <select value={activityType} onChange={e => setActivityType(e.target.value as ActivityType)} className="input-style w-40">
                                    {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Enter remarks..." className="input-style flex-1" />
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="button-success !w-auto">Log Activity</button>
                            </div>
                        </form>
                    </div>
                    <div className="card p-5 flex-1 overflow-y-auto">
                        <ActivityFeed activities={activities} users={users} title="History" />
                    </div>
                </div>
            )}

            {activeTab === 'Cost' && (
                <div className="card p-6 max-w-2xl mx-auto">
                    <CostEstimator />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
