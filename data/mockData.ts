
import { PlatformMetrics, Integration, IntegrationStatus, Lead, Campaign, CampaignGroup, HistoricalTrend, LeadStage, GoalSettings } from '../types';

export const monthlyHeaders = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];


export const metricsData: PlatformMetrics[] = [
  {
    name: 'All Channels',
    metrics: [
      {
        name: 'Blended Social Audience',
        sourceType: 'API',
        data: {
          'Jan': '-', 'Feb': '-', 'Mar': '7,512', 'Apr': '7,845', 'May': '8,103', 'Jun': '8,350', 'Jul': '8,633', 'Aug': '9,138', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-',
        },
        isHighlighted: true,
        isTrendingUp: true,
      },
      {
        name: 'Blended Subscriber Growth',
        sourceType: 'API',
        data: {
          'Jan': '-', 'Feb': '-', 'Mar': '-', 'Apr': '-', 'May': '-', 'Jun': '-', 'Jul': '-', 'Aug': '-', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-',
        },
        isHighlighted: true,
        isTrendingUp: true,
      },
      {
        name: 'Blended Awareness',
        sourceType: 'API',
        data: {
          'Jan': '-', 'Feb': '-', 'Mar': '-', 'Apr': '-', 'May': '-', 'Jun': '-', 'Jul': '-', 'Aug': '-', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-',
        },
        isHighlighted: true,
        isTrendingUp: true,
      },
    ],
  },
  {
    name: 'LinkedIn',
    metrics: [
      { name: 'LN - Subscribers', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': 405, 'Apr': 420, 'May': 435, 'Jun': 450, 'Jul': 462, 'Aug': 510, 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isStarred: true, isTrendingUp: true },
      { name: 'LN - Subscriber Growth', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': 12, 'Apr': 15, 'May': 15, 'Jun': 15, 'Jul': 12, 'Aug': 50, 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'LN - Posts', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': 4, 'Apr': 5, 'May': 6, 'Jun': 8, 'Jul': 5, 'Aug': 28, 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'LN - Post Reach', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': 45100, 'Apr': 55200, 'May': 60500, 'Jun': 62100, 'Jul': 65800, 'Aug': 68940, 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
    ],
  },
  {
    name: 'Facebook',
    metrics: [
      { name: 'FB - Total Followers', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': '2,500', 'Apr': '2,650', 'May': '2,780', 'Jun': '2,900', 'Jul': '3,000', 'Aug': '3,177', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'FB - Follower Growth', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': 140, 'Apr': 150, 'May': 130, 'Jun': 120, 'Jul': 100, 'Aug': 316, 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'FB - Posts', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': 40, 'Apr': 45, 'May': 50, 'Jun': 60, 'Jul': 75, 'Aug': 88, 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'FB - Post Reach', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': 450123, 'Apr': 510450, 'May': 580112, 'Jun': 610834, 'Jul': 650912, 'Aug': 699066, 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'FB - Engagement', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': '1,200', 'Apr': '1,350', 'May': '1,500', 'Jun': '1,600', 'Jul': '1,750', 'Aug': '1,873', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'FB - Engagement Rate', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': '0.22%', 'Apr': '0.22%', 'May': '0.22%', 'Jun': '0.23%', 'Jul': '0.23%', 'Aug': '0.27%', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
    ],
  },
  {
        name: 'Email Marketing',
        metrics: [
            { name: 'EM - Campaigns Sent', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '-', 'Apr': '-', 'May': '-', 'Jun': '-', 'Jul': '-', 'Aug': '-', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' } },
            { name: 'EM - Emails Delivered', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '-', 'Apr': '-', 'May': '-', 'Jun': '-', 'Jul': '-', 'Aug': '-', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' } },
            { name: 'EM - Emails Opened', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '-', 'Apr': '-', 'May': '-', 'Jun': '-', 'Jul': '-', 'Aug': '-', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' } },
            { name: 'EM - Open Rate', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '22.5%', 'Apr': '23.1%', 'May': '22.8%', 'Jun': '24.0%', 'Jul': '24.2%', 'Aug': '24.5%', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' } },
            { name: 'EM - Click Rate', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '2.8%', 'Apr': '2.9%', 'May': '3.1%', 'Jun': '3.0%', 'Jul': '3.2%', 'Aug': '3.4%', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' } },
            { name: 'EM - Newsletters', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': 2, 'Apr': 2, 'May': 2, 'Jun': 2, 'Jul': 2, 'Aug': 2, 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' } },
        ]
  },
  {
    name: 'Website',
    metrics: [
      { name: 'Website - Users', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': '4,000', 'Apr': '4,100', 'May': '4,300', 'Jun': '4,500', 'Jul': '4,700', 'Aug': '4,900', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isStarred: true, isTrendingUp: true },
      { name: 'Website - Bounce Rate', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': '48%', 'Apr': '46%', 'May': '44%', 'Jun': '43%', 'Jul': '42%', 'Aug': '41.5%', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingDown: true },
      { name: 'Website - SEO Blog Posts', sourceType: 'Manual', data: { 'Jan': '-', 'Feb': '-', 'Mar': 4, 'Apr': 4, 'May': 5, 'Jun': 4, 'Jul': 5, 'Aug': 4, 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' } },
    ],
  },
  {
    name: 'Meta Ads',
    metrics: [
      { name: 'Meta - Spend', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '$6,000', 'Apr': '$6,500', 'May': '$7,000', 'Jun': '$7,500', 'Jul': '$8,000', 'Aug': '$8,150', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isStarred: true, isTrendingUp: true },
      { name: 'Meta - Impressions', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '600,000', 'Apr': '650,000', 'May': '700,000', 'Jun': '720,000', 'Jul': '750,000', 'Aug': '785,000', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'Meta - Clicks', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '5,000', 'Apr': '5,500', 'May': '5,800', 'Jun': '6,000', 'Jul': '6,200', 'Aug': '6,500', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'Meta - Conversions', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': 150, 'Apr': 165, 'May': 175, 'Jun': 185, 'Jul': 195, 'Aug': 205, 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'Meta - ROAS', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '2.8x', 'Apr': '2.9x', 'May': '3.0x', 'Jun': '3.2x', 'Jul': '3.1x', 'Aug': '3.0x', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
    ],
  },
  {
    name: 'Google Ads',
    metrics: [
      { name: 'GA - Spend', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '$8,000', 'Apr': '$8,500', 'May': '$9,000', 'Jun': '$9,500', 'Jul': '$10,000', 'Aug': '$10,300', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isStarred: true, isTrendingUp: true },
      { name: 'GA - Impressions', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '350,000', 'Apr': '370,000', 'May': '380,000', 'Jun': '390,000', 'Jul': '400,000', 'Aug': '415,000', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'GA - CTR', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '2.2%', 'Apr': '2.3%', 'May': '2.4%', 'Jun': '2.6%', 'Jul': '2.7%', 'Aug': '2.85%', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'GA - Conversions', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': 180, 'Apr': 190, 'May': 200, 'Jun': 210, 'Jul': 220, 'Aug': 240, 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingUp: true },
      { name: 'GA - CPA', sourceType: 'API', data: { 'Jan': '-', 'Feb': '-', 'Mar': '$44.44', 'Apr': '$44.73', 'May': '$45.00', 'Jun': '$45.23', 'Jul': '$45.45', 'Aug': '$42.91', 'Sep': '-', 'Oct': '-', 'Nov': '-', 'Dec': '-' }, isTrendingDown: true },
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
    { id: '3', name: 'Peter Jones', email: 'peter.jones@example.com', company: 'Tech Solutions', channel: 'Website', campaign: 'Free Trial Offer', campaignGroup: 'Product Marketing', dateAdded: '2023-08-21', stage: LeadStage.Qualified },
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
    { id: '5', name: 'Seguridad Electrónica - Industrias - Lectura de Placas', campaignGroupId: '4', status: 'Completed', startDate: '2023-08-10', endDate: '2023-08-25', leads: 12, cost: 2000, sent: 5000, delivered: 4950, opens: 1500, clicks: 300, revenue: 7500 },
    { id: '6', name: 'Seguridad Electrónica - Industrias - Reconocimiento facial', campaignGroupId: '4', status: 'Completed', startDate: '2023-08-15', endDate: '2023-07-15', leads: 18, cost: 2500, sent: 6200, delivered: 6100, opens: 1800, clicks: 450, revenue: 11200 },
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
        qualified: 50,
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