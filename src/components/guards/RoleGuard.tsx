import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { RoleCode, hasAdminPrivileges, isFullAdmin } from '@/types/Role';
import { hasPermission, canAccessRoute, PERMISSIONS } from '@/utils/permissions';
import useAuth from '@/hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: RoleCode;
  requiredPermission?: keyof typeof PERMISSIONS;
  adminOnly?: boolean;
  sousAdminAccess?: boolean;
  route?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

/**
 * RoleGuard component that protects content based on user roles and permissions
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  adminOnly = false,
  sousAdminAccess = false,
  route,
  fallback,
  showFallback = true,
}) => {
  const { user } = useAuth();
  const userRole = user?.type as RoleCode;

  // Check permissions
  const hasAccess = React.useMemo(() => {
    if (!userRole) return false;

    // Admin only check
    if (adminOnly && !isFullAdmin(userRole)) {
      return false;
    }

    // Sous admin access check
    if (sousAdminAccess && !hasAdminPrivileges(userRole)) {
      return false;
    }

    // Specific role requirement
    if (requiredRole && userRole !== requiredRole && !isFullAdmin(userRole)) {
      return false;
    }

    // Permission-based check
    if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
      return false;
    }

    // Route-based check
    if (route && !canAccessRoute(userRole, route)) {
      return false;
    }

    return true;
  }, [userRole, requiredRole, requiredPermission, adminOnly, sousAdminAccess, route]);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showFallback) {
      return null;
    }

    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Accès non autorisé
          </Alert>
          <Typography variant="h6" gutterBottom>
            Permissions insuffisantes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette section.
            {adminOnly && ' Cette fonctionnalité est réservée aux administrateurs.'}
            {sousAdminAccess && ' Cette fonctionnalité nécessite des privilèges administrateur.'}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
};

/**
 * AdminOnlyGuard - Restricts access to full admin users only
 */
export const AdminOnlyGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => {
  return (
    <RoleGuard adminOnly fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

/**
 * SousAdminGuard - Allows both admin and sous admin access
 */
export const SousAdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => {
  return (
    <RoleGuard sousAdminAccess fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

/**
 * PermissionGuard - Checks specific permissions
 */
export const PermissionGuard: React.FC<{
  children: React.ReactNode;
  permission: keyof typeof PERMISSIONS;
  fallback?: React.ReactNode;
}> = ({ children, permission, fallback }) => {
  return (
    <RoleGuard requiredPermission={permission} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

/**
 * ConditionalRender - Conditionally renders content based on permissions
 * Use this for inline conditional rendering without fallback UI
 */
export const ConditionalRender: React.FC<{
  children: React.ReactNode;
  condition?: boolean;
  role?: RoleCode;
  permission?: keyof typeof PERMISSIONS;
  adminOnly?: boolean;
  sousAdminAccess?: boolean;
}> = ({ children, condition, role, permission, adminOnly, sousAdminAccess }) => {
  const { user } = useAuth();
  const userRole = user?.type as RoleCode;

  const shouldRender = React.useMemo(() => {
    if (condition !== undefined) return condition;

    if (adminOnly && !isFullAdmin(userRole)) return false;
    if (sousAdminAccess && !hasAdminPrivileges(userRole)) return false;
    if (role && userRole !== role && !isFullAdmin(userRole)) return false;
    if (permission && !hasPermission(userRole, permission)) return false;

    return true;
  }, [condition, role, permission, adminOnly, sousAdminAccess, userRole]);

  if (!shouldRender) return null;

  return <>{children}</>;
};

export default RoleGuard;
