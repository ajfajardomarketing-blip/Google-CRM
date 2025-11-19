
import React, { useState, useMemo, useEffect } from 'react';
import { Lead, LeadStage, CampaignGroup, Campaign } from '../types';
import AddLeadModal from '../components/AddLeadModal';
import EditLeadModal from '../components/EditLeadModal';
import { SearchIcon } from '../components/icons';

interface CrmViewProps {
  leads: Lead[];
  campaignGroups: CampaignGroup[];
  campaigns: Campaign[];
  onAddLead: (newLead: Omit<Lead, 'id'>) => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onDeleteLead: (leadId: string) => Promise<boolean>;
}

const CrmView: React.FC<CrmViewProps> = ({ leads, campaignGroups, campaigns, onAddLead, onUpdateLead, onDeleteLead }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    campaignGroup: 'All',
    channel: 'All',
    stage: 'Active', // Default to active leads
  });
  
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    lead: Lead | null;
  }>({ visible: false, x: 0, y: 0, lead: null });

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, lead: null });
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [contextMenu.visible]);


  const channels = useMemo(() => ['All', ...Array.from(new Set(leads.map(l => l.channel)))], [leads]);
  const campaignGroupNames = useMemo(() => ['All', ...Array.from(new Set(campaignGroups.map(c => c.name)))], [campaignGroups]);
  const stages = useMemo(() => ['Active', 'All', ...Object.values(LeadStage).filter(s => s !== LeadStage.Eliminar)], []);
  
  const filteredLeads = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();

    const filtered = leads.filter(lead => {
      const searchMatch = lowercasedQuery === '' ||
        lead.name.toLowerCase().includes(lowercasedQuery) ||
        lead.email.toLowerCase().includes(lowercasedQuery) ||
        lead.company.toLowerCase().includes(lowercasedQuery) ||
        (lead.jobTitle && lead.jobTitle.toLowerCase().includes(lowercasedQuery));

      if (!searchMatch) return false;

      const stageMatch = filters.stage === 'Active'
        ? lead.stage !== LeadStage.Discarded
        : filters.stage === 'All'
          ? true
          : lead.stage === filters.stage;

      return (
        (filters.campaignGroup === 'All' || lead.campaignGroup === filters.campaignGroup) &&
        (filters.channel === 'All' || lead.channel === filters.channel) &&
        stageMatch
      );
    });
    
    // Sort leads from oldest to newest
    return filtered.sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());
  }, [leads, filters, searchQuery]);

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setIsEditModalOpen(true);
  }

  const handleContextMenu = (event: React.MouseEvent, lead: Lead) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      lead: lead,
    });
  };

  const handleDeleteFromContextMenu = async () => {
    if (contextMenu.lead) {
      if (window.confirm(`Are you sure you want to delete the lead "${contextMenu.lead.name}"? This action cannot be undone.`)) {
        await onDeleteLead(contextMenu.lead.id);
      }
    }
    setContextMenu({ visible: false, x: 0, y: 0, lead: null });
  };

  const calculateDaysInStage = (lead: Lead): string | number => {
    const { stage, stageDates } = lead;

    if (stage === LeadStage.Conversion || stage === LeadStage.Discarded || stage === LeadStage.Eliminar) {
        return '-';
    }

    const stageStartDateString = stageDates?.[stage];

    if (!stageStartDateString) {
        return '-'; // Data not available for this stage
    }
    
    const stageStartDate = new Date(stageStartDateString);
    if (isNaN(stageStartDate.getTime())) {
        return '-'; // Invalid date
    }

    const today = new Date();
    // To not show negative numbers if date is in the future
    if (stageStartDate > today) {
        return 0;
    }

    const diffTime = today.getTime() - stageStartDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getStageChip = (stage: LeadStage) => {
    switch(stage) {
      case LeadStage.Lead:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">{stage}</span>;
      case LeadStage.Qualified:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500/20 text-indigo-300">{stage}</span>;
      case LeadStage.Opportunity:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-300">{stage}</span>;
      case LeadStage.Conversion:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-300">{stage}</span>;
      case LeadStage.Discarded:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-300">{stage}</span>;
      case LeadStage.Eliminar:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-300">{stage}</span>;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Leads CRM</h1>
            <p className="text-base text-gray-400 mt-1">Manage and track all your marketing leads.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#d356f8] text-white font-semibold py-1.5 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300"
        >
          Add New Lead
        </button>
      </div>

      <div className="bg-gray-900 p-4 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-end gap-3 mb-4">
            <div className="relative w-full sm:w-auto sm:flex-grow">
                <label htmlFor="search-leads" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Search</label>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pt-5">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                    id="search-leads"
                    type="text"
                    placeholder="Search leads..."
                    className="w-full pl-10 pr-4 py-1.5 bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div>
              <label htmlFor="filter-channel" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Channel</label>
              <select 
                  id="filter-channel"
                  aria-label="Filter by channel"
                  className="w-full sm:w-auto pl-3 pr-10 py-1.5 text-sm bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8] rounded-md"
                  value={filters.channel}
                  onChange={e => setFilters({...filters, channel: e.target.value})}
              >
                {channels.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filter-campaign-group" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Campaign Group</label>
              <select 
                  id="filter-campaign-group"
                  aria-label="Filter by campaign group"
                  className="w-full sm:w-auto pl-3 pr-10 py-1.5 text-sm bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8] rounded-md"
                  value={filters.campaignGroup}
                  onChange={e => setFilters({...filters, campaignGroup: e.target.value})}
              >
                {campaignGroupNames.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filter-stage" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Stage</label>
              <select 
                  id="filter-stage"
                  aria-label="Filter by stage"
                  className="w-full sm:w-auto pl-3 pr-10 py-1.5 text-sm bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8] rounded-md"
                  value={filters.stage}
                  onChange={e => setFilters({...filters, stage: e.target.value})}
              >
                {stages.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-950">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-950 px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase w-56">Name</th>
                <th className="sticky left-[14rem] z-10 bg-gray-950 px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase w-48 border-r border-gray-700">Company</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Job Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Channel</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Campaign Group</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Campaign</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Stage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Days in Stage</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Deal Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Date Added</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} onContextMenu={(e) => handleContextMenu(e, lead)} className="hover:bg-gray-700 cursor-context-menu">
                  <td className="sticky left-0 bg-gray-900 px-4 py-3 whitespace-nowrap w-56">
                    <button onClick={() => handleEditClick(lead)} className="truncate w-full text-sm font-medium text-[#e9a7fb] hover:text-[#d356f8] text-left transition duration-150 ease-in-out">
                        {lead.name}
                    </button>
                    <div className="truncate text-sm text-gray-400">{lead.email}</div>
                  </td>
                  <td className="sticky left-[14rem] bg-gray-900 px-4 py-3 whitespace-nowrap text-sm text-gray-400 w-48 border-r border-gray-700 truncate">{lead.company}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 truncate">{lead.jobTitle || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{lead.channel}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{lead.campaignGroup}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{lead.campaign}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{getStageChip(lead.stage)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-center">{calculateDaysInStage(lead)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-400">
                    {(lead.stage === LeadStage.Opportunity || lead.stage === LeadStage.Conversion) && lead.dealValue
                      ? `$${lead.dealValue.toLocaleString()}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{lead.dateAdded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {contextMenu.visible && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg"
        >
          <div className="py-1">
            <button
              onClick={handleDeleteFromContextMenu}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Lead
            </button>
          </div>
        </div>
      )}

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
          onUpdateLead={(updatedLead) => {
            onUpdateLead(updatedLead);
            setIsEditModalOpen(false);
          }}
          onDeleteLead={onDeleteLead}
          lead={editingLead}
          campaigns={campaigns}
          campaignGroups={campaignGroups}
        />
      )}
    </div>
  );
};

export default CrmView;