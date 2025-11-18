

import React, { useState, useMemo } from 'react';
import { 
    channels,
    campaignKpiOptions
} from '../data/mockData';
import { Campaign, CampaignGroup, Lead, LeadStage } from '../types';
import KpiConfigModal from '../components/KpiConfigModal';
import { SettingsIcon, EditIcon, ChevronUpIcon, ChevronDownIcon } from '../components/icons';
import EditCampaignModal from '../components/EditCampaignModal';
import EditCampaignGroupModal from '../components/EditCampaignGroupModal';


// --- Start of AddCampaignGroupModal ---
interface AddCampaignGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGroup: (group: Omit<CampaignGroup, 'id' | 'order'>) => void;
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
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Add New Campaign Group</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Group Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Seguridad Electrónica - Industrias" className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required>
                 <option value="">Select a Channel</option>
                 {channels.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-black px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-700 py-1.5 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="bg-[#d356f8] text-white font-semibold py-1.5 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300">
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
    if (!formData.name || !formData.campaignGroupId || !formData.startDate) return;
    
    const campaignData: Omit<Campaign, 'id' | 'leads' | 'cost'> = {
      name: formData.name,
      campaignGroupId: formData.campaignGroupId,
      status: formData.status,
      startDate: formData.startDate,
    };

    if (formData.endDate) {
      campaignData.endDate = formData.endDate;
    }

    onAddCampaign(campaignData);

    onClose();
    setFormData({ name: '', campaignGroupId: '', status: 'Active', startDate: '', endDate: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Add New Campaign</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Campaign Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Lectura de Placas" className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Campaign Group</label>
              <select name="campaignGroupId" value={formData.campaignGroupId} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required>
                 <option value="">Select a Group</option>
                 {campaignGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-300">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required>
                 <option value="Active">Active</option>
                 <option value="Paused">Paused</option>
                 <option value="Completed">Completed</option>
              </select>
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">End Date</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
            </div>
          </div>
          <div className="bg-black px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-700 py-1.5 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="bg-[#d356f8] text-white font-semibold py-1.5 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300">
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
    leads: Lead[];
    onAddCampaign: (campaign: Omit<Campaign, 'id' | 'leads' | 'cost'>) => void;
    onAddCampaignGroup: (group: Omit<CampaignGroup, 'id' | 'order'>) => void;
    onUpdateCampaign: (campaign: Campaign) => void;
    onDeleteCampaign: (campaignId: string) => Promise<boolean>;
    onUpdateCampaignGroup: (group: CampaignGroup) => void;
    onDeleteCampaignGroup: (groupId: string) => Promise<boolean>;
}

const CampaignsView: React.FC<CampaignsViewProps> = ({ 
    campaigns, 
    campaignGroups, 
    leads, 
    onAddCampaign, 
    onAddCampaignGroup, 
    onUpdateCampaign, 
    onDeleteCampaign,
    onUpdateCampaignGroup,
    onDeleteCampaignGroup
}) => {
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isKpiConfigOpen, setIsKpiConfigOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<CampaignGroup | null>(null);

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

    const handleEditClick = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setIsEditModalOpen(true);
    };

    const handleEditGroupClick = (group: CampaignGroup) => {
        setEditingGroup(group);
        setIsEditGroupModalOpen(true);
    };
    
    const leadCountsByCampaignId = useMemo(() => {
        const counts: Record<string, number> = {};
        const groupMap = new Map(campaignGroups.map(g => [g.id, g.name]));

        campaigns.forEach(campaign => {
            const groupName = groupMap.get(campaign.campaignGroupId);
            if (!groupName) {
                counts[campaign.id] = 0;
                return;
            }
            const count = leads.filter(lead => 
                lead.campaign === campaign.name && lead.campaignGroup === groupName
            ).length;
            counts[campaign.id] = count;
        });
        return counts;
    }, [leads, campaigns, campaignGroups]);

    const campaignsWithCalculatedMetrics = useMemo(() => {
        const campaignLookup = new Map<string, string>();
        campaignGroups.forEach(group => {
            campaigns.filter(c => c.campaignGroupId === group.id).forEach(campaign => {
                campaignLookup.set(`${group.name}|${campaign.name}`, campaign.id);
            });
        });

        const conversionCounts = new Map<string, number>();
        const revenueMap = new Map<string, number>();

        leads.forEach(lead => {
            if (lead.stage === LeadStage.Conversion) {
                const campaignId = campaignLookup.get(`${lead.campaignGroup}|${lead.campaign}`);
                if (campaignId) {
                    conversionCounts.set(campaignId, (conversionCounts.get(campaignId) || 0) + 1);
                    if (lead.dealValue) {
                        revenueMap.set(campaignId, (revenueMap.get(campaignId) || 0) + lead.dealValue);
                    }
                }
            }
        });

        return campaigns.map(campaign => {
            const conversions = conversionCounts.get(campaign.id) || 0;
            const revenue = revenueMap.get(campaign.id) || 0;
            const cpa = conversions > 0 ? campaign.cost / conversions : 0;
            const roas = campaign.cost > 0 ? revenue / campaign.cost : 0;

            return {
                ...campaign,
                conversions,
                revenue,
                cpa,
                roas,
            };
        });
    }, [leads, campaigns, campaignGroups]);


    const campaignsByGroup = useMemo(() => {
        const grouped: { [key: string]: Campaign[] } = {};
        campaignsWithCalculatedMetrics.forEach(campaign => {
            if (!grouped[campaign.campaignGroupId]) {
                grouped[campaign.campaignGroupId] = [];
            }
            grouped[campaign.campaignGroupId].push(campaign);
        });

        // Sort campaigns within each group by start date (descending)
        for (const groupId in grouped) {
            grouped[groupId].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        }
        
        return grouped;
    }, [campaignsWithCalculatedMetrics]);

    const formatKpiValue = (value: number | undefined, kpi: keyof Campaign | (string & {})) => {
        if (value === undefined || value === null) return 'N/A';
        if (['cost', 'revenue', 'cpc', 'cpa'].includes(kpi)) {
            return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (kpi === 'roas') return `${value.toFixed(1)}x`;
        return value.toLocaleString();
    };


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <p className="text-base text-gray-400 mt-1">Analyze the performance of your marketing campaigns.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <button
                onClick={() => setIsKpiConfigOpen(true)}
                className="bg-gray-700 border border-gray-600 text-gray-200 font-semibold py-1.5 px-4 rounded-lg shadow-sm hover:bg-gray-600 transition duration-300 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Configure KPIs
            </button>
            <button 
                onClick={() => setIsGroupModalOpen(true)}
                className="bg-gray-700 border border-gray-600 text-gray-200 font-semibold py-1.5 px-4 rounded-lg shadow-sm hover:bg-gray-600 transition duration-300">
                Add Group
            </button>
            <button 
                onClick={() => setIsCampaignModalOpen(true)}
                className="bg-[#d356f8] text-white font-semibold py-1.5 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300">
                Add Campaign
            </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {campaignGroups.map((group, index) => {
            const groupCampaigns = campaignsByGroup[group.id] || [];
            const channelKpiConfig = kpiConfig[group.channel] || {};
            const availableKpis = campaignKpiOptions[group.channel] || [];
            const hasCustomKpis = availableKpis.length > 0;
            const isEmailMarketing = group.channel === 'Email Marketing';

            const totals = useMemo(() => {
                if (groupCampaigns.length === 0) return null;

                const initialTotals: { [key in keyof Campaign]?: number } & { leads: number } = { leads: 0 };
                
                availableKpis.forEach(kpi => {
                    initialTotals[kpi.id] = 0;
                });
                initialTotals.cost = 0;

                return groupCampaigns.reduce((acc, campaign) => {
                    acc.cost! += campaign.cost || 0;
                    acc.leads += leadCountsByCampaignId[campaign.id] || 0;

                    availableKpis.forEach(kpi => {
                      if(typeof acc[kpi.id] === 'number') {
                        // @ts-ignore
                        acc[kpi.id] += campaign[kpi.id] || 0;
                      }
                    });
                    
                    return acc;
                }, initialTotals);
            }, [groupCampaigns, leadCountsByCampaignId, availableKpis]);

            return (
            <div key={group.id} className="bg-gray-900 p-4 rounded-xl shadow-lg">
                <div className="mb-4 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white">{group.name}</h2>
                        <p className="text-sm font-medium text-[#d356f8]">{group.channel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleEditGroupClick(group)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                            title="Edit Group"
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-950">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Campaign</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                        {hasCustomKpis ? (
                            isEmailMarketing ? (
                                availableKpis.reduce<React.ReactNode[]>((acc, kpi) => {
                                    if (channelKpiConfig[kpi.id]) {
                                        acc.push(<th key={kpi.id} className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">{kpi.label}</th>);
                                        if (kpi.id === 'opens') {
                                            acc.push(<th key="open-rate" className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Open Rate</th>);
                                        }
                                        if (kpi.id === 'clicks') {
                                            acc.push(<th key="click-rate" className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Click Rate</th>);
                                        }
                                    }
                                    return acc;
                                }, [])
                            ) : (
                                availableKpis.map(kpi => 
                                    channelKpiConfig[kpi.id] && <th key={kpi.id} className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">{kpi.label}</th>
                                )
                            )
                        ) : (
                            <>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Date Range</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Leads</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Cost</th>
                            </>
                        )}
                    </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {groupCampaigns.map((campaign) => {
                       return (
                        <tr key={campaign.id} className="hover:bg-gray-700">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                <button onClick={() => handleEditClick(campaign)} className="text-[#e9a7fb] hover:text-[#d356f8] text-left transition duration-150 ease-in-out">
                                    {campaign.name}
                                </button>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{getStatusChip(campaign.status)}</td>
                            {hasCustomKpis ? (
                                isEmailMarketing ? (
                                    availableKpis.reduce<React.ReactNode[]>((acc, kpi) => {
                                        if (channelKpiConfig[kpi.id]) {
                                            acc.push(
                                                <td key={kpi.id} className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-400">
                                                    {formatKpiValue(campaign[kpi.id] as number | undefined, kpi.id)}
                                                </td>
                                            );
                                            if (kpi.id === 'opens') {
                                                const openRate = (campaign.delivered ?? 0) > 0 ? ((campaign.opens ?? 0) / campaign.delivered!) * 100 : 0;
                                                acc.push(
                                                    <td key="open-rate" className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-400 font-semibold">
                                                        {openRate.toFixed(1)}%
                                                    </td>
                                                );
                                            }
                                            if (kpi.id === 'clicks') {
                                                const clickRate = (campaign.delivered ?? 0) > 0 ? ((campaign.clicks ?? 0) / campaign.delivered!) * 100 : 0;
                                                acc.push(
                                                    <td key="click-rate" className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-400 font-semibold">
                                                        {clickRate.toFixed(1)}%
                                                    </td>
                                                );
                                            }
                                        }
                                        return acc;
                                    }, [])
                                ) : (
                                    availableKpis.map(kpi =>
                                        channelKpiConfig[kpi.id] && 
                                        <td key={kpi.id} className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-400">
                                            {formatKpiValue(campaign[kpi.id as keyof Campaign] as number | undefined, kpi.id)}
                                        </td>
                                    )
                                )
                            ) : (
                                <>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{campaign.endDate ? `${campaign.startDate} – ${campaign.endDate}` : campaign.startDate}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-400">{leadCountsByCampaignId[campaign.id] ?? 0}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-400">${campaign.cost.toLocaleString()}</td>
                                </>
                            )}
                        </tr>
                       )
                    })}
                    {groupCampaigns.length === 0 && (
                        <tr>
                            <td colSpan={10} className="text-center py-4 text-sm text-gray-500">No campaigns in this group yet.</td>
                        </tr>
                    )}
                    </tbody>
                    {groupCampaigns.length > 0 && totals && (
                        <tfoot className="bg-black/70">
                            <tr className="border-t-2 border-gray-600">
                                <td colSpan={2} className="px-4 py-2 text-left text-sm font-bold text-white uppercase tracking-wider">
                                    Total
                                </td>
                                {hasCustomKpis ? (
                                    isEmailMarketing ? (
                                        availableKpis.reduce<React.ReactNode[]>((acc, kpi) => {
                                            if (channelKpiConfig[kpi.id]) {
                                                acc.push(
                                                    <td key={`${kpi.id}-total`} className="px-4 py-2 whitespace-nowrap text-right text-sm font-bold text-white">
                                                        {formatKpiValue(totals[kpi.id as keyof typeof totals], kpi.id)}
                                                    </td>
                                                );
                                                if (kpi.id === 'opens') {
                                                    const totalOpenRate = (totals.delivered ?? 0) > 0 ? ((totals.opens ?? 0) / totals.delivered!) * 100 : 0;
                                                    acc.push(
                                                        <td key="open-rate-total" className="px-4 py-2 whitespace-nowrap text-right text-sm font-bold text-white">
                                                            {totalOpenRate.toFixed(1)}%
                                                        </td>
                                                    );
                                                }
                                                if (kpi.id === 'clicks') {
                                                    const totalClickRate = (totals.delivered ?? 0) > 0 ? ((totals.clicks ?? 0) / totals.delivered!) * 100 : 0;
                                                    acc.push(
                                                        <td key="click-rate-total" className="px-4 py-2 whitespace-nowrap text-right text-sm font-bold text-white">
                                                            {totalClickRate.toFixed(1)}%
                                                        </td>
                                                    );
                                                }
                                            }
                                            return acc;
                                        }, [])
                                    ) : (
                                        availableKpis.map(kpi => {
                                            if (channelKpiConfig[kpi.id]) {
                                                const nonSummable = ['cpc', 'cpa', 'roas'];
                                                if (nonSummable.includes(kpi.id)) {
                                                    return <td key={`${kpi.id}-total`} className="px-4 py-2 text-right text-sm text-gray-500">N/A</td>;
                                                }
                                                return (
                                                    <td key={`${kpi.id}-total`} className="px-4 py-2 whitespace-nowrap text-right text-sm font-bold text-white">
                                                        {formatKpiValue(totals[kpi.id as keyof typeof totals], kpi.id)}
                                                    </td>
                                                );
                                            }
                                            return null;
                                        })
                                    )
                                ) : (
                                    <>
                                        <td className="px-4 py-2"></td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-bold text-white">{totals.leads.toLocaleString()}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-bold text-white">${totals.cost?.toLocaleString()}</td>
                                    </>
                                )}
                            </tr>
                        </tfoot>
                    )}
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

      {editingCampaign && (
        <EditCampaignModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCampaign(null);
          }}
          onUpdateCampaign={(updatedCampaign) => {
            onUpdateCampaign(updatedCampaign);
            setIsEditModalOpen(false);
            setEditingCampaign(null);
          }}
          onDeleteCampaign={onDeleteCampaign}
          campaign={editingCampaign}
          campaignGroups={campaignGroups}
        />
      )}

      {editingGroup && (
        <EditCampaignGroupModal
          isOpen={isEditGroupModalOpen}
          onClose={() => {
            setIsEditGroupModalOpen(false);
            setEditingGroup(null);
          }}
          onUpdateGroup={(updatedGroup) => {
            onUpdateCampaignGroup(updatedGroup);
            setIsEditGroupModalOpen(false);
            setEditingGroup(null);
          }}
          onDeleteGroup={onDeleteCampaignGroup}
          group={editingGroup}
          campaigns={campaigns}
        />
      )}
    </div>
  );
};

export default CampaignsView;