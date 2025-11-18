import React, { useState, useEffect } from 'react';
import { PlatformMetrics, Metric, GoalSettings } from '../types';
import { EditIcon, CheckIcon, CloseIcon } from './icons';
import { monthlyHeaders } from '../data/mockData';

interface OperationsMetricsTableProps {
  goals: GoalSettings;
  actualMetrics: PlatformMetrics[];
  onUpdateActualMetrics: (newMetrics: PlatformMetrics[]) => void;
}

interface FlatMetric extends Metric {
    label: string;
    platformName: string;
}

const operationalMetricsConfig = [
  { label: 'Linkedin Posts', platformName: 'LinkedIn', metricName: 'LN - Posts' },
  { label: 'Facebook Posts', platformName: 'Facebook', metricName: 'FB - Posts' },
  { label: 'Email Campaigns', platformName: 'Email Marketing', metricName: 'EM - Campaigns Sent' },
  { label: 'Newsletters', platformName: 'Email Marketing', metricName: 'EM - Newsletters' },
  { label: 'SEO Article Posts', platformName: 'Website', metricName: 'Website - SEO Blog Posts' },
];

const OperationsMetricsTable: React.FC<OperationsMetricsTableProps> = ({ goals, actualMetrics, onUpdateActualMetrics }) => {
    const [localMetrics, setLocalMetrics] = useState<FlatMetric[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    const hasManualMetrics = localMetrics.some(m => m.sourceType === 'Manual');

    const labelToEffortMap: { [label: string]: string } = {
        'Linkedin Posts': 'Posts',
        'Facebook Posts': 'Posts',
        'Email Campaigns': 'Emails Sent',
        'Newsletters': 'Newsletters',
        'SEO Article Posts': 'SEO Article Posts',
    };

    const populateLocalMetrics = (sourceMetrics: PlatformMetrics[]) => {
        const flatMetrics: FlatMetric[] = [];
        operationalMetricsConfig.forEach(config => {
            const platform = sourceMetrics.find(p => p.name === config.platformName);
            const metric = platform?.metrics.find(m => m.name === config.metricName);
            if (metric) {
                flatMetrics.push({
                    ...metric,
                    label: config.label,
                    platformName: config.platformName
                });
            }
        });
        setLocalMetrics(flatMetrics);
    };

    useEffect(() => {
        populateLocalMetrics(actualMetrics);
    }, [actualMetrics]);

    const handleCancel = () => {
        setIsEditing(false);
        populateLocalMetrics(actualMetrics); // Revert changes
    };

    const handleSave = () => {
        const updatedFullData = JSON.parse(JSON.stringify(actualMetrics));
        
        localMetrics.forEach(localMetric => {
            const platform = updatedFullData.find((p: PlatformMetrics) => p.name === localMetric.platformName);
            if (platform) {
                const metric = platform.metrics.find((m: Metric) => m.name === localMetric.name);
                if (metric) {
                    metric.data = localMetric.data;
                }
            }
        });

        onUpdateActualMetrics(updatedFullData);
        setIsEditing(false);
    };

    const handleInputChange = (metricName: string, header: string, value: string) => {
        const newMetrics = localMetrics.map(m => {
            if (m.name === metricName) {
                return { ...m, data: { ...m.data, [header]: value } };
            }
            return m;
        });
        setLocalMetrics(newMetrics);
    };
    
    if (localMetrics.length === 0) return null;

    return (
        <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Content Log</h2>
                    <p className="text-sm text-gray-400 mt-1">Monthly log of marketing activities. Edit manual entries to keep your historical data accurate.</p>
                </div>
                {hasManualMetrics && (
                     isEditing ? (
                        <div className="flex items-center gap-2">
                            <button onClick={handleSave} className="flex items-center gap-1 text-xs bg-green-500/20 text-green-300 font-semibold py-1 px-3 rounded-md hover:bg-green-500/40">
                                <CheckIcon className="w-3 h-3" /> Save
                            </button>
                            <button onClick={handleCancel} className="flex items-center gap-1 text-xs bg-gray-600 text-gray-200 font-semibold py-1 px-3 rounded-md hover:bg-gray-500">
                                <CloseIcon className="w-3 h-3" /> Cancel
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-sm bg-gray-700 text-gray-200 font-semibold py-1 px-3 rounded-md hover:bg-gray-600">
                            <EditIcon className="w-4 h-4" /> Edit Manual Entries
                        </button>
                    )
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-950">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4 max-w-xs">Activity</th>
                            {monthlyHeaders.map(header => (
                                <th key={header} className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-800">
                        {localMetrics.map((metric) => (
                            <tr key={metric.name}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-200">
                                    {metric.label}
                                </td>
                                {monthlyHeaders.map(header => {
                                    const effortName = labelToEffortMap[metric.label];
                                    const goal = effortName ? goals.efforts?.[metric.platformName]?.[effortName] : undefined;
                                    const rawValue = metric.data[header];
                                    const actualValue = (rawValue && rawValue !== '-') ? parseFloat(String(rawValue).replace(/,/g, '')) : null;

                                    let colorClass = 'text-gray-300';
                                    if (goal !== undefined && actualValue !== null && goal > 0) {
                                        const percentage = (actualValue / goal) * 100;
                                        if (percentage >= 100) {
                                            colorClass = 'text-green-400 font-semibold';
                                        } else if (percentage > 50) {
                                            colorClass = 'text-yellow-400 font-semibold';
                                        } else {
                                            colorClass = 'text-red-400 font-semibold';
                                        }
                                    }
                                    
                                    const displayValue = actualValue !== null ? actualValue : rawValue;

                                    return (
                                        <td key={header} className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                                            {isEditing && metric.sourceType === 'Manual' ? (
                                                <input
                                                    type="text"
                                                    value={rawValue || ''}
                                                    onChange={(e) => handleInputChange(metric.name, header, e.target.value)}
                                                    className="w-20 bg-gray-800 text-white text-right rounded-md border-transparent focus:outline-none focus:ring-2 focus:ring-[#d356f8] focus:bg-gray-700 transition"
                                                />
                                            ) : (
                                                <span className={colorClass}>{displayValue}</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OperationsMetricsTable;