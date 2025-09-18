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
    const { isReady, isLogged } = useAuth();

    const updateAdmins = useCallback(async () => {
        try {
            const { data } = await UserAPI.getAdmins();
            setAdmins(data);
        } catch (error) {
            console.error('Error fetching admins:', error);
        }
    }, []);

    const updateClients = useCallback(async () => {
        try {
            const { data } = await UserAPI.getClients();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    }, []);

    const updateAllUsers = useCallback(async () => {
        try {
            const { data } = await UserAPI.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching all users:', error);
        }
    }, []);

    useEffect(() => {
        if (!isReady || !isLogged) return;
        updateAllUsers();
        updateAdmins();
        updateClients();
    }, [isLogged, isReady, updateAllUsers, updateAdmins, updateClients]);

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