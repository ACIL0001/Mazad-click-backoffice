import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Terms, CreateTermsDto, UpdateTermsDto } from '../../types/terms';
import { TermsAPI } from '../../api/terms';

const TermsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [terms, setTerms] = useState<Terms[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [currentTerm, setCurrentTerm] = useState<Terms | null>(null);
  const [deleteTermId, setDeleteTermId] = useState<string | null>(null);
  const [viewTerm, setViewTerm] = useState<Terms | null>(null);
  const [formData, setFormData] = useState<CreateTermsDto>({
    title: '',
    content: '',
    version: ''
  });
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Fetch all terms on component mount
  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const data = await TermsAPI.getAll();
      setTerms(data);
      setError(null);
    } catch (err) {
      setError(t('terms.errors.loading'));
      console.error('Error fetching terms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newTerm = await TermsAPI.create(formData);
      setTerms([...terms, newTerm]);
      setSuccess(t('terms.success.created'));
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(t('terms.errors.creating'));
      console.error('Error creating terms:', err);
    }
  };

  const handleUpdate = async () => {
    if (!currentTerm || !currentTerm._id) {
      setError(t('terms.errors.noIdEdit'));
      return;
    }
    
    try {
      setUpdateLoading(true);
      const updatedTerm = await TermsAPI.update(currentTerm._id, formData);
      setTerms(terms.map(term => term._id === updatedTerm._id ? updatedTerm : term));
      setSuccess(t('terms.success.updated'));
      setOpenDialog(false);
      resetForm();
      setCurrentTerm(null);
    } catch (err) {
      setError(t('terms.errors.updating'));
      console.error('Error updating terms:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTermId) {
      setError(t('terms.errors.noId'));
      setOpenDeleteDialog(false);
      return;
    }
    
    try {
      setDeleteLoading(true);
      await TermsAPI.delete(deleteTermId);
      setTerms(terms.filter(term => term._id !== deleteTermId));
      setSuccess(t('terms.success.deleted'));
      setOpenDeleteDialog(false);
      setDeleteTermId(null);
    } catch (err) {
      setError(t('terms.errors.deleting'));
      console.error('Error deleting terms:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (term: Terms) => {
    if (!term._id) {
      setError(t('terms.errors.noIdEdit'));
      return;
    }
    
    setCurrentTerm(term);
    setFormData({
      title: term.title,
      content: term.content,
      version: term.version
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (id: string) => {
    if (!id) {
      setError(t('terms.errors.noId'));
      return;
    }
    
    setDeleteTermId(id);
    setOpenDeleteDialog(true);
  };

  const handleViewClick = async (term: Terms) => {
    try {
      // Fetch the latest version of the term to ensure we have the most current data
      const fullTerm = await TermsAPI.getById(term._id);
      setViewTerm(fullTerm);
      setOpenViewDialog(true);
    } catch (err) {
      setError(t('terms.errors.loadingDetails'));
      console.error('Error fetching term details:', err);
    }
  };

  const handleAddClick = () => {
    setCurrentTerm(null);
    resetForm();
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      version: ''
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTerm(null);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, boxShadow: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            {t('terms.title')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ borderRadius: 2 }}
          >
            {t('terms.addNew')}
          </Button>
        </Box>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>
            {success}
          </Alert>
        )}

        {/* Terms List */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('terms.table.title')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('terms.table.version')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('terms.table.created')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('terms.table.updated')}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{t('terms.table.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {terms.map((term) => (
                  <TableRow key={term._id} hover>
                    <TableCell>{term.title}</TableCell>
                    <TableCell>
                      <Chip label={`v${term.version}`} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{formatDate(term.createdAt)}</TableCell>
                    <TableCell>{formatDate(term.updatedAt)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="info"
                        onClick={() => handleViewClick(term)}
                        aria-label="view"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(term)}
                        aria-label="edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(term._id)}
                        aria-label="delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {terms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        {t('terms.noTerms')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
            {currentTerm ? t('terms.dialog.edit') : t('terms.dialog.add')}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box component="form">
              <TextField
                margin="normal"
                required
                fullWidth
                label={t('terms.form.title')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label={t('terms.form.version')}
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g., 1.0.0"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                multiline
                rows={6}
                label={t('terms.form.content')}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('terms.dialog.cancel')}</Button>
            <Button
              onClick={currentTerm ? handleUpdate : handleCreate}
              variant="contained"
              disabled={!formData.title || !formData.content || !formData.version || updateLoading}
            >
              {updateLoading ? <CircularProgress size={24} /> : (currentTerm ? t('common.save') : t('common.save'))}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>{t('terms.dialog.delete')}</DialogTitle>
          <DialogContent>
            <Typography>
              {t('terms.dialog.confirmDelete')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>{t('terms.dialog.cancel')}</Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteLoading}>
              {deleteLoading ? <CircularProgress size={24} /> : t('terms.dialog.deleteButton')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog 
          open={openViewDialog} 
          onClose={() => setOpenViewDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{ sx: { maxHeight: '80vh' } }}
        >
          <DialogTitle sx={{ backgroundColor: 'info.main', color: 'white' }}>
            {t('terms.dialog.view')}: {viewTerm?.title} (v{viewTerm?.version})
          </DialogTitle>
          <DialogContent>
            {viewTerm && (
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t('terms.table.created')}: {formatDate(viewTerm.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('terms.table.updated')}: {formatDate(viewTerm.updatedAt)}
                  </Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: '50vh', overflow: 'auto' }}>
                  <Typography variant="body1" whiteSpace="pre-wrap">
                    {viewTerm.content}
                  </Typography>
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>{t('common.close')}</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default TermsManagement;