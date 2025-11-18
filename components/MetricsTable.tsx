
import React, { useState, useEffect } from 'react';
import { PlatformMetrics, Metric, GoalSettings } from '../types';
import { EditIcon, CheckIcon, CloseIcon } from './icons';

interface MetricsTableProps {
  metricsData: PlatformMetrics[];
  headers: string[];
  goals: GoalSettings;
  onUpdateMetricsData: (newMetrics: PlatformMetrics[]) => void;
}

const MetricsTable: React.FC<MetricsTableProps> = ({ metricsData, headers, goals, onUpdateMetricsData }) => {
    const [localData, setLocalData] = useState<PlatformMetrics[]>([]);
    const [editingPlatformName, setEditingPlatformName] = useState<string | null>(null);

    useEffect(() => {
        setLocalData(JSON.parse(JSON.stringify(metricsData)));
    }, [metricsData]);

    const handleEditClick = (platformName: string) => {
        setEditingPlatformName(platformName);
    };

    const handleCancel = () => {
        setEditingPlatformName(null);
        // Revert any changes by resetting local state to the original prop data
        setLocalData(JSON.parse(JSON.stringify(metricsData)));
    };

    const handleSave = () => {
        onUpdateMetricsData(localData);
        setEditingPlatformName(null);
    };

    const handleInputChange = (platformIndex: number, metricIndex: number, header: string, value: string) => {
        const newData = JSON.parse(JSON.stringify(localData));
        newData[platformIndex].metrics[metricIndex].data[header] = value;
        setLocalData(newData);
    };

    const getProgressBar = (progress: number) => {
        const color = progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500';
        return (
            <div className="w-full bg-gray-600 rounded-full h-2">
                <div className={color} style={{ width: `${Math.min(progress, 100)}%`, height: '100%', borderRadius: 'inherit' }}></div>
            </div>
        );
    }

    const renderMetricRow = (metric: Metric, platformIndex: number, metricIndex: number) => {
        const platformName = localData[platformIndex].name;
        const isEditing = editingPlatformName === platformName;
        const goal = goals.metrics[platformName]?.[metric.name];

        let actualsKey: string | null = null;
        for (let i = headers.length - 1; i >= 0; i--) {
            const month = headers[i];
            const value = metric.data[month];
            if (value != null && value !== '-' && String(value).trim() !== '') {
                actualsKey = month;
                break;
            }
        }

        const actualValueRaw = actualsKey ? metric.data[actualsKey] : 0;
        const actualValue = typeof actualValueRaw === 'string' 
            ? parseFloat(actualValueRaw.replace(/[^0-9.]/g, '')) 
            : (actualValueRaw || 0);
            
        const progress = (goal && actualValue && !isNaN(actualValue)) ? (actualValue / goal) * 100 : null;

        return (
            <tr key={metric.name} className={`${metric.isHighlighted ? 'bg-indigo-900/50' : ''}`}>
                <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium max-w-xs truncate ${metric.isHighlighted ? 'text-indigo-300' : 'text-gray-200'}`}>
                    {metric.name}
                </td>
                
                {headers.map(header => (
                    <td key={header} className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                        {isEditing && metric.sourceType === 'Manual' ? (
                            <input
                                type="text"
                                value={metric.data[header] || ''}
                                onChange={(e) => handleInputChange(platformIndex, metricIndex, header, e.target.value)}
                                className="w-20 bg-gray-800 text-white text-right rounded-md border-transparent focus:outline-none focus:ring-2 focus:ring-[#d356f8] focus:bg-gray-700 transition"
                            />
                        ) : (
                            <span>{metric.data[header]}</span>
                        )}
                    </td>
                ))}
                
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {goal ? goal.toLocaleString() : '-'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {progress !== null ? (
                        <div className="flex items-center justify-end gap-2">
                            <span className="w-10 text-right text-sm">{progress.toFixed(0)}%</span>
                            <div className="w-20">
                                {getProgressBar(progress)}
                            </div>
                        </div>
                    ) : '-'}
                </td>
            </tr>
        );
    }

    return (
        <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4">
                <h2 className="text-xl font-bold text-white">Metrics by Channel</h2>
                <p className="text-sm text-gray-400 mt-1">Detailed performance metrics from your connected channels.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-950">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4 max-w-xs">Metric</th>
                            {headers.map(header => (
                                <th key={header} className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{header}</th>
                            ))}
                             <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Goal</th>
                             <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Progress</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900">
                        {localData.map((platform, platformIndex) => {
                            const isEditing = editingPlatformName === platform.name;
                            const isManual = platform.metrics.some(m => m.sourceType === 'Manual');

                            return (
                                <React.Fragment key={platform.name}>
                                    {platformIndex > 0 && (
                                        <tr>
                                            <td colSpan={headers.length + 3} className="py-1.5 bg-black">
                                                <div className="px-4 flex justify-between items-center">
                                                    <span className="font-semibold text-base text-gray-300">{platform.name}</span>
                                                    {isManual && (
                                                        isEditing ? (
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={handleSave} className="flex items-center gap-1 text-xs bg-green-500/20 text-green-300 font-semibold py-0.5 px-2 rounded-md hover:bg-green-500/40">
                                                                    <CheckIcon className="w-3 h-3" /> Save
                                                                </button>
                                                                <button onClick={handleCancel} className="flex items-center gap-1 text-xs bg-gray-600 text-gray-200 font-semibold py-0.5 px-2 rounded-md hover:bg-gray-500">
                                                                    <CloseIcon className="w-3 h-3" /> Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => handleEditClick(platform.name)} className="flex items-center gap-1 text-xs bg-gray-700 text-gray-200 font-semibold py-0.5 px-2 rounded-md hover:bg-gray-600">
                                                                <EditIcon className="w-3 h-3" /> Edit
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {platform.metrics.map((metric, metricIndex) => renderMetricRow(metric, platformIndex, metricIndex))}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MetricsTable;
