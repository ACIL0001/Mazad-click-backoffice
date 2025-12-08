import Device from '../types/Device';
import { requests } from './utils';
import { RoleCode } from "../types/Role";

export const UserAPI = {
  reset: (): Promise<any> => requests.delete('users/change-password'),
  logout: (): Promise<any> => requests.delete('auth/signout'),
  get: (): Promise<any> => requests.get(`users/me`),
  updateProfile: (updateData: any): Promise<any> => requests.put('users/me', updateData), 
  findById: (id: string): Promise<any> => requests.get(`users/${id}`), 
  setDevice: (device: Device): Promise<any> => requests.post('user/update/device', device),
  setAvatar: (avatar: FormData): Promise<any> => requests.post('users/me/avatar', avatar), 
  setPhone: (data: any): Promise<any> => requests.post('user/update/phone', data), // { tel, code }
  changePassword: (credentials: any): Promise<any> => requests.post(`users/change-password`, credentials),
  identity: (form: FormData): Promise<any> => requests.post('identities', form),
  
  // Admin role methods
  getAll: (): Promise<any> => requests.get(`users/all`),
  getAdmins: (): Promise<any> => requests.get(`users/admins`), 
  addSubscriptionPlan: (plan: string): Promise<any> => requests.post('users/subscription-plan', { plan }),
  updateSubscriptionPlan: (plan: string): Promise<any> => requests.put('users/subscription-plan', { plan }),
  verifyUser: (userId: string, isVerified: boolean): Promise<any> => requests.put(`users/verify/${userId}`, { isVerified }),
  
  // Returns all professionals (verified and unverified)
  getProfessionals: (): Promise<any> => requests.get('users/professionals'),
  // Returns only verified professionals
  getVerifiedProfessionals: (): Promise<any> => requests.get('users/professionals/verified'),
  getResellers: (): Promise<any> => requests.get('users/resellers/verified'),
  
  getClients: (): Promise<any> => requests.get('users/clients'),
  setUserActive: (userId: string, isActive: boolean): Promise<any> => requests.put(`users/active/${userId}`, { isActive }),
  setUserBanned: (userId: string, isBanned: boolean): Promise<any> => requests.put(`users/ban/${userId}`, { isBanned }),
  promoteToReseller: (userId: string): Promise<any> => requests.put(`users/promote-to-reseller/${userId}`, {}),
  deleteUser: (userId: string): Promise<any> => requests.delete(`users/${userId}`),
  
  // Additional methods needed by components
  getBuyers: (): Promise<any> => requests.get('users/buyers'),
  getSellers: (): Promise<any> => requests.get('users/sellers'),
  getRestaurants: (): Promise<any> => requests.get('users/restaurants'),
  getRiders: (): Promise<any> => requests.get('users/riders'),
  enable: (userId: string): Promise<any> => requests.put(`users/enable/${userId}`, {}),
  disable: (userId: string): Promise<any> => requests.put(`users/disable/${userId}`, {}),
  
  // Admin creation method
  createAdmin: (): Promise<any> => requests.post('users/create-admin', {}),

  // Recommendation methods
  recommendUser: (userId: string, isRecommended: boolean): Promise<any> => 
    requests.put(`users/recommend/${userId}`, { isRecommended }),
  
  getRecommendedProfessionals: (): Promise<any> => 
    requests.get('users/professionals/recommended'),
  
  getRecommendedResellers: (): Promise<any> => 
    requests.get('users/resellers/recommended'),

  // Certification methods
  setUserCertified: (userId: string, isCertified: boolean): Promise<any> => 
    requests.put(`users/certified/${userId}`, { isCertified }),
};