import { useContext } from 'react';
import { UserContext } from '@/contexts/UserContext';

const useUsers = () => useContext(UserContext);
export default useUsers;
