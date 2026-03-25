import { requests } from './utils';

export interface UserStatusStats {
  total: number;
  verified: number;
  unverified: number;
  active: number;
  inactive: number;
  banned: number;
  notBanned: number;
  recommended: number;
  notRecommended: number;
  certified?: number;
}

export interface UserStats {
  total: number;
  verified: number;
  active: number;
  banned: number;
  recommended: number;
  certified: number;
  byType: {
    admin: UserStatusStats | number;
    professional: UserStatusStats;
    client: UserStatusStats;
    reseller: UserStatusStats;
  };
}

export interface TenderStats {
  total: number;
  byStatus: {
    open: number;
    awarded: number;
    closed: number;
    archived: number;
  };
  byType: {
    product: number;
    service: number;
  };
  dailyAverage: number;
  weeklyGrowth: number;
}

export interface AuctionStats {
  total: number;
  byStatus: {
    active: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  byCategory: {
    name: string;
    count: number;
    _id: string;
  }[];
  dailyAverage: number;
  weeklyGrowth: number;
}

export interface CategoryStats {
  name: string;
  count: number;
  _id: string;
}

export interface PlatformOverview {
  users: UserStats;
  auctions: AuctionStats;
  tenders: TenderStats;
  lastUpdated: Date;
}

export interface DashboardWidget {
  title: string;
  value: number;
  icon: string;
}

export interface DashboardStats {
  widgets: DashboardWidget[];
}

export interface SectorStats {
  sector: string;
  count: number;
}

export const StatsAPI = {
  getUserStats: (): Promise<UserStats> => requests.get('stats/users'),
  getAuctionStats: (): Promise<AuctionStats> => requests.get('stats/auctions'),
  getTenderStats: (): Promise<TenderStats> => requests.get('stats/tenders'),
  getCategoryStats: (): Promise<CategoryStats[]> => requests.get('stats/categories'),
  getSummary: (): Promise<any> => requests.get('stats/summary'),
  getDashboardStats: (): Promise<DashboardStats> => requests.get('stats/dashboard'),
  getUserTimeSeries: (): Promise<{ labels: string[]; data: number[] }> => requests.get('stats/users/timeseries'),
  getAuctionTimeSeries: (): Promise<{ labels: string[]; data: number[] }> => requests.get('stats/auctions/timeseries'),
  getTenderTimeSeries: (): Promise<{ labels: string[]; data: number[] }> => requests.get('stats/tenders/timeseries'),
  getAuctionStatusTimeSeries: (): Promise<{ labels: string[]; series: { name: string; data: number[] }[] }> => requests.get('stats/auctions/status-timeseries'),
  getAuctionCategoryTimeSeries: (): Promise<{ labels: string[]; series: { name: string; data: number[] }[] }> => requests.get('stats/auctions/category-timeseries'),
  getUsersBySector: (): Promise<SectorStats[]> => requests.get('stats/users/by-sector'),
};