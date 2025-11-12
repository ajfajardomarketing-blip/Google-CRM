import React, { useState, useMemo } from 'react';
import { 
    channels,
    campaignKpiOptions
} from '../data/mockData';
import { Campaign, CampaignGroup } from '../types';
import KpiConfigModal from '../components/KpiConfigModal';
import { SettingsIcon } from '../components/icons';


// --- Start of AddCampaignGroupModal ---
interface AddCampaignGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGroup: (group: Omit<CampaignGroup, 'id'>) => void;
}

const AddCampaignGroupModal: React.FC<AddCampaignGroupModalProps> = ({ isOpen, onClose, onAddGroup }) => {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !channel) return;
    onAddGroup({ name, channel });
    onClose();
    setName('');
    setChannel('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Add New Campaign Group</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Group Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Seguridad Electrónica - Industrias" className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                 <option value="">Select a Channel</option>
                 {channels.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-gray-900 px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
              Save Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- End of AddCampaignGroupModal ---

// --- Start of AddCampaignModal ---
interface AddCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCampaign: (campaign: Omit<Campaign, 'id' | 'leads' | 'cost'>) => void;
  campaignGroups: CampaignGroup[];
}

const AddCampaignModal: React.FC<AddCampaignModalProps> = ({ isOpen, onClose, onAddCampaign, campaignGroups }) => {
  const [formData, setFormData] = useState({
    name: '',
    campaignGroupId: '',
    status: 'Active' as Campaign['status'],
    startDate: '',
    endDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.campaignGroupId || !formData.startDate || !formData.endDate) return;
    
    onAddCampaign({
      name: formData.name,
      campaignGroupId: parseInt(formData.campaignGroupId, 10),
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
    });

    onClose();
    setFormData({ name: '', campaignGroupId: '', status: 'Active', startDate: '', endDate: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Add New Campaign</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Campaign Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Lectura de Placas" className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Campaign Group</label>
              <select name="campaignGroupId" value={formData.campaignGroupId} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                 <option value="">Select a Group</option>
                 {campaignGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-300">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                 <option value="Active">Active</option>
                 <option value="Paused">Paused</option>
                 <option value="Completed">Completed</option>
              </select>
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">End Date</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
          </div>
          <div className="bg-gray-900 px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
              Save Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- End of AddCampaignModal ---

const createInitialKpiConfig = (): Record<string, Record<string, boolean>> => {
    const config: Record<string, Record<string, boolean>> = {};
    for (const channel in campaignKpiOptions) {
        config[channel] = {};
        campaignKpiOptions[channel].forEach(kpi => {
            config[channel][kpi.id] = true;
        });
    }
    return config;
};

interface CampaignsViewProps {
    campaigns: Campaign[];
    campaignGroups: CampaignGroup[];
    onAddCampaign: (campaign: Omit<Campaign, 'id' | 'leads' | 'cost'>) => void;
    onAddCampaignGroup: (group: Omit<CampaignGroup, 'id'>) => void;
}

const CampaignsView: React.FC<CampaignsViewProps> = ({ campaigns, campaignGroups, onAddCampaign, onAddCampaignGroup }) => {
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isKpiConfigOpen, setIsKpiConfigOpen] = useState(false);

    const [kpiConfig, setKpiConfig] = useState<Record<string, Record<string, boolean>>>(createInitialKpiConfig());
    
    const getStatusChip = (status: 'Active' | 'Completed' | 'Paused') => {
        switch(status) {
            case 'Active':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-300">{status}</span>;
            case 'Completed':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">{status}</span>;
            case 'Paused':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-300">{status}</span>;
            default:
                return null;
        }
    }
    
    const handleSaveKpiConfig = (newConfig: Record<string, Record<string, boolean>>) => {
        setKpiConfig(newConfig);
        setIsKpiConfigOpen(false);
    };

    const campaignsByGroup = useMemo(() => {
        const grouped: { [key: number]: Campaign[] } = {};
        campaigns.forEach(campaign => {
            if (!grouped[campaign.campaignGroupId]) {
                grouped[campaign.campaignGroupId] = [];
            }
            grouped[campaign.campaignGroupId].push(campaign);
        });
        return grouped;
    }, [campaigns]);

    const formatKpiValue = (value: number | undefined, kpi: keyof Campaign) => {
        if (value === undefined || value === null) return 'N/A';
        if (['cost', 'revenue', 'cpc', 'cpa'].includes(kpi)) {
            return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (kpi === 'roas') return `${value.toFixed(1)}x`;
        return value.toLocaleString();
    };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <p className="text-gray-400 mt-1">Analyze the performance of your marketing campaigns.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <button
                onClick={() => setIsKpiConfigOpen(true)}
                className="bg-gray-700 border border-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-600 transition duration-300 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Configure KPIs
            </button>
            <button 
                onClick={() => setIsGroupModalOpen(true)}
                className="bg-gray-700 border border-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-600 transition duration-300">
                Add Campaign Group
            </button>
            <button 
                onClick={() => setIsCampaignModalOpen(true)}
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                Add New Campaign
            </button>
        </div>
      </div>
      
      <div className="space-y-8">
        {campaignGroups.map(group => {
            const channelKpiConfig = kpiConfig[group.channel] || {};
            const availableKpis = campaignKpiOptions[group.channel] || [];
            const hasCustomKpis = availableKpis.length > 0;

            return (
            <div key={group.id} className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-white">{group.name}</h2>
                    <p className="text-sm font-medium text-blue-400">{group.channel}</p>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Campaign</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                        {hasCustomKpis ? (
                            availableKpis.map(kpi => 
                                channelKpiConfig[kpi.id] && <th key={kpi.id} className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">{kpi.label}</th>
                            )
                        ) : (
                            <>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Start Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">End Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Leads</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Cost</th>
                            </>
                        )}
                    </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {(campaignsByGroup[group.id] || []).map((campaign) => {
                       return (
                        <tr key={campaign.id} className="hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{campaign.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(campaign.status)}</td>
                            {hasCustomKpis ? (
                                availableKpis.map(kpi =>
                                    channelKpiConfig[kpi.id] && 
                                    <td key={kpi.id} className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                                        {/* FIX: Cast campaign property to number | undefined as TypeScript cannot infer that kpi.id only refers to numeric properties of Campaign. */}
                                        {formatKpiValue(campaign[kpi.id] as number | undefined, kpi.id)}
                                    </td>
                                )
                            ) : (
                                <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{campaign.startDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{campaign.endDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">{campaign.leads}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">${campaign.cost.toLocaleString()}</td>
                                </>
                            )}
                        </tr>
                       )
                    })}
                    {(!campaignsByGroup[group.id] || campaignsByGroup[group.id].length === 0) && (
                        <tr>
                            <td colSpan={10} className="text-center py-4 text-sm text-gray-500">No campaigns in this group yet.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        )})}
      </div>

      <AddCampaignModal 
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onAddCampaign={onAddCampaign}
        campaignGroups={campaignGroups}
      />

      <AddCampaignGroupModal 
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onAddGroup={onAddCampaignGroup}
      />
      
      <KpiConfigModal
        isOpen={isKpiConfigOpen}
        onClose={() => setIsKpiConfigOpen(false)}
        config={kpiConfig}
        onSave={handleSaveKpiConfig}
      />
    </div>
  );
};

export default CampaignsView;