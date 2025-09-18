import { RoleCode, hasAdminPrivileges, isFullAdmin, isSousAdmin, hasMinimumRole } from '@/types/Role';

// Permission matrix - defines what each role can access
export const PERMISSIONS = {
  // User Management
  VIEW_USERS: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  MANAGE_USERS: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  DELETE_USERS: [RoleCode.ADMIN],
  
  // Admin Management  
  CREATE_ADMIN: [RoleCode.ADMIN],
  CREATE_SOUS_ADMIN: [RoleCode.ADMIN],
  DELETE_ADMIN: [RoleCode.ADMIN],
  MANAGE_ADMIN_USERS: [RoleCode.ADMIN],
  
  // Content Management
  MANAGE_AUCTIONS: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  MANAGE_CATEGORIES: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  MODERATE_CONTENT: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  
  // System Settings
  SYSTEM_CONFIGURATION: [RoleCode.ADMIN],
  PAYMENT_SETTINGS: [RoleCode.ADMIN],
  MANAGE_TERMS: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  
  // Communication
  SEND_NOTIFICATIONS: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  MANAGE_COMMUNICATION: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  VIEW_CHAT: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  
  // Reports & Analytics
  VIEW_BASIC_STATS: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  VIEW_FINANCIAL_REPORTS: [RoleCode.ADMIN],
  VIEW_DETAILED_ANALYTICS: [RoleCode.ADMIN],
  
  // Identity Verification
  MANAGE_IDENTITIES: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  
  // Subscriptions
  VIEW_SUBSCRIPTIONS: [RoleCode.ADMIN, RoleCode.SOUS_ADMIN],
  MANAGE_SUBSCRIPTION_PLANS: [RoleCode.ADMIN],
  PROCESS_PAYMENTS: [RoleCode.ADMIN],
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (userRole?: RoleCode, permission?: keyof typeof PERMISSIONS): boolean => {
  if (!userRole || !permission) return false;
  return PERMISSIONS[permission]?.includes(userRole) || false;
};

/**
 * Check if user can access a specific route/feature
 */
export const canAccessRoute = (userRole?: RoleCode, route?: string): boolean => {
  if (!userRole || !route) return false;
  
  // Admin routes
  if (route.includes('/admin')) {
    return hasAdminPrivileges(userRole);
  }
  
  // Route-specific permissions
  switch (true) {
    case route.includes('/users'):
      return hasPermission(userRole, 'VIEW_USERS');
    
    case route.includes('/auctions'):
      return hasPermission(userRole, 'MANAGE_AUCTIONS');
    
    case route.includes('/categories'):
    case route.includes('/sous-categories'):
    case route.includes('/sous-sous-categories'):
      return hasPermission(userRole, 'MANAGE_CATEGORIES');
    
    case route.includes('/configuration'):
      return hasPermission(userRole, 'SYSTEM_CONFIGURATION');
    
    case route.includes('/subscription'):
      return hasPermission(userRole, 'VIEW_SUBSCRIPTIONS');
    
    case route.includes('/communication'):
      return hasPermission(userRole, 'MANAGE_COMMUNICATION');
    
    case route.includes('/chat'):
      return hasPermission(userRole, 'VIEW_CHAT');
    
    case route.includes('/identities'):
      return hasPermission(userRole, 'MANAGE_IDENTITIES');
    
    case route.includes('/terms'):
      return hasPermission(userRole, 'MANAGE_TERMS');
    
    default:
      // Default dashboard access for admin users
      return hasAdminPrivileges(userRole);
  }
};

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role?: RoleCode): string => {
  switch (role) {
    case RoleCode.ADMIN:
      return 'Administrateur';
    case RoleCode.SOUS_ADMIN:
      return 'Sous-Administrateur';
    case RoleCode.PROFESSIONAL:
      return 'Professionnel';
    case RoleCode.RESELLER:
      return 'Revendeur';
    case RoleCode.CLIENT:
      return 'Client';
    default:
      return 'Utilisateur';
  }
};

/**
 * Get user role badge color
 */
export const getRoleBadgeColor = (role?: RoleCode): 'error' | 'warning' | 'info' | 'success' | 'default' => {
  switch (role) {
    case RoleCode.ADMIN:
      return 'error';
    case RoleCode.SOUS_ADMIN:
      return 'warning';
    case RoleCode.PROFESSIONAL:
      return 'info';
    case RoleCode.RESELLER:
      return 'success';
    case RoleCode.CLIENT:
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Check if a navigation item should be inactive (visible but not clickable) for a specific role
 */
export const isNavItemInactive = (userRole?: RoleCode, route?: string): boolean => {
  if (!userRole || !route) return false;
  
  // Items that should be inactive for SOUS_ADMIN
  if (userRole === RoleCode.SOUS_ADMIN) {
    switch (true) {
      case route.includes('/admin') && route !== '/dashboard/admin/profile' && route !== '/dashboard/admin/permissions':
        return true; // Administration section (except profile and permissions)
      case route.includes('/subscription'):
        return true; // Abonnements
      case route.includes('/terms'):
        return true; // Conditions Générales
      case route.includes('/configuration'):
        return true; // Configuration (system settings)
      default:
        return false;
    }
  }
  
  return false;
};

/**
 * Enhanced filter navigation items based on user permissions with inactive state support
 */
export const filterNavItemsByPermissions = (navItems: any[], userRole?: RoleCode): any[] => {
  return navItems.filter(item => {
    // Check if user can access this route
    if (item.path && !canAccessRoute(userRole, item.path)) {
      return false;
    }
    
    // Check for admin-only items
    if (item.adminOnly && !isFullAdmin(userRole)) {
      return false;
    }
    
    // Check for sous-admin items
    if (item.requiresAdmin && !hasAdminPrivileges(userRole)) {
      return false;
    }
    
    // Add inactive state for items that should be visible but not clickable
    if (item.path && isNavItemInactive(userRole, item.path)) {
      item.inactive = true;
    }
    
    // Filter children recursively
    if (item.children) {
      item.children = item.children.map((child: any) => {
        // Add inactive state to children as well
        if (child.path && isNavItemInactive(userRole, child.path)) {
          child.inactive = true;
        }
        return child;
      }).filter((child: any) => {
        // Check permissions for children
        if (child.adminOnly && !isFullAdmin(userRole)) {
          return false;
        }
        if (child.requiresAdmin && !hasAdminPrivileges(userRole)) {
          return false;
        }
        return true;
      });
      
      // Keep parent if it has children or if it's just inactive (not completely hidden)
      return item.children.length > 0 || item.inactive;
    }
    
    return true;
  });
};
