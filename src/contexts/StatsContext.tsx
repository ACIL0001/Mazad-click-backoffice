import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  StatsAPI,
  UserStats,
  AuctionStats,
  CategoryStats,
} from '../api/stats';
import { useSnackbar } from 'notistack';

import { StatsContext } from './StatsContextStore';

interface StatsProviderProps {
  children: ReactNode;
}

export const StatsProvider = ({ children }: StatsProviderProps) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [auctionStats, setAuctionStats] = useState<AuctionStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[] | null>(null);
  const [userTimeSeries, setUserTimeSeries] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [auctionTimeSeries, setAuctionTimeSeries] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [auctionStatusTimeSeries, setAuctionStatusTimeSeries] = useState<{ labels: string[]; series: { name: string; data: number[] }[] } | null>(null);
  const [auctionCategoryTimeSeries, setAuctionCategoryTimeSeries] = useState<{ labels: string[]; series: { name: string; data: number[] }[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        fetchedUserStats,
        fetchedAuctionStats,
        fetchedCategoryStats,
        fetchedUserTimeSeries,
        fetchedAuctionTimeSeries,
        fetchedAuctionStatusTimeSeries,
        fetchedAuctionCategoryTimeSeries,
      ] = await Promise.all([
        StatsAPI.getUserStats(),
        StatsAPI.getAuctionStats(),
        StatsAPI.getCategoryStats(),
        StatsAPI.getUserTimeSeries(),
        StatsAPI.getAuctionTimeSeries(),
        StatsAPI.getAuctionStatusTimeSeries(),
        StatsAPI.getAuctionCategoryTimeSeries(),
      ]);

      setUserStats(fetchedUserStats);
      setAuctionStats(fetchedAuctionStats);
      setCategoryStats(fetchedCategoryStats);
      setUserTimeSeries(fetchedUserTimeSeries);
      setAuctionTimeSeries(fetchedAuctionTimeSeries);
      setAuctionStatusTimeSeries(fetchedAuctionStatusTimeSeries);
      setAuctionCategoryTimeSeries(fetchedAuctionCategoryTimeSeries);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setError(err.message || 'Failed to fetch data');
      enqueueSnackbar('Erreur de chargement des statistiques.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  const value = {
    userStats,
    auctionStats,
    categoryStats,
    userTimeSeries,
    auctionTimeSeries,
    auctionStatusTimeSeries,
    auctionCategoryTimeSeries,
    loading,
    error,
    refetch,
  };

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
};



export default StatsProvider;