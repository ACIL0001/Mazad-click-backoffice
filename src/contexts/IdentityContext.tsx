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
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);
    const { isReady, isLogged } = useAuth();

    const updateIdentity = async () => {
        // Prevent fetching more than once every 5 seconds
        const now = Date.now();
        if (now - lastFetchTime < 5000) {
            console.log('IdentityContext: Skipping fetch - too soon since last fetch');
            return;
        }
        
        setLastFetchTime(now);
        IdentityAPI.getAllIdentities().then((data: IdentityDocument[]) => {
            setIdentities(data)
        }).catch((error) => {
            console.error('IdentityContext: Failed to fetch identities:', error);
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