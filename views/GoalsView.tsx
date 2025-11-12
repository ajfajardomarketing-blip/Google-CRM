
import React, { useState, useEffect, useMemo } from 'react';
import { GoalSettings, Lead, LeadStage } from '../types';
import { metricsData } from '../data/mockData';

interface GoalsViewProps {
  goals: GoalSettings;
  leads: Lead[];
  onUpdateGoals: (newGoals: GoalSettings) => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ goals, leads, onUpdateGoals }) => {
  const [localGoals, setLocalGoals] = useState(goals);
  const [activeTab, setActiveTab] = useState('Leads');

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);
  
  const currentLeadData = useMemo(() => {
    const totalLeads = leads.length;
    const opportunities = leads.filter(l => l.stage === LeadStage.Opportunity || l.stage === LeadStage.Conversion).length;
    const conversions = leads.filter(l => l.stage === LeadStage.Conversion).length;
    return { totalLeads, opportunities, conversions };
  }, [leads]);
  
  const handleLeadGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalGoals(prev => ({
      ...prev,
      leads: {
        ...prev.leads,
        [name]: value === '' ? 0 : parseInt(value, 10),
      },
    }));
  };
  
  const handleMetricGoalChange = (channelName: string, metricName: string, value: string) => {
    setLocalGoals(prev => ({
        ...prev,
        metrics: {
            ...prev.metrics,
            [channelName]: {
                ...prev.metrics[channelName],
                [metricName]: value === '' ? 0 : parseFloat(value),
            }
        }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoals(localGoals);
    // Optionally show a success message
  };

  const tabs = ['Leads', 'Channel Metrics'];

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold text-white">Goals Configuration</h1>
            <p className="text-gray-400 mt-1">Set your monthly targets to track performance.</p>
        </div>

        <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`${
                            activeTab === tab
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            {activeTab === 'Leads' && (
                <div className="space-y-4 max-w-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Lead Goals</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Total Leads Goal</label>
                        <input type="number" name="total" value={localGoals.leads.total} onChange={handleLeadGoalChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        <p className="text-xs text-gray-400 mt-1">Current: {currentLeadData.totalLeads}</p>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Opportunities Goal</label>
                        <input type="number" name="opportunities" value={localGoals.leads.opportunities} onChange={handleLeadGoalChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                         <p className="text-xs text-gray-400 mt-1">Current: {currentLeadData.opportunities}</p>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Conversions Goal</label>
                        <input type="number" name="conversions" value={localGoals.leads.conversions} onChange={handleLeadGoalChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        <p className="text-xs text-gray-400 mt-1">Current: {currentLeadData.conversions}</p>
                    </div>
                </div>
            )}
            
            {activeTab === 'Channel Metrics' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Channel Metric Goals</h2>
                    {metricsData.filter(p => p.name !== 'All Channels').map(platform => (
                        <details key={platform.name} className="bg-gray-900/50 p-4 rounded-lg">
                            <summary className="font-semibold text-lg text-gray-200 cursor-pointer">{platform.name}</summary>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {platform.metrics.map(metric => (
                                    <div key={metric.name}>
                                        <label className="block text-sm font-medium text-gray-400">{metric.name}</label>
                                        <input 
                                            type="number" 
                                            value={localGoals.metrics[platform.name]?.[metric.name] || ''}
                                            onChange={(e) => handleMetricGoalChange(platform.name, metric.name, e.target.value)} 
                                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                ))}
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </div>
        
        <div className="mt-6 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                Save All Goals
            </button>
        </div>
      </form>
    </div>
  );
};

export default GoalsView;
