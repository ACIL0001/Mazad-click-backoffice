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
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { Terms, CreateTermsDto, UpdateTermsDto } from '../../types/terms';
import { TermsAPI } from '../../api/terms';

const TermsManagement: React.FC = () => {
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
    version: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      setError('Failed to fetch terms. Please try again.');
      console.error('Error fetching terms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.title || !formData.version) {
        setError('Please fill all required fields');
        return;
      }

      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('version', formData.version);
      if (selectedFile) formPayload.append('file', selectedFile);

      const newTerm = await TermsAPI.create(formPayload);
      setTerms([...terms, newTerm]);
      setSuccess('Terms created successfully!');
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError('Failed to create terms. Please try again.');
      console.error('Error creating terms:', err);
    }
  };

  const handleUpdate = async () => {
    if (!currentTerm || !currentTerm._id) {
      setError('Cannot update: No term selected or missing ID');
      return;
    }
    
    try {
      setUpdateLoading(true);
      
      const formPayload = new FormData();
      if (formData.title) formPayload.append('title', formData.title);
      if (formData.version) formPayload.append('version', formData.version);
      if (selectedFile) formPayload.append('file', selectedFile);

      const updatedTerm = await TermsAPI.update(currentTerm._id, formPayload);
      setTerms(terms.map(term => term._id === updatedTerm._id ? updatedTerm : term));
      setSuccess('Terms updated successfully!');
      setOpenDialog(false);
      resetForm();
      setCurrentTerm(null);
    } catch (err) {
      setError('Failed to update terms. Please try again.');
      console.error('Error updating terms:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTermId) {
      setError('Cannot delete: No term ID provided');
      setOpenDeleteDialog(false);
      return;
    }
    
    try {
      setDeleteLoading(true);
      await TermsAPI.delete(deleteTermId);
      setTerms(terms.filter(term => term._id !== deleteTermId));
      setSuccess('Terms deleted successfully!');
      setOpenDeleteDialog(false);
      setDeleteTermId(null);
    } catch (err) {
      setError('Failed to delete terms. Please try again.');
      console.error('Error deleting terms:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (term: Terms) => {
    if (!term._id) {
      setError('Cannot edit: Term has no ID');
      return;
    }
    
    setCurrentTerm(term);
    setFormData({
      title: term.title,
      version: term.version
    });
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleDeleteClick = (id: string) => {
    if (!id) {
      setError('Cannot delete: No term ID provided');
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
      setError('Failed to load term details. Please try again.');
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
      content: '', // Keeping it in state type to avoid major refactors but ignoring it
      version: ''
    });
    setSelectedFile(null);
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
            Terms and Conditions Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ borderRadius: 2 }}
          >
            Add New Terms
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Version</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Updated</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
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
                        No terms found. Click "Add New Terms" to create one.
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
            {currentTerm ? 'Edit Terms' : 'Create New Terms'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box component="form">
              <TextField
                margin="normal"
                required
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g., 1.0.0"
              />
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Document File (PDF, DOC, DOCX)
                </Typography>
                <input
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                    Upload Document
                  </Button>
                </label>
                {selectedFile && (
                  <Box display="flex" alignItems="center" mt={1}>
                    <FileIcon color="action" fontSize="small" />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {selectedFile.name}
                    </Typography>
                  </Box>
                )}
                { currentTerm && currentTerm.attachment && !selectedFile && (
                   <Box display="flex" alignItems="center" mt={1}>
                    <FileIcon color="primary" fontSize="small" />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Current file: {currentTerm.attachment.filename}
                    </Typography>
                  </Box>
                )}
              </Box>

            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={currentTerm ? handleUpdate : handleCreate}
              variant="contained"
              disabled={!formData.title || !formData.version || updateLoading}
            >
              {updateLoading ? <CircularProgress size={24} /> : (currentTerm ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete these terms? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteLoading}>
              {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
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
            {viewTerm?.title} (v{viewTerm?.version})
          </DialogTitle>
          <DialogContent>
            {viewTerm && (
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Created: {formatDate(viewTerm.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last updated: {formatDate(viewTerm.updatedAt)}
                  </Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: '50vh', overflow: 'auto' }}>
                  {viewTerm.content && (
                    <Typography variant="body1" whiteSpace="pre-wrap" sx={{ mb: 2 }}>
                      {viewTerm.content}
                    </Typography>
                  )}
                  {viewTerm.attachment && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>Attached Document:</Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<FileIcon />}
                        href={viewTerm.attachment.url}
                        target="_blank"
                      >
                         {viewTerm.attachment.filename || 'Download Document'}
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default TermsManagement;