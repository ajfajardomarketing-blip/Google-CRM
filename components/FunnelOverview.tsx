
import React from 'react';
import { FunnelStage } from '../types';

interface FunnelOverviewProps {
  funnelData: FunnelStage[];
  onStageClick: (stageName: string) => void;
}

const FunnelOverview: React.FC<FunnelOverviewProps> = ({ funnelData, onStageClick }) => {
    const stageColors = ['bg-[#d356f8]', 'bg-indigo-500', 'bg-sky-500', 'bg-teal-500'];
    const funnelStages = funnelData.filter(stage => stage.name !== 'Discarded');
    const totalValue = funnelStages.length > 0 ? funnelStages[0].value : 1;

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg h-full flex flex-col">
        <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Leads Funnel</h2>
            <p className="text-gray-400 mt-1 text-sm">An overview of your lead conversion process.</p>
        </div>
        <div className="flex flex-1">
            {/* Left side: Funnel Visualization */}
            <div className="w-1/2 p-4 flex flex-col items-center justify-center space-y-2">
                {funnelStages.map((stage, index) => {
                    const widthPercentage = totalValue > 0 ? (stage.value / totalValue) * 80 : 0; // Use 80% of width for better visuals
                    return(
                    <div 
                        key={stage.name} 
                        className="w-full flex flex-col items-center cursor-pointer group"
                        onClick={() => onStageClick(stage.name)}
                    >
                        <div 
                            className={`h-8 rounded-md flex items-center justify-center text-white font-bold text-sm transition-opacity group-hover:opacity-80 ${stageColors[index % stageColors.length]}`}
                            style={{ width: `${Math.max(widthPercentage, 25)}%` }}
                        >
                            {stage.value}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 transition-colors group-hover:text-[#e9a7fb]">{stage.name}</p>
                    </div>
                )})}
            </div>
            {/* Right side: Funnel Details */}
            <div className="w-1/2 border-l border-gray-700">
                <div className="p-2 space-y-1 h-full flex flex-col justify-center">
                    {funnelData.map((stage, index) => (
                        <div 
                            key={stage.name}
                            className={`p-2 cursor-pointer transition-colors ${index === 0 ? 'bg-gray-700/50 rounded-md' : 'hover:bg-gray-700/50 rounded-md'}`}
                            onClick={() => onStageClick(stage.name)}
                        >
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-semibold text-gray-200">{stage.name}</p>
                                <p className="text-sm font-medium text-gray-300">{stage.value.toLocaleString()}</p>
                            </div>
                            <div className="mt-1">
                                {(stage.name === 'Opportunity' || stage.name === 'Conversion') && (
                                <p className="text-xs text-gray-400">
                                    Value: ${stage.monetaryValue.toLocaleString()}
                                </p>
                                )}
                                {stage.name !== 'Lead' && stage.name !== 'Discarded' && (
                                    <p className="text-xs text-green-400 font-semibold">
                                        {stage.conversionRate.toFixed(1)}% Conv.
                                    </p>
                                )}
                                {stage.name === 'Discarded' && (
                                    <p className="text-xs text-red-400 font-semibold">
                                        {stage.conversionRate.toFixed(1)}% Lost
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default FunnelOverview;
