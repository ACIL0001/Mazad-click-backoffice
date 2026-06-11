import { createContext } from 'react';
import User from '@/types/User';

export interface IUserContext {
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
