/**
 * Website Integration Code for chouhan-park-view-xi.vercel.app
 * 
 * Add this JavaScript code to your website to automatically send leads to the CRM.
 * 
 * INSTRUCTIONS:
 * 1. Replace 'YOUR_CRM_WEBHOOK_URL' with your actual webhook URL
 * 2. Add this code to your website's contact/enquiry form submission handler
 * 3. Customize the form field mappings to match your form structure
 */

// Configuration
const CRM_WEBHOOK_URL = 'YOUR_CRM_WEBHOOK_URL'; // Replace with your webhook URL
const WEBSITE_SOURCE = 'chouhan-park-view-xi.vercel.app';

/**
 * Send lead to CRM
 */
async function sendLeadToCRM(formData) {
  // Extract data from form
  const leadData = {
    customerName: formData.name || formData.customerName || formData.fullName || '',
    mobile: formData.mobile || formData.phone || formData.phoneNumber || '',
    email: formData.email || formData.emailAddress || '',
    city: formData.city || formData.location || '',
    interestedProject: formData.project || formData.interestedProject || formData.propertyName || '',
    interestedUnit: formData.unit || formData.propertyType || formData.unitType || '',
    propertyType: formData.propertyType || formData.unitType || '',
    investmentTimeline: formData.timeline || formData.investmentTimeline || formData.whenToInvest || '',
    remarks: formData.message || formData.remarks || formData.comments || formData.query || '',
    message: formData.message || formData.query || '',
    sourceUrl: WEBSITE_SOURCE,
    pageUrl: window.location.href,
    formId: 'contact-form', // Change if you have multiple forms
    timestamp: new Date().toISOString(),
  };

  // Validate required fields
  if (!leadData.customerName || !leadData.mobile) {
    console.error('CRM: Missing required fields (name and mobile)');
    return { success: false, error: 'Name and mobile number are required' };
  }

  try {
    const response = await fetch(CRM_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication if needed
        // 'Authorization': 'Bearer YOUR_SECRET_TOKEN',
      },
      body: JSON.stringify(leadData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('CRM: Lead sent successfully', result);
      return { success: true, data: result };
    } else {
      const error = await response.text();
      console.error('CRM: Failed to send lead', error);
      return { success: false, error: error };
    }
  } catch (error) {
    console.error('CRM: Error sending lead', error);
    return { success: false, error: error.message };
  }
}

/**
 * Example: Integration with a form submission
 * 
 * Method 1: Add to existing form submit handler
 */
function handleFormSubmit(event) {
  event.preventDefault(); // Prevent default form submission
  
  // Get form data
  const form = event.target;
  const formData = {
    name: form.querySelector('[name="name"]')?.value || '',
    mobile: form.querySelector('[name="mobile"]')?.value || '',
    email: form.querySelector('[name="email"]')?.value || '',
    city: form.querySelector('[name="city"]')?.value || '',
    project: form.querySelector('[name="project"]')?.value || '',
    propertyType: form.querySelector('[name="propertyType"]')?.value || '',
    message: form.querySelector('[name="message"]')?.value || '',
  };

  // Send to CRM (non-blocking)
  sendLeadToCRM(formData).then(result => {
    if (result.success) {
      // Show success message
      alert('Thank you! We will contact you soon.');
      form.reset();
    } else {
      // Still submit form even if CRM fails
      console.warn('CRM submission failed, but form will still be processed');
    }
  });

  // Continue with your existing form submission logic
  // ... your existing code ...
}

/**
 * Method 2: Using FormData API
 */
function handleFormSubmitWithFormData(event) {
  event.preventDefault();
  
  const form = event.target;
  const formDataObj = new FormData(form);
  
  // Convert FormData to object
  const data = {};
  formDataObj.forEach((value, key) => {
    data[key] = value;
  });

  // Send to CRM
  sendLeadToCRM(data);
  
  // Your existing form handling...
}

/**
 * Method 3: React/Next.js Example
 */
/*
import { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    city: '',
    project: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send to CRM
    const result = await sendLeadToCRM(formData);
    
    if (result.success) {
      alert('Thank you! We will contact you soon.');
      setFormData({ name: '', mobile: '', email: '', city: '', project: '', message: '' });
    }
    
    // Your existing form submission logic...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="name" 
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required 
      />
      <input 
        name="mobile" 
        value={formData.mobile}
        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
        required 
      />
      <input 
        name="email" 
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
*/

/**
 * Method 4: Vanilla JavaScript - Auto-attach to form
 */
document.addEventListener('DOMContentLoaded', function() {
  // Find all forms on the page
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      // Extract form data
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Send to CRM (don't block form submission)
      sendLeadToCRM(data).catch(error => {
        console.error('CRM submission error:', error);
      });
    });
  });
});

/**
 * Export for use in modules
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sendLeadToCRM };
}


