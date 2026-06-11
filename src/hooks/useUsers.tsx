import { useContext } from 'react';
import { UserContext } from '@/contexts/UserContextStore';

const useUsers = () => useContext(UserContext);
// eslint-disable-next-line react-refresh/only-export-components
export default useUsers;
