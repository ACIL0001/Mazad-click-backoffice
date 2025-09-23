/** @format */

import { useState, useEffect, createContext, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { UserAPI } from '@/api/user';
import User from '@/types/User';

interface IUserContext {
  users: User[];
  updateAllUsers: () => Promise<void>;
  updateClients: () => Promise<void>;
  updateAdmins: () => Promise<void>;
  admins: User[];
  clients: User[];
}

export const UserContext = createContext<IUserContext>({
  users: [] as User[],
  updateAllUsers: async () => {},
  updateClients: async () => {},
  updateAdmins: async () => {},
  admins: [],
  clients: [],
});

const UserProvider = ({ children }: any) => {
    const [users, setUsers] = useState<User[]>([]) 
    const [admins, setAdmins] = useState<User[]>([]);
    const [clients, setClients] = useState<User[]>([]);
    const { isReady, isLogged, auth, tokens } = useAuth();

    const updateAdmins = useCallback(async () => {
        try {
            console.log('Fetching admins - Auth state:', { isLogged, isReady, hasTokens: !!tokens?.accessToken });
            const { data } = await UserAPI.getAdmins();
            setAdmins(data);
        } catch (error) {
            console.error('Error fetching admins:', error);
        }
    }, [isLogged, isReady, tokens]);

    const updateClients = useCallback(async () => {
        try {
            console.log('Fetching clients - Auth state:', { isLogged, isReady, hasTokens: !!tokens?.accessToken });
            const { data } = await UserAPI.getClients();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    }, [isLogged, isReady, tokens]);

    const updateAllUsers = useCallback(async () => {
        try {
            console.log('Fetching all users - Auth state:', { isLogged, isReady, hasTokens: !!tokens?.accessToken });
            const { data } = await UserAPI.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching all users:', error);
        }
    }, [isLogged, isReady, tokens]);

    useEffect(() => {
        // FIXED: Ensure we have tokens before making API calls
        if (!isReady || !isLogged || !tokens?.accessToken) {
            console.log('Not ready for API calls yet:', { isReady, isLogged, hasTokens: !!tokens?.accessToken });
            return;
        }

        // Add a small delay to ensure auth interceptor has the latest tokens
        const timer = setTimeout(() => {
            console.log('Making API calls with tokens available');
            updateAllUsers();
            updateAdmins();
            updateClients();
        }, 100); // 100ms delay to ensure tokens are ready

        return () => clearTimeout(timer);
    }, [isLogged, isReady, tokens?.accessToken, updateAllUsers, updateAdmins, updateClients]);

    return (
        <UserContext.Provider
            value={{
                users,
                updateAllUsers,
                updateClients,
                updateAdmins,
                admins,
                clients,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;