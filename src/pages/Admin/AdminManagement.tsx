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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      enqueueSnackbar(t('admin.management.errors.loading'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      const endpoint = formData.type === RoleCode.ADMIN ? 'admin/create-admin' : 'admin/create-sous-admin';
      await requests.post(endpoint, formData);
      
      enqueueSnackbar(
        t('admin.management.success.created', { type: formData.type === RoleCode.ADMIN ? t('admin.management.type.admin') : t('admin.management.type.sousAdmin') }),
        { variant: 'success' }
      );
      
      setOpenDialog(false);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      enqueueSnackbar(
        error.response?.data?.message || t('admin.management.errors.creating'),
        { variant: 'error' }
      );
    }
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;
    
    try {
      await requests.put(`admin/update/${editingAdmin._id}`, formData);
      enqueueSnackbar(t('admin.management.success.updated'), { variant: 'success' });
      setOpenDialog(false);
      setEditingAdmin(null);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      console.error('Error updating admin:', error);
      enqueueSnackbar(
        error.response?.data?.message || t('admin.management.errors.updating'),
        { variant: 'error' }
      );
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (!window.confirm(t('admin.management.confirmDelete', { name: `${admin.firstName} ${admin.lastName}` }))) {
      return;
    }

    try {
      await requests.delete(`admin/delete/${admin._id}`);
      enqueueSnackbar(t('admin.management.success.deleted'), { variant: 'success' });
      fetchAdmins();
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      enqueueSnackbar(
        error.response?.data?.message || t('admin.management.errors.deleting'),
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
    <Page title={t('admin.management.title')}>
      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom>
            {t('admin.management.title')}
          </Typography>
          <AdminOnlyGuard>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              {t('admin.management.addAdmin')}
            </Button>
          </AdminOnlyGuard>
        </Stack>

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('admin.management.table.name')}</TableCell>
                    <TableCell>{t('admin.management.table.email')}</TableCell>
                    <TableCell>{t('admin.management.table.phone')}</TableCell>
                    <TableCell>{t('admin.management.table.type')}</TableCell>
                    <TableCell>{t('admin.management.table.status')}</TableCell>
                    <TableCell>{t('admin.management.table.createdAt')}</TableCell>
                    <TableCell align="right">{t('admin.management.table.actions')}</TableCell>
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
                          label={admin.isActive ? t('admin.management.status.active') : t('admin.management.status.inactive')}
                          color={admin.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(admin.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1}>
                          <Tooltip title={t('admin.management.actions.viewDetails')}>
                            <IconButton size="small" onClick={() => openEditDialog(admin)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <PermissionGuard permission="MANAGE_ADMIN_USERS">
                            <Tooltip title={t('admin.management.actions.edit')}>
                              <IconButton size="small" onClick={() => openEditDialog(admin)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>

                          <AdminOnlyGuard>
                            <Tooltip title={t('admin.management.actions.delete')}>
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
            {editingAdmin ? t('admin.management.form.update') : t('admin.management.form.create')}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('admin.management.form.firstName')}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('admin.management.form.lastName')}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('admin.management.form.email')}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('admin.management.form.password')}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingAdmin}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('admin.management.form.phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('admin.management.form.gender')}</InputLabel>
                  <Select
                    value={formData.gender}
                    label={t('admin.management.form.gender')}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                  >
                    <MenuItem value="MALE">{t('common.male')}</MenuItem>
                    <MenuItem value="FEMALE">{t('common.female')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <AdminOnlyGuard
                  fallback={
                    <Alert severity="info" sx={{ mt: 1 }}>
                      {t('admin.management.adminOnlyMessage')}
                    </Alert>
                  }
                >
                  <FormControl fullWidth>
                    <InputLabel>{t('admin.management.form.type')}</InputLabel>
                    <Select
                      value={formData.type}
                      label={t('admin.management.form.type')}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as RoleCode.ADMIN | RoleCode.SOUS_ADMIN })}
                    >
                      <MenuItem value={RoleCode.SOUS_ADMIN}>{t('admin.management.type.sousAdmin')}</MenuItem>
                      <MenuItem value={RoleCode.ADMIN}>{t('admin.management.type.admin')}</MenuItem>
                    </Select>
                  </FormControl>
                </AdminOnlyGuard>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>{t('admin.management.form.cancel')}</Button>
            <Button
              onClick={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}
              variant="contained"
              disabled={!formData.firstName || !formData.lastName || !formData.email || (!editingAdmin && !formData.password)}
            >
              {editingAdmin ? t('admin.management.form.update') : t('admin.management.form.create')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Page>
  );
}
