import { useContext } from 'react';
import { IdentityContext } from '@/contexts/IdentityContextStore';

const useIdentity = () => useContext(IdentityContext);
// eslint-disable-next-line react-refresh/only-export-components
export default useIdentity;
