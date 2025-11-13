

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import DashboardView from './views/DashboardView';
import IntegrationsView from './views/IntegrationsView';
import CrmView from './views/CrmView';
import CampaignsView from './views/CampaignsView';
import GoalsView from './views/GoalsView';
import { View, Lead, Campaign, CampaignGroup, GoalSettings } from './types';
import { initialGoalsData } from './data/mockData';
import { 
  listenToCollection, 
  listenToDocument, 
  addLead, 
  updateLead,
  deleteLead,
  addCampaignGroup, 
  addCampaign, 
  updateGoals,
  updateCampaign,
  deleteCampaign,
  updateCampaignGroup,
  deleteCampaignGroup
} from './firebase';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Centralized state management with Firestore real-time data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignGroups, setCampaignGroups] = useState<CampaignGroup[]>([]);
  const [goals, setGoals] = useState<GoalSettings>({ leads: { total: 0, opportunities: 0, conversions: 0 }, metrics: {} });

  // Listen for real-time updates from Firestore
  useEffect(() => {
    // Listeners for collections
    const unsubscribeLeads = listenToCollection<Lead>('leads', setLeads);
    const unsubscribeCampaigns = listenToCollection<Campaign>('campaigns', setCampaigns);
    const unsubscribeCampaignGroups = listenToCollection<CampaignGroup>('campaignGroups', (data) => {
        // Sort by the new 'order' property
        const sortedData = data.sort((a, b) => a.order - b.order);
        setCampaignGroups(sortedData);
    });

    // Listener for Goals document, with a fallback to create it with empty data
    const unsubscribeGoals = listenToDocument<GoalSettings>('settings', 'goals', setGoals, () => {
        console.log('Goals document does not exist. Creating with a clean slate...');
        updateGoals({ leads: { total: 0, opportunities: 0, conversions: 0 }, metrics: {} });
    });

    // Cleanup listeners on component unmount
    return () => {
      unsubscribeLeads();
      unsubscribeCampaigns();
      unsubscribeCampaignGroups();
      unsubscribeGoals();
    };
  }, []);


  // Handler functions now delegate to the firebase service
  const handleAddLead = async (newLead: Omit<Lead, 'id'>) => {
    await addLead(newLead);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    await updateLead(updatedLead);
  };

  const handleDeleteLead = async (leadId: string): Promise<boolean> => {
    try {
      await deleteLead(leadId);
      return true; // Indicate success
    } catch (error) {
      console.error("Failed to delete lead:", error);
      alert("Error: Could not delete the lead. Please check your Firestore security rules to ensure delete operations are permitted.");
      return false; // Indicate failure
    }
  };

  const handleAddCampaignGroup = async (newGroup: Omit<CampaignGroup, 'id' | 'order'>) => {
    await addCampaignGroup(newGroup);
  };

  const handleUpdateCampaignGroup = async (updatedGroup: CampaignGroup) => {
    await updateCampaignGroup(updatedGroup);
  };

  const handleDeleteCampaignGroup = async (groupId: string): Promise<boolean> => {
    try {
        await deleteCampaignGroup(groupId);
        return true;
    } catch (error) {
        console.error("Failed to delete campaign group:", error);
        alert("Error: Could not delete the campaign group.");
        return false;
    }
  };

  const handleAddCampaign = async (newCampaign: Omit<Campaign, 'id' | 'leads' | 'cost'>) => {
    await addCampaign(newCampaign);
  };
  
  const handleUpdateGoals = async (newGoals: GoalSettings) => {
    await updateGoals(newGoals);
  };

  const handleUpdateCampaign = async (updatedCampaign: Campaign) => {
    await updateCampaign(updatedCampaign);
  };

  const handleDeleteCampaign = async (campaignId: string): Promise<boolean> => {
    try {
      await deleteCampaign(campaignId);
      return true;
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      alert("Error: Could not delete the campaign.");
      return false;
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <DashboardView leads={leads} campaigns={campaigns} goals={goals} />;
      case View.Integrations:
        return <IntegrationsView />;
      case View.CRM:
        return <CrmView leads={leads} campaignGroups={campaignGroups} campaigns={campaigns} onAddLead={handleAddLead} onUpdateLead={handleUpdateLead} onDeleteLead={handleDeleteLead} />;
      case View.Campaigns:
        return <CampaignsView 
                  campaigns={campaigns} 
                  campaignGroups={campaignGroups}
                  leads={leads}
                  onAddCampaign={handleAddCampaign} 
                  onAddCampaignGroup={handleAddCampaignGroup}
                  onUpdateCampaign={handleUpdateCampaign}
                  onDeleteCampaign={handleDeleteCampaign}
                  onUpdateCampaignGroup={handleUpdateCampaignGroup}
                  onDeleteCampaignGroup={handleDeleteCampaignGroup}
                />;
      case View.Goals:
        return <GoalsView goals={goals} leads={leads} onUpdateGoals={handleUpdateGoals} />;
      default:
        return <DashboardView leads={leads} campaigns={campaigns} goals={goals} />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-gray-200 font-sans overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <main className="flex-1 p-6 sm:p-8 md:p-10 overflow-auto pb-20">
        {renderView()}
      </main>
      {/* FIX: Corrected typo from currentVw to currentView */}
      <MobileNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

export default App;