import { createContext } from 'react';
import {
  UserStats,
  AuctionStats,
  CategoryStats,
} from '../api/stats';

export interface StatsContextType {
  userStats: UserStats | null;
  auctionStats: AuctionStats | null;
  categoryStats: CategoryStats[] | null;
  userTimeSeries: { labels: string[]; data: number[] } | null;
  auctionTimeSeries: { labels: string[]; data: number[] } | null;
  auctionStatusTimeSeries: { labels: string[]; series: { name: string; data: number[] }[] } | null;
  auctionCategoryTimeSeries: { labels: string[]; series: { name: string; data: number[] }[] } | null;
  online?: {
    client: any[];
    admin: any[];
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const StatsContext = createContext<StatsContextType | undefined>(undefined);
