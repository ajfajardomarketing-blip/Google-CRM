
import React, { useState, useMemo } from 'react';
import { Lead, LeadStage, CampaignGroup, Campaign } from '../types';
import AddLeadModal from '../components/AddLeadModal';
import EditLeadModal from '../components/EditLeadModal';

interface CrmViewProps {
  leads: Lead[];
  campaignGroups: CampaignGroup[];
  campaigns: Campaign[];
  onAddLead: (newLead: Omit<Lead, 'id'>) => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

const CrmView: React.FC<CrmViewProps> = ({ leads, campaignGroups, campaigns, onAddLead, onUpdateLead }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  const [filters, setFilters] = useState({
    campaignGroup: 'All',
    channel: 'All',
    stage: 'All',
  });

  const channels = useMemo(() => ['All', ...Array.from(new Set(leads.map(l => l.channel)))], [leads]);
  const campaignGroupNames = useMemo(() => ['All', ...Array.from(new Set(campaignGroups.map(c => c.name)))], [campaignGroups]);
  const stages = useMemo(() => ['All', ...Object.values(LeadStage)], []);
  
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => 
      (filters.campaignGroup === 'All' || lead.campaignGroup === filters.campaignGroup) &&
      (filters.channel === 'All' || lead.channel === filters.channel) &&
      (filters.stage === 'All' || lead.stage === filters.stage)
    );
  }, [leads, filters]);

  const handleUpdateLeadWithModalClose = (updatedLead: Lead) => {
    onUpdateLead(updatedLead);
    setIsEditModalOpen(false);
  };

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setIsEditModalOpen(true);
  }

  const getStageChip = (stage: LeadStage) => {
    switch(stage) {
      case LeadStage.Lead:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">{stage}</span>;
      case LeadStage.Opportunity:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-300">{stage}</span>;
      case LeadStage.Conversion:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-300">{stage}</span>;
      case LeadStage.Discarded:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-300">{stage}</span>;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Leads CRM</h1>
            <p className="text-gray-400 mt-1">Manage and track all your marketing leads.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Add New Lead
        </button>
      </div>

      <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="channel-filter" className="block text-sm font-medium text-gray-300">Channel</label>
            <select 
                id="channel-filter" 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.channel}
                onChange={e => setFilters({...filters, channel: e.target.value})}
            >
              {channels.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="group-filter" className="block text-sm font-medium text-gray-300">Campaign Group</label>
            <select 
                id="group-filter" 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.campaignGroup}
                onChange={e => setFilters({...filters, campaignGroup: e.target.value})}
            >
              {campaignGroupNames.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="stage-filter" className="block text-sm font-medium text-gray-300">Stage</label>
            <select 
                id="stage-filter" 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.stage}
                onChange={e => setFilters({...filters, stage: e.target.value})}
            >
              {stages.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Channel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Campaign Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Stage</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Deal Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date Added</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleEditClick(lead)} className="text-sm font-medium text-blue-400 hover:text-blue-300 text-left transition duration-150 ease-in-out">
                        {lead.name}
                    </button>
                    <div className="text-sm text-gray-400">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{lead.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{lead.channel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{lead.campaignGroup}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{lead.campaign}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStageChip(lead.stage)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                    {(lead.stage === LeadStage.Opportunity || lead.stage === LeadStage.Conversion) && lead.dealValue
                      ? `$${lead.dealValue.toLocaleString()}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{lead.dateAdded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLead={onAddLead}
        campaigns={campaigns}
        campaignGroups={campaignGroups}
      />
      
      {editingLead && (
        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateLead={handleUpdateLeadWithModalClose}
          lead={editingLead}
          campaigns={campaigns}
          campaignGroups={campaignGroups}
        />
      )}
    </div>
  );
};

export default CrmView;
