import { requests } from './utils';

export const DeliveryAPI = {
  updateStatus: (status: any): Promise<any> => requests.post('delivery/update/status', status),
  find: (status?: string): Promise<any> => requests.get(status ? `delivery/find/${status}` : 'delivery/find'),
  findByOrder: (id: string): Promise<any> => requests.get(`delivery/findByOrder/${id}`),
  findByRider: (id: string, status?: string): Promise<any> =>
    requests.get(status ? `delivery/find/rider/${id}/${status}` : `delivery/find/rider/${id}`),
};
