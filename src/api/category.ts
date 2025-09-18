import { requests } from './utils';

export const CategoryAPI = {
  // Basic CRUD operations
  getCategories: (): Promise<any> => requests.get('category'),
  getCategoryById: (id: string): Promise<any> => requests.get(`category/${id}`),
  
  // FIXED: Updated create method to handle both regular data and FormData
  create: (data: any): Promise<any> => {
    // If data is FormData (contains image), use multipart/form-data
    if (data instanceof FormData) {
      return requests.post('category', data, true).then(res => res.data);
    }
    // Otherwise, send as regular JSON
    return requests.post('category', data);
  },
  
  update: (id: string, data: any): Promise<any> => requests.patch(`category/${id}`, data), 
  delete: (id: string): Promise<any> => requests.delete(`category/${id}`),
  
  // New nested category operations
  getRootCategories: (): Promise<any> => requests.get('category/roots'),
  getCategoryTree: (): Promise<any> => requests.get('category/tree'),
  getCategoriesByParent: (parentId?: string): Promise<any> => 
    requests.get(`category/by-parent${parentId ? `?parentId=${parentId}` : ''}`),
  getCategoryWithAncestors: (id: string): Promise<any> => 
    requests.get(`category/${id}/with-ancestors`),
  getCategoryWithDescendants: (id: string): Promise<any> => 
    requests.get(`category/${id}/with-descendants`),
  
  // Move category to different parent
  moveCategory: (id: string, newParent?: string | null): Promise<any> => 
    requests.patch(`category/${id}/move`, { newParent }),
  
  // Delete category with all descendants (use with caution)
  deleteWithDescendants: (id: string): Promise<any> => 
    requests.delete(`category/${id}/with-descendants`),
};