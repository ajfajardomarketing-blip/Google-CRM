
import React, { useMemo, useState } from 'react';
import { Lead, LeadStage, FunnelStage, IntegrationStatus, Campaign, GoalSettings } from '../types';
import { metricsData, weeklyHeaders, historicalTrendsData, integrationsData } from '../data/mockData';
import KpiCard from '../components/KpiCard';
import MetricsTable from '../components/MetricsTable';
import FunnelOverview from '../components/FunnelOverview';
import HistoricalTrendsChart from '../components/HistoricalTrendsChart';
import LeadDetailPanel from '../components/LeadDetailPanel';
import { CrmIcon, CampaignsIcon, TrendingUpIcon, ArrowDownIcon, DollarIcon } from '../components/icons';
import ChannelPerformanceChart from '../components/ChannelPerformanceChart';

interface DashboardViewProps {
  leads: Lead[];
  campaigns: Campaign[];
  goals: GoalSettings;
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads, campaigns, goals }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedStage, setSelectedStage] = useState<string | null>(null);

    const connectedMetricsData = useMemo(() => {
        const connectedChannels = integrationsData
            .filter(integration => integration.status === IntegrationStatus.Connected)
            .map(integration => integration.name);
    
        // "Website" is often tracked via GA, but we'll treat it as a core metric source
        connectedChannels.push('Website'); 

        return metricsData.filter(platform =>
            platform.name === 'All Channels' || connectedChannels.includes(platform.name)
        );
    }, []);

    const aggregatedData = useMemo(() => {
        // --- KPI Cards Data ---
        const totalSpend = campaigns.reduce((acc, c) => acc + c.cost, 0);
        const convertedLeads = leads.filter(l => l.stage === LeadStage.Conversion);
        const totalRevenue = convertedLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);
        const totalLeads = leads.length;
        const totalRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
        
        const leadsGoalProgress = goals.leads.total > 0 ? (totalLeads / goals.leads.total) * 100 : 0;


        // --- Funnel Data ---
        const leadCount = leads.length;
        const leadValue = leads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

        const opportunityLeads = leads.filter(l => l.stage === LeadStage.Opportunity || l.stage === LeadStage.Conversion);
        const opportunityCount = opportunityLeads.length;
        const opportunityValue = opportunityLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);
        
        const conversionCount = convertedLeads.length;
        const conversionValue = convertedLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

        const discardedLeads = leads.filter(l => l.stage === LeadStage.Discarded);
        const discardedCount = discardedLeads.length;
        const discardedValue = discardedLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);
        
        const funnelStages: FunnelStage[] = [
            { name: 'Lead', value: leadCount, monetaryValue: leadValue, conversionRate: 100 },
            { name: 'Opportunity', value: opportunityCount, monetaryValue: opportunityValue, conversionRate: leadCount > 0 ? (opportunityCount / leadCount) * 100 : 0 },
            { name: 'Conversion', value: conversionCount, monetaryValue: conversionValue, conversionRate: opportunityCount > 0 ? (conversionCount / opportunityCount) * 100 : 0 },
            { name: 'Discarded', value: discardedCount, monetaryValue: discardedValue, conversionRate: leadCount > 0 ? (discardedCount / leadCount) * 100 : 0 },
        ];


        return {
            totalSpend,
            totalRevenue,
            totalLeads,
            totalRoas,
            cpl,
            funnelStages,
            leadsGoalProgress
        };
    }, [leads, campaigns, goals]);
    
    const handleStageClick = (stageName: string) => {
        setSelectedStage(stageName);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setSelectedStage(null);
    };
    
    const leadsForPanel = useMemo(() => {
        if (!selectedStage) return [];
        
        switch(selectedStage) {
            case 'Lead':
                return leads;
            case 'Opportunity':
                return leads.filter(l => l.stage === LeadStage.Opportunity || l.stage === LeadStage.Conversion);
            case 'Conversion':
                return leads.filter(l => l.stage === LeadStage.Conversion);
            case 'Discarded':
                return leads.filter(l => l.stage === LeadStage.Discarded);
            default:
                return [];
        }
    }, [selectedStage, leads]);


  return (
    <>
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Marketing Performance Dashboard</h1>
            <p className="text-gray-400 mt-1">A 360° view of your marketing efforts.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <KpiCard title="Total Spend" value={`$${aggregatedData.totalSpend.toLocaleString()}`} icon={<DollarIcon className="w-6 h-6 text-gray-500" />} />
            <KpiCard title="Total Revenue" value={`$${aggregatedData.totalRevenue.toLocaleString()}`} icon={<TrendingUpIcon className="w-6 h-6 text-gray-500" />} />
            <KpiCard title="Total ROAS" value={`${aggregatedData.totalRoas.toFixed(2)}x`} icon={<CampaignsIcon className="w-6 h-6 text-gray-500" />} />
            <KpiCard title="Total Leads" value={aggregatedData.totalLeads.toLocaleString()} icon={<CrmIcon className="w-6 h-6 text-gray-500" />} goalProgress={aggregatedData.leadsGoalProgress} />
            <KpiCard title="Avg. CPL" value={`$${aggregatedData.cpl.toFixed(2)}`} icon={<ArrowDownIcon className="w-6 h-6 text-gray-500" />} />
        </div>

        {/* Funnel and Historical Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <FunnelOverview funnelData={aggregatedData.funnelStages} onStageClick={handleStageClick} />
          </div>
          <div className="lg:col-span-2">
            <HistoricalTrendsChart data={historicalTrendsData} />
          </div>
        </div>

        {/* Channel Performance Table */}
        <ChannelPerformanceChart leads={leads} />

        {/* Metrics Table */}
        <MetricsTable metricsData={connectedMetricsData} weeklyHeaders={weeklyHeaders} goals={goals} />
    </div>
    <LeadDetailPanel 
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        stageName={selectedStage}
        leads={leadsForPanel}
    />
    </>
  );
};

export default DashboardView;
