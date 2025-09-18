
export enum RoleCode {
  CLIENT = 'CLIENT',
  PROFESSIONAL = 'PROFESSIONAL',
  RESELLER = 'RESELLER',
  SOUS_ADMIN = 'SOUS_ADMIN',
  ADMIN = 'ADMIN',
}

// Role hierarchy levels (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [RoleCode.CLIENT]: 1,
  [RoleCode.PROFESSIONAL]: 2,
  [RoleCode.RESELLER]: 3,
  [RoleCode.SOUS_ADMIN]: 4,
  [RoleCode.ADMIN]: 5,
};

// Permission checking utilities
export const hasAdminPrivileges = (role?: RoleCode): boolean => {
  return role === RoleCode.ADMIN || role === RoleCode.SOUS_ADMIN;
};

export const isFullAdmin = (role?: RoleCode): boolean => {
  return role === RoleCode.ADMIN;
};

export const isSousAdmin = (role?: RoleCode): boolean => {
  return role === RoleCode.SOUS_ADMIN;
};

export const hasMinimumRole = (userRole?: RoleCode, requiredRole?: RoleCode): boolean => {
  if (!userRole || !requiredRole) return false;
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};

export default interface Role {
  id: string,
  code: RoleCode
}
