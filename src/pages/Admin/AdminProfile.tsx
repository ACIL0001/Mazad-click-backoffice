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
      enqueueSnackbar('Erreur lors du chargement du profil', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await requests.put(`admin/update/${profile?._id}`, formData);
      enqueueSnackbar('Profil mis à jour avec succès', { variant: 'success' });
      setEditMode(false);
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors de la mise à jour',
        { variant: 'error' }
      );
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      enqueueSnackbar('Les mots de passe ne correspondent pas', { variant: 'error' });
      return;
    }

    try {
      await requests.put(`admin/change-password/${profile?._id}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      enqueueSnackbar('Mot de passe modifié avec succès', { variant: 'success' });
      setPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors du changement de mot de passe',
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
    const descriptions: Record<string, string> = {
      VIEW_USERS: 'Voir la liste des utilisateurs',
      MANAGE_USERS: 'Gérer les comptes utilisateurs',
      DELETE_USERS: 'Supprimer des utilisateurs',
      CREATE_ADMIN: 'Créer des administrateurs',
      CREATE_SOUS_ADMIN: 'Créer des sous-administrateurs',
      DELETE_ADMIN: 'Supprimer des administrateurs',
      MANAGE_ADMIN_USERS: 'Gérer les utilisateurs administrateurs',
      MANAGE_AUCTIONS: 'Gérer les enchères',
      MANAGE_CATEGORIES: 'Gérer les catégories',
      MODERATE_CONTENT: 'Modérer le contenu',
      SYSTEM_CONFIGURATION: 'Configuration système',
      PAYMENT_SETTINGS: 'Paramètres de paiement',
      MANAGE_TERMS: 'Gérer les conditions générales',
      SEND_NOTIFICATIONS: 'Envoyer des notifications',
      MANAGE_COMMUNICATION: 'Gérer la communication',
      VIEW_CHAT: 'Accéder au centre de communication',
      VIEW_BASIC_STATS: 'Voir les statistiques de base',
      VIEW_FINANCIAL_REPORTS: 'Voir les rapports financiers',
      VIEW_DETAILED_ANALYTICS: 'Voir les analyses détaillées',
      MANAGE_IDENTITIES: 'Gérer les vérifications d\'identité',
      VIEW_SUBSCRIPTIONS: 'Voir les abonnements',
      MANAGE_SUBSCRIPTION_PLANS: 'Gérer les plans d\'abonnement',
      PROCESS_PAYMENTS: 'Traiter les paiements',
    };

    return descriptions[permission] || permission;
  };

  if (loading || !profile) {
    return (
      <Page title="Profil Administrateur">
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <Typography>Chargement...</Typography>
        </Box>
      </Page>
    );
  }

  const permissions = getPermissionList();

  return (
    <Page title="Profil Administrateur">
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h4" gutterBottom>
          Profil Administrateur
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
                        label={profile.isActive ? 'Actif' : 'Inactif'}
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
                      label="Prénom"
                      value={editMode ? formData.firstName : profile.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      value={editMode ? formData.lastName : profile.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={editMode ? formData.email : profile.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      value={editMode ? formData.phone : profile.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date de création"
                      value={new Date(profile.createdAt).toLocaleString('fr-FR')}
                      disabled
                    />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={2} mt={3}>
                  {editMode ? (
                    <>
                      <Button variant="contained" onClick={handleUpdateProfile}>
                        Sauvegarder
                      </Button>
                      <Button onClick={() => setEditMode(false)}>
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <Button variant="outlined" onClick={() => setEditMode(true)}>
                      Modifier
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<SecurityIcon />}
                    onClick={() => setPasswordDialog(true)}
                  >
                    Changer le mot de passe
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
                  Permissions
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Vos autorisations actuelles en tant que {getRoleDisplayName(profile.type)}
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
          <DialogTitle>Changer le mot de passe</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                type="password"
                label="Mot de passe actuel"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <TextField
                fullWidth
                type="password"
                label="Nouveau mot de passe"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirmer le nouveau mot de passe"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                error={passwordData.newPassword !== '' && passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword}
                helperText={
                  passwordData.newPassword !== '' && passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword
                    ? 'Les mots de passe ne correspondent pas'
                    : ''
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialog(false)}>Annuler</Button>
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
              Changer le mot de passe
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Page>
  );
}
