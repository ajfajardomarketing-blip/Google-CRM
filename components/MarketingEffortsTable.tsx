import React, { useMemo } from 'react';
import { GoalSettings, PlatformMetrics, Campaign, CampaignGroup } from '../types';
import { monthlyHeaders } from '../data/mockData';

interface MarketingEffortsTableProps {
    goals: GoalSettings;
    actualMetrics: PlatformMetrics[];
    campaigns: Campaign[];
    campaignGroups: CampaignGroup[];
}

const getProgressBar = (progress: number) => {
    const color = progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div className={color} style={{ width: `${Math.min(progress, 100)}%`, height: '100%', borderRadius: 'inherit' }}></div>
        </div>
    );
};

const MarketingEffortsTable: React.FC<MarketingEffortsTableProps> = ({ goals, actualMetrics, campaigns, campaignGroups }) => {
    const effortsData = useMemo(() => {
        if (!goals.efforts) return [];

        const currentMonthName = monthlyHeaders[new Date().getMonth()];

        const effortToMetricMap: { [key: string]: { [key: string]: { platform: string; metric: string; } } } = {
            'Facebook': { 'Posts': { platform: 'Facebook', metric: 'FB - Posts' } },
            'LinkedIn': { 'Posts': { platform: 'LinkedIn', metric: 'LN - Posts' } },
            'Email Marketing': {
                'Emails Sent': { platform: 'Email Marketing', metric: 'EM - Campaigns Sent' },
                'Newsletters': { platform: 'Email Marketing', metric: 'EM - Newsletters' }
            },
            'Website': { 'SEO Article Posts': { platform: 'Website', metric: 'Website - SEO Blog Posts' } }
        };

        const data: { channel: string; effort: string; actual: number; goal: number }[] = [];

        for (const channel in goals.efforts) {
            for (const effortName in goals.efforts[channel]) {
                const mapping = effortToMetricMap[channel]?.[effortName];
                if (mapping) {
                    const goal = goals.efforts[channel][effortName];

                    const platform = actualMetrics.find(p => p.name === mapping.platform);
                    const metric = platform?.metrics.find(m => m.name === mapping.metric);
                    const rawValue = metric?.data[currentMonthName];
                    const actual = (rawValue && rawValue !== '-') ? parseFloat(String(rawValue).replace(/,/g, '')) : 0;
                    
                    data.push({
                        channel,
                        effort: effortName,
                        actual,
                        goal,
                    });
                }
            }
        }
        return data;
    }, [goals, actualMetrics]);


    if (!effortsData || effortsData.length === 0) {
        return null; // Don't render the table if there are no effort goals set
    }

    return (
        <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4">
                <h2 className="text-xl font-bold text-white">Content Marketing Efforts</h2>
                <p className="text-gray-400 mt-1 text-sm">Tracking monthly activity goals against actual performance.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-950">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Effort</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Channel</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actual</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Goal</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">Progress</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {effortsData.map(item => {
                            const progress = item.goal > 0 ? (item.actual / item.goal) * 100 : 0;
                            return (
                                <tr key={`${item.channel}-${item.effort}`} className="hover:bg-gray-800">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">{item.effort}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{item.channel}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-white font-semibold">{item.actual.toLocaleString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-400">{item.goal.toLocaleString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full">
                                                {getProgressBar(progress)}
                                            </div>
                                            <span className="w-12 text-right text-sm font-medium text-gray-300">{progress.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MarketingEffortsTable;