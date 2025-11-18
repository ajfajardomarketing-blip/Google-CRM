



import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import DashboardView from './views/DashboardView';
import IntegrationsView from './views/IntegrationsView';
import CrmView from './views/CrmView';
import CampaignsView from './views/CampaignsView';
import GoalsView from './views/GoalsView';
import ReportingView from './views/ReportingView';
import { View, Lead, Campaign, CampaignGroup, GoalSettings, PlatformMetrics, Message } from './types';
import { metricsData as initialMetricsData } from './data/mockData';
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
  deleteCampaignGroup,
  updateActualMetrics
} from './firebase';
import OperationsView from './views/OperationsView';
import AiAssistantBubble from './components/AiAssistantBubble';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Centralized state management with Firestore real-time data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignGroups, setCampaignGroups] = useState<CampaignGroup[]>([]);
  const [goals, setGoals] = useState<GoalSettings>({ 
    leads: { total: 0, qualified: 0, opportunities: 0, conversions: 0 }, 
    metrics: {},
    efforts: {},
    calculatorInputs: { totalSalesGoal: 1500000, marketingContribution: 60, avgTicket: 843, oppToCustomerRate: 40, leadToOppRate: 62.5, avgCpl: 470 },
    expenses: { salaries: [], tools: [], variable: [] }
  });
  const [actualMetrics, setActualMetrics] = useState<PlatformMetrics[]>(initialMetricsData);
  const [dateRange, setDateRange] = useState<string | { start: Date; end: Date }>('This Year');
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
        sender: 'model',
        content: "Hello! I'm your Marketing OS Copilot. I'm ready to analyze your data for the selected period. What would you like to know?"
    }
  ]);

  // Handle OAuth redirect from services like LinkedIn
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const redirectView = localStorage.getItem('oauth_redirect_view');

    // If we have auth params and a stored view, redirect to that view.
    if ((code || error) && redirectView === 'Integrations') {
      setCurrentView(View.Integrations);
      localStorage.removeItem('oauth_redirect_view');
    }
  }, []); // Runs only once on initial app load

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
        console.log('Goals document does not exist. Creating with default data...');
        const defaultGoals: GoalSettings = {
            leads: { total: 0, qualified: 0, opportunities: 0, conversions: 0 },
            metrics: {},
            efforts: {},
            calculatorInputs: {
                totalSalesGoal: 1500000,
                marketingContribution: 60,
                avgTicket: 843,
                oppToCustomerRate: 40,
                leadToOppRate: 62.5,
                avgCpl: 470
            },
            expenses: {
                salaries: [],
                tools: [],
                variable: []
            }
        };
        updateGoals(defaultGoals);
    });
    
    // Listener for Actual Metrics document
    const unsubscribeMetrics = listenToDocument<{data: PlatformMetrics[]}>('settings', 'actualMetrics', (data) => {
      if (data && data.data) {
        // Create a deep copy of the initial data to serve as a complete template
        const mergedMetrics = JSON.parse(JSON.stringify(initialMetricsData));
        const firestoreMetrics = data.data;

        // Merge the data from Firestore into our complete template
        firestoreMetrics.forEach(firestorePlatform => {
          const localPlatform = mergedMetrics.find((p: PlatformMetrics) => p.name === firestorePlatform.name);
          if (localPlatform) {
            // If the platform exists in our template, merge the metrics within it
            firestorePlatform.metrics.forEach(firestoreMetric => {
              const localMetric = localPlatform.metrics.find((m: any) => m.name === firestoreMetric.name);
              if (localMetric) {
                // If the metric exists, update its data object with values from Firestore
                Object.assign(localMetric.data, firestoreMetric.data);
              } else {
                // If it's a new metric for an existing platform, add it
                localPlatform.metrics.push(firestoreMetric);
              }
            });
          } else {
            // If it's a completely new platform from Firestore, add it
            mergedMetrics.push(firestorePlatform);
          }
        });
        
        setActualMetrics(mergedMetrics);
      }
    }, () => {
      console.log('actualMetrics document does not exist. Creating with default data...');
      updateActualMetrics(initialMetricsData);
    });


    // Cleanup listeners on component unmount
    return () => {
      unsubscribeLeads();
      unsubscribeCampaigns();
      unsubscribeCampaignGroups();
      unsubscribeGoals();
      unsubscribeMetrics();
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

  const handleUpdateActualMetrics = async (newMetrics: PlatformMetrics[]) => {
    await updateActualMetrics(newMetrics);
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <DashboardView 
                  leads={leads} 
                  campaigns={campaigns} 
                  campaignGroups={campaignGroups} 
                  goals={goals} 
                  actualMetrics={actualMetrics}
                  onUpdateActualMetrics={handleUpdateActualMetrics}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />;
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
      case View.Operations:
        return <OperationsView
                  goals={goals}
                  actualMetrics={actualMetrics}
                  campaigns={campaigns}
                  campaignGroups={campaignGroups}
                  onUpdateActualMetrics={handleUpdateActualMetrics}
                />;
      case View.Planning:
        return <GoalsView 
                  goals={goals} 
                  leads={leads} 
                  onUpdateGoals={handleUpdateGoals}
                  campaigns={campaigns}
                  campaignGroups={campaignGroups}
                  dateRange={dateRange}
                />;
      case View.Reporting:
        return <ReportingView 
                  leads={leads}
                  campaigns={campaigns}
                  campaignGroups={campaignGroups}
                  goals={goals}
                  actualMetrics={actualMetrics}
               />;
      default:
        return <DashboardView 
                  leads={leads} 
                  campaigns={campaigns} 
                  campaignGroups={campaignGroups} 
                  goals={goals} 
                  actualMetrics={actualMetrics}
                  onUpdateActualMetrics={handleUpdateActualMetrics}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />;
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
      <main className="flex-1 p-4 sm:p-6 overflow-auto pb-20">
        {renderView()}
      </main>
      <MobileNav currentView={currentView} setCurrentView={setCurrentView} />
      <AiAssistantBubble
          leads={leads}
          campaigns={campaigns}
          campaignGroups={campaignGroups}
          goals={goals}
          actualMetrics={actualMetrics}
          dateRange={dateRange}
          messages={aiMessages}
          setMessages={setAiMessages}
      />
    </div>
  );
};

export default App;