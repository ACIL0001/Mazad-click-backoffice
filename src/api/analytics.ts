import { requests } from './utils';

export interface DateRangeParams {
  from?: string;
  to?: string;
  granularity?: 'hourly' | 'daily';
  userType?: string;
  deviceType?: string;
  wilaya?: string;
  eventName?: string;
  urlPath?: string;
}

export interface OverviewData {
  totalSessions: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  avgPagesPerSession: number;
  topEvents: { eventName: string; count: number }[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  sourceBreakdown: Record<string, number>;
  dateRange: { from: string; to: string };
}

export interface TrafficData {
  trend: any[];
  topLandingPages: { page: string; sessions: number }[];
  topReferrers: { referrer: string; sessions: number }[];
  dateRange: { from: string; to: string };
}

export interface GeographicData {
  wilayas: {
    wilaya: string;
    sessions: number;
    uniqueVisitors: number;
    avgDuration: number;
    bounceRate: number;
  }[];
  dateRange: { from: string; to: string };
}

export interface FunnelStep {
  step: string;
  count: number;
  dropoff: number;
  conversionFromPrevious: number;
}

export interface FunnelsData {
  auctionFunnel: FunnelStep[];
  tenderFunnel: FunnelStep[];
  directSalesFunnel: FunnelStep[];
  dateRange: { from: string; to: string };
}

export interface JourneysData {
  nodes: { id: string }[];
  links: { source: string; target: string; value: number }[];
  totalSessions: number;
  dateRange: { from: string; to: string };
}

export interface HeatmapsData {
  urlPath: string;
  clicks: any[];
  rageClicks: any[];
  deadClicks: any[];
  scrollDepthDistribution: { depth: number; count: number }[];
  dateRange: { from: string; to: string };
}

export interface SearchData {
  topSearches: { query: string; count: number; avgResults: number }[];
  zeroResults: { query: string; count: number }[];
  searchTrend: any[];
  totalSearches: number;
  clickThroughRate: number;
  dateRange: { from: string; to: string };
}

export interface EcommerceData {
  bids: { count: number; totalValue: number; avgValue: number; };
  tenders: { count: number; totalValue: number; };
  directSales: { count: number; totalValue: number; };
  subscriptions: { count: number; totalValue: number; };
  transactionBreakdown: { category: string; type: string; count: number; totalValue: number; }[];
  dateRange: { from: string; to: string };
}

export interface RealtimeData {
  activeUsers: number;
  pageViewsPerMinute: number;
  activePages: { page: string; viewers: number }[];
  timestamp: string;
}

export const AnalyticsAPI = {
  // Dashboard endpoints
  getOverview: (params?: DateRangeParams): Promise<OverviewData> =>
    requests.get('analytics/dashboard/overview', { params }),

  getTraffic: (params?: DateRangeParams): Promise<TrafficData> =>
    requests.get('analytics/dashboard/traffic', { params }),

  getGeographic: (params?: DateRangeParams): Promise<GeographicData> =>
    requests.get('analytics/dashboard/geographic', { params }),

  getFunnels: (params?: DateRangeParams): Promise<FunnelsData> =>
    requests.get('analytics/dashboard/funnels', { params }),

  getJourneys: (params?: DateRangeParams): Promise<JourneysData> =>
    requests.get('analytics/dashboard/journeys', { params }),

  getHeatmaps: (params?: DateRangeParams): Promise<HeatmapsData> =>
    requests.get('analytics/dashboard/heatmaps', { params }),

  getSearch: (params?: DateRangeParams): Promise<SearchData> =>
    requests.get('analytics/dashboard/search', { params }),

  getEcommerce: (params?: DateRangeParams): Promise<EcommerceData> =>
    requests.get('analytics/dashboard/ecommerce', { params }),

  getUserProfile: (userId: string): Promise<any> =>
    requests.get(`analytics/dashboard/users/${userId}`),

  getCohorts: (params?: DateRangeParams): Promise<any> =>
    requests.get('analytics/dashboard/cohorts', { params }),

  getRealtime: (): Promise<RealtimeData> =>
    requests.get('analytics/dashboard/realtime'),

  getEvents: (params?: DateRangeParams & { page?: number; limit?: number }): Promise<any> =>
    requests.get('analytics/dashboard/events', { params }),
};
