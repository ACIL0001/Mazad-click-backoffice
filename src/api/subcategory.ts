import { requests } from './utils';

export const SubCategoryAPI = {
  create: (data: any): Promise<any> => requests.post('subcategory', data),
  get: (): Promise<any> => requests.get('subcategory'),
  getById: (id: string): Promise<any> => requests.get(`subcategory/${id}`),
  update: (id: string, data: FormData): Promise<any> => requests.patch(`subcategory/${id}`, data),
  delete: (id: string): Promise<any> => requests.delete(`subcategory/${id}`),
};
