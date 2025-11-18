
import React, { useMemo } from 'react';
import { GoalSettings, PlatformMetrics } from '../types';
import { monthlyHeaders } from '../data/mockData';

// Donut chart sub-component
const DonutChart: React.FC<{ label: string; actual: number; goal: number; }> = ({ label, actual, goal }) => {
    const percentage = goal > 0 ? (actual / goal) * 100 : 0;
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    let progressColor = 'stroke-red-500';
    if (percentage >= 80) {
        progressColor = 'stroke-green-400';
    } else if (percentage >= 50) {
        progressColor = 'stroke-yellow-400';
    }
    
    return (
        <div className="flex flex-col items-center justify-center text-center p-2 relative group bg-gray-800/50 rounded-lg">
            <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                        className="stroke-current text-gray-700"
                        cx="50"
                        cy="50"
                        r={radius}
                        strokeWidth="10"
                        fill="transparent"
                    />
                    <circle
                        className={`stroke-current ${progressColor} transition-all duration-500 ease-in-out`}
                        cx="50"
                        cy="50"
                        r={radius}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{actual}</span>
                </div>
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-300 truncate w-full">{label}</p>
             <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-center text-sm text-white bg-black rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 left-1/2 -translate-x-1/2">
                Actual: {actual.toLocaleString()} / Goal: {goal.toLocaleString()}
            </div>
        </div>
    );
};


interface MarketingEffortsChartsProps {
    goals: GoalSettings;
    actualMetrics: PlatformMetrics[];
}

const MarketingEffortsCharts: React.FC<MarketingEffortsChartsProps> = ({ goals, actualMetrics }) => {
    const effortsData = useMemo(() => {
        const currentMonthName = monthlyHeaders[new Date().getMonth()];

        const getMetricData = (platformName: string, metricName: string, effortName: string) => {
             const goal = goals.efforts?.[platformName]?.[effortName] || 0;
             const platform = actualMetrics.find(p => p.name === platformName);
             const metric = platform?.metrics.find(m => m.name === metricName);
             const rawValue = metric?.data[currentMonthName];
             const actual = (rawValue && rawValue !== '-') ? parseFloat(String(rawValue).replace(/,/g, '')) : 0;
             return { goal, actual };
        };
        
        const lnPosts = getMetricData('LinkedIn', 'LN - Posts', 'Posts');
        const fbPosts = getMetricData('Facebook', 'FB - Posts', 'Posts');
        const emCampaigns = getMetricData('Email Marketing', 'EM - Campaigns Sent', 'Emails Sent');
        const emNewsletters = getMetricData('Email Marketing', 'EM - Newsletters', 'Newsletters');
        const websitePosts = getMetricData('Website', 'Website - SEO Blog Posts', 'SEO Article Posts');

        return [
            { label: 'Linkedin Posts', ...lnPosts },
            { label: 'Facebook Posts', ...fbPosts },
            { label: 'Email Campaigns', ...emCampaigns },
            { label: 'Newsletters', ...emNewsletters },
            { label: 'SEO Articles', ...websitePosts },
        ];
    }, [goals, actualMetrics]);

    const hasGoals = effortsData.some(e => e.goal > 0);

    if (!hasGoals) {
        return null;
    }

    // Filter out items that don't have a goal set
    const chartsToDisplay = effortsData.filter(e => e.goal > 0);

    if (chartsToDisplay.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-200">Content Marketing Efforts</h2>
            <p className="text-sm text-gray-400">Current month's progress towards your content and activity goals.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
                {chartsToDisplay.map(effort => (
                    <DonutChart key={effort.label} label={effort.label} actual={effort.actual} goal={effort.goal} />
                ))}
            </div>
        </div>
    );
};

export default MarketingEffortsCharts;