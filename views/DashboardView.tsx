











import React, { useMemo, useState } from 'react';
import { Lead, LeadStage, FunnelStage, Campaign, GoalSettings, HistoricalTrend, CampaignGroup, MetricData, PlatformMetrics, Metric, FixedExpense, VariableExpense } from '../types';
import { monthlyHeaders } from '../data/mockData';
import KpiCard from '../components/KpiCard';
import MetricsTable from '../components/MetricsTable';
import FunnelOverview from '../components/FunnelOverview';
import HistoricalTrendsChart from '../components/HistoricalTrendsChart';
import LeadDetailPanel from '../components/LeadDetailPanel';
import { CrmIcon, CampaignsIcon, TrendingUpIcon, ArrowDownIcon, DollarIcon, CloseIcon, InfoIcon, ChevronDownIcon } from '../components/icons';
import ChannelPerformanceChart from '../components/ChannelPerformanceChart';
import CampaignGroupPerformanceChart from '../components/CampaignGroupPerformanceChart';
import DateRangeFilter from '../components/DateRangeFilter';
import MarketingEffortsCharts from '../components/MarketingEffortsCharts';

interface DashboardViewProps {
  leads: Lead[];
  campaigns: Campaign[];
  campaignGroups: CampaignGroup[];
  goals: GoalSettings;
  actualMetrics: PlatformMetrics[];
  onUpdateActualMetrics: (newMetrics: PlatformMetrics[]) => void;
  dateRange: string | { start: Date; end: Date };
  onDateRangeChange: (range: string | { start: Date; end: Date }) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ leads, campaigns, campaignGroups, goals, actualMetrics, onUpdateActualMetrics, dateRange, onDateRangeChange }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedStage, setSelectedStage] = useState<string | null>(null);
    const [isProfitDetailOpen, setIsProfitDetailOpen] = useState(false);

    const calculatedMetricsData = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
        // Operate on a deep copy of the state to avoid direct mutation.
        const newMetricsData = JSON.parse(JSON.stringify(actualMetrics));
    
        // --- Calculate revenue per campaign from leads (used for ROAS) ---
        const campaignRevenueMap = new Map<string, number>();
        const convertedLeads = leads.filter(l => l.stage === LeadStage.Conversion && l.dealValue);
        const groupNameMap = new Map(campaignGroups.map(g => [g.id, g.name]));
        const campaignLookup = new Map<string, string>();
        campaigns.forEach(campaign => {
            const groupName = groupNameMap.get(campaign.campaignGroupId);
            if(groupName) {
                campaignLookup.set(`${groupName}|${campaign.name}`, campaign.id);
            }
        });
        convertedLeads.forEach(lead => {
            const campaignId = campaignLookup.get(`${lead.campaignGroup}|${lead.campaign}`);
            if (campaignId) {
                campaignRevenueMap.set(campaignId, (campaignRevenueMap.get(campaignId) || 0) + lead.dealValue!);
            }
        });

        // --- Email Marketing Automation ---
        const emailMarketingGroupIds = campaignGroups.filter(g => g.channel === 'Email Marketing').map(g => g.id);
        const completedEmailCampaigns = campaigns.filter(c => c.status === 'Completed' && emailMarketingGroupIds.includes(c.campaignGroupId) && c.endDate);
        const monthlyEmailAggregates: { [month: string]: { sent: number; delivered: number; opens: number; clicks: number, campaignsSent: number } } = {};
        monthlyHeaders.forEach(month => {
            monthlyEmailAggregates[month] = { sent: 0, delivered: 0, opens: 0, clicks: 0, campaignsSent: 0 };
        });
        completedEmailCampaigns.forEach(campaign => {
            const endDate = new Date(campaign.endDate!);
            const monthName = monthNames[endDate.getMonth()];
            if (monthlyEmailAggregates[monthName]) {
                monthlyEmailAggregates[monthName].sent += campaign.sent || 0;
                monthlyEmailAggregates[monthName].delivered += campaign.delivered || 0;
                monthlyEmailAggregates[monthName].opens += campaign.opens || 0;
                monthlyEmailAggregates[monthName].clicks += campaign.clicks || 0;
                monthlyEmailAggregates[monthName].campaignsSent += 1;
            }
        });

        const emailPlatform = newMetricsData.find((p: PlatformMetrics) => p.name === 'Email Marketing');
        if (emailPlatform) {
            emailPlatform.metrics.forEach((metric: Metric) => {
                const newMetricData: MetricData = {};
                for (const month of monthlyHeaders) {
                    const aggregates = monthlyEmailAggregates[month];
                    switch (metric.name) {
                        case 'EM - Campaigns Sent': newMetricData[month] = aggregates.campaignsSent > 0 ? aggregates.campaignsSent.toLocaleString() : '-'; break;
                        case 'EM - Emails Delivered': newMetricData[month] = aggregates.delivered > 0 ? aggregates.delivered.toLocaleString() : '-'; break;
                        case 'EM - Emails Opened': newMetricData[month] = aggregates.opens > 0 ? aggregates.opens.toLocaleString() : '-'; break;
                        case 'EM - Open Rate': const openRate = aggregates.delivered > 0 ? (aggregates.opens / aggregates.delivered) * 100 : 0; newMetricData[month] = aggregates.delivered > 0 ? `${openRate.toFixed(1)}%` : '-'; break;
                        case 'EM - Click Rate': const clickRate = aggregates.delivered > 0 ? (aggregates.clicks / aggregates.delivered) * 100 : 0; newMetricData[month] = aggregates.delivered > 0 ? `${clickRate.toFixed(1)}%` : '-'; break;
                        default: newMetricData[month] = metric.data[month] || '-'; break;
                    }
                }
                metric.data = newMetricData;
            });
        }

        // --- Ads Channels Automation (Meta & Google) ---
        const adsChannels = ['Meta Ads', 'Google Ads'];
        const monthlyAdsAggregates: { [channel: string]: { [month: string]: { spend: number, impressions: number, clicks: number, conversions: number, revenue: number } } } = {};
        adsChannels.forEach(channel => {
            monthlyAdsAggregates[channel] = {};
            monthlyHeaders.forEach(month => {
                monthlyAdsAggregates[channel][month] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 };
            });
            const groupIds = campaignGroups.filter(g => g.channel === channel).map(g => g.id);
            const channelCampaigns = campaigns.filter(c => c.status === 'Completed' && groupIds.includes(c.campaignGroupId) && c.endDate);
            channelCampaigns.forEach(campaign => {
                const endDate = new Date(campaign.endDate!);
                const monthName = monthNames[endDate.getMonth()];
                if (monthlyAdsAggregates[channel][monthName]) {
                    const aggregates = monthlyAdsAggregates[channel][monthName];
                    aggregates.spend += campaign.cost || 0;
                    aggregates.impressions += campaign.impressions || 0;
                    aggregates.clicks += campaign.clicks || 0;
                    aggregates.conversions += campaign.conversions || 0;
                    aggregates.revenue += campaignRevenueMap.get(campaign.id) || 0;
                }
            });
        });

        adsChannels.forEach(channel => {
            const platform = newMetricsData.find((p: PlatformMetrics) => p.name === channel);
            if (platform) {
                platform.metrics.forEach((metric: Metric) => {
                    const newMetricData: MetricData = {};
                    for (const month of monthlyHeaders) {
                        const aggregates = monthlyAdsAggregates[channel][month];
                        const metricPrefix = channel === 'Meta Ads' ? 'Meta' : 'GA';
                        switch (metric.name) {
                            case `${metricPrefix} - Spend`: newMetricData[month] = aggregates.spend > 0 ? `$${aggregates.spend.toLocaleString()}` : '-'; break;
                            case `${metricPrefix} - Impressions`: newMetricData[month] = aggregates.impressions > 0 ? aggregates.impressions.toLocaleString() : '-'; break;
                            case `${metricPrefix} - Clicks`: newMetricData[month] = aggregates.clicks > 0 ? aggregates.clicks.toLocaleString() : '-'; break;
                            case `${metricPrefix} - Conversions`: newMetricData[month] = aggregates.conversions > 0 ? aggregates.conversions.toLocaleString() : '-'; break;
                            case `${metricPrefix} - CTR`: const ctr = aggregates.impressions > 0 ? (aggregates.clicks / aggregates.impressions) * 100 : 0; newMetricData[month] = aggregates.impressions > 0 ? `${ctr.toFixed(2)}%` : '-'; break;
                            case `${metricPrefix} - CPA`: const cpa = aggregates.conversions > 0 ? aggregates.spend / aggregates.conversions : 0; newMetricData[month] = aggregates.conversions > 0 ? `$${cpa.toFixed(2)}` : '-'; break;
                            case `${metricPrefix} - ROAS`: const roas = aggregates.spend > 0 ? aggregates.revenue / aggregates.spend : 0; newMetricData[month] = aggregates.spend > 0 ? `${roas.toFixed(2)}x` : '-'; break;
                            default: newMetricData[month] = metric.data[month] || '-'; break;
                        }
                    }
                    metric.data = newMetricData;
                });
            }
        });

        // --- Blended Metrics Calculation ---
        const parseMetricValue = (value: string | number | undefined): number => {
            if (typeof value === 'number') return value;
            if (typeof value !== 'string' || value === '-') return 0;
            return parseFloat(value.replace(/[,%$x$]/g, '')) || 0;
        };

        const allChannelsPlatform = newMetricsData.find((p: PlatformMetrics) => p.name === 'All Channels');
        if (allChannelsPlatform) {
            const findMetricValue = (platformName: string, metricName: string, month: string) => {
                const platform = newMetricsData.find(p => p.name === platformName);
                const metric = platform?.metrics.find(m => m.name === metricName);
                return parseMetricValue(metric?.data[month]);
            };

            monthlyHeaders.forEach(month => {
                const lnReach = findMetricValue('LinkedIn', 'LN - Post Reach', month);
                const fbPostReach = findMetricValue('Facebook', 'FB - Post Reach', month);
                const websiteUsers = findMetricValue('Website', 'Website - Users', month);
                const metaImpressions = findMetricValue('Meta Ads', 'Meta - Impressions', month);
                const gaImpressions = findMetricValue('Google Ads', 'GA - Impressions', month);
                const emailOpens = findMetricValue('Email Marketing', 'EM - Emails Opened', month);
                
                const blendedAwarenessMetric = allChannelsPlatform.metrics.find((m: Metric) => m.name === 'Blended Awareness');
                if (blendedAwarenessMetric) {
                    const totalAwareness = lnReach + fbPostReach + websiteUsers + metaImpressions + gaImpressions + emailOpens;
                    blendedAwarenessMetric.data[month] = totalAwareness > 0 ? totalAwareness.toLocaleString() : '-';
                }

                const blendedGrowthMetric = allChannelsPlatform.metrics.find((m: Metric) => m.name === 'Blended Subscriber Growth');
                if (blendedGrowthMetric) {
                    const lnGrowth = findMetricValue('LinkedIn', 'LN - Subscriber Growth', month);
                    const fbGrowth = findMetricValue('Facebook', 'FB - Follower Growth', month);
                    const totalGrowth = lnGrowth + fbGrowth;
                    blendedGrowthMetric.data[month] = totalGrowth > 0 ? totalGrowth.toLocaleString() : '-';
                }
                
                const blendedAudienceMetric = allChannelsPlatform.metrics.find((m: Metric) => m.name === 'Blended Social Audience');
                if (blendedAudienceMetric) {
                    const lnAudience = findMetricValue('LinkedIn', 'LN - Subscribers', month);
                    const fbAudience = findMetricValue('Facebook', 'FB - Total Followers', month);
                    const totalAudience = lnAudience + fbAudience;
                    blendedAudienceMetric.data[month] = totalAudience > 0 ? totalAudience.toLocaleString() : '-';
                }
            });
        }

        return newMetricsData;
    }, [campaigns, campaignGroups, actualMetrics, leads]);

    const periods = useMemo(() => {
        const getPeriods = (range: string | { start: Date; end: Date }): { current: { start: Date; end: Date }; previous: { start: Date; end: Date } } => {
            const now = new Date();
            let currentStart: Date, currentEnd: Date, prevStart: Date, prevEnd: Date;

            if (typeof range === 'string') {
                currentEnd = new Date();
                currentEnd.setHours(23, 59, 59, 999);
                switch (range) {
                    case 'Last 30 Days':
                        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
                        currentStart.setHours(0, 0, 0, 0);
                        break;
                    case 'Last 90 Days':
                        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89);
                        currentStart.setHours(0, 0, 0, 0);
                        break;
                    case 'Last Year':
                        currentStart = new Date(now.getFullYear() - 1, 0, 1);
                        currentEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
                        break;
                    case 'This Year':
                    default:
                        currentStart = new Date(now.getFullYear(), 0, 1);
                        break;
                }
            } else {
                currentStart = range.start;
                currentEnd = range.end;
            }

            if (range === 'This Year') {
                prevStart = new Date(now.getFullYear() - 1, 0, 1);
                prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
            } else if (range === 'Last Year') {
                prevStart = new Date(now.getFullYear() - 2, 0, 1);
                prevEnd = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999);
            } else {
                const duration = currentEnd.getTime() - currentStart.getTime();
                prevEnd = new Date(currentStart.getTime() - 1);
                prevStart = new Date(prevEnd.getTime() - duration);
            }

            return {
                current: { start: currentStart, end: currentEnd },
                previous: { start: prevStart, end: prevEnd }
            };
        };
        return getPeriods(dateRange);
    }, [dateRange]);

    const { currentPeriodData, previousPeriodData } = useMemo(() => {
        const filterDataForPeriod = (period: { start: Date; end: Date }) => {
            const filteredLeads = leads.filter(lead => {
                const leadDate = new Date(lead.dateAdded);
                return leadDate >= period.start && leadDate <= period.end;
            });
            const filteredCampaigns = campaigns.filter(campaign => {
                const campaignStartDate = new Date(campaign.startDate);
                return campaignStartDate >= period.start && campaignStartDate <= period.end;
            });
            return { filteredLeads, filteredCampaigns };
        };

        return {
            currentPeriodData: filterDataForPeriod(periods.current),
            previousPeriodData: filterDataForPeriod(periods.previous),
        };
    }, [leads, campaigns, periods]);
    
    const { filteredLeads, filteredCampaigns } = currentPeriodData;

    const historicalTrends = useMemo<HistoricalTrend[]>(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonthIndex = today.getMonth(); // 0-11
        const monthsOfTheYear: string[] = [];

        // Generate months from January of the current year up to the current month
        for (let i = 0; i <= currentMonthIndex; i++) {
            monthsOfTheYear.push(`${monthNames[i]} ${currentYear}`);
        }

        const monthlyData: { [key: string]: { leads: number; opportunities: number; conversions: number } } = {};
        monthsOfTheYear.forEach(m => {
            monthlyData[m] = { leads: 0, opportunities: 0, conversions: 0 };
        });

        leads.forEach(lead => {
            const leadDate = new Date(lead.dateAdded);
            if (!isNaN(leadDate.getTime())) {
                const monthKey = `${monthNames[leadDate.getMonth()]} ${leadDate.getFullYear()}`;

                if (monthlyData[monthKey]) {
                    monthlyData[monthKey].leads++;
                    if (lead.stage === LeadStage.Opportunity || lead.stage === LeadStage.Conversion) {
                        monthlyData[monthKey].opportunities++;
                    }
                    if (lead.stage === LeadStage.Conversion) {
                        monthlyData[monthKey].conversions++;
                    }
                }
            }
        });

        return [
          {
            name: 'Leads Entered',
            data: monthsOfTheYear.map(month => ({ month, value: monthlyData[month]?.leads || 0 })),
          },
          {
            name: 'Opportunities',
            data: monthsOfTheYear.map(month => ({ month, value: monthlyData[month]?.opportunities || 0 })),
          },
          {
            name: 'Conversions',
            data: monthsOfTheYear.map(month => ({ month, value: monthlyData[month]?.conversions || 0 })),
          },
        ];
    }, [leads]);

    const aggregatedData = useMemo(() => {
        const calculateAggregates = (periodLeads: Lead[], periodCampaigns: Campaign[], allCampaignGroups: CampaignGroup[], goalsData: GoalSettings, period: { start: Date, end: Date }) => {
            const paidChannels = ['Meta Ads', 'Google Ads', 'LinkedIn Ads'];
            const paidCampaignGroupIds = allCampaignGroups.filter(g => paidChannels.includes(g.channel)).map(g => g.id);
            
            // --- Universal Metrics ---
            const totalLeads = periodLeads.length;
            const allConversions = periodLeads.filter(l => l.stage === LeadStage.Conversion);
            const totalConversionsCount = allConversions.length;
            const totalRevenue = allConversions.reduce((acc, l) => acc + (l.dealValue || 0), 0);
            const averageTicket = totalConversionsCount > 0 ? totalRevenue / totalConversionsCount : 0;
            
            // --- Ads-Specific Metrics ---
            const adLeads = periodLeads.filter(l => paidChannels.includes(l.channel));
            const adLeadsCount = adLeads.length;
    
            const adCampaigns = periodCampaigns.filter(c => paidCampaignGroupIds.includes(c.campaignGroupId));
            const totalAdSpend = adCampaigns.reduce((acc, c) => acc + c.cost, 0);
    
            const adConversions = allConversions.filter(l => paidChannels.includes(l.channel));
            const adConversionsCount = adConversions.length;
            const adRevenue = adConversions.reduce((acc, l) => acc + (l.dealValue || 0), 0);
            
            const totalROAS = totalAdSpend > 0 ? adRevenue / totalAdSpend : 0;
            const cplAds = adLeadsCount > 0 ? totalAdSpend / adLeadsCount : 0;
            const cpaAds = adConversionsCount > 0 ? totalAdSpend / adConversionsCount : 0;
            const avgRevenuePerCustomerAds = adConversionsCount > 0 ? adRevenue / adConversionsCount : 0;

            // --- Comprehensive ROI Calculation ---
            let totalExpenses = totalAdSpend;
            if (goalsData.expenses) {
                const userVariableSpend = (goalsData.expenses.variable || [])
                    .filter(e => {
                        const expenseDate = new Date(e.date + 'T00:00:00');
                        return !e.isAutoGenerated && expenseDate >= period.start && expenseDate <= period.end;
                    })
                    .reduce((acc, e) => acc + e.amount, 0);

                const monthsInRange = (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
                const roundedMonthsInRange = parseFloat(monthsInRange.toFixed(2));
                const salariesSpend = (goalsData.expenses.salaries || []).reduce((acc, e) => acc + e.monthlyAmount, 0);
                const toolsSpend = (goalsData.expenses.tools || []).reduce((acc, e) => acc + e.monthlyAmount, 0);
                const fixedSpend = (salariesSpend + toolsSpend) * roundedMonthsInRange;
                    
                totalExpenses += userVariableSpend + fixedSpend;
            }
            const totalROI = totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;
            const netMarketingProfit = totalRevenue - totalExpenses;
            
            return {
                totalLeads,
                totalRevenue,
                averageTicket,
                totalROI,
                adLeadsCount,
                totalAdSpend,
                adRevenue,
                totalROAS,
                cplAds,
                cpaAds,
                avgRevenuePerCustomerAds,
                netMarketingProfit
            };
        };

        const calculateChange = (current: number, previous: number): number | null => {
            if (previous === 0) {
                return current > 0 ? Infinity : 0;
            }
            if (current === previous) return 0;
            return ((current - previous) / previous) * 100;
        };
        
        const currentAggregates = calculateAggregates(currentPeriodData.filteredLeads, currentPeriodData.filteredCampaigns, campaignGroups, goals, periods.current);
        const previousAggregates = calculateAggregates(previousPeriodData.filteredLeads, previousPeriodData.filteredCampaigns, campaignGroups, goals, periods.previous);
        
        // --- Funnel Data ---
        const leadCount = filteredLeads.length;
        const leadValue = filteredLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

        const qualifiedLeads = filteredLeads.filter(l => l.stage === LeadStage.Qualified || l.stage === LeadStage.Opportunity || l.stage === LeadStage.Conversion);
        const qualifiedCount = qualifiedLeads.length;
        const qualifiedValue = qualifiedLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

        const opportunityLeads = filteredLeads.filter(l => l.stage === LeadStage.Opportunity || l.stage === LeadStage.Conversion);
        const opportunityCount = opportunityLeads.length;
        const opportunityValue = opportunityLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);
        
        const convertedLeads = filteredLeads.filter(l => l.stage === LeadStage.Conversion);
        const conversionCount = convertedLeads.length;
        const conversionValue = convertedLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

        const discardedLeads = filteredLeads.filter(l => l.stage === LeadStage.Discarded);
        const discardedCount = discardedLeads.length;
        const discardedValue = discardedLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);
        
        const funnelStages: FunnelStage[] = [
            { name: 'Lead', value: leadCount, monetaryValue: leadValue, conversionRate: 100 },
            { name: 'Qualified', value: qualifiedCount, monetaryValue: qualifiedValue, conversionRate: leadCount > 0 ? (qualifiedCount / leadCount) * 100 : 0 },
            { name: 'Opportunity', value: opportunityCount, monetaryValue: opportunityValue, conversionRate: qualifiedCount > 0 ? (opportunityCount / qualifiedCount) * 100 : 0 },
            { name: 'Conversion', value: conversionCount, monetaryValue: conversionValue, conversionRate: opportunityCount > 0 ? (conversionCount / opportunityCount) * 100 : 0 },
            { name: 'Discarded', value: discardedCount, monetaryValue: discardedValue, conversionRate: leadCount > 0 ? (discardedCount / leadCount) * 100 : 0 },
        ];


        return {
            ...currentAggregates,
            funnelStages,
            totalLeadsChange: calculateChange(currentAggregates.totalLeads, previousAggregates.totalLeads),
            totalRevenueChange: calculateChange(currentAggregates.totalRevenue, previousAggregates.totalRevenue),
            averageTicketChange: calculateChange(currentAggregates.averageTicket, previousAggregates.averageTicket),
            totalROIChange: calculateChange(currentAggregates.totalROI, previousAggregates.totalROI),
            netMarketingProfitChange: calculateChange(currentAggregates.netMarketingProfit, previousAggregates.netMarketingProfit),
            adLeadsCountChange: calculateChange(currentAggregates.adLeadsCount, previousAggregates.adLeadsCount),
            totalAdSpendChange: calculateChange(currentAggregates.totalAdSpend, previousAggregates.totalAdSpend),
            adRevenueChange: calculateChange(currentAggregates.adRevenue, previousAggregates.adRevenue),
            totalROASChange: calculateChange(currentAggregates.totalROAS, previousAggregates.totalROAS),
            cplAdsChange: calculateChange(currentAggregates.cplAds, previousAggregates.cplAds),
            cpaAdsChange: calculateChange(currentAggregates.cpaAds, previousAggregates.cpaAds),
            avgRevenuePerCustomerAdsChange: calculateChange(currentAggregates.avgRevenuePerCustomerAds, previousAggregates.avgRevenuePerCustomerAds),
        };
    }, [currentPeriodData, previousPeriodData, campaignGroups, goals, periods]);
    
    // Detailed calculation for the profit breakdown modal
    const profitBreakdown = useMemo(() => {
        const period = periods.current;
        const { totalRevenue } = aggregatedData;

        // Ad Spend Details
        const paidChannels = ['Meta Ads', 'Google Ads', 'LinkedIn Ads'];
        const paidCampaignGroupIds = campaignGroups.filter(g => paidChannels.includes(g.channel)).map(g => g.id);
        const adSpendItems = currentPeriodData.filteredCampaigns.filter(c => paidCampaignGroupIds.includes(c.campaignGroupId));
        const totalAdSpend = adSpendItems.reduce((acc, c) => acc + c.cost, 0);

        if (!goals.expenses) {
            return {
                totalRevenue,
                totalAdSpend,
                adSpendItems,
                fixedExpenses: 0,
                fixedExpenseDetails: { salaries: [], tools: [], monthsInRange: 0, monthlyTotal: 0 },
                variableExpenses: 0,
                variableExpenseItems: [],
                totalExpenses: totalAdSpend,
                netMarketingProfit: totalRevenue - totalAdSpend
            };
        }
        
        // Fixed Expenses Details
        const monthsInRange = (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
        const roundedMonthsInRange = parseFloat(monthsInRange.toFixed(2));
        const salaries: FixedExpense[] = goals.expenses.salaries || [];
        const tools: FixedExpense[] = goals.expenses.tools || [];
        const monthlySalaries = salaries.reduce((acc, e) => acc + e.monthlyAmount, 0);
        const monthlyTools = tools.reduce((acc, e) => acc + e.monthlyAmount, 0);
        const fixedExpenses = (monthlySalaries + monthlyTools) * roundedMonthsInRange;

        // Variable Expenses Details
        const variableExpenseItems: VariableExpense[] = (goals.expenses.variable || [])
            .filter(e => {
                const expenseDate = new Date(e.date + 'T00:00:00');
                return !e.isAutoGenerated && expenseDate >= period.start && expenseDate <= period.end;
            });
        const variableExpenses = variableExpenseItems.reduce((acc, e) => acc + e.amount, 0);

        const totalExpenses = totalAdSpend + fixedExpenses + variableExpenses;

        return {
            totalRevenue,
            totalAdSpend,
            adSpendItems,
            fixedExpenses,
            fixedExpenseDetails: {
                salaries,
                tools,
                monthsInRange: roundedMonthsInRange,
                monthlyTotal: monthlySalaries + monthlyTools
            },
            variableExpenses,
            variableExpenseItems,
            totalExpenses,
            netMarketingProfit: totalRevenue - totalExpenses
        };
    }, [periods, aggregatedData, goals.expenses, campaignGroups, currentPeriodData.filteredCampaigns]);

    const goalsWithBlended = useMemo(() => {
        const newGoals = JSON.parse(JSON.stringify(goals));

        const getGoal = (platform: string, metric: string): number => {
            return newGoals.metrics?.[platform]?.[metric] || 0;
        };

        // Calculate Blended Social Audience Goal
        const blendedSocialAudienceGoal = getGoal('LinkedIn', 'LN - Subscribers') + getGoal('Facebook', 'FB - Total Followers');

        // Calculate Blended Subscriber Growth Goal
        const blendedSubscriberGrowthGoal = getGoal('LinkedIn', 'LN - Subscriber Growth') + getGoal('Facebook', 'FB - Follower Growth');
        
        // Calculate Blended Awareness Goal (sum of available goals for constituent metrics)
        const blendedAwarenessGoal = 
            getGoal('LinkedIn', 'LN - Post Reach') +
            getGoal('Facebook', 'FB - Post Reach') +
            getGoal('Website', 'Website - Users') +
            getGoal('Meta Ads', 'Meta - Impressions') +
            getGoal('Google Ads', 'GA - Impressions') +
            getGoal('Email Marketing', 'EM - Emails Opened');

        if (!newGoals.metrics['All Channels']) {
            newGoals.metrics['All Channels'] = {};
        }

        if (blendedSocialAudienceGoal > 0) {
            newGoals.metrics['All Channels']['Blended Social Audience'] = blendedSocialAudienceGoal;
        }
        if (blendedSubscriberGrowthGoal > 0) {
            newGoals.metrics['All Channels']['Blended Subscriber Growth'] = blendedSubscriberGrowthGoal;
        }
        if (blendedAwarenessGoal > 0) {
            newGoals.metrics['All Channels']['Blended Awareness'] = blendedAwarenessGoal;
        }
        
        return newGoals;
    }, [goals]);

    const handleStageClick = (stageName: string) => {
        setSelectedStage(stageName);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setSelectedStage(null);
    };
    
    const leadsForPanel = useMemo(() => {
        if (!selectedStage) return [];
        
        // This panel should show leads from the filtered date range
        switch(selectedStage) {
            case LeadStage.Lead:
                return filteredLeads.filter(l => l.stage === LeadStage.Lead);
            case LeadStage.Qualified:
                return filteredLeads.filter(l => l.stage === LeadStage.Qualified);
            case LeadStage.Opportunity:
                return filteredLeads.filter(l => l.stage === LeadStage.Opportunity);
            case LeadStage.Conversion:
                return filteredLeads.filter(l => l.stage === LeadStage.Conversion);
            case LeadStage.Discarded:
                return filteredLeads.filter(l => l.stage === LeadStage.Discarded);
            default:
                return [];
        }
    }, [selectedStage, filteredLeads]);

    const roiColorClass = aggregatedData.totalROI < 0 ? 'text-red-400' : 'text-green-400';
    const netProfitColorClass = aggregatedData.netMarketingProfit < 0 ? 'text-red-400' : 'text-green-400';

    const totalLeadsGoal = goals.leads?.total;
    const totalLeadsGoalProgress = totalLeadsGoal && totalLeadsGoal > 0
        ? (aggregatedData.totalLeads / totalLeadsGoal) * 100
        : undefined;

    const marketingSalesGoal = goals.calculatorInputs
        ? (goals.calculatorInputs.totalSalesGoal * (goals.calculatorInputs.marketingContribution / 100))
        : 0;
    const totalRevenueGoalProgress = marketingSalesGoal && marketingSalesGoal > 0
        ? (aggregatedData.totalRevenue / marketingSalesGoal) * 100
        : undefined;
        
    const getDateRangeText = (range: string | { start: Date; end: Date }): string => {
        if (typeof range === 'string') {
            return range;
        }
        if (range?.start && range?.end) {
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
            if (range.start.toDateString() === range.end.toDateString()) {
                 return range.start.toLocaleDateString(undefined, options);
            }
            return `${range.start.toLocaleDateString(undefined, options)} - ${range.end.toLocaleDateString(undefined, options)}`;
        }
        return '...';
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);


  return (
    <>
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white">Marketing Performance Dashboard</h1>
                <p className="text-base text-gray-400 mt-1">A 360° view of your marketing efforts for: <span className="font-semibold text-gray-300">{getDateRangeText(dateRange)}</span></p>
            </div>
            <DateRangeFilter
                currentRange={dateRange}
                onRangeChange={onDateRangeChange}
            />
        </div>

        {/* Universal KPI Cards */}
        <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-200">Universal KPIs</h2>
            <p className="text-sm text-gray-400">How is the overall marketing strategy performing?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
                <KpiCard
                    title="Total Leads"
                    value={aggregatedData.totalLeads.toLocaleString()}
                    icon={<CrmIcon className="w-6 h-6 text-gray-500" />}
                    goalProgress={totalLeadsGoalProgress}
                    percentageChange={totalLeadsGoalProgress === undefined ? aggregatedData.totalLeadsChange : null}
                    description="Overall volume of leads generated, combining all channels (organic and paid)."
                />
                <KpiCard
                    title="Total Revenue"
                    value={`$${aggregatedData.totalRevenue.toLocaleString()}`}
                    icon={<TrendingUpIcon className="w-6 h-6 text-gray-500" />}
                    goalProgress={totalRevenueGoalProgress}
                    percentageChange={totalRevenueGoalProgress === undefined ? aggregatedData.totalRevenueChange : null}
                    description="Total revenue attributed to all marketing activities within the selected period."
                />
                <KpiCard title="Average Ticket" value={`$${Math.round(aggregatedData.averageTicket).toLocaleString()}`} icon={<DollarIcon className="w-6 h-6 text-gray-500" />} percentageChange={aggregatedData.averageTicketChange} description="Average value of each conversion or sale. Calculated by dividing total revenue by the number of conversions." />
                <KpiCard title="Total ROI" value={`${aggregatedData.totalROI.toFixed(1)}%`} icon={<CampaignsIcon className="w-6 h-6 text-gray-500" />} description="Return on Investment. Measures the overall profitability of marketing, including ad spend, salaries, and other registered expenses. (Revenue - Total Expenses) / Total Expenses." valueClassName={roiColorClass} />
                <KpiCard
                    title="Net Marketing Profit"
                    value={`$${aggregatedData.netMarketingProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<DollarIcon className="w-6 h-6 text-gray-500" />}
                    percentageChange={aggregatedData.netMarketingProfitChange}
                    description="The net profit generated from marketing activities after all expenses (ad spend, salaries, tools, etc.) have been deducted from the total revenue. (Total Revenue - Total Expenses)."
                    valueClassName={netProfitColorClass}
                    onInfoClick={() => setIsProfitDetailOpen(true)}
                />
            </div>
        </div>
        
        {/* Ads KPI Cards */}
        <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-200">Ads KPIs</h2>
            <p className="text-sm text-gray-400">How efficient are our paid campaigns?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 pt-2">
                <KpiCard title="Total Ad Spend" value={`$${aggregatedData.totalAdSpend.toLocaleString()}`} icon={<DollarIcon className="w-6 h-6 text-gray-500" />} percentageChange={aggregatedData.totalAdSpendChange} invertTrendColor description="Total investment solely on ad platforms (e.g., Meta Ads, Google Ads) during the period." />
                <KpiCard title="Ad Revenue" value={`$${aggregatedData.adRevenue.toLocaleString()}`} icon={<TrendingUpIcon className="w-6 h-6 text-gray-500" />} percentageChange={aggregatedData.adRevenueChange} description="Total revenue attributed directly to paid advertising campaigns." />
                <KpiCard title="Total ROAS" value={`${aggregatedData.totalROAS.toFixed(2)}x`} icon={<CampaignsIcon className="w-6 h-6 text-gray-500" />} percentageChange={aggregatedData.totalROASChange} description="Return on Ad Spend. (Ad Revenue / Ad Spend). Measures the effectiveness of ads." />
                <KpiCard title="Ad Leads" value={aggregatedData.adLeadsCount.toLocaleString()} icon={<CrmIcon className="w-6 h-6 text-gray-500" />} percentageChange={aggregatedData.adLeadsCountChange} description="Total leads generated exclusively by paid advertising campaigns (Ads)." />
                <KpiCard title="Avg. CPL (Ads)" value={`$${Math.round(aggregatedData.cplAds).toLocaleString()}`} icon={<ArrowDownIcon className="w-6 h-6 text-gray-500" />} percentageChange={aggregatedData.cplAdsChange} invertTrendColor description="Average Cost Per Lead from Ads. (Ad Spend / Ad Leads). Measures the cost to acquire a lead." />
                <KpiCard title="Avg. CPA (Ads)" value={`$${Math.round(aggregatedData.cpaAds).toLocaleString()}`} icon={<ArrowDownIcon className="w-6 h-6 text-gray-500" />} percentageChange={aggregatedData.cpaAdsChange} invertTrendColor description="Average Cost Per Acquisition from Ads. (Ad Spend / Ad Customers). Measures the cost to acquire a customer." />
                <KpiCard 
                    title="Avg. Revenue / Customer (Ads)" 
                    value={`$${Math.round(aggregatedData.avgRevenuePerCustomerAds).toLocaleString()}`} 
                    icon={<TrendingUpIcon className="w-6 h-6 text-gray-500" />} 
                    percentageChange={aggregatedData.avgRevenuePerCustomerAdsChange} 
                    description="Average revenue generated by each customer acquired through advertising. (Ad Revenue / Ad Customers)." 
                    tooltipAlignment="right"
                />
            </div>
        </div>

        {/* Funnel and Historical Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <FunnelOverview funnelData={aggregatedData.funnelStages} onStageClick={handleStageClick} />
          </div>
          <div className="lg:col-span-2">
            <HistoricalTrendsChart data={historicalTrends} />
          </div>
        </div>

        <MarketingEffortsCharts 
            goals={goals}
            actualMetrics={calculatedMetricsData}
        />

        {/* Channel Performance Table */}
        <ChannelPerformanceChart leads={filteredLeads} campaigns={filteredCampaigns} campaignGroups={campaignGroups} />

        {/* Campaign Group Performance Table */}
        <CampaignGroupPerformanceChart leads={filteredLeads} campaigns={filteredCampaigns} campaignGroups={campaignGroups} />

        {/* Metrics Table */}
        <MetricsTable 
            metricsData={calculatedMetricsData} 
            headers={monthlyHeaders} 
            goals={goalsWithBlended}
            onUpdateMetricsData={onUpdateActualMetrics}
        />
    </div>
    <LeadDetailPanel 
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        stageName={selectedStage}
        leads={leadsForPanel}
    />
    {isProfitDetailOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg border border-gray-700">
                <div className="p-5 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Net Marketing Profit Calculation</h2>
                    <button onClick={() => setIsProfitDetailOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-400">
                        This calculation is for the selected period: <span className="font-semibold text-gray-300">{getDateRangeText(dateRange)}</span>
                    </p>
                    {/* Revenue */}
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-200">Total Revenue</span>
                        <span className="font-bold text-green-400">{formatCurrency(profitBreakdown.totalRevenue)}</span>
                    </div>
                    {/* Expenses */}
                    <div className="border-t border-b border-gray-700 py-3 my-2">
                        <div className="flex justify-between items-center text-lg mb-2">
                            <span className="text-gray-200">Total Expenses</span>
                            <span className="font-bold text-red-400">({formatCurrency(profitBreakdown.totalExpenses)})</span>
                        </div>
                        <div className="pl-4 space-y-2 text-base">
                            {/* Ad Spend Details */}
                            <details className="text-gray-300 group">
                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                    <div className="flex items-center">
                                        <ChevronDownIcon className="w-4 h-4 mr-1 transition-transform transform group-open:rotate-180" /> Ad Spend
                                    </div>
                                    <span>{formatCurrency(profitBreakdown.totalAdSpend)}</span>
                                </summary>
                                <div className="mt-2 pl-5 pr-2 border-l border-gray-600 ml-1.5 text-sm text-gray-400 space-y-1 max-h-32 overflow-y-auto">
                                    {profitBreakdown.adSpendItems.length > 0 ? profitBreakdown.adSpendItems.map(item => (
                                        <div key={item.id} className="flex justify-between"><span>{item.name}</span><span>{formatCurrency(item.cost)}</span></div>
                                    )) : <span>No ad campaigns in this period.</span>}
                                </div>
                            </details>
                            {/* Fixed Expenses Details */}
                            <details className="text-gray-300 group">
                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                    <div className="flex items-center">
                                        <ChevronDownIcon className="w-4 h-4 mr-1 transition-transform transform group-open:rotate-180" /> Fixed Expenses
                                    </div>
                                    <span>{formatCurrency(profitBreakdown.fixedExpenses)}</span>
                                </summary>
                                <div className="mt-2 pl-5 pr-2 border-l border-gray-600 ml-1.5 text-sm text-gray-400 space-y-3">
                                    
                                    <div>
                                        {(profitBreakdown.fixedExpenseDetails.salaries.length > 0 || profitBreakdown.fixedExpenseDetails.tools.length > 0) ? (
                                            <>
                                                {profitBreakdown.fixedExpenseDetails.salaries.map(item => (
                                                    <div key={item.id} className="flex justify-between"><span>{item.name} (Salary)</span><span>{formatCurrency(item.monthlyAmount)} / mo</span></div>
                                                ))}
                                                {profitBreakdown.fixedExpenseDetails.tools.map(item => (
                                                    <div key={item.id} className="flex justify-between"><span>{item.name} (Tool)</span><span>{formatCurrency(item.monthlyAmount)} / mo</span></div>
                                                ))}
                                            </>
                                        ) : (
                                            <p>No monthly fixed expenses recorded.</p>
                                        )}
                                    </div>
                                    
                                    {(profitBreakdown.fixedExpenseDetails.salaries.length > 0 || profitBreakdown.fixedExpenseDetails.tools.length > 0) && (
                                        <div className="border-t border-gray-700 pt-2 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Monthly Subtotal</span>
                                                <span className="font-semibold">{formatCurrency(profitBreakdown.fixedExpenseDetails.monthlyTotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Period Multiplier</span>
                                                <span>x {profitBreakdown.fixedExpenseDetails.monthsInRange.toFixed(2)} months</span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-600 mt-2 pt-2">
                                                <span className="font-semibold text-gray-200">Calculated Total</span>
                                                <span className="font-bold text-gray-200">{formatCurrency(profitBreakdown.fixedExpenses)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </details>
                            {/* Variable Expenses Details */}
                            <details className="text-gray-300 group">
                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                    <div className="flex items-center">
                                        <ChevronDownIcon className="w-4 h-4 mr-1 transition-transform transform group-open:rotate-180" /> Variable Expenses
                                    </div>
                                    <span>{formatCurrency(profitBreakdown.variableExpenses)}</span>
                                </summary>
                                <div className="mt-2 pl-5 pr-2 border-l border-gray-600 ml-1.5 text-sm text-gray-400 space-y-1 max-h-32 overflow-y-auto">
                                    {profitBreakdown.variableExpenseItems.length > 0 ? profitBreakdown.variableExpenseItems.map(item => (
                                        <div key={item.id} className="flex justify-between"><span>{item.name}</span><span>{formatCurrency(item.amount)}</span></div>
                                    )) : <span>No manual variable expenses in this period.</span>}
                                </div>
                            </details>
                        </div>
                    </div>
                    {/* Final Result */}
                    <div className="flex justify-between items-center text-xl">
                        <span className="font-bold text-white">Net Marketing Profit</span>
                        <span className={`font-bold ${netProfitColorClass}`}>{formatCurrency(profitBreakdown.netMarketingProfit)}</span>
                    </div>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default DashboardView;