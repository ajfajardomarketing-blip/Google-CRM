

import React, { useState, useEffect, useMemo } from 'react';
import { Lead, LeadStage, Campaign, CampaignGroup } from '../types';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => Promise<boolean>;
  lead: Lead | null;
  campaigns: Campaign[];
  campaignGroups: CampaignGroup[];
}

const stageOrder = [LeadStage.Lead, LeadStage.Opportunity, LeadStage.Conversion];

const EditLeadModal: React.FC<EditLeadModalProps> = ({ isOpen, onClose, onUpdateLead, onDeleteLead, lead, campaigns, campaignGroups }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    campaignGroupId: '',
    campaignId: '',
    stage: LeadStage.Lead,
    dealValue: '',
    dateAdded: '',
    stageDates: {} as Partial<Record<LeadStage, string>>,
  });
  const [isDeleting, setIsDeleting] = useState(false);
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
        dateAdded: lead.dateAdded,
        stageDates: lead.stageDates || { [LeadStage.Lead]: lead.dateAdded },
      });
      setChannel(lead.channel);
    }
  }, [lead, campaigns, campaignGroups]);

  const availableCampaigns = useMemo(() => {
    if (!formData.campaignGroupId) return [];
    return campaigns.filter(c => c.campaignGroupId === formData.campaignGroupId);
  }, [formData.campaignGroupId, campaigns]);
  
  const handleStageDateChange = (stage: LeadStage, date: string) => {
    setFormData(prev => ({
      ...prev,
      stageDates: {
        ...prev.stageDates,
        [stage]: date,
      }
    }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'campaignGroupId') {
        const selectedGroup = campaignGroups.find(g => g.id === value);
        setChannel(selectedGroup ? selectedGroup.channel : '');
        setFormData(prev => ({ ...prev, campaignGroupId: value, campaignId: '' }));
    } else if (name === 'stage') {
        const newStage = value as LeadStage;
        
        if (newStage === LeadStage.Eliminar) {
            handleDelete();
            return;
        }

        const dealValueShouldBeCleared = newStage !== LeadStage.Opportunity && newStage !== LeadStage.Conversion;

        const oldStageIndex = stageOrder.indexOf(formData.stage);
        const newStageIndex = stageOrder.indexOf(newStage);
        
        const newStageDates = { ...formData.stageDates };

        // If stage doesn't have a date, set it to today
        if (!newStageDates[newStage]) {
            newStageDates[newStage] = new Date().toISOString().split('T')[0];
        }

        // If moving backwards, clear future stage dates
        if (newStageIndex < oldStageIndex) {
            for (let i = newStageIndex + 1; i < stageOrder.length; i++) {
                delete newStageDates[stageOrder[i]];
            }
        }
        
        setFormData(prev => ({ 
            ...prev, 
            stage: newStage,
            dealValue: dealValueShouldBeCleared ? '' : prev.dealValue,
            stageDates: newStageDates,
        }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedGroup = campaignGroups.find(g => g.id === formData.campaignGroupId);
    const selectedCampaign = campaigns.find(c => c.id === formData.campaignId);

    if (!selectedGroup || !selectedCampaign || !lead) return;

    const updatedLead: Lead = {
      ...lead,
      name: formData.name,
      email: formData.email,
      company: formData.company,
      channel: selectedGroup.channel,
      campaignGroup: selectedGroup.name,
      campaign: selectedCampaign.name,
      stage: formData.stage,
      dateAdded: formData.dateAdded,
      stageDates: formData.stageDates,
    };

    if (formData.dealValue) {
        updatedLead.dealValue = parseFloat(formData.dealValue);
    } else {
        delete updatedLead.dealValue;
    }

    onUpdateLead(updatedLead);
    onClose();
  };
  
  const handleDelete = async () => {
    if (!lead) return;
    if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      setIsDeleting(true);
      const success = await onDeleteLead(lead.id);
      setIsDeleting(false);
      if (success) {
        onClose();
      }
    }
  };

  const renderStageDateInputs = () => {
      const currentStageIndex = stageOrder.indexOf(formData.stage);
      if (formData.stage === LeadStage.Discarded) {
          return null; // Don't show date inputs for Discarded stage
      }

      return stageOrder.map((stage, index) => {
          if (index > currentStageIndex) return null;
          return (
              <div key={stage}>
                  <label className="block text-base font-medium text-gray-300">{stage} Date</label>
                  <input
                      type="date"
                      value={formData.stageDates[stage] || ''}
                      onChange={(e) => handleStageDateChange(stage, e.target.value)}
                      className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]"
                      required
                  />
              </div>
          );
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start sm:items-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[95vh] mt-8 sm:mt-0">
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Edit Lead</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-base font-medium text-gray-300">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-base font-medium text-gray-300">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-base font-medium text-gray-300">Company</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-300">Stage</label>
                <select name="stage" value={formData.stage} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required>
                  {Object.values(LeadStage).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-300">Deal Amount</label>
                <input 
                    type="number" 
                    name="dealValue" 
                    value={formData.dealValue} 
                    onChange={handleChange} 
                    className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8] disabled:bg-gray-700 disabled:text-gray-400" 
                    disabled={formData.stage !== LeadStage.Opportunity && formData.stage !== LeadStage.Conversion}
                    placeholder="e.g., 5000"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-300">Campaign Group</label>
                <select name="campaignGroupId" value={formData.campaignGroupId} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required>
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
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Stage Dates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderStageDateInputs()}
                </div>
            </div>

          </div>
          <div className="bg-black px-6 py-4 flex justify-end items-center flex-shrink-0">
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
                Cancel
              </button>
              <button type="submit" className="bg-[#d356f8] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300">
                Update Lead
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadModal;
