/** @format */

import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth';
import Identity from '@/types/Identity';
import { IdentityAPI } from '@/api/identity';



interface IIdentityContext {
  identities: Identity[]
  updateIdentity: () => Promise<void>;
}

export const IdentityContext = createContext<IIdentityContext>({
  identities: [] as Identity[],
  updateIdentity: async () => {},
});

const IdentityProvider = ({ children }: any) => {

    const [identities, setIdentities] = useState<Identity[]>([]) 
    const { isReady, isLogged } = useAuth();

    const updateIdentity = async () => {

    IdentityAPI.getAllIdentities().then(({ data }: { data: Identity[] }) => {

        setIdentities(data)
    });
  };

  useEffect(() => {
    if (!isReady || !isLogged) return;
    updateIdentity();
  }, [isLogged, isReady]);

  return (
    <IdentityContext.Provider
      value={{
        identities,
        updateIdentity,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export default IdentityProvider;