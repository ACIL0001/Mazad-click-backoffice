import { requests } from './utils';

export const OrderAPI = {
  updateStatus: (status: any): Promise<any> => requests.post('order/update/status', status),
  find: (status?: string): Promise<any> => requests.get(status ? `order/find/${status}` : 'order/find'),
  findByRestaurant: (id: string, status?: string): Promise<any> =>
    requests.get(status ? `order/find/restaurant/${id}/${status}` : `order/find/restaurant/${id}`),
  findOrder: (id: string): Promise<any> => requests.get(`order/find/${id}`),
};
