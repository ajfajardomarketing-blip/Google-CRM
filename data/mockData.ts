

import { PlatformMetrics, Integration, IntegrationStatus, Lead, Campaign, CampaignGroup, HistoricalTrend, LeadStage, GoalSettings } from '../types';

export const weeklyHeaders = [
  'Aug 1 - 7',
  'Aug 8 - 14',
  'Aug 15 - 21',
  'Aug 22 - 28',
  'Aug 29 - 31',
  'August Actuals',
];

export const metricsData: PlatformMetrics[] = [
  {
    name: 'All Channels',
    metrics: [
      {
        name: 'Blended Social Audience',
        data: {
          'Aug 1 - 7': '8,633',
          'Aug 8 - 14': '8,724',
          'Aug 15 - 21': '8,919',
          'Aug 22 - 28': '',
          'Aug 29 - 31': '',
          'August Actuals': '9,138',
        },
        isHighlighted: true,
        isTrendingUp: true,
      },
    ],
  },
  {
    name: 'LinkedIn',
    metrics: [
      { name: 'LN - Subscribers', data: { 'Aug 1 - 7': 462, 'Aug 8 - 14': 470, 'Aug 15 - 21': 480, 'Aug 22 - 28': 500, 'Aug 29 - 31': 510, 'August Actuals': 510 }, isStarred: true, isTrendingUp: true },
      { name: 'LN - Subscriber Growth', data: { 'Aug 1 - 7': 2, 'Aug 8 - 14': 8, 'Aug 15 - 21': 10, 'Aug 22 - 28': 10, 'Aug 29 - 31': 10, 'August Actuals': 50 }, isTrendingUp: true },
      { name: 'LN - Articles Posted', data: { 'Aug 1 - 7': 0, 'Aug 8 - 14': 0, 'Aug 15 - 21': 2, 'Aug 22 - 28': 13, 'Aug 29 - 31': 13, 'August Actuals': 28 }, isTrendingUp: true },
      { name: 'LN - Post Reach', data: { 'Aug 1 - 7': 0, 'Aug 8 - 14': 11, 'Aug 15 - 21': 8.76, 'Aug 22 - 28': 33.22, 'Aug 29 - 31': 19.58, 'August Actuals': 68.94 }, isTrendingUp: true },
    ],
  },
  {
    name: 'Facebook',
    metrics: [
      { name: 'FB - Total Followers', data: { 'Aug 1 - 7': '2,860', 'Aug 8 - 14': '2,957', 'Aug 15 - 21': '3,082', 'Aug 22 - 28': '3,106', 'Aug 29 - 31': '3,171', 'August Actuals': '3,177' }, isTrendingUp: true },
      { name: 'FB - Follower Growth', data: { 'Aug 1 - 7': -1, 'Aug 8 - 14': 77, 'Aug 15 - 21': 145, 'Aug 22 - 28': 24, 'Aug 29 - 31': 65, 'August Actuals': 316 }, isTrendingUp: true },
      { name: 'FB - Posts / Reels Created', data: { 'Aug 1 - 7': 0, 'Aug 8 - 14': 11, 'Aug 15 - 21': 13, 'Aug 22 - 28': 13, 'Aug 29 - 31': 51, 'August Actuals': 88 }, isTrendingUp: true },
      { name: 'FB - Stories Created', data: { 'Aug 1 - 7': 0, 'Aug 8 - 14': 27, 'Aug 15 - 21': 16, 'Aug 22 - 28': 7, 'Aug 29 - 31': 26, 'August Actuals': 80 }, isTrendingUp: true },
      { name: 'FB - Impressions', data: { 'Aug 1 - 7': '155,884', 'Aug 8 - 14': '168,933', 'Aug 15 - 21': '180,554', 'Aug 22 - 28': '146,388', 'Aug 29 - 31': '137,603', 'August Actuals': '799,066' }, isTrendingUp: true },
      { name: 'FB - Engagement', data: { 'Aug 1 - 7': 9, 'Aug 8 - 14': 283, 'Aug 15 - 21': 609, 'Aug 22 - 28': 648, 'Aug 29 - 31': 231, 'August Actuals': '1,873' }, isTrendingUp: true },
      { name: 'FB - Engagement Rate', data: { 'Aug 1 - 7': '0.01%', 'Aug 8 - 14': '0.17%', 'Aug 15 - 21': '0.34%', 'Aug 22 - 28': '0.31%', 'Aug 29 - 31': '0.17%', 'August Actuals': '0.27%' }, isTrendingUp: true },
    ],
  },
  {
    name: 'Website',
    metrics: [
      { name: 'Website - Sessions', data: { 'Aug 1 - 7': '1,200', 'Aug 8 - 14': '1,350', 'Aug 15 - 21': '1,400', 'Aug 22 - 28': '1,550', 'Aug 29 - 31': '900', 'August Actuals': '6,400' }, isStarred: true, isTrendingUp: true },
      { name: 'Website - Users', data: { 'Aug 1 - 7': '950', 'Aug 8 - 14': '1,050', 'Aug 15 - 21': '1,100', 'Aug 22 - 28': '1,200', 'Aug 29 - 31': '700', 'August Actuals': '4,900' }, isTrendingUp: true },
      { name: 'Website - Bounce Rate', data: { 'Aug 1 - 7': '45%', 'Aug 8 - 14': '42%', 'Aug 15 - 21': '43%', 'Aug 22 - 28': '40%', 'Aug 29 - 31': '38%', 'August Actuals': '41.5%' }, isTrendingDown: true },
      { name: 'Website - Goal Completions', data: { 'Aug 1 - 7': 50, 'Aug 8 - 14': 65, 'Aug 15 - 21': 70, 'Aug 22 - 28': 80, 'Aug 29 - 31': 45, 'August Actuals': 310 }, isTrendingUp: true },
    ],
  },
  {
    name: 'Meta Ads',
    metrics: [
      { name: 'Meta - Spend', data: { 'Aug 1 - 7': '$1,500', 'Aug 8 - 14': '$1,800', 'Aug 15 - 21': '$1,650', 'Aug 22 - 28': '$2,000', 'Aug 29 - 31': '$1,200', 'August Actuals': '$8,150' }, isStarred: true, isTrendingUp: true },
      { name: 'Meta - Impressions', data: { 'Aug 1 - 7': '150,000', 'Aug 8 - 14': '175,000', 'Aug 15 - 21': '160,000', 'Aug 22 - 28': '190,000', 'Aug 29 - 31': '110,000', 'August Actuals': '785,000' }, isTrendingUp: true },
      { name: 'Meta - Clicks', data: { 'Aug 1 - 7': '1,200', 'Aug 8 - 14': '1,500', 'Aug 15 - 21': '1,300', 'Aug 22 - 28': '1,600', 'Aug 29 - 31': '900', 'August Actuals': '6,500' }, isTrendingUp: true },
      { name: 'Meta - Conversions', data: { 'Aug 1 - 7': 30, 'Aug 8 - 14': 45, 'Aug 15 - 21': 40, 'Aug 22 - 28': 55, 'Aug 29 - 31': 35, 'August Actuals': 205 }, isTrendingUp: true },
      { name: 'Meta - ROAS', data: { 'Aug 1 - 7': '2.5x', 'Aug 8 - 14': '3.1x', 'Aug 15 - 21': '2.9x', 'Aug 22 - 28': '3.5x', 'Aug 29 - 31': '3.2x', 'August Actuals': '3.0x' }, isTrendingUp: true },
    ],
  },
  {
    name: 'Google Ads',
    metrics: [
      { name: 'GA - Spend', data: { 'Aug 1 - 7': '$2,000', 'Aug 8 - 14': '$2,200', 'Aug 15 - 21': '$2,100', 'Aug 22 - 28': '$2,500', 'Aug 29 - 31': '$1,500', 'August Actuals': '$10,300' }, isStarred: true, isTrendingUp: true },
      { name: 'GA - Impressions', data: { 'Aug 1 - 7': '80,000', 'Aug 8 - 14': '90,000', 'Aug 15 - 21': '85,000', 'Aug 22 - 28': '100,000', 'Aug 29 - 31': '60,000', 'August Actuals': '415,000' }, isTrendingUp: true },
      { name: 'GA - CTR', data: { 'Aug 1 - 7': '2.5%', 'Aug 8 - 14': '2.8%', 'Aug 15 - 21': '2.7%', 'Aug 22 - 28': '3.0%', 'Aug 29 - 31': '3.1%', 'August Actuals': '2.85%' }, isTrendingUp: true },
      { name: 'GA - Conversions', data: { 'Aug 1 - 7': 40, 'Aug 8 - 14': 50, 'Aug 15 - 21': 48, 'Aug 22 - 28': 60, 'Aug 29 - 31': 42, 'August Actuals': 240 }, isTrendingUp: true },
      { name: 'GA - CPA', data: { 'Aug 1 - 7': '$50.00', 'Aug 8 - 14': '$44.00', 'Aug 15 - 21': '$43.75', 'Aug 22 - 28': '$41.67', 'Aug 29 - 31': '$35.71', 'August Actuals': '$42.91' }, isTrendingDown: true },
    ],
  },
];


