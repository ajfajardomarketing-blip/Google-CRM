import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Lead, Campaign, CampaignGroup, GoalSettings, PlatformMetrics } from '../types';
import { CloseIcon } from './icons';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
import remarkGfm from 'https://esm.sh/remark-gfm@4';


interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  campaigns: Campaign[];
  campaignGroups: CampaignGroup[];
  goals: GoalSettings;
  actualMetrics: PlatformMetrics[];
}

const GenerateReportModal: React.FC<GenerateReportModalProps> = ({ isOpen, onClose, ...data }) => {
  const [period, setPeriod] = useState('Last 90 Days');
  const [sections, setSections] = useState({
    kpiAnalysis: true,
    funnelPerformance: true,
    channelBreakdown: true,
    nextSteps: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSections(prev => ({ ...prev, [name]: checked }));
  };

  const filterDataForPeriod = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const filteredLeads = data.leads.filter(lead => {
        const leadDate = new Date(lead.dateAdded);
        return leadDate >= startDate && leadDate <= endDate;
    });

    const filteredCampaigns = data.campaigns.filter(campaign => {
        const campaignStartDate = new Date(campaign.startDate);
        // Include campaigns that were active during the period
        return campaignStartDate <= endDate && (!campaign.endDate || new Date(campaign.endDate) >= startDate);
    });

    return { leads: filteredLeads, campaigns: filteredCampaigns };
  };

  const generatePrompt = () => {
    const periodDays = period === 'Last 30 Days' ? 30 : 90;
    const { leads, campaigns } = filterDataForPeriod(periodDays);

    const summary = {
        period: `${periodDays} days`,
        totalLeads: leads.length,
        totalCampaigns: campaigns.length,
        goals: data.goals,
        leadsData: leads.map(({ id, stageDates, ...rest }) => rest).slice(0, 50), // Sample of leads
        campaignsData: campaigns.map(({ id, ...rest }) => rest).slice(0, 50), // Sample of campaigns
        metricsData: data.actualMetrics, // Full metrics data is useful context
        includedSections: Object.entries(sections).filter(([, value]) => value).map(([key]) => key),
    };

    const prompt = `
      You are a world-class Marketing Strategist AI famialiar with all the data provided. Your task is to analyze the following marketing data and generate a comprehensive, insightful report.

      **CONTEXT:**
      The data provided covers the last ${summary.period}. Here is a summary of the data you need to analyze:
      - **Overall Goals:** ${JSON.stringify(summary.goals, null, 2)}
      - **Leads Generated in Period (${summary.totalLeads} total):** ${JSON.stringify(summary.leadsData, null, 2)}
      - **Campaigns Active in Period (${summary.totalCampaigns} total):** ${JSON.stringify(summary.campaignsData, null, 2)}
      - **Historical Metrics Data (All Time):** ${JSON.stringify(summary.metricsData, null, 2)}

      **TASK:**
      Generate a marketing report using Markdown formatting. The report should include the following sections based on user selection: ${summary.includedSections.join(', ')}.

      **SECTION GUIDELINES:**
      ${summary.includedSections.includes('kpiAnalysis') ? `
      - **KPI Analysis:** Review the key performance indicators. Compare current performance against goals where applicable. Highlight significant trends, wins, and areas for concern. Use the historical data to provide context on trends.
      ` : ''}
      ${summary.includedSections.includes('funnelPerformance') ? `
      - **Funnel Performance:** Analyze the lead funnel (Lead -> Qualified -> Opportunity -> Conversion). Calculate and discuss conversion rates between stages. Identify potential bottlenecks or drop-off points.
      ` : ''}
      ${summary.includedSections.includes('channelBreakdown') ? `
      - **Channel & Campaign Breakdown:** Evaluate the performance of different marketing channels and specific campaign groups. Which channels are driving the most leads and revenue? What is the ROAS for paid channels? Identify top and bottom-performing campaigns.
      ` : ''}
      ${summary.includedSections.includes('nextSteps') ? `
      - **Next Steps & Strategic Recommendations:** Based on your analysis, provide a clear, actionable playbook. Suggest specific next steps, new ideas, or experiments to capitalize on successes and address weaknesses. Your recommendations should be concrete and aimed at achieving the company's overall goals. Be creative and think like a true strategist.
      ` : ''}

      **FORMATTING:**
      - Use Markdown for clear formatting (headings, bold text, lists, etc.).
      - Be insightful, concise, and professional.
      - Back up your claims with data points from the provided context.
    `;

    return prompt;
  };


  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError('');
    setReport('');

    try {
      // FIX: Replaced process.env.API_KEY with a placeholder to prevent app from crashing.
      // A valid API key must be provided for this feature to work.
      const ai = new GoogleGenAI({ apiKey: 'AIzaSy...PLACEHOLDER' });
      const prompt = generatePrompt();

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setReport(response.text);

    } catch (e) {
      console.error(e);
      setError('An error occurred while generating the report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    // Reset state on close
    setReport('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start sm:items-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[95vh] mt-8 sm:mt-0">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Generate AI Marketing Report</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6">
            {!report && !isLoading && !error && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white">1. Select Analysis Period</h3>
                        <div className="mt-2 flex gap-2">
                           {['Last 30 Days', 'Last 90 Days'].map(p => (
                                <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${period === p ? 'bg-[#d356f8] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                    {p}
                                </button>
                           ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">2. Choose Report Sections</h3>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-3 bg-gray-800 p-3 rounded-md">
                                <input type="checkbox" name="kpiAnalysis" checked={sections.kpiAnalysis} onChange={handleCheckboxChange} className="h-4 w-4 text-[#d356f8] bg-gray-700 border-gray-600 rounded focus:ring-[#d356f8]" />
                                <span className="text-base text-gray-300">KPI Analysis</span>
                            </label>
                            <label className="flex items-center space-x-3 bg-gray-800 p-3 rounded-md">
                                <input type="checkbox" name="funnelPerformance" checked={sections.funnelPerformance} onChange={handleCheckboxChange} className="h-4 w-4 text-[#d356f8] bg-gray-700 border-gray-600 rounded focus:ring-[#d356f8]" />
                                <span className="text-base text-gray-300">Funnel Performance</span>
                            </label>
                            <label className="flex items-center space-x-3 bg-gray-800 p-3 rounded-md">
                                <input type="checkbox" name="channelBreakdown" checked={sections.channelBreakdown} onChange={handleCheckboxChange} className="h-4 w-4 text-[#d356f8] bg-gray-700 border-gray-600 rounded focus:ring-[#d356f8]" />
                                <span className="text-base text-gray-300">Channel Breakdown</span>
                            </label>
                            <label className="flex items-center space-x-3 bg-gray-800 p-3 rounded-md">
                                <input type="checkbox" name="nextSteps" checked={sections.nextSteps} onChange={handleCheckboxChange} className="h-4 w-4 text-[#d356f8] bg-gray-700 border-gray-600 rounded focus:ring-[#d356f8]" />
                                <span className="text-base text-gray-300">Next Steps & Recommendations</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
            
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 border-4 border-t-[#d356f8] border-gray-700 rounded-full animate-spin"></div>
                    <h3 className="mt-4 text-xl font-semibold text-white">Analyzing Your Data...</h3>
                    <p className="text-gray-400">Gemini is generating your strategic report. This may take a moment.</p>
                </div>
            )}

            {error && (
                <div className="text-center p-4 bg-red-900/50 text-red-300 rounded-md">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {report && (
                <div className="prose prose-invert prose-headings:text-white prose-a:text-[#e9a7fb] max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
                </div>
            )}
        </div>

        <div className="bg-black px-6 py-4 flex justify-end gap-3 flex-shrink-0">
            <button type="button" onClick={handleClose} className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
                Close
            </button>
            {!report && (
                <button 
                    type="button" 
                    onClick={handleGenerateReport} 
                    disabled={isLoading || Object.values(sections).every(v => !v)}
                    className="bg-[#d356f8] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating...' : 'Generate Report'}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default GenerateReportModal;