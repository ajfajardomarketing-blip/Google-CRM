

import React, { useMemo, useState } from 'react';
import { Lead, LeadStage, Campaign, CampaignGroup } from '../types';
import { ChevronUpIcon, ChevronDownIcon } from './icons';

interface CampaignGroupPerformanceChartProps {
  leads: Lead[];
  campaigns: Campaign[];
  campaignGroups: CampaignGroup[];
}

interface CampaignGroupPerformanceData {
  groupName: string;
  channel: string;
  leads: number;
  opportunities: number;
  conversions: number;
  revenue: number;
  budget: number | null;
  roas: number | null;
  cpl: number | null;
  cpa: number | null;
  leadToOppRate: number;
  oppToConvRate: number;
}

const CampaignGroupPerformanceChart: React.FC<CampaignGroupPerformanceChartProps> = ({ leads, campaigns, campaignGroups }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof CampaignGroupPerformanceData; direction: 'ascending' | 'descending' } | null>({ key: 'revenue', direction: 'descending' });
  
  const performanceData = useMemo<CampaignGroupPerformanceData[]>(() => {
    const paidChannels = ['Meta Ads', 'Google Ads', 'LinkedIn Ads'];

    const costByGroup: Record<string, number> = {};
    campaigns.forEach(campaign => {
        costByGroup[campaign.campaignGroupId] = (costByGroup[campaign.campaignGroupId] || 0) + campaign.cost;
    });

    const data = campaignGroups.map(group => {
      const groupLeads = leads.filter(lead => lead.campaignGroup === group.name);
      const leadCount = groupLeads.length;
      
      const opportunityCount = groupLeads.filter(
        lead => lead.stage === LeadStage.Opportunity || lead.stage === LeadStage.Conversion
      ).length;

      const conversionLeads = groupLeads.filter(
        lead => lead.stage === LeadStage.Conversion
      );
      const conversionCount = conversionLeads.length;
      
      const revenue = conversionLeads.reduce((sum, lead) => sum + (lead.dealValue || 0), 0);
      
      const totalCost = costByGroup[group.id] || 0;
      const isPaidChannel = paidChannels.includes(group.channel);
      
      const budget = isPaidChannel ? totalCost : null;
      const roas = isPaidChannel && totalCost > 0 ? revenue / totalCost : null;
      const cpl = isPaidChannel && leadCount > 0 ? totalCost / leadCount : null;
      const cpa = isPaidChannel && conversionCount > 0 ? totalCost / conversionCount : null;

      const leadToOppRate = leadCount > 0 ? (opportunityCount / leadCount) * 100 : 0;
      const oppToConvRate = opportunityCount > 0 ? (conversionCount / opportunityCount) * 100 : 0;

      return {
        groupName: group.name,
        channel: group.channel,
        leads: leadCount,
        opportunities: opportunityCount,
        conversions: conversionCount,
        revenue,
        budget,
        roas,
        cpl,
        cpa,
        leadToOppRate,
        oppToConvRate
      };
    });
    
    if (sortConfig !== null) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null) return 1;
        if (bValue === null) return -1;
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [leads, campaigns, campaignGroups, sortConfig]);

  const requestSort = (key: keyof CampaignGroupPerformanceData) => {
    let direction: 'ascending' | 'descending' = 'descending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: keyof CampaignGroupPerformanceData) => {
    if (sortConfig?.key !== key) {
        return <svg className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>;
    }
    if (sortConfig.direction === 'ascending') {
        return <ChevronUpIcon className="w-4 h-4" />;
    }
    return <ChevronDownIcon className="w-4 h-4" />;
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatRoas = (value: number | null) => {
    if (value === null) return '-';
    return `${value.toFixed(2)}x`;
  };

  const sortableColumns: { key: keyof CampaignGroupPerformanceData; label: string }[] = [
    { key: 'leads', label: 'Leads' },
    { key: 'opportunities', label: 'Opportunities' },
    { key: 'conversions', label: 'Conversions' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'budget', label: 'Budget' },
    { key: 'roas', label: 'ROAS' },
    { key: 'cpl', label: 'CPL' },
    { key: 'cpa', label: 'CPA' },
  ];

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-bold text-white">Campaign Group Performance</h2>
        <p className="text-gray-400 mt-1 text-sm">Performance effectiveness by campaign group.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-950">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campaign Group</th>
              {sortableColumns.map(({ key, label }) => (
                <th key={key} className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button onClick={() => requestSort(key)} className="flex items-center justify-end w-full group focus:outline-none">
                    {label}
                    <span className="ml-1">{getSortIcon(key)}</span>
                  </button>
                </th>
              ))}
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Lead → Opp %</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Opp → Conv %</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {performanceData.map(item => (
              <tr key={item.groupName} className="hover:bg-gray-700">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">{item.groupName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">{item.leads}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">{item.opportunities}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">{item.conversions}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-400 text-right font-semibold">
                  {formatCurrency(item.revenue)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">{formatCurrency(item.budget)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">{formatRoas(item.roas)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">{formatCurrency(item.cpl)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">{formatCurrency(item.cpa)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right font-medium">{item.leadToOppRate.toFixed(1)}%</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right font-medium">{item.oppToConvRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignGroupPerformanceChart;
