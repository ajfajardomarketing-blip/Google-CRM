

import React from 'react';
import { GoalSettings, PlatformMetrics, Campaign, CampaignGroup } from '../types';
import MarketingEffortsTable from '../components/MarketingEffortsTable';
import OperationsMetricsTable from '../components/OperationsMetricsTable';

interface OperationsViewProps {
    goals: GoalSettings;
    actualMetrics: PlatformMetrics[];
    campaigns: Campaign[];
    campaignGroups: CampaignGroup[];
    onUpdateActualMetrics: (newMetrics: PlatformMetrics[]) => void;
}

const OperationsView: React.FC<OperationsViewProps> = ({ goals, actualMetrics, campaigns, campaignGroups, onUpdateActualMetrics }) => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Operations Dashboard</h1>
                <p className="text-base text-gray-400 mt-1">Track your team's monthly activities and historical performance.</p>
            </div>

            <MarketingEffortsTable
                goals={goals}
                actualMetrics={actualMetrics}
                campaigns={campaigns}
                campaignGroups={campaignGroups}
            />

            <OperationsMetricsTable
                goals={goals}
                actualMetrics={actualMetrics}
                onUpdateActualMetrics={onUpdateActualMetrics}
            />
            
        </div>
    );
};

export default OperationsView;