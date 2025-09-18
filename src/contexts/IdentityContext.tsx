/** @format */

import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth';
import { IdentityAPI, IdentityDocument } from '@/api/identity';

interface IIdentityContext {
  identities: IdentityDocument[]
  updateIdentity: () => Promise<void>;
}

export const IdentityContext = createContext<IIdentityContext>({
  identities: [] as IdentityDocument[],
  updateIdentity: async () => {},
});

const IdentityProvider = ({ children }: any) => {

    const [identities, setIdentities] = useState<IdentityDocument[]>([]) 
    const { isReady, isLogged } = useAuth();

    const updateIdentity = async () => {
        IdentityAPI.getAllIdentities().then((data: IdentityDocument[]) => {
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