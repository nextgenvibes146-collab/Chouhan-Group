
import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { ModeOfEnquiry } from '../types';
import type { NewLeadData } from '../App';
import { UserCircleIcon, BuildingOfficeIcon, CurrencyRupeeIcon } from './Icons';

interface AssignLeadFormProps {
  users: User[];
  currentUser: User;
  onAssignLead: (newLeadData: NewLeadData) => void;
  onCancel?: () => void;
}

const initialFormState: NewLeadData = {
    customerName: '',
    mobile: '',
    email: '',
    city: '',
    platform: '',
    interestedProject: '',
    interestedUnit: '',
    investmentTimeline: '',
    remarks: '',
    assignedSalespersonId: '',
    budget: '',
    purpose: undefined,
};

const AssignLeadForm: React.FC<AssignLeadFormProps> = ({ users, currentUser, onAssignLead, onCancel }) => {
  const isAdmin = currentUser.role === 'Admin';
  const salesAgents = users.filter(u => u.role === 'Salesperson');
  const adminUser = users.find(u => u.role === 'Admin');
  const defaultAdminId = adminUser?.id || 'admin-0';

  const [formData, setFormData] = useState<NewLeadData>({
      ...initialFormState,
      assignedSalespersonId: isAdmin ? (salesAgents[0]?.id || '') : defaultAdminId
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (!isAdmin) {
        setFormData(prev => ({ ...prev, assignedSalespersonId: defaultAdminId }));
    }
  }, [isAdmin, defaultAdminId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobile) {
      setError('Customer Name and Mobile are required.');
      setSuccess('');
      return;
    }
    if (isAdmin && !formData.assignedSalespersonId) {
        setError('Please select a salesperson to assign.');
        return;
    }

    setError('');
    onAssignLead(formData);
    setSuccess(isAdmin ? `Lead assigned successfully!` : `Lead sent to Admin for approval.`);
    
    setFormData({
      ...initialFormState,
      assignedSalespersonId: isAdmin ? (salesAgents[0]?.id || '') : defaultAdminId
    });

    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-border-color bg-gray-50 flex justify-between items-center">
        <div>
            <h3 className="text-lg font-bold text-gray-900">Add New Lead</h3>
            <p className="text-sm text-gray-500">Capture prospect details and requirements.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        
        {/* Section 1: Customer Profile */}
        <div>
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center">
                <UserCircleIcon className="w-5 h-5 mr-2" />
                Customer Profile
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="customerName" className="label-style">Customer Name <span className="text-red-500">*</span></label>
                    <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} className="input-style" placeholder="e.g., John Doe" />
                </div>
                <div>
                    <label htmlFor="mobile" className="label-style">Mobile Number <span className="text-red-500">*</span></label>
                    <input type="tel" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className="input-style" placeholder="e.g., 9876543210" />
                </div>
                <div>
                    <label htmlFor="email" className="label-style">Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="input-style" placeholder="e.g., john@example.com" />
                </div>
                <div>
                    <label htmlFor="city" className="label-style">Current City</label>
                    <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="input-style" placeholder="e.g., Raipur" />
                </div>
            </div>
        </div>

        <hr className="border-border-color" />

        {/* Section 2: Requirements */}
        <div>
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                Requirements & Preferences
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="interestedProject" className="label-style">Project Interest</label>
                    <input type="text" id="interestedProject" name="interestedProject" value={formData.interestedProject} onChange={handleChange} className="input-style" placeholder="e.g., Sunrise City" />
                </div>
                <div>
                    <label htmlFor="interestedUnit" className="label-style">Property Type</label>
                    <select id="interestedUnit" name="interestedUnit" value={formData.interestedUnit} onChange={handleChange} className="input-style">
                        <option value="">Select Type</option>
                        <option value="Plot">Plot</option>
                        <option value="Flat">Flat</option>
                        <option value="Pent House">Pent House</option>
                        <option value="Villa">Villa</option>
                        <option value="Bungalow">Bungalow</option>
                        <option value="Row House">Row House</option>
                        <option value="Commercial">Commercial</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="budget" className="label-style">Budget Range</label>
                    <input type="text" id="budget" name="budget" value={formData.budget} onChange={handleChange} className="input-style" placeholder="e.g., 20L - 30L" />
                </div>
                <div>
                    <label htmlFor="purpose" className="label-style">Purpose of Purchase</label>
                    <select id="purpose" name="purpose" value={formData.purpose} onChange={handleChange} className="input-style">
                        <option value="">Select Purpose</option>
                        <option value="Self Use">Self Use</option>
                        <option value="Investment">Investment</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="investmentTimeline" className="label-style">Timeline</label>
                    <select id="investmentTimeline" name="investmentTimeline" value={formData.investmentTimeline} onChange={handleChange} className="input-style">
                        <option value="">Select Timeline</option>
                        <option value="Immediate">Immediate</option>
                        <option value="Within 1 Month">Within 1 Month</option>
                        <option value="Within 3 Months">Within 3 Months</option>
                        <option value="After 6 Months">After 6 Months</option>
                    </select>
                </div>
            </div>
        </div>

        <hr className="border-border-color" />

        {/* Section 3: Source & Assignment */}
        <div>
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center">
                <CurrencyRupeeIcon className="w-5 h-5 mr-2" />
                Source & Assignment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="platform" className="label-style">Lead Source</label>
                    <select id="platform" name="platform" value={formData.platform} onChange={handleChange} className="input-style">
                        <option value="">Select Source</option>
                        {Object.values(ModeOfEnquiry).map(mode => (
                            <option key={mode} value={mode}>{mode}</option>
                        ))}
                    </select>
                </div>
                {isAdmin ? (
                    <div>
                        <label htmlFor="assignedSalespersonId" className="label-style">Assign Sales Agent <span className="text-red-500">*</span></label>
                        <select id="assignedSalespersonId" name="assignedSalespersonId" value={formData.assignedSalespersonId} onChange={handleChange} className="input-style">
                            {salesAgents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="md:col-span-1">
                         <label className="label-style">Assignment</label>
                         <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-sm border border-blue-100">
                            Lead will be submitted to Admin for approval.
                         </div>
                    </div>
                )}
                 <div className="md:col-span-2">
                    <label htmlFor="remarks" className="label-style">Initial Remarks</label>
                    <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} rows={2} className="input-style" placeholder="Any specific requirements or conversation notes..."></textarea>
                </div>
            </div>
        </div>

        {error && <p className="text-red-600 font-medium text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        {success && <p className="text-green-600 font-medium text-sm bg-green-50 p-3 rounded-lg">{success}</p>}
        
        <div className="pt-4 flex justify-end gap-3">
          {onCancel && (
            <button type="button" onClick={onCancel} className="button-secondary w-full md:w-auto md:px-8">
                Cancel
            </button>
          )}
          <button type="submit" className="button-primary w-full md:w-auto md:px-8">
            {isAdmin ? 'Create & Assign Lead' : 'Submit Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignLeadForm;
