
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import IntegrationsView from './views/IntegrationsView';
import CrmView from './views/CrmView';
import CampaignsView from './views/CampaignsView';
import GoalsView from './views/GoalsView';
import { View, Lead, Campaign, CampaignGroup, GoalSettings } from './types';
import { leadsData, campaignsData, campaignGroupsData, initialGoalsData } from './data/mockData';

const APP_STORAGE_key = 'unifiedMarketingDashboardData';

interface AppData {
  leads: Lead[];
  campaigns: Campaign[];
  campaignGroups: CampaignGroup[];
  goals: GoalSettings;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  
  // Centralized state management with localStorage persistence
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignGroups, setCampaignGroups] = useState<CampaignGroup[]>([]);
  const [goals, setGoals] = useState<GoalSettings>(initialGoalsData);

  // Load initial data from localStorage or mockData on first run
  useEffect(() => {
    try {
      const savedDataString = localStorage.getItem(APP_STORAGE_key);
      if (savedDataString) {
        const savedData: AppData = JSON.parse(savedDataString);
        setLeads(savedData.leads || leadsData);
        setCampaigns(savedData.campaigns || campaignsData);
        setCampaignGroups(savedData.campaignGroups || campaignGroupsData);
        setGoals(savedData.goals || initialGoalsData);
      } else {
        // First time load: seed with mock data
        setLeads(leadsData);
        setCampaigns(campaignsData);
        setCampaignGroups(campaignGroupsData);
        setGoals(initialGoalsData);
      }
    } catch (error) {
        console.error("Failed to load or parse data from localStorage:", error);
        // Fallback to mock data if storage is corrupted
        setLeads(leadsData);
        setCampaigns(campaignsData);
        setCampaignGroups(campaignGroupsData);
        setGoals(initialGoalsData);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    // Avoid saving empty arrays on initial mount before hydration
    if (leads.length > 0 || campaigns.length > 0 || campaignGroups.length > 0) {
        const appData: AppData = { leads, campaigns, campaignGroups, goals };
        localStorage.setItem(APP_STORAGE_key, JSON.stringify(appData));
    }
  }, [leads, campaigns, campaignGroups, goals]);


  // Handler functions to be passed down as props
  const handleAddLead = (newLead: Omit<Lead, 'id'>) => {
    setLeads(prevLeads => [...prevLeads, { ...newLead, id: prevLeads.length > 0 ? Math.max(...prevLeads.map(l => l.id)) + 1 : 1 }]);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prevLeads => 
        prevLeads.map(lead => (lead.id === updatedLead.id ? updatedLead : lead))
    );
  };

  const handleAddCampaignGroup = (newGroup: Omit<CampaignGroup, 'id'>) => {
    setCampaignGroups(prev => [...prev, { ...newGroup, id: prev.length > 0 ? Math.max(...prev.map(g => g.id)) + 1 : 1 }]);
  };

  const handleAddCampaign = (newCampaign: Omit<Campaign, 'id' | 'leads' | 'cost'>) => {
    setCampaigns(prev => [...prev, { ...newCampaign, id: prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1, leads: 0, cost: 0 }]);
  };
  
  const handleUpdateGoals = (newGoals: GoalSettings) => {
    setGoals(newGoals);
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <DashboardView leads={leads} campaigns={campaigns} goals={goals} />;
      case View.Integrations:
        return <IntegrationsView />;
      case View.CRM:
        return <CrmView leads={leads} campaignGroups={campaignGroups} campaigns={campaigns} onAddLead={handleAddLead} onUpdateLead={handleUpdateLead} />;
      case View.Campaigns:
        return <CampaignsView campaigns={campaigns} campaignGroups={campaignGroups} onAddCampaign={handleAddCampaign} onAddCampaignGroup={handleAddCampaignGroup} />;
      case View.Goals:
        return <GoalsView goals={goals} leads={leads} onUpdateGoals={handleUpdateGoals} />;
      default:
        return <DashboardView leads={leads} campaigns={campaigns} goals={goals} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 p-6 sm:p-8 md:p-10">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
