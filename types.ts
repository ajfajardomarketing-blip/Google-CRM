export enum View {
  Dashboard = 'Dashboard',
  Integrations = 'Integrations',
  CRM = 'CRM',
  Campaigns = 'Campaigns',
  Goals = 'Goals',
}

export interface MetricData {
  [week: string]: string | number;
}

export interface Metric {
  name: string;
  data: MetricData;
  isStarred?: boolean;
  isTrendingDown?: boolean;
  isTrendingUp?: boolean;
  isHighlighted?: boolean;
}

export interface PlatformMetrics {
  name:string;
  metrics: Metric[];
}

export enum IntegrationStatus {
  Connected = 'Connected',
  Available = 'Available',
}

export interface Integration {
  name: string;
  category: string;
  logo: string;
  status: IntegrationStatus;
}

export enum LeadStage {
  Lead = 'Lead',
  Opportunity = 'Opportunity',
  Conversion = 'Conversion',
  Discarded = 'Discarded',
  Eliminar = 'Eliminar',
}

export interface Lead {
  id: string; // Changed to string for Firestore compatibility
  name: string;
  email: string;
  company: string;
  channel: string;
  campaign: string;
  campaignGroup: string;
  dateAdded: string;
  stage: LeadStage;
  stageDates?: Partial<Record<LeadStage, string>>;
  dealValue?: number;
}

export interface CampaignGroup {
  id: string; // Changed to string for Firestore compatibility
  name: string;
  channel: string;
  order: number;
}

export interface Campaign {
  id: string; // Changed to string for Firestore compatibility
  name: string;
  campaignGroupId: string; // Changed to string for Firestore compatibility
  status: 'Active' | 'Completed' | 'Paused';
  startDate: string;
  endDate?: string;
  leads: number;
  cost: number;
  // Email Marketing specific metrics
  sent?: number;
  delivered?: number;
  opens?: number;
  clicks?: number;
  revenue?: number;
  // Ads specific metrics
  impressions?: number;
  cpc?: number;
  conversions?: number;
  cpa?: number;
  roas?: number;
  // Organic Social specific metrics
  reach?: number;
  engagement?: number;
  followerGrowth?: number;
  websiteClicks?: number;
  // Events specific metrics
  registered?: number;
  attendees?: number;
}

export interface FunnelStage {
  name: string;
  value: number;
  monetaryValue: number;
  conversionRate: number;
}

export interface HistoricalDataPoint {
  month: string;
  value: number;
}

export interface HistoricalTrend {
  name: string;
  data: HistoricalDataPoint[];
}

export interface GoalSettings {
    leads: {
        total: number;
        opportunities: number;
        conversions: number;
    };
    metrics: {
        [channelName: string]: {
            [metricName: string]: number;
        };
    };
}