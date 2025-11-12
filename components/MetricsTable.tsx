
import React from 'react';
import { PlatformMetrics, Metric, GoalSettings } from '../types';
import { StarIcon, TrendingDownIcon, TrendingUpIcon } from './icons';

interface MetricsTableProps {
  metricsData: PlatformMetrics[];
  weeklyHeaders: string[];
  goals: GoalSettings;
}

const MetricsTable: React.FC<MetricsTableProps> = ({ metricsData, weeklyHeaders, goals }) => {

    const getProgressBar = (progress: number) => {
        const color = progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500';
        return (
            <div className="w-full bg-gray-600 rounded-full h-2.5">
                <div className={color} style={{ width: `${Math.min(progress, 100)}%`, height: '100%', borderRadius: 'inherit' }}></div>
            </div>
        );
    }

    const renderMetricRow = (metric: Metric, platformName: string) => {
        const valueClassName = (() => {
            const baseClasses = 'px-6 py-3 whitespace-nowrap text-sm text-right';
            if (metric.isTrendingUp) {
                return `${baseClasses} text-green-400 font-semibold`;
            }
            if (metric.isTrendingDown) {
                return `${baseClasses} text-red-400 font-semibold`;
            }
            if (metric.isHighlighted) {
                return `${baseClasses} text-blue-400 font-semibold`;
            }
            return `${baseClasses} text-gray-300`;
        })();

        const goal = goals.metrics[platformName]?.[metric.name];
        const actualValueRaw = metric.data['August Actuals'];
        const actualValue = typeof actualValueRaw === 'string' 
            ? parseFloat(actualValueRaw.replace(/[^0-9.]/g, '')) 
            : actualValueRaw;

        const progress = (goal && actualValue) ? (actualValue / goal) * 100 : null;

        return (
            <tr key={metric.name} className={`${metric.isHighlighted ? 'bg-blue-900/50' : ''}`}>
                <td className={`px-6 py-3 whitespace-nowrap text-sm font-medium ${metric.isHighlighted ? 'text-blue-300' : 'text-gray-200'}`}>
                    <div className="flex items-center">
                        {metric.isStarred && <StarIcon className="w-4 h-4 text-yellow-400 mr-2" />}
                        {metric.isTrendingUp && <TrendingUpIcon className="w-4 h-4 text-green-500 mr-2" />}
                        {metric.isTrendingDown && <TrendingDownIcon className="w-4 h-4 text-red-500 mr-2" />}
                        {metric.name}
                    </div>
                </td>
                {weeklyHeaders.slice(0, -1).map(header => (
                    <td key={header} className={valueClassName}>
                        {metric.data[header] || '-'}
                    </td>
                ))}
                <td className={valueClassName}>{metric.data['August Actuals'] || '-'}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-300">
                    {goal ? goal.toLocaleString() : '-'}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-300">
                    {progress !== null ? (
                        <div className="flex items-center justify-end gap-2">
                            <span className="w-12 text-right">{progress.toFixed(0)}%</span>
                            <div className="w-24">
                                {getProgressBar(progress)}
                            </div>
                        </div>
                    ) : '-'}
                </td>
            </tr>
        );
    }

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6">
                <h2 className="text-xl font-bold text-white">Metrics by Channel</h2>
                <p className="text-gray-400 mt-1">Detailed performance metrics from your connected channels.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Metric</th>
                            {weeklyHeaders.slice(0, -1).map(header => (
                                <th key={header} className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{header}</th>
                            ))}
                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actuals</th>
                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Goal</th>
                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Progress</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800">
                        {metricsData.map((platform, platformIndex) => (
                            <React.Fragment key={platform.name}>
                                {platformIndex > 0 && (
                                    <tr>
                                        <td colSpan={weeklyHeaders.length + 3} className="py-2 bg-gray-900">
                                            <div className="px-6 font-semibold text-gray-300">{platform.name}</div>
                                        </td>
                                    </tr>
                                )}
                                {platform.metrics.map((metric) => renderMetricRow(metric, platform.name))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MetricsTable;
