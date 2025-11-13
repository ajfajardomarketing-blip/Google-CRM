

import React, { useState, useEffect, useMemo } from 'react';
import { Campaign, CampaignGroup } from '../types';
import { campaignKpiOptions } from '../data/mockData';

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCampaign: (campaign: Campaign) => void;
  onDeleteCampaign: (campaignId: string) => Promise<boolean>;
  campaign: Campaign | null;
  campaignGroups: CampaignGroup[];
}

const EditCampaignModal: React.FC<EditCampaignModalProps> = ({ isOpen, onClose, onUpdateCampaign, onDeleteCampaign, campaign, campaignGroups }) => {
  const [formData, setFormData] = useState<Partial<Campaign>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (campaign) {
      setFormData(campaign);
    }
  }, [campaign]);

  const selectedGroup = useMemo(() => {
    return campaignGroups.find(g => g.id === formData.campaignGroupId);
  }, [formData.campaignGroupId, campaignGroups]);

  const channel = selectedGroup?.channel;
  const channelKpis = channel ? campaignKpiOptions[channel] || [] : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;

    if (type === 'number') {
        parsedValue = value === '' ? 0 : parseFloat(value);
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    if (formData.status === 'Completed' && !formData.endDate) {
      alert('An End Date is required for completed campaigns.');
      return;
    }
    
    const finalData = { ...formData };
    
    if (!finalData.endDate) {
      delete finalData.endDate;
    }
    
    // Ensure all number fields are numbers, defaulting to 0 if empty
    const allKpis = Object.values(campaignKpiOptions).flat();
    const numericFields: (keyof Campaign)[] = ['cost', ...allKpis.map(k => k.id)];

    for (const key of numericFields) {
        if (typeof finalData[key] !== 'number' || isNaN(finalData[key] as number)) {
            // @ts-ignore
            finalData[key] = 0;
        }
    }

    onUpdateCampaign(finalData as Campaign);
  };

  const handleDelete = async () => {
    if (!campaign) return;
    if (window.confirm(`Are you sure you want to delete the campaign "${campaign.name}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      const success = await onDeleteCampaign(campaign.id);
      setIsDeleting(false);
      if (success) {
        onClose();
      }
    }
  };

  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Edit Campaign</h2>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-base text-red-400 hover:text-red-300 font-semibold px-3 py-1 rounded-md hover:bg-red-900/50 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-h-[70vh] overflow-y-auto">
            {/* Basic Info */}
            <div className="sm:col-span-2">
              <label className="block text-base font-medium text-gray-300">Campaign Name</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-300">Campaign Group</label>
              <select name="campaignGroupId" value={formData.campaignGroupId || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required>
                 <option value="">Select a Group</option>
                 {campaignGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
             <div>
              <label className="block text-base font-medium text-gray-300">Status</label>
              <select name="status" value={formData.status || 'Active'} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required>
                 <option value="Active">Active</option>
                 <option value="Paused">Paused</option>
                 <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-300">Start Date</label>
              <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-300">
                End Date {formData.status === 'Completed' && <span className="text-red-400">*</span>}
              </label>
              <input 
                type="date" 
                name="endDate" 
                value={formData.endDate || ''} 
                onChange={handleChange} 
                className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" 
                required={formData.status === 'Completed'}
              />
            </div>

            {/* General Metrics */}
            <div className="sm:col-span-2 pt-2">
                <hr className="border-gray-700" />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-300">Cost / Spend</label>
              <input type="number" name="cost" value={formData.cost || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" placeholder="e.g., 5000" />
            </div>
            <div></div>

            {/* Channel-Specific Metrics */}
            {channelKpis.length > 0 && (
                <div className="sm:col-span-2 pt-2">
                    <h3 className="text-xl font-semibold text-gray-200">{channel} Metrics</h3>
                    <hr className="border-gray-700 mt-2" />
                </div>
            )}
            
            {channelKpis.map(kpi => {
              // Revenue is calculated automatically, so it should not be editable.
              if (kpi.id === 'revenue') return null;

              return (
                <div key={kpi.id}>
                  <label className="block text-base font-medium text-gray-300">{kpi.label}</label>
                  <input
                    type="number"
                    name={kpi.id}
                    value={formData[kpi.id as keyof Campaign] as number ?? ''}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]"
                    placeholder="0"
                  />
                </div>
              );
            })}
          </div>

          <div className="bg-black px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="bg-[#d356f8] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300">
              Update Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCampaignModal;
