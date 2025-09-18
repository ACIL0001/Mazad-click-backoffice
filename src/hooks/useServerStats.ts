import { useContext } from 'react';
import { StatsContext } from '@/contexts/StatsContext';

const useServerStats = () => useContext(StatsContext);
export default useServerStats;
