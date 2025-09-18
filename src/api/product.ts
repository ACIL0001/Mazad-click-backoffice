import { requests } from './utils';

export const ProductAPI = {
  find: (): Promise<any> => requests.get('product/find'),
  findByRestaurant: (id: string): Promise<any> => requests.get(`product/find/restaurant/${id}`),
};
