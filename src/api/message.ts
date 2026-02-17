import { requests } from './utils';

export const MessageAPI = {
  send: (message: any): Promise<any> => requests.post('message/create', message),
  read: (conversation_id: string): Promise<any> => requests.get(`message/getAll/${conversation_id}`),
  delete: (id: string): Promise<any> => requests.delete(`message/${id}`),
  markAllAsRead: (chatId: string): Promise<any> => requests.post(`message/mark-read/${chatId}`, {}),
  getByConversation: (conversationId: string): Promise<any> => requests.get(`message/conversation/${conversationId}`),
  getUnreadCount: (userId: string): Promise<any> => requests.get(`message/unread-count/${userId}`),
};