

import React, { useState, useMemo } from 'react';
import { Lead, LeadStage, Campaign, CampaignGroup } from '../types';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Omit<Lead, 'id'>) => void;
  campaigns: Campaign[];
  campaignGroups: CampaignGroup[];
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onAddLead, campaigns, campaignGroups }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    campaignGroupId: '',
    campaignId: '',
    stage: LeadStage.Lead,
    dealValue: '',
    dateAdded: new Date().toISOString().split('T')[0],
  });

  const [channel, setChannel] = useState('');

  const availableCampaigns = useMemo(() => {
    if (!formData.campaignGroupId) return [];
    // FIX: Compare campaignGroupId as strings, removing parseInt.
    return campaigns.filter(c => c.campaignGroupId === formData.campaignGroupId);
  }, [formData.campaignGroupId, campaigns]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'campaignGroupId') {
        // FIX: Compare campaign group id as strings, removing parseInt.
        const selectedGroup = campaignGroups.find(g => g.id === value);
        setChannel(selectedGroup ? selectedGroup.channel : '');
        setFormData(prev => ({ ...prev, campaignGroupId: value, campaignId: '' }));
    } else if (name === 'stage') {
        const newStage = value as LeadStage;
        const dealValueShouldBeCleared = newStage !== LeadStage.Opportunity && newStage !== LeadStage.Conversion;
        setFormData(prev => ({ 
            ...prev, 
            stage: newStage,
            dealValue: dealValueShouldBeCleared ? '' : prev.dealValue 
        }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedGroup = campaignGroups.find(g => g.id === formData.campaignGroupId);
    const selectedCampaign = campaigns.find(c => c.id === formData.campaignId);

    if (!selectedGroup || !selectedCampaign) return;

    const newLead: Omit<Lead, 'id'> = {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      channel: selectedGroup.channel,
      campaignGroup: selectedGroup.name,
      campaign: selectedCampaign.name,
      dateAdded: formData.dateAdded,
      stage: formData.stage,
      stageDates: {
        [formData.stage]: formData.dateAdded,
      },
    };
    
    if (formData.dealValue) {
        newLead.dealValue = parseFloat(formData.dealValue);
    }

    onAddLead(newLead);

    onClose();
    // Reset form
    setFormData({ name: '', email: '', company: '', campaignGroupId: '', campaignId: '', stage: LeadStage.Lead, dealValue: '', dateAdded: new Date().toISOString().split('T')[0] });
    setChannel('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start sm:items-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[95vh] mt-8 sm:mt-0">
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Add New Lead</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
            {/* Contact Info */}
            <div className="sm:col-span-2">
              <label className="block text-base font-medium text-gray-300">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-base font-medium text-gray-300">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-base font-medium text-gray-300">Company</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
            </div>
            
            {/* Source Info */}
            <div>
              <label className="block text-base font-medium text-gray-300">Campaign Group</label>
              <select name="campaignGroupId" value={formData.campaignGroupId} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required>
                 <option value="">Select a Group</option>
                 {campaignGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-300">Channel</label>
              <input type="text" name="channel" value={channel} readOnly className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none bg-black text-gray-400" />
            </div>
             <div className="sm:col-span-2">
              <label className="block text-base font-medium text-gray-300">Campaign</label>
              <select name="campaignId" value={formData.campaignId} onChange={handleChange} disabled={!formData.campaignGroupId} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8] disabled:bg-gray-700 disabled:text-gray-400" required>
                 <option value="">Select a Campaign</option>
                 {availableCampaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Stage Info */}
            <div className="sm:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-300">Date Added</label>
                  <input type="date" name="dateAdded" value={formData.dateAdded} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-300">Stage</label>
                  <select name="stage" value={formData.stage} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required>
                     {Object.values(LeadStage).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-base font-medium text-gray-300">Deal Amount</label>
              <input 
                  type="number" 
                  name="dealValue" 
                  value={formData.dealValue} 
                  onChange={handleChange} 
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8] disabled:bg-gray-700 disabled:text-gray-400" 
                  disabled={formData.stage !== LeadStage.Opportunity && formData.stage !== LeadStage.Conversion}
                  placeholder="e.g., 5000"
              />
            </div>
          </div>
          <div className="bg-black px-6 py-4 flex justify-end gap-3 flex-shrink-0">
            <button type="button" onClick={onClose} className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="bg-[#d356f8] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300">
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
