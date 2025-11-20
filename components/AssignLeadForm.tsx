
import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { ModeOfEnquiry } from '../types';
import type { NewLeadData } from '../App';

interface AssignLeadFormProps {
  users: User[];
  currentUser: User;
  onAssignLead: (newLeadData: NewLeadData) => void;
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
};

const AssignLeadForm: React.FC<AssignLeadFormProps> = ({ users, currentUser, onAssignLead }) => {
  const isAdmin = currentUser.role === 'Admin';
  const salesAgents = users.filter(u => u.role === 'Salesperson');
  const adminUser = users.find(u => u.role === 'Admin');
  const defaultAdminId = adminUser?.id || 'admin-0';

  const [formData, setFormData] = useState<NewLeadData>({
      ...initialFormState,
      // If admin, default to first salesperson, else default to Admin ID
      assignedSalespersonId: isAdmin ? (salesAgents[0]?.id || '') : defaultAdminId
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Update assignedSalespersonId if the user role dictates it (safety check)
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
    
    const message = isAdmin 
        ? `Lead assigned successfully!`
        : `Lead sent to Admin for approval/assignment.`;
        
    setSuccess(message);
    
    // Reset form
    setFormData({
      ...initialFormState,
      assignedSalespersonId: isAdmin ? (salesAgents[0]?.id || '') : defaultAdminId
    });

    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-text-primary">Add New Lead</h3>
        <p className="text-sm text-text-secondary mt-1">
            {isAdmin 
                ? "Create a new lead and assign it to a sales agent." 
                : "Enter lead details below. New leads will be sent to the Admin for assignment."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Column 1 */}
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-text-primary mb-2">Customer Details</h4>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="customerName" className="label-style">Customer Name*</label>
                            <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} className="input-style" placeholder="e.g., John Doe" />
                        </div>
                        <div>
                            <label htmlFor="mobile" className="label-style">Mobile Number*</label>
                            <input type="text" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className="input-style" placeholder="e.g., 9876543210" />
                        </div>
                        <div>
                            <label htmlFor="email" className="label-style">Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="input-style" placeholder="e.g., john.doe@example.com" />
                        </div>
                        <div>
                            <label htmlFor="city" className="label-style">City</label>
                            <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="input-style" placeholder="e.g., Raipur" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-text-primary mb-2">Lead Information</h4>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="platform" className="label-style">Source / Platform</label>
                            <select id="platform" name="platform" value={formData.platform} onChange={handleChange} className="input-style">
                                <option value="" disabled>Select a source...</option>
                                {Object.values(ModeOfEnquiry).map(mode => (
                                    <option key={mode} value={mode}>{mode}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="interestedProject" className="label-style">Interested Project</label>
                            <input type="text" id="interestedProject" name="interestedProject" value={formData.interestedProject} onChange={handleChange} className="input-style" placeholder="e.g., Singapour P4" />
                        </div>
                        <div>
                            <label htmlFor="interestedUnit" className="label-style">Property Type</label>
                            <input type="text" id="interestedUnit" name="interestedUnit" value={formData.interestedUnit} onChange={handleChange} className="input-style" placeholder="e.g., Plot, Rowhouse" />
                        </div>
                        <div>
                            <label htmlFor="investmentTimeline" className="label-style">Investment Timeline</label>
                            <input type="text" id="investmentTimeline" name="investmentTimeline" value={formData.investmentTimeline} onChange={handleChange} className="input-style" placeholder="e.g., Within 3 months" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width Section */}
            <div className="md:col-span-2">
                <h4 className="font-semibold text-text-primary mb-2">Assignment & Remarks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                     <div className="md:col-span-2">
                        <label htmlFor="remarks" className="label-style">Remark</label>
                        <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} rows={2} className="input-style" placeholder="Initial conversation details..."></textarea>
                    </div>
                    
                    {isAdmin ? (
                        <div>
                            <label htmlFor="assignedSalespersonId" className="label-style">Assign To*</label>
                            <select id="assignedSalespersonId" name="assignedSalespersonId" value={formData.assignedSalespersonId} onChange={handleChange} className="input-style">
                                <option value="" disabled>Select a salesperson</option>
                                {salesAgents.map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1 md:flex md:justify-between">
                                <p className="text-sm text-blue-700">
                                    This lead will be automatically assigned to <strong>Admin</strong> for review.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {error && 
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        }
        {success && 
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3" role="alert">
            <p className="font-bold">Success</p>
            <p>{success}</p>
          </div>
        }
        
        <div className="pt-2 flex justify-end">
          <button type="submit" className="flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            {isAdmin ? 'Assign Lead' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignLeadForm;
