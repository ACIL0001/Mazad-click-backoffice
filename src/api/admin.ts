import { requests } from './utils';

export interface CreateAdminDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  type: 'ADMIN' | 'SOUS_ADMIN';
}

export interface UpdateAdminDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE';
  type?: 'ADMIN' | 'SOUS_ADMIN';
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface PermissionCheckDto {
  action: string;
}

export const AdminAPI = {
  // Get all admin users
  getAllAdmins: (): Promise<any> => requests.get('admin/all'),
  
  // Get admin users only (excluding sous admin)
  getAdminsOnly: (): Promise<any> => requests.get('admin/admins-only'),
  
  // Get sous admin users only
  getSousAdmins: (): Promise<any> => requests.get('admin/sous-admins'),
  
  // Create new admin user
  createAdmin: (adminData: CreateAdminDto): Promise<any> => 
    requests.post('admin/create-admin', adminData),
  
  // Create new sous admin user
  createSousAdmin: (adminData: CreateAdminDto): Promise<any> => 
    requests.post('admin/create-sous-admin', adminData),
  
  // Update admin user
  updateAdmin: (id: string, updateData: UpdateAdminDto): Promise<any> => 
    requests.put(`admin/update/${id}`, updateData),
  
  // Delete admin user
  deleteAdmin: (id: string): Promise<any> => 
    requests.delete(`admin/delete/${id}`),
  
  // Change admin password
  changePassword: (id: string, passwordData: ChangePasswordDto): Promise<any> => 
    requests.put(`admin/change-password/${id}`, passwordData),
  
  // Get current admin profile
  getProfile: (): Promise<any> => requests.get('admin/profile'),
  
  // Check specific permission
  checkPermission: (permissionData: PermissionCheckDto): Promise<any> => 
    requests.post('admin/check-permission', permissionData),
};
