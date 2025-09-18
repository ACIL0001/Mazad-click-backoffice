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
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleCode>(RoleCode.SOUS_ADMIN);
  const [customAction, setCustomAction] = useState('');
  const [permissionResult, setPermissionResult] = useState<any>(null);

  const permissionCategories = [
    {
      name: 'Gestion des Utilisateurs',
      permissions: [
        { action: 'VIEW_USERS', description: 'Voir la liste des utilisateurs' },
        { action: 'MANAGE_USERS', description: 'Gérer les comptes utilisateurs' },
        { action: 'DELETE_USERS', description: 'Supprimer des utilisateurs' },
      ],
    },
    {
      name: 'Administration',
      permissions: [
        { action: 'CREATE_ADMIN', description: 'Créer des administrateurs' },
        { action: 'CREATE_SOUS_ADMIN', description: 'Créer des sous-administrateurs' },
        { action: 'DELETE_ADMIN', description: 'Supprimer des administrateurs' },
        { action: 'MANAGE_ADMIN_USERS', description: 'Gérer les utilisateurs administrateurs' },
      ],
    },
    {
      name: 'Gestion du Contenu',
      permissions: [
        { action: 'MANAGE_AUCTIONS', description: 'Gérer les enchères' },
        { action: 'MANAGE_CATEGORIES', description: 'Gérer les catégories' },
        { action: 'MODERATE_CONTENT', description: 'Modérer le contenu' },
        { action: 'MANAGE_TERMS', description: 'Gérer les conditions générales' },
      ],
    },
    {
      name: 'Configuration Système',
      permissions: [
        { action: 'SYSTEM_CONFIGURATION', description: 'Configuration système' },
        { action: 'PAYMENT_SETTINGS', description: 'Paramètres de paiement' },
      ],
    },
    {
      name: 'Communication',
      permissions: [
        { action: 'SEND_NOTIFICATIONS', description: 'Envoyer des notifications' },
        { action: 'MANAGE_COMMUNICATION', description: 'Gérer la communication' },
        { action: 'VIEW_CHAT', description: 'Accéder au centre de communication' },
      ],
    },
    {
      name: 'Rapports & Analytics',
      permissions: [
        { action: 'VIEW_BASIC_STATS', description: 'Voir les statistiques de base' },
        { action: 'VIEW_FINANCIAL_REPORTS', description: 'Voir les rapports financiers' },
        { action: 'VIEW_DETAILED_ANALYTICS', description: 'Voir les analyses détaillées' },
      ],
    },
    {
      name: 'Identité & Abonnements',
      permissions: [
        { action: 'MANAGE_IDENTITIES', description: 'Gérer les vérifications d\'identité' },
        { action: 'VIEW_SUBSCRIPTIONS', description: 'Voir les abonnements' },
        { action: 'MANAGE_SUBSCRIPTION_PLANS', description: 'Gérer les plans d\'abonnement' },
        { action: 'PROCESS_PAYMENTS', description: 'Traiter les paiements' },
      ],
    },
  ];

  const handleCheckPermission = async () => {
    if (!customAction.trim()) {
      enqueueSnackbar('Veuillez saisir une action à vérifier', { variant: 'warning' });
      return;
    }

    try {
      const response = await requests.post('admin/check-permission', {
        action: customAction.trim(),
      });
      setPermissionResult(response);
      enqueueSnackbar('Vérification des permissions effectuée', { variant: 'success' });
    } catch (error: any) {
      console.error('Error checking permission:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors de la vérification',
        { variant: 'error' }
      );
    }
  };

  const hasRolePermission = (action: string, role: RoleCode): boolean => {
    return checkPermission(role, action as keyof typeof PERMISSIONS);
  };

  const getRoleDescription = (role: RoleCode): string => {
    const descriptions = {
      [RoleCode.ADMIN]: 'Accès complet à toutes les fonctionnalités du système',
      [RoleCode.SOUS_ADMIN]: 'Accès limité aux fonctionnalités de gestion quotidienne',
      [RoleCode.PROFESSIONAL]: 'Accès professionnel aux enchères et services',
      [RoleCode.RESELLER]: 'Accès revendeur avec outils de revente',
      [RoleCode.CLIENT]: 'Accès client de base aux enchères',
    };
    return descriptions[role] || 'Utilisateur standard';
  };

  const userRole = user?.type as RoleCode;

  return (
    <Page title="Permissions & Autorisations">
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h4" gutterBottom>
          Permissions & Autorisations
        </Typography>

        <Grid container spacing={3}>
          {/* Permission Matrix */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Matrice des Permissions par Rôle
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  Cette matrice montre les autorisations accordées à chaque type d'utilisateur administrateur.
                </Alert>

                <Scrollbar>
                  <TableContainer component={Paper} variant="outlined">
                    <Table sx={{ minWidth: 800 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Catégorie / Action</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            <Chip
                              label="Admin"
                              color="error"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            <Chip
                              label="Sous-Admin"
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
                  Description des Rôles
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
                            label="Votre rôle"
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
                  Vérificateur de Permissions
                </Typography>
                
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Action à vérifier"
                    placeholder="Ex: CREATE_ADMIN, MANAGE_USERS, etc."
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    helperText="Saisissez le nom d'une action pour vérifier vos permissions"
                  />
                  
                  <Button
                    variant="contained"
                    onClick={handleCheckPermission}
                    disabled={!customAction.trim()}
                  >
                    Vérifier la Permission
                  </Button>

                  {permissionResult && (
                    <Alert
                      severity={permissionResult.hasPermission ? 'success' : 'warning'}
                      sx={{ mt: 2 }}
                    >
                      <Typography variant="body2">
                        <strong>Action:</strong> {permissionResult.action}<br />
                        <strong>Votre rôle:</strong> {getRoleDisplayName(permissionResult.userType)}<br />
                        <strong>Autorisé:</strong> {permissionResult.hasPermission ? 'Oui' : 'Non'}
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
                  Vos Permissions Actuelles
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  En tant que <strong>{getRoleDisplayName(userRole)}</strong>, voici vos autorisations actuelles :
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