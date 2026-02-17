import { requests } from "./utils";

export interface ChatUser {
  _id: string;
  firstName: string;
  lastName: string;
  AccountType: string;
  phone?: string;
}

export interface ChatData {
  users: ChatUser[];
  createdAt?: string;
}

export interface GetChatsParams {
  id: string;
  from: string;
}

export interface BroadcastData {
  message: string;
  sender: string;
  filterType: 'ALL' | 'SECTEUR' | 'WILAYA' | 'USERS';
  filterValue?: string[];
}

export const ChatAPI = {
  createChat: (data: ChatData): Promise<any> => requests.post('/chat/create', data),
  getChats: (data: GetChatsParams): Promise<any> => requests.post('/chat/getchats', data),
  getAdminChats: (): Promise<any> => requests.get('/chat/admin-chats'),
  broadcast: (data: BroadcastData): Promise<any> => requests.post('/chat/broadcast', data),
};