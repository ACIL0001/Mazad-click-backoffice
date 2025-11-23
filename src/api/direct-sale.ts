import { requests } from "./utils";

export const DirectSaleAPI = {
  getDirectSales: (): Promise<any> => requests.get('direct-sale/admin/all'),
  getDirectSaleById: (id: string): Promise<any> => requests.get(`direct-sale/${id}`),
  getPurchasesByDirectSale: (id: string): Promise<any> => requests.get(`direct-sale/${id}/purchases`),
  update: (id: string, data: any): Promise<any> => requests.put(`direct-sale/${id}`, data),
  delete: (id: string): Promise<any> => requests.delete(`direct-sale/${id}`),
};

