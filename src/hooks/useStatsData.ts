import { useState, useEffect } from 'react';
import { StatsAPI, UserStats, AuctionStats, CategoryStats } from '../api/stats';

interface UseStatsDataReturn {
  userStats: UserStats | null;
  auctionStats: AuctionStats | null;
  categoryStats: CategoryStats[] | null;
  userTimeSeries: { labels: string[]; data: number[] } | null;
  auctionTimeSeries: { labels: string[]; data: number[] } | null;
  auctionStatusTimeSeries: { labels: string[]; series: { name: string; data: number[] }[] } | null;
  auctionCategoryTimeSeries: { labels: string[]; series: { name: string; data: number[] }[] } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useStatsData = (): UseStatsDataReturn => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [auctionStats, setAuctionStats] = useState<AuctionStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[] | null>(null);
  const [userTimeSeries, setUserTimeSeries] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [auctionTimeSeries, setAuctionTimeSeries] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [auctionStatusTimeSeries, setAuctionStatusTimeSeries] = useState<{ labels: string[]; series: { name: string; data: number[] }[] } | null>(null);
  const [auctionCategoryTimeSeries, setAuctionCategoryTimeSeries] = useState<{ labels: string[]; series: { name: string; data: number[] }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [userData, auctionData, categoryData, userTS, auctionTS, auctionStatusTS, auctionCategoryTS] = await Promise.all([
        StatsAPI.getUserStats(),
        StatsAPI.getAuctionStats(),
        StatsAPI.getCategoryStats(),
        StatsAPI.getUserTimeSeries(),
        StatsAPI.getAuctionTimeSeries(),
        StatsAPI.getAuctionStatusTimeSeries(),
        StatsAPI.getAuctionCategoryTimeSeries(),
      ]);

      setUserStats(userData);
      setAuctionStats(auctionData);
      setCategoryStats(categoryData);
      setUserTimeSeries(userTS);
      setAuctionTimeSeries(auctionTS);
      setAuctionStatusTimeSeries(auctionStatusTS);
      setAuctionCategoryTimeSeries(auctionCategoryTS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    userStats,
    auctionStats,
    categoryStats,
    userTimeSeries,
    auctionTimeSeries,
    auctionStatusTimeSeries,
    auctionCategoryTimeSeries,
    loading,
    error,
    refetch: fetchStats,
  };
}; 