export const integrationsData: Integration[] = [
    { name: 'HubSpot', category: 'CRM', logo: 'https://cdn.worldvectorlogo.com/logos/hubspot.svg', status: IntegrationStatus.Connected },
    { name: 'Google Analytics 4', category: 'Analytics', logo: 'https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg', status: IntegrationStatus.Connected },
    { name: 'QuickBooks', category: 'Accounting', logo: 'https://cdn.worldvectorlogo.com/logos/quickbooks-6.svg', status: IntegrationStatus.Connected },
    { name: 'Meta Ads', category: 'Marketing', logo: 'https://cdn.worldvectorlogo.com/logos/meta-2.svg', status: IntegrationStatus.Connected },
    { name: 'Shopify', category: 'E-commerce', logo: 'https://cdn.worldvectorlogo.com/logos/shopify.svg', status: IntegrationStatus.Available },
    { name: 'Google Ads', category: 'Marketing', logo: 'https://cdn.worldvectorlogo.com/logos/google-ads-2.svg', status: IntegrationStatus.Available },
    { name: 'Salesforce', category: 'CRM', logo: 'https://cdn.worldvectorlogo.com/logos/salesforce-2.svg', status: IntegrationStatus.Connected },
    { name: 'Stripe', category: 'Payments', logo: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg', status: IntegrationStatus.Connected },
    { name: 'Intercom', category: 'Support', logo: 'https://cdn.worldvectorlogo.com/logos/intercom-2.svg', status: IntegrationStatus.Available },
    { name: 'Instagram Insights', category: 'Social Media', logo: 'https://cdn.worldvectorlogo.com/logos/instagram-2-1.svg', status: IntegrationStatus.Available },
    { name: 'Microsoft Dynamics 365', category: 'Finance', logo: 'https://cdn.worldvectorlogo.com/logos/microsoft-dynamics-365.svg', status: IntegrationStatus.Available },
    { name: 'LinkedIn', category: 'Social Media', logo: 'https://cdn.worldvectorlogo.com/logos/linkedin-icon-2.svg', status: IntegrationStatus.Connected },
    { name: 'Facebook', category: 'Social Media', logo: 'https://cdn.worldvectorlogo.com/logos/facebook-3-1.svg', status: IntegrationStatus.Connected },
];

// FIX: Changed numeric ids to strings to match the 'Lead' type.
export const leadsData: Lead[] = [
    { id: '1', name: 'John Doe', email: 'john.doe@example.com', company: 'Acme Corp', channel: 'LinkedIn', campaign: 'Q3 Product Launch', campaignGroup: 'Product Marketing', dateAdded: '2023-08-15', stage: LeadStage.Opportunity, dealValue: 5000 },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', company: 'Innovate LLC', channel: 'Facebook', campaign: 'Summer Sale', campaignGroup: 'Growth', dateAdded: '2023-08-18', stage: LeadStage.Conversion, dealValue: 12500 },
    { id: '3', name: 'Peter Jones', email: 'peter.jones@example.com', company: 'Tech Solutions', channel: 'Website', campaign: 'Free Trial Offer', campaignGroup: 'Product Marketing', dateAdded: '2023-08-21', stage: LeadStage.Lead },
    { id: '4', name: 'Mary Johnson', email: 'mary.j@example.com', company: 'Data Systems', channel: 'LinkedIn', campaign: 'Q3 Product Launch', campaignGroup: 'Product Marketing', dateAdded: '2023-08-22', stage: LeadStage.Discarded },
];

export const channels = ['Email Marketing', 'Social Media', 'Content Marketing', 'Website', 'Meta Ads', 'Google Ads', 'LinkedIn Ads', 'Organic Social', 'Eventos'];

// FIX: Changed numeric ids to strings to match the 'CampaignGroup' type.
export const campaignGroupsData: CampaignGroup[] = [
    { id: '1', name: 'Product Marketing', channel: 'Website', order: 0 },
    { id: '2', name: 'Growth', channel: 'Social Media', order: 1 },
    { id: '3', name: 'Content Marketing', channel: 'Content Marketing', order: 2 },
    { id: '4', name: 'Seguridad Electrónica - Industrias', channel: 'Email Marketing', order: 3 },
    { id: '5', name: 'Google Ads Q3', channel: 'Google Ads', order: 4 },
    { id: '6', name: 'Instagram Content', channel: 'Organic Social', order: 5 },
    { id: '7', name: 'Webinars 2023', channel: 'Eventos', order: 6 },
];

// FIX: Changed numeric ids and campaignGroupIds to strings to match the 'Campaign' type.
export const campaignsData: Campaign[] = [
    { id: '1', name: 'Q3 Product Launch', campaignGroupId: '1', status: 'Active', startDate: '2023-07-01', endDate: '2023-09-30', leads: 28, cost: 5000 },
    { id: '2', name: 'Summer Sale', campaignGroupId: '2', status: 'Completed', startDate: '2023-06-15', endDate: '2023-07-31', leads: 152, cost: 8500 },
    { id: '3', name: 'Free Trial Offer', campaignGroupId: '1', status: 'Active', startDate: '2023-08-01', endDate: '2023-10-31', leads: 98, cost: 3200 },
    { id: '4', name: 'Webinar Series', campaignGroupId: '3', status: 'Paused', startDate: '2023-09-01', endDate: '2023-09-30', leads: 45, cost: 1500 },
    { id: '5', name: 'Seguridad Electrónica - Industrias - Lectura de Placas', campaignGroupId: '4', status: 'Active', startDate: '2023-08-10', endDate: '2023-09-10', leads: 12, cost: 2000, sent: 5000, delivered: 4950, opens: 1500, clicks: 300, revenue: 7500 },
    { id: '6', name: 'Seguridad Electrónica - Industrias - Reconocimiento facial', campaignGroupId: '4', status: 'Active', startDate: '2023-08-15', endDate: '2023-09-15', leads: 18, cost: 2500, sent: 6200, delivered: 6100, opens: 1800, clicks: 450, revenue: 11200 },
    { id: '7', name: 'Google Search - "Security Solutions"', campaignGroupId: '5', status: 'Active', startDate: '2023-08-01', endDate: '2023-10-31', leads: 42, cost: 6800, impressions: 150000, clicks: 750, cpc: 9.06, conversions: 42, cpa: 161.90, roas: 3.5 },
    { id: '8', name: 'Instagram Stories - Product Demo', campaignGroupId: '6', status: 'Completed', startDate: '2023-08-20', endDate: '2023-08-27', leads: 5, cost: 0, reach: 12000, engagement: 850, followerGrowth: 150, websiteClicks: 35 },
    { id: '9', name: 'Marketing OS Launch Webinar', campaignGroupId: '7', status: 'Completed', startDate: '2023-08-30', endDate: '2023-08-30', leads: 75, cost: 500, registered: 250, attendees: 180 },
];

const adsKpis = [
    { id: 'impressions' as const, label: 'Impressions' },
    { id: 'clicks' as const, label: 'Clicks' },
    { id: 'cost' as const, label: 'Spend' },
    { id: 'cpc' as const, label: 'CPC' },
    { id: 'conversions' as const, label: 'Conversions' },
    { id: 'cpa' as const, label: 'CPA' },
    { id: 'roas' as const, label: 'ROAS' },
    { id: 'revenue' as const, label: 'Revenue' },
];

export const campaignKpiOptions: { [key: string]: { id: keyof Campaign, label: string }[] } = {
  'Email Marketing': [
    { id: 'sent', label: 'Sent' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'opens', label: 'Opens' },
    { id: 'clicks', label: 'Clicks' },
    { id: 'revenue', label: 'Revenue' },
  ],
  'Meta Ads': adsKpis,
  'Google Ads': adsKpis,
  'LinkedIn Ads': adsKpis,
  'Organic Social': [
      { id: 'reach', label: 'Reach' },
      { id: 'engagement', label: 'Engagement' },
      { id: 'followerGrowth', label: 'Follower Growth' },
      { id: 'websiteClicks', label: 'Website Clicks' },
  ],
  'Eventos': [
    { id: 'registered', label: 'Registered' },
    { id: 'attendees', label: 'Attendees' },
  ]
};


export const initialGoalsData: GoalSettings = {
    leads: {
        total: 100,
        opportunities: 25,
        conversions: 10,
    },
    metrics: {
        'LinkedIn': {
            'LN - Subscribers': 600,
            'LN - Subscriber Growth': 50,
        },
        'Facebook': {
            'FB - Total Followers': 3500,
            'FB - Follower Growth': 300,
            'FB - Engagement': 2000,
        },
        'Website': {
            'Website - Sessions': 7000,
            'Website - Goal Completions': 350,
        },
        'Meta Ads': {
            'Meta - Conversions': 250,
            'Meta - ROAS': 3.5,
        },
        'Google Ads': {
           'GA - Conversions': 300,
           'GA - CPA': 40.00,
        }
    }
};