import { requests } from './utils';

export interface Ad {
  _id: string;
  title: string;
  image: string | {
    _id: string;
    url: string;
    filename: string;
  };
  url: string;
  isActive: boolean;
  isDisplayed: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const AdsAPI = {
  // Get all ads
  getAds: async (): Promise<any> => {
    try {
      return await requests.get('ads');
    } catch (error: any) {
      // If endpoint doesn't exist (404), return empty array
      if (error?.response?.status === 404) {
        console.warn('Ads endpoint not found on backend. Returning empty array.');
        return [];
      }
      throw error;
    }
  },
  
  // Get single ad by ID
  getAdById: async (id: string): Promise<any> => {
    try {
      return await requests.get(`ads/${id}`);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error('Ad not found');
      }
      throw error;
    }
  },
  
  // Create new ad (with FormData for image upload)
  createAd: async (data: FormData | any): Promise<any> => {
    try {
      if (data instanceof FormData) {
        return await requests.post('ads', data);
      }
      return await requests.post('ads', data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error('Ads endpoint not found. Please ensure the backend /ads endpoint is implemented.');
      }
      throw error;
    }
  },
  
  // Update ad (supports image replacement)
  updateAd: async (id: string, data: FormData | any): Promise<any> => {
    try {
      if (data instanceof FormData) {
        return await requests.put(`ads/${id}`, data);
      }
      return await requests.patch(`ads/${id}`, data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error('Ads endpoint not found. Please ensure the backend /ads endpoint is implemented.');
      }
      throw error;
    }
  },
  
  // Delete ad
  deleteAd: async (id: string): Promise<any> => {
    try {
      return await requests.delete(`ads/${id}`);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error('Ads endpoint not found. Please ensure the backend /ads endpoint is implemented.');
      }
      throw error;
    }
  },
  
  // Toggle display status
  toggleAdDisplay: async (id: string, isDisplayed: boolean): Promise<any> => {
    try {
      return await requests.patch(`ads/${id}/display`, { isDisplayed });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error('Ads endpoint not found. Please ensure the backend /ads endpoint is implemented.');
      }
      throw error;
    }
  },
  
  // Toggle active status
  toggleAdActive: async (id: string, isActive: boolean): Promise<any> => {
    try {
      return await requests.patch(`ads/${id}/active`, { isActive });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error('Ads endpoint not found. Please ensure the backend /ads endpoint is implemented.');
      }
      throw error;
    }
  },
  
  // Bulk update order for sorting
  updateAdOrder: async (ads: { _id: string; order: number }[]): Promise<any> => {
    try {
      return await requests.patch('ads/order', { ads });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error('Ads endpoint not found. Please ensure the backend /ads endpoint is implemented.');
      }
      throw error;
    }
  },
};

