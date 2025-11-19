
import React, { useState, useEffect, useMemo } from 'react';
import { GoalSettings, Lead, LeadStage, CalculatorInputs, Campaign, CampaignGroup } from '../types';
import { metricsData } from '../data/mockData';
import GoalsCalculator from '../components/GoalsCalculator';
import GoalsExpenses from '../components/GoalsExpenses';

interface GoalsViewProps {
  goals: GoalSettings;
  leads: Lead[];
  onUpdateGoals: (newGoals: GoalSettings) => void;
  campaigns: Campaign[];
  campaignGroups: CampaignGroup[];
  dateRange: string | { start: Date; end: Date };
}

const marketingEffortsConfig = {
    'Facebook': ['Posts'],
    'LinkedIn': ['Posts'],
    'Email Marketing': ['Emails Sent', 'Newsletters'],
    'Website': ['SEO Article Posts']
};

const effortMetricsToExclude = ['LN - Posts', 'FB - Posts'];

const GoalsView: React.FC<GoalsViewProps> = ({ goals, leads, onUpdateGoals, campaigns, campaignGroups, dateRange }) => {
  const [localGoals, setLocalGoals] = useState<GoalSettings>(goals);
  const [activeTab, setActiveTab] = useState('Calculator');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const defaultCalculatorInputs: CalculatorInputs = {
    totalSalesGoal: 1500000,
    marketingContribution: 60,
    avgTicket: 843,
    oppToCustomerRate: 40,
    leadToOppRate: 62.5,
    avgCpl: 470,
  };
  
  // Memoize stringified versions of props and state for reliable change detection.
  // This solves issues where object references might not change, but content does.
  const goalsString = useMemo(() => JSON.stringify(goals), [goals]);
  const localGoalsString = useMemo(() => JSON.stringify(localGoals), [localGoals]);
  
  // When the 'goals' prop changes from Firestore, update the local state.
  useEffect(() => {
    setLocalGoals(JSON.parse(goalsString));
  }, [goalsString]);
  
  // Detect if there are unsaved changes by comparing the stringified versions.
  useEffect(() => {
    setHasChanges(goalsString !== localGoalsString);
  }, [localGoalsString, goalsString]);
  
  const currentLeadData = useMemo(() => {
    const totalLeads = leads.length;
    const qualified = leads.filter(l => l.stage === LeadStage.Qualified || l.stage === LeadStage.Opportunity || l.stage === LeadStage.Conversion).length;
    const opportunities = leads.filter(l => l.stage === LeadStage.Opportunity || l.stage === LeadStage.Conversion).length;
    const conversions = leads.filter(l => l.stage === LeadStage.Conversion).length;
    return { totalLeads, qualified, opportunities, conversions };
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
                ...(prev.metrics ? prev.metrics[channelName] : {}),
                [metricName]: value === '' ? 0 : parseFloat(value),
            }
        }
    }));
  };
  
  const handleEffortGoalChange = (channelName: string, effortName: string, value: string) => {
    setLocalGoals(prev => ({
        ...prev,
        efforts: {
            ...prev.efforts,
            [channelName]: {
                ...(prev.efforts ? prev.efforts[channelName] : {}),
                [effortName]: value === '' ? 0 : parseInt(value, 10),
            }
        }
    }));
  };

  const handleCalculatorChange = (newCalculatorInputs: CalculatorInputs) => {
    setLocalGoals(prev => ({
        ...prev,
        calculatorInputs: newCalculatorInputs
    }));
  };

  const handleExpensesChange = (newExpenses: GoalSettings['expenses']) => {
    setLocalGoals(prev => ({
        ...prev,
        expenses: newExpenses
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateGoals(localGoals);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000); // Hide message after 3 seconds
  };

  const tabs = ['Calculator', 'Expenses', 'Leads', 'Efforts', 'Channel Metrics'];

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-4xl font-bold text-white">Planning</h1>
            <p className="text-lg text-gray-400 mt-1">Plan your budget, forecast goals, and set monthly targets.</p>
        </div>
      
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-700 mb-6 gap-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                ? 'border-[#d356f8] text-[#e9a7fb]'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
                <div className="flex items-center gap-4 self-end sm:self-center pb-2 sm:pb-0">
                    {showSuccessMessage && (
                        <span className="text-green-400 font-semibold transition-opacity duration-300">
                            Inputs saved successfully!
                        </span>
                    )}
                    <button 
                        type="submit"
                        disabled={!hasChanges}
                        className="bg-[#d356f8] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {activeTab === 'Calculator' && (
                <GoalsCalculator 
                    inputs={localGoals.calculatorInputs || defaultCalculatorInputs} 
                    onInputsChange={handleCalculatorChange} 
                />
            )}

            {activeTab === 'Expenses' && (
                <GoalsExpenses 
                    expenses={localGoals.expenses || { salaries: [], tools: [], variable: [] }}
                    onExpensesChange={handleExpensesChange}
                    campaigns={campaigns}
                    campaignGroups={campaignGroups}
                    dateRange={dateRange}
                />
            )}

            {(activeTab === 'Leads' || activeTab === 'Channel Metrics' || activeTab === 'Efforts') && (
                <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                    {activeTab === 'Leads' && (
                        <div className="space-y-4 max-w-lg">
                            <h2 className="text-2xl font-bold text-white mb-4">Lead Goals</h2>
                            <div>
                                <label className="block text-base font-medium text-gray-300">Total Leads Goal</label>
                                <input type="number" name="total" value={localGoals.leads?.total || 0} onChange={handleLeadGoalChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
                                <p className="text-sm text-gray-400 mt-1">Current: {currentLeadData.totalLeads}</p>
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-300">Qualified Leads Goal</label>
                                <input type="number" name="qualified" value={localGoals.leads?.qualified || 0} onChange={handleLeadGoalChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
                                <p className="text-sm text-gray-400 mt-1">Current: {currentLeadData.qualified}</p>
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-300">Opportunities Goal</label>
                                <input type="number" name="opportunities" value={localGoals.leads?.opportunities || 0} onChange={handleLeadGoalChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
                                <p className="text-sm text-gray-400 mt-1">Current: {currentLeadData.opportunities}</p>
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-300">Conversions Goal</label>
                                <input type="number" name="conversions" value={localGoals.leads?.conversions || 0} onChange={handleLeadGoalChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
                                <p className="text-sm text-gray-400 mt-1">Current: {currentLeadData.conversions}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Efforts' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Content Marketing Efforts Goals</h2>
                            <p className="text-gray-400 -mt-4">Set monthly goals for your marketing activities.</p>
                            {Object.entries(marketingEffortsConfig).map(([channel, efforts]) => (
                                <details key={channel} className="bg-black/50 p-4 rounded-lg" open>
                                    <summary className="font-semibold text-xl text-gray-200 cursor-pointer">{channel}</summary>
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {efforts.map(effortName => (
                                            <div key={effortName}>
                                                <label className="block text-base font-medium text-gray-400">{effortName}</label>
                                                <input 
                                                    type="number" 
                                                    value={localGoals.efforts?.[channel]?.[effortName] || ''}
                                                    onChange={(e) => handleEffortGoalChange(channel, effortName, e.target.value)} 
                                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]"
                                                    placeholder="e.g., 20"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>
                    )}
                    
                    {activeTab === 'Channel Metrics' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Channel Metric Goals</h2>
                            {metricsData.filter(p => p.name !== 'All Channels').map(platform => (
                                <details key={platform.name} className="bg-black/50 p-4 rounded-lg">
                                    <summary className="font-semibold text-xl text-gray-200 cursor-pointer">{platform.name}</summary>
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {platform.metrics.filter(metric => !effortMetricsToExclude.includes(metric.name)).map(metric => (
                                            <div key={metric.name}>
                                                <label className="block text-base font-medium text-gray-400">{metric.name}</label>
                                                <input 
                                                    type="number" 
                                                    value={localGoals.metrics?.[platform.name]?.[metric.name] || ''}
                                                    onChange={(e) => handleMetricGoalChange(platform.name, metric.name, e.target.value)} 
                                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </form>
    </div>
  );
};

export default GoalsView;