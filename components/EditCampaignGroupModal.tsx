

import React, { useState, useEffect, useMemo } from 'react';
import { CampaignGroup, Campaign } from '../types';

interface EditCampaignGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateGroup: (group: CampaignGroup) => void;
  onDeleteGroup: (groupId: string) => Promise<boolean>;
  group: CampaignGroup | null;
  campaigns: Campaign[];
}

const EditCampaignGroupModal: React.FC<EditCampaignGroupModalProps> = ({ isOpen, onClose, onUpdateGroup, onDeleteGroup, group, campaigns }) => {
  const [name, setName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
    }
  }, [group]);
  
  const campaignsInGroup = useMemo(() => {
    if (!group) return [];
    return campaigns.filter(c => c.campaignGroupId === group.id);
  }, [group, campaigns]);

  const canDelete = campaignsInGroup.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !name) return;

    const updatedGroup: CampaignGroup = {
        ...group,
        name: name,
    };
    
    onUpdateGroup(updatedGroup);
  };

  const handleDelete = async () => {
    if (!group || !canDelete) return;
    if (window.confirm(`Are you sure you want to delete the campaign group "${group.name}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      const success = await onDeleteGroup(group.id);
      setIsDeleting(false);
      if (success) {
        onClose();
      }
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Edit Campaign Group</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-300">Group Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Seguridad Electrónica - Industrias" className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-300">Channel</label>
              <select value={group.channel} disabled className="mt-1 block w-full bg-black text-gray-400 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none cursor-not-allowed">
                 <option>{group.channel}</option>
              </select>
               <p className="text-sm text-gray-500 mt-1">Channel cannot be changed after creation.</p>
            </div>
          </div>
          <div className="bg-black px-6 py-4 flex justify-between items-center">
            <div>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || !canDelete}
                    className="text-base text-red-400 hover:text-red-300 font-semibold px-3 py-2 rounded-md hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title={!canDelete ? `Cannot delete. ${campaignsInGroup.length} campaign(s) still in this group.` : 'Delete Group'}
                >
                    {isDeleting ? 'Deleting...' : 'Delete Group'}
                </button>
                {!canDelete && <p className="text-sm text-yellow-500 mt-1">Reassign campaigns to delete.</p>}
            </div>

            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
                    Cancel
                </button>
                <button type="submit" className="bg-[#d356f8] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300">
                    Save Changes
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCampaignGroupModal;
