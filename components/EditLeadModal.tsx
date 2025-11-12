
import React, { useState, useEffect, useMemo } from 'react';
import { Lead, LeadStage, Campaign, CampaignGroup } from '../types';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (lead: Lead) => void;
  lead: Lead | null;
  campaigns: Campaign[];
  campaignGroups: CampaignGroup[];
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({ isOpen, onClose, onUpdateLead, lead, campaigns, campaignGroups }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    campaignGroupId: '',
    campaignId: '',
    stage: LeadStage.Lead,
    dealValue: '',
  });

  const [channel, setChannel] = useState('');

  useEffect(() => {
    if (lead) {
      const group = campaignGroups.find(g => g.name === lead.campaignGroup);
      const campaign = campaigns.find(c => c.name === lead.campaign && c.campaignGroupId === group?.id);
      
      setFormData({
        name: lead.name,
        email: lead.email,
        company: lead.company,
        stage: lead.stage,
        campaignGroupId: group ? String(group.id) : '',
        campaignId: campaign ? String(campaign.id) : '',
        dealValue: lead.dealValue ? String(lead.dealValue) : '',
      });
      setChannel(lead.channel);
    }
  }, [lead, campaigns, campaignGroups]);

  const availableCampaigns = useMemo(() => {
    if (!formData.campaignGroupId) return [];
    return campaigns.filter(c => c.campaignGroupId === parseInt(formData.campaignGroupId, 10));
  }, [formData.campaignGroupId, campaigns]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'campaignGroupId') {
        const selectedGroup = campaignGroups.find(g => g.id === parseInt(value, 10));
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
    const selectedGroup = campaignGroups.find(g => g.id === parseInt(formData.campaignGroupId, 10));
    const selectedCampaign = campaigns.find(c => c.id === parseInt(formData.campaignId, 10));

    if (!selectedGroup || !selectedCampaign || !lead) return;

    onUpdateLead({
      ...lead,
      name: formData.name,
      email: formData.email,
      company: formData.company,
      channel: selectedGroup.channel,
      campaignGroup: selectedGroup.name,
      campaign: selectedCampaign.name,
      stage: formData.stage,
      dealValue: formData.dealValue ? parseFloat(formData.dealValue) : undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Edit Lead</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Company</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Stage</label>
              <select name="stage" value={formData.stage} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                 {Object.values(LeadStage).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Deal Amount</label>
              <input 
                  type="number" 
                  name="dealValue" 
                  value={formData.dealValue} 
                  onChange={handleChange} 
                  className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-700 disabled:text-gray-400" 
                  disabled={formData.stage !== LeadStage.Opportunity && formData.stage !== LeadStage.Conversion}
                  placeholder="e.g., 5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Campaign Group</label>
              <select name="campaignGroupId" value={formData.campaignGroupId} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                 <option value="">Select a Group</option>
                 {campaignGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Channel</label>
              <input type="text" name="channel" value={channel} readOnly className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none bg-gray-900 text-gray-400" />
            </div>
             <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Campaign</label>
              <select name="campaignId" value={formData.campaignId} onChange={handleChange} disabled={!formData.campaignGroupId} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-700 disabled:text-gray-400" required>
                 <option value="">Select a Campaign</option>
                 {availableCampaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-gray-900 px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
              Update Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadModal;
