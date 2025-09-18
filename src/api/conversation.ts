import Conversation from '../types/Conversation';
import { requests } from './utils';

export const ConversationAPI = {
  get: (): Promise<any> => requests.get(`conversation/`),
  getById: (id: string): Promise<any> => requests.get(`conversation/${id}`),
  seen: (id: string): Promise<any> => requests.get(`conversation/seen/${id}`),
  findWith: (id: string): Promise<any> => requests.get(`conversation/findWith/${id}`),
  getGroups: (): Promise<any> => requests.get(`conversation/groups`),
  update: (conversation: Conversation): Promise<any> => requests.post('conversation/update/', conversation),
  delete: (ids: string[]): Promise<any> => requests.post('conversation/delete', { ids }),
  getOrCreateConversation: (userId: string): Promise<any> => requests.post('conversation/getOrCreate', { userId }),
};