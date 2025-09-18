import { requests } from './utils';

export enum NotificationCategory {
  TASK = 'Task',
  EVENT = 'Event',
  NOTE = 'Note',
  CONTACT = 'User',
  All = 'All',
  SYSTEM = 'SYSTEM',
}

export enum NotificationAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

export const NotificationAPI = {
  getAll: (): Promise<any> => requests.get(`notification`),
  SubmitPushNotification: async (notificationData: {
    title: string;
    description: string;
    client: boolean;
    rider: boolean;
    retaurant: boolean;
  }) => requests.post('notification/a/submit/pushnotifcation', notificationData),
  SubmitEmailNotification: async (notificationData: {
    title: string;
    description: string;
    client: boolean;
    rider: boolean;
    restaurant: boolean;
  }) => requests.post('notification/a/submit/emailnotification', notificationData),
  markAllChatNotificationsAsRead: (chatId: string): Promise<any> => requests.put(`notification/chat/${chatId}/read`, {}),
};
