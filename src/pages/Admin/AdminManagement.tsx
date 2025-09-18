import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Table,
  Stack,
  Button,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { AdminOnlyGuard, PermissionGuard } from '@/components/guards/RoleGuard';
import { RoleCode } from '@/types/Role';
import { getRoleDisplayName, getRoleBadgeColor } from '@/utils/permissions';
import { requests } from '@/api/utils';
import Page from '@/components/Page';
import Scrollbar from '@/components/Scrollbar';
import SearchNotFound from '@/components/SearchNotFound';

interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: RoleCode;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateAdminDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  type: RoleCode.ADMIN | RoleCode.SOUS_ADMIN;
}

export default function AdminManagement() {
  const { enqueueSnackbar } = useSnackbar();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<CreateAdminDto>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: 'MALE',
    type: RoleCode.SOUS_ADMIN,
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await requests.get('admin/all');
      setAdmins(response.data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      enqueueSnackbar('Erreur lors du chargement des administrateurs', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      const endpoint = formData.type === RoleCode.ADMIN ? 'admin/create-admin' : 'admin/create-sous-admin';
      await requests.post(endpoint, formData);
      
      enqueueSnackbar(
        `${formData.type === RoleCode.ADMIN ? 'Administrateur' : 'Sous-administrateur'} créé avec succès`,
        { variant: 'success' }
      );
      
      setOpenDialog(false);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors de la création',
        { variant: 'error' }
      );
    }
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;
    
    try {
      await requests.put(`admin/update/${editingAdmin._id}`, formData);
      enqueueSnackbar('Administrateur mis à jour avec succès', { variant: 'success' });
      setOpenDialog(false);
      setEditingAdmin(null);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      console.error('Error updating admin:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors de la mise à jour',
        { variant: 'error' }
      );
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${admin.firstName} ${admin.lastName} ?`)) {
      return;
    }

    try {
      await requests.delete(`admin/delete/${admin._id}`);
      enqueueSnackbar('Administrateur supprimé avec succès', { variant: 'success' });
      fetchAdmins();
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors de la suppression',
        { variant: 'error' }
      );
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      gender: 'MALE',
      type: RoleCode.SOUS_ADMIN,
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingAdmin(null);
    setOpenDialog(true);
  };

  const openEditDialog = (admin: AdminUser) => {
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      password: '', // Don't pre-fill password
      phone: admin.phone,
      gender: 'MALE', // Default value
      type: admin.type as RoleCode.ADMIN | RoleCode.SOUS_ADMIN,
    });
    setEditingAdmin(admin);
    setOpenDialog(true);
  };

  const filteredAdmins = admins.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const isNotFound = !loading && admins.length === 0;

  return (
    <Page title="Gestion des Administrateurs">
      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom>
            Gestion des Administrateurs
          </Typography>
          <AdminOnlyGuard>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Ajouter un Administrateur
            </Button>
          </AdminOnlyGuard>
        </Stack>

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Téléphone</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date de création</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {admin.firstName} {admin.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleDisplayName(admin.type)}
                          color={getRoleBadgeColor(admin.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={admin.isActive ? 'Actif' : 'Inactif'}
                          color={admin.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(admin.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Voir les détails">
                            <IconButton size="small" onClick={() => openEditDialog(admin)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <PermissionGuard permission="MANAGE_ADMIN_USERS">
                            <Tooltip title="Modifier">
                              <IconButton size="small" onClick={() => openEditDialog(admin)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>

                          <AdminOnlyGuard>
                            <Tooltip title="Supprimer">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteAdmin(admin)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </AdminOnlyGuard>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          {isNotFound && (
            <SearchNotFound searchQuery="" />
          )}

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={admins.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingAdmin ? 'Modifier l\'Administrateur' : 'Créer un Administrateur'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={editingAdmin ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingAdmin}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Genre</InputLabel>
                  <Select
                    value={formData.gender}
                    label="Genre"
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                  >
                    <MenuItem value="MALE">Homme</MenuItem>
                    <MenuItem value="FEMALE">Femme</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <AdminOnlyGuard
                  fallback={
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Seuls les administrateurs complets peuvent créer d'autres administrateurs.
                    </Alert>
                  }
                >
                  <FormControl fullWidth>
                    <InputLabel>Type d'Administrateur</InputLabel>
                    <Select
                      value={formData.type}
                      label="Type d'Administrateur"
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as RoleCode.ADMIN | RoleCode.SOUS_ADMIN })}
                    >
                      <MenuItem value={RoleCode.SOUS_ADMIN}>Sous-Administrateur</MenuItem>
                      <MenuItem value={RoleCode.ADMIN}>Administrateur Complet</MenuItem>
                    </Select>
                  </FormControl>
                </AdminOnlyGuard>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button
              onClick={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}
              variant="contained"
              disabled={!formData.firstName || !formData.lastName || !formData.email || (!editingAdmin && !formData.password)}
            >
              {editingAdmin ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Page>
  );
}
