import { useContext } from 'react';
import { IdentityContext } from '@/contexts/IdentityContext';

const useIdentity = () => useContext(IdentityContext);
export default useIdentity;
