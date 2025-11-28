import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  Key as KeyIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { SousAdminGuard } from '@/components/guards/RoleGuard';
import { RoleCode } from '@/types/Role';
import { getRoleDisplayName, getRoleBadgeColor, PERMISSIONS, hasPermission } from '@/utils/permissions';
import { requests } from '@/api/utils';
import useAuth from '@/hooks/useAuth';
import Page from '@/components/Page';

interface AdminProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: RoleCode;
  isActive: boolean;
  createdAt: string;
  privileges: {
    isAdmin: boolean;
    isSousAdmin: boolean;
    hasAdminPrivileges: boolean;
  };
}

export default function AdminProfile() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await requests.get('admin/profile');
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phone,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      enqueueSnackbar(t('admin.profile.errorLoading'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await requests.put(`admin/update/${profile?._id}`, formData);
      enqueueSnackbar(t('admin.profile.successUpdated'), { variant: 'success' });
      setEditMode(false);
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      enqueueSnackbar(
        error.response?.data?.message || t('admin.profile.errorUpdating'),
        { variant: 'error' }
      );
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      enqueueSnackbar(t('admin.profile.passwordMismatch'), { variant: 'error' });
      return;
    }

    try {
      await requests.put(`admin/change-password/${profile?._id}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      enqueueSnackbar(t('admin.profile.passwordChanged'), { variant: 'success' });
      setPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      enqueueSnackbar(
        error.response?.data?.message || t('admin.profile.errorChangingPassword'),
        { variant: 'error' }
      );
    }
  };

  const getPermissionList = () => {
    const userRole = user?.type as RoleCode;
    const permissions = Object.entries(PERMISSIONS).filter(([permission, roles]) =>
      roles.includes(userRole)
    );

    return permissions.map(([permission, roles]) => ({
      name: permission,
      description: getPermissionDescription(permission),
      hasAccess: hasPermission(userRole, permission as keyof typeof PERMISSIONS),
    }));
  };

  const getPermissionDescription = (permission: string): string => {
    const permissionKeyMap: Record<string, string> = {
      VIEW_USERS: 'admin.permissions.permissionDescriptions.viewUsers',
      MANAGE_USERS: 'admin.permissions.permissionDescriptions.manageUsers',
      DELETE_USERS: 'admin.permissions.permissionDescriptions.deleteUsers',
      CREATE_ADMIN: 'admin.permissions.permissionDescriptions.createAdmin',
      CREATE_SOUS_ADMIN: 'admin.permissions.permissionDescriptions.createSousAdmin',
      DELETE_ADMIN: 'admin.permissions.permissionDescriptions.deleteAdmin',
      MANAGE_ADMIN_USERS: 'admin.permissions.permissionDescriptions.manageAdminUsers',
      MANAGE_AUCTIONS: 'admin.permissions.permissionDescriptions.manageAuctions',
      MANAGE_CATEGORIES: 'admin.permissions.permissionDescriptions.manageCategories',
      MODERATE_CONTENT: 'admin.permissions.permissionDescriptions.moderateContent',
      SYSTEM_CONFIGURATION: 'admin.permissions.permissionDescriptions.systemConfiguration',
      PAYMENT_SETTINGS: 'admin.permissions.permissionDescriptions.paymentSettings',
      MANAGE_TERMS: 'admin.permissions.permissionDescriptions.manageTerms',
      SEND_NOTIFICATIONS: 'admin.permissions.permissionDescriptions.sendNotifications',
      MANAGE_COMMUNICATION: 'admin.permissions.permissionDescriptions.manageCommunication',
      VIEW_CHAT: 'admin.permissions.permissionDescriptions.viewChat',
      VIEW_BASIC_STATS: 'admin.permissions.permissionDescriptions.viewBasicStats',
      VIEW_FINANCIAL_REPORTS: 'admin.permissions.permissionDescriptions.viewFinancialReports',
      VIEW_DETAILED_ANALYTICS: 'admin.permissions.permissionDescriptions.viewDetailedAnalytics',
      MANAGE_IDENTITIES: 'admin.permissions.permissionDescriptions.manageIdentities',
      VIEW_SUBSCRIPTIONS: 'admin.permissions.permissionDescriptions.viewSubscriptions',
      MANAGE_SUBSCRIPTION_PLANS: 'admin.permissions.permissionDescriptions.manageSubscriptionPlans',
      PROCESS_PAYMENTS: 'admin.permissions.permissionDescriptions.processPayments',
    };

    const translationKey = permissionKeyMap[permission];
    return translationKey ? t(translationKey) : permission;
  };

  if (loading || !profile) {
    return (
      <Page title={t('admin.profile.title')}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <Typography>{t('common.loading')}</Typography>
        </Box>
      </Page>
    );
  }

  const permissions = getPermissionList();

  return (
    <Page title={t('admin.profile.title')}>
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h4" gutterBottom>
          {t('admin.profile.title')}
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                    <AccountIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {profile.firstName} {profile.lastName}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip
                        label={getRoleDisplayName(profile.type)}
                        color={getRoleBadgeColor(profile.type)}
                        icon={<ShieldIcon />}
                      />
                      <Chip
                        label={profile.isActive ? t('admin.management.status.active') : t('admin.management.status.inactive')}
                        color={profile.isActive ? 'success' : 'error'}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('admin.management.form.firstName')}
                      value={editMode ? formData.firstName : profile.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('admin.management.form.lastName')}
                      value={editMode ? formData.lastName : profile.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('admin.management.form.email')}
                      value={editMode ? formData.email : profile.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('admin.management.form.phone')}
                      value={editMode ? formData.phone : profile.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('admin.management.table.createdAt')}
                      value={new Date(profile.createdAt).toLocaleString('fr-FR')}
                      disabled
                    />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={2} mt={3}>
                  {editMode ? (
                    <>
                      <Button variant="contained" onClick={handleUpdateProfile}>
                        {t('common.save')}
                      </Button>
                      <Button onClick={() => setEditMode(false)}>
                        {t('common.cancel')}
                      </Button>
                    </>
                  ) : (
                    <Button variant="outlined" onClick={() => setEditMode(true)}>
                      {t('common.edit')}
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<SecurityIcon />}
                    onClick={() => setPasswordDialog(true)}
                  >
                    {t('admin.profile.changePassword')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Permissions */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <KeyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('admin.permissions.title')}
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t('admin.profile.currentPermissions', { role: getRoleDisplayName(profile.type) })}
                </Alert>

                <List dense>
                  {permissions.map((permission) => (
                    <ListItem key={permission.name} sx={{ px: 0 }}>
                      <ListItemIcon>
                        {permission.hasAccess ? (
                          <CheckIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={permission.description}
                        secondary={permission.name}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          color: permission.hasAccess ? 'text.primary' : 'text.disabled',
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.75rem',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Password Change Dialog */}
        <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('admin.profile.changePassword')}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                type="password"
                label={t('admin.profile.currentPassword')}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <TextField
                fullWidth
                type="password"
                label={t('admin.profile.newPassword')}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <TextField
                fullWidth
                type="password"
                label={t('admin.profile.confirmPassword')}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                error={passwordData.newPassword !== '' && passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword}
                helperText={
                  passwordData.newPassword !== '' && passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword
                    ? t('admin.profile.passwordMismatch')
                    : ''
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialog(false)}>{t('common.cancel')}</Button>
            <Button
              onClick={handleChangePassword}
              variant="contained"
              disabled={
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword ||
                passwordData.newPassword !== passwordData.confirmPassword
              }
            >
              {t('admin.profile.changePassword')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Page>
  );
}
