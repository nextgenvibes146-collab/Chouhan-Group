import React, { useState } from 'react';
import type { User } from '../types';
import type { NewLeadData } from '../App';

interface AssignLeadFormProps {
  salesAgents: User[];
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

const AssignLeadForm: React.FC<AssignLeadFormProps> = ({ salesAgents, onAssignLead }) => {
  const [formData, setFormData] = useState<NewLeadData>({
      ...initialFormState,
      assignedSalespersonId: salesAgents[0]?.id || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobile || !formData.assignedSalespersonId) {
      setError('Customer Name, Mobile, and Assign To are required.');
      setSuccess('');
      return;
    }
    setError('');
    onAssignLead(formData);
    setSuccess(`Lead for ${formData.customerName} assigned successfully!`);
    
    // Reset form
    setFormData({
      ...initialFormState,
      assignedSalespersonId: salesAgents[0]?.id || ''
    });

    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-brand-border">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-brand-dark">Create & Assign a New Lead</h3>
        <p className="text-sm text-brand-gray mt-1">Quickly add and assign a new lead to your sales team.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Customer Details */}
        <div>
          <h4 className="text-md font-semibold text-brand-dark border-b border-brand-border pb-2 mb-4">Customer Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="label-style">Customer Name*</label>
                <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} className="dark-input-style" placeholder="e.g., John Doe" />
              </div>
              <div>
                <label htmlFor="mobile" className="label-style">Mobile Number*</label>
                <input type="text" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className="dark-input-style" placeholder="e.g., 9876543210" />
              </div>
              <div>
                <label htmlFor="email" className="label-style">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="dark-input-style" placeholder="e.g., john.doe@example.com" />
              </div>
              <div>
                <label htmlFor="city" className="label-style">City</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="dark-input-style" placeholder="e.g., Raipur" />
              </div>
          </div>
        </div>
        
        {/* Section 2: Lead Information */}
        <div>
          <h4 className="text-md font-semibold text-brand-dark border-b border-brand-border pb-2 mb-4">Lead Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="platform" className="label-style">Source / Platform</label>
              <input type="text" id="platform" name="platform" value={formData.platform} onChange={handleChange} className="dark-input-style" placeholder="e.g., Facebook, Reference" />
            </div>
            <div>
              <label htmlFor="interestedProject" className="label-style">Interested Project</label>
              <input type="text" id="interestedProject" name="interestedProject" value={formData.interestedProject} onChange={handleChange} className="dark-input-style" placeholder="e.g., Singapour P4" />
            </div>
             <div>
              <label htmlFor="interestedUnit" className="label-style">Property Type</label>
              <input type="text" id="interestedUnit" name="interestedUnit" value={formData.interestedUnit} onChange={handleChange} className="dark-input-style" placeholder="e.g., Plot, Rowhouse" />
            </div>
            <div>
              <label htmlFor="investmentTimeline" className="label-style">Investment Timeline</label>
              <input type="text" id="investmentTimeline" name="investmentTimeline" value={formData.investmentTimeline} onChange={handleChange} className="dark-input-style" placeholder="e.g., Within 3 months" />
            </div>
          </div>
        </div>

        {/* Section 3: Assignment & Remarks */}
        <div>
          <h4 className="text-md font-semibold text-brand-dark border-b border-brand-border pb-2 mb-4">Assignment</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="remarks" className="label-style">Remark</label>
              <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} rows={2} className="dark-input-style" placeholder="Initial conversation details..."></textarea>
            </div>
            <div>
              <label htmlFor="assignedSalespersonId" className="label-style">Assign To*</label>
              <select id="assignedSalespersonId" name="assignedSalespersonId" value={formData.assignedSalespersonId} onChange={handleChange} className="dark-input-style">
                <option value="" disabled>Select a salesperson</option>
                {salesAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
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
        
        <div className="pt-2">
          <button type="submit" className="button-primary">
            Assign Lead
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignLeadForm;