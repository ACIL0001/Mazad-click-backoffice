import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { SousAdminGuard } from '@/components/guards/RoleGuard';
import { RoleCode } from '@/types/Role';
import { getRoleDisplayName, getRoleBadgeColor } from '@/utils/permissions';
import { PERMISSIONS, hasPermission as checkPermission } from '@/utils/permissions';
import { requests } from '@/api/utils';
import useAuth from '@/hooks/useAuth';
import Page from '@/components/Page';
import Scrollbar from '@/components/Scrollbar';

interface PermissionCheck {
  action: string;
  description: string;
}

export default function AdminPermissions() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleCode>(RoleCode.SOUS_ADMIN);
  const [customAction, setCustomAction] = useState('');
  const [permissionResult, setPermissionResult] = useState<any>(null);

  const permissionCategories = [
    {
      name: t('admin.permissions.categories.userManagement'),
      permissions: [
        { action: 'VIEW_USERS', description: t('admin.permissions.permissionDescriptions.viewUsers') },
        { action: 'MANAGE_USERS', description: t('admin.permissions.permissionDescriptions.manageUsers') },
        { action: 'DELETE_USERS', description: t('admin.permissions.permissionDescriptions.deleteUsers') },
      ],
    },
    {
      name: t('admin.permissions.categories.administration'),
      permissions: [
        { action: 'CREATE_ADMIN', description: t('admin.permissions.permissionDescriptions.createAdmin') },
        { action: 'CREATE_SOUS_ADMIN', description: t('admin.permissions.permissionDescriptions.createSousAdmin') },
        { action: 'DELETE_ADMIN', description: t('admin.permissions.permissionDescriptions.deleteAdmin') },
        { action: 'MANAGE_ADMIN_USERS', description: t('admin.permissions.permissionDescriptions.manageAdminUsers') },
      ],
    },
    {
      name: t('admin.permissions.categories.contentManagement'),
      permissions: [
        { action: 'MANAGE_AUCTIONS', description: t('admin.permissions.permissionDescriptions.manageAuctions') },
        { action: 'MANAGE_CATEGORIES', description: t('admin.permissions.permissionDescriptions.manageCategories') },
        { action: 'MODERATE_CONTENT', description: t('admin.permissions.permissionDescriptions.moderateContent') },
        { action: 'MANAGE_TERMS', description: t('admin.permissions.permissionDescriptions.manageTerms') },
      ],
    },
    {
      name: t('admin.permissions.categories.systemConfiguration'),
      permissions: [
        { action: 'SYSTEM_CONFIGURATION', description: t('admin.permissions.permissionDescriptions.systemConfiguration') },
        { action: 'PAYMENT_SETTINGS', description: t('admin.permissions.permissionDescriptions.paymentSettings') },
      ],
    },
    {
      name: t('admin.permissions.categories.communication'),
      permissions: [
        { action: 'SEND_NOTIFICATIONS', description: t('admin.permissions.permissionDescriptions.sendNotifications') },
        { action: 'MANAGE_COMMUNICATION', description: t('admin.permissions.permissionDescriptions.manageCommunication') },
        { action: 'VIEW_CHAT', description: t('admin.permissions.permissionDescriptions.viewChat') },
      ],
    },
    {
      name: t('admin.permissions.categories.reportsAnalytics'),
      permissions: [
        { action: 'VIEW_BASIC_STATS', description: t('admin.permissions.permissionDescriptions.viewBasicStats') },
        { action: 'VIEW_FINANCIAL_REPORTS', description: t('admin.permissions.permissionDescriptions.viewFinancialReports') },
        { action: 'VIEW_DETAILED_ANALYTICS', description: t('admin.permissions.permissionDescriptions.viewDetailedAnalytics') },
      ],
    },
    {
      name: t('admin.permissions.categories.identitySubscriptions'),
      permissions: [
        { action: 'MANAGE_IDENTITIES', description: t('admin.permissions.permissionDescriptions.manageIdentities') },
        { action: 'VIEW_SUBSCRIPTIONS', description: t('admin.permissions.permissionDescriptions.viewSubscriptions') },
        { action: 'MANAGE_SUBSCRIPTION_PLANS', description: t('admin.permissions.permissionDescriptions.manageSubscriptionPlans') },
        { action: 'PROCESS_PAYMENTS', description: t('admin.permissions.permissionDescriptions.processPayments') },
      ],
    },
  ];

  const handleCheckPermission = async () => {
    if (!customAction.trim()) {
      enqueueSnackbar(t('admin.permissions.messages.enterAction'), { variant: 'warning' });
      return;
    }

    try {
      const response = await requests.post('admin/check-permission', {
        action: customAction.trim(),
      });
      setPermissionResult(response);
      enqueueSnackbar(t('admin.permissions.messages.checkSuccess'), { variant: 'success' });
    } catch (error: any) {
      console.error('Error checking permission:', error);
      enqueueSnackbar(
        error.response?.data?.message || t('admin.permissions.messages.checkError'),
        { variant: 'error' }
      );
    }
  };

  const hasRolePermission = (action: string, role: RoleCode): boolean => {
    return checkPermission(role, action as keyof typeof PERMISSIONS);
  };

  const getRoleDescription = (role: RoleCode): string => {
    const descriptions = {
      [RoleCode.ADMIN]: t('admin.permissions.roleDescriptions.admin'),
      [RoleCode.SOUS_ADMIN]: t('admin.permissions.roleDescriptions.sousAdmin'),
      [RoleCode.PROFESSIONAL]: t('admin.permissions.roleDescriptions.professional'),
      [RoleCode.RESELLER]: t('admin.permissions.roleDescriptions.reseller'),
      [RoleCode.CLIENT]: t('admin.permissions.roleDescriptions.client'),
    };
    return descriptions[role] || t('admin.permissions.roleDescriptions.standard');
  };

  const userRole = user?.type as RoleCode;

  return (
    <Page title={t('admin.permissions.title')}>
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h4" gutterBottom>
          {t('admin.permissions.title')}
        </Typography>

        <Grid container spacing={3}>
          {/* Permission Matrix */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('admin.permissions.matrix')}
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  {t('admin.permissions.matrixDescription')}
                </Alert>

                <Scrollbar>
                  <TableContainer component={Paper} variant="outlined">
                    <Table sx={{ minWidth: 800 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>{t('admin.permissions.categoryAction')}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            <Chip
                              label={t('admin.management.type.admin')}
                              color="error"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            <Chip
                              label={t('admin.management.type.sousAdmin')}
                              color="warning"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {permissionCategories.map((category) => (
                          <React.Fragment key={category.name}>
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                sx={{
                                  bgcolor: 'grey.100',
                                  fontWeight: 'bold',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {category.name}
                              </TableCell>
                            </TableRow>
                            {category.permissions.map((permission) => (
                              <TableRow key={permission.action} hover>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                      {permission.description}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {permission.action}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  {hasRolePermission(permission.action, RoleCode.ADMIN) ? (
                                    <CheckIcon color="success" />
                                  ) : (
                                    <CancelIcon color="error" />
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {hasRolePermission(permission.action, RoleCode.SOUS_ADMIN) ? (
                                    <CheckIcon color="success" />
                                  ) : (
                                    <CancelIcon color="error" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Scrollbar>
              </CardContent>
            </Card>
          </Grid>

          {/* Role Descriptions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('admin.permissions.roleDescriptions')}
                </Typography>
                
                <Stack spacing={2}>
                  {[RoleCode.ADMIN, RoleCode.SOUS_ADMIN].map((role) => (
                    <Box key={role}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Chip
                          label={getRoleDisplayName(role)}
                          color={getRoleBadgeColor(role)}
                          size="small"
                        />
                        {userRole === role && (
                          <Chip
                            label={t('admin.permissions.yourRole')}
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {getRoleDescription(role)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Permission Checker */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <KeyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('admin.permissions.checker')}
                </Typography>
                
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label={t('admin.permissions.actionToCheck')}
                    placeholder="Ex: CREATE_ADMIN, MANAGE_USERS, etc."
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    helperText={t('admin.permissions.actionHelper')}
                  />
                  
                  <Button
                    variant="contained"
                    onClick={handleCheckPermission}
                    disabled={!customAction.trim()}
                  >
                    {t('admin.permissions.checkPermission')}
                  </Button>

                  {permissionResult && (
                    <Alert
                      severity={permissionResult.hasPermission ? 'success' : 'warning'}
                      sx={{ mt: 2 }}
                    >
                      <Typography variant="body2">
                        <strong>{t('admin.permissions.action')}:</strong> {permissionResult.action}<br />
                        <strong>{t('admin.permissions.yourRole')}:</strong> {getRoleDisplayName(permissionResult.userType)}<br />
                        <strong>{t('admin.permissions.authorized')}:</strong> {permissionResult.hasPermission ? t('common.yes') : t('common.no')}
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Current User Permissions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('admin.permissions.currentPermissions')}
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t('admin.permissions.currentPermissionsDescription', { role: getRoleDisplayName(userRole) })}
                </Alert>

                <Grid container spacing={2}>
                  {permissionCategories.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category.name}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {category.name}
                        </Typography>
                        <Stack spacing={1}>
                          {category.permissions.map((permission) => (
                            <Stack
                              key={permission.action}
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              {hasRolePermission(permission.action, userRole) ? (
                                <CheckIcon color="success" fontSize="small" />
                              ) : (
                                <CancelIcon color="error" fontSize="small" />
                              )}
                              <Typography
                                variant="caption"
                                color={hasRolePermission(permission.action, userRole) ? 'text.primary' : 'text.disabled'}
                              >
                                {permission.description}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Page>
  );
}