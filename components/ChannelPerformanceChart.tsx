
import React, { useMemo } from 'react';
import { Lead, LeadStage } from '../types';

interface ChannelPerformanceChartProps {
  leads: Lead[];
}

interface ChannelPerformanceData {
  channel: string;
  leads: number;
  opportunities: number;
  conversions: number;
  leadToOppRate: number;
  oppToConvRate: number;
}

const ChannelPerformanceChart: React.FC<ChannelPerformanceChartProps> = ({ leads }) => {
  const performanceData = useMemo<ChannelPerformanceData[]>(() => {
    const channels = [...new Set(leads.map(lead => lead.channel))];

    const data = channels.map(channel => {
      const channelLeads = leads.filter(lead => lead.channel === channel);
      const leadCount = channelLeads.length;
      
      const opportunityCount = channelLeads.filter(
        lead => lead.stage === LeadStage.Opportunity || lead.stage === LeadStage.Conversion
      ).length;

      const conversionCount = channelLeads.filter(
        lead => lead.stage === LeadStage.Conversion
      ).length;

      const leadToOppRate = leadCount > 0 ? (opportunityCount / leadCount) * 100 : 0;
      const oppToConvRate = opportunityCount > 0 ? (conversionCount / opportunityCount) * 100 : 0;

      return {
        channel,
        leads: leadCount,
        opportunities: opportunityCount,
        conversions: conversionCount,
        leadToOppRate,
        oppToConvRate
      };
    });

    // Sort by total leads descending
    return data.sort((a, b) => b.leads - a.leads);
  }, [leads]);

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-white">Channel Performance</h2>
        <p className="text-gray-400 mt-1 text-base">Lead generation and conversion effectiveness by channel.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-950">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">Channel</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Leads</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Opportunities</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Conversions</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Lead → Opp %</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Opp → Conv %</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {performanceData.map(item => (
              <tr key={item.channel} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-200">{item.channel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-300 text-right">{item.leads}</td>
                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-300 text-right">{item.opportunities}</td>
                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-300 text-right">{item.conversions}</td>
                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-300 text-right font-medium">{item.leadToOppRate.toFixed(1)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-300 text-right font-medium">{item.oppToConvRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChannelPerformanceChart;
