import { requests } from './utils';

export const SubSubCategoryAPI = {
  create: (data: any): Promise<any> => requests.post('subsubcategory', data),
  get: (): Promise<any> => requests.get('subsubcategory'),
  getById: (id: string): Promise<any> => requests.get(`subsubcategory/${id}`),
  getBySubCategory: (subcategoryId: string): Promise<any> => requests.get(`subsubcategory/by-subcategory/${subcategoryId}`),
  update: (id: string, data: FormData): Promise<any> => requests.patch(`subsubcategory/${id}`, data),
  delete: (id: string): Promise<any> => requests.delete(`subsubcategory/${id}`),
};