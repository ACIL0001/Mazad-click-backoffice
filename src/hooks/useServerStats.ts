import { useContext } from 'react';
import { StatsContext } from '@/contexts/StatsContextStore';

const useServerStats = () => useContext(StatsContext);
// eslint-disable-next-line react-refresh/only-export-components
export default useServerStats;
