
import React, { useState } from 'react';
import GenerateReportModal from '../components/GenerateReportModal';
import { Lead, Campaign, CampaignGroup, GoalSettings, PlatformMetrics } from '../types';

interface ReportingViewProps {
  leads: Lead[];
  campaigns: Campaign[];
  campaignGroups: CampaignGroup[];
  goals: GoalSettings;
  actualMetrics: PlatformMetrics[];
}

const ReportingView: React.FC<ReportingViewProps> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">AI-Powered Reporting</h1>
        <p className="text-base text-gray-400 mt-1">Generate strategic marketing reports and playbooks with Gemini.</p>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d356f8] to-[#8D4CDF] flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Your AI Marketing Strategist</h2>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Leverage the power of Gemini 2.5 Pro to analyze your unified data. Generate comprehensive reports, identify key trends, uncover insights, and get actionable recommendations to achieve your marketing goals.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-6 bg-[#d356f8] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300"
        >
          Generate Report with AI
        </button>
      </div>

      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        {...props}
      />
    </div>
  );
};

export default ReportingView;