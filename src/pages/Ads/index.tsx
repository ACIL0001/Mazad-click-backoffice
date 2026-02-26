import { useState, useEffect } from 'react';
import {
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  Chip,
  CircularProgress,
  Paper,
  TableContainer,
  Box,
  Checkbox,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Card,
} from '@mui/material';
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import { useSnackbar } from 'notistack';
import MuiTable from '../../components/Tables/MuiTable';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AdsAPI, Ad } from '@/api/ads';
import AdForm from './AdForm';
import app from '@/config';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function Ads() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const COLUMNS = [
    { id: 'title', label: 'Title', alignRight: false, searchable: true, sortable: true },
    { id: 'isActive', label: t('ads.isActive') || 'Active', alignRight: false, searchable: false },
    { id: 'isDisplayed', label: t('ads.isDisplayed') || 'Displayed', alignRight: false, searchable: false },
    { id: 'order', label: t('ads.order') || 'Order', alignRight: false, searchable: false, sortable: true },
    { id: 'createdAt', label: t('ads.createdAt') || 'Created At', alignRight: false, searchable: false, sortable: true },
    { id: 'actions', label: t('ads.actions') || 'Actions', alignRight: true, searchable: false },
  ];

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState('order');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);

  const { data: adsData, isLoading: loading } = useQuery({
    queryKey: ['ads'],
    queryFn: async () => {
      const response = await AdsAPI.getAds();
      let data: Ad[] = [];
      
      // Handle different response formats
      if (Array.isArray(response)) {
        data = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.ads)) {
          data = response.ads;
        } else if (response.success && Array.isArray(response.data)) {
          data = response.data;
        } else if (response.result && Array.isArray(response.result)) {
          data = response.result;
        } else if (response.items && Array.isArray(response.items)) {
          data = response.items;
        }
      }
      
      // Validate that we have valid ad objects
      data = data.filter((ad) => ad && ad._id);
      
      // Sort by order
      data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return data;
    },
  });

  const ads = adsData || [];

  const getImageUrl = (ad: Ad): string => {
    if (!ad || !ad.image) return '';
    
    let imageUrl = '';
    
    // Handle different image formats from backend
    // Backend returns: { url: string, fullUrl: string, _id: string, filename: string }
    if (typeof ad.image === 'string') {
      imageUrl = ad.image;
    } else if (ad.image && typeof ad.image === 'object') {
      // Backend transformAttachment returns: { url, fullUrl, _id, filename }
      const imageObj = ad.image as any;
      // Prefer fullUrl as it's already a complete URL
      if (imageObj.fullUrl) {
        imageUrl = imageObj.fullUrl;
      } else if (imageObj.url) {
        imageUrl = imageObj.url;
      }
    }
    
    if (!imageUrl || imageUrl.trim() === '') return '';
    
    // If already a full URL, return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Construct full URL from relative path
    if (imageUrl.startsWith('/static/')) {
      return `${app.baseURL}${imageUrl.substring(1)}`;
    }
    
    if (imageUrl.startsWith('/')) {
      return `${app.baseURL}${imageUrl.substring(1)}`;
    }
    
    return `${app.baseURL}/${imageUrl}`;
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = ads.map((ad) => ad._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleDeleteClick = (id: string) => {
    setAdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!adToDelete) return;
    
    try {
      await AdsAPI.deleteAd(adToDelete);
      enqueueSnackbar('Ad deleted successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      setDeleteDialogOpen(false);
      setAdToDelete(null);
    } catch (error: any) {
      console.error('Error deleting ad:', error);
      const errorMessage = error?.response?.status === 404 
        ? 'Ads endpoint not found. The backend /ads endpoint needs to be implemented.'
        : error?.message || 'Failed to delete ad';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selected.map(id => AdsAPI.deleteAd(id)));
      enqueueSnackbar('Selected ads deleted successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      setSelected([]);
    } catch (error: any) {
      console.error('Error deleting selected ads:', error);
      const errorMessage = error?.response?.status === 404 
        ? 'Ads endpoint not found. The backend /ads endpoint needs to be implemented.'
        : error?.message || 'Failed to delete selected ads';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleToggleDisplay = async (id: string, currentValue: boolean) => {
    try {
      await AdsAPI.toggleAdDisplay(id, !currentValue);
      enqueueSnackbar('Display status updated', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    } catch (error: any) {
      console.error('Error toggling display:', error);
      const errorMessage = error?.response?.status === 404 
        ? 'Ads endpoint not found. The backend /ads endpoint needs to be implemented.'
        : error?.message || 'Failed to update display status';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleToggleActive = async (id: string, currentValue: boolean) => {
    try {
      await AdsAPI.toggleAdActive(id, !currentValue);
      enqueueSnackbar('Active status updated', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    } catch (error: any) {
      console.error('Error toggling active:', error);
      const errorMessage = error?.response?.status === 404 
        ? 'Ads endpoint not found. The backend /ads endpoint needs to be implemented.'
        : error?.message || 'Failed to update active status';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleEditClick = (ad: Ad) => {
    setEditingAd(ad);
    setFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingAd(null);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['ads'] });
  };

  const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    setPage(0);
  };

  const filteredAds = ads.filter((ad) =>
    ad.title?.toLowerCase().includes(filterName.toLowerCase())
  );

  const sortedAds = [...filteredAds].sort((a, b) => {
    if (orderBy === 'title') {
      const aValue = a.title || '';
      const bValue = b.title || '';
      return order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (orderBy === 'order') {
      const aValue = a.order ?? 0;
      const bValue = b.order ?? 0;
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (orderBy === 'createdAt') {
      const aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sortedAds.length) : 0;

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const TableBodyComponent = ({ data, selected, setSelected }: { data: Ad[]; selected: string[]; setSelected: (selected: string[]) => void }) => {
    const isItemSelected = (id: string) => selected.indexOf(id) !== -1;

    return (
      <TableBody>
        {data.map((ad) => {
          const isAdSelected = isItemSelected(ad._id);
          const imageUrl = getImageUrl(ad);

          return (
            <TableRow
              hover
              key={ad._id}
              tabIndex={-1}
              role="checkbox"
              selected={isAdSelected}
              aria-checked={isAdSelected}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={isAdSelected}
                  onChange={() => handleSelectClick(ad._id)}
                />
              </TableCell>
              <TableCell component="th" scope="row">
                <Typography variant="subtitle2" noWrap>
                  {ad.title || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                <Switch
                  checked={ad.isActive ?? false}
                  onChange={() => handleToggleActive(ad._id, ad.isActive ?? false)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={ad.isDisplayed ?? false}
                  onChange={() => handleToggleDisplay(ad._id, ad.isDisplayed ?? false)}
                  size="small"
                  color="success"
                />
              </TableCell>
              <TableCell>
                <Chip label={ad.order ?? 0} size="small" />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {ad.createdAt 
                    ? new Date(ad.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={() => handleEditClick(ad)}
                  color="primary"
                  size="small"
                >
                  <Iconify icon="eva:edit-fill" />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteClick(ad._id)}
                  color="error"
                  size="small"
                >
                  <Iconify icon="eva:trash-2-fill" />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
        {emptyRows > 0 && (
          <TableRow style={{ height: 53 * emptyRows }}>
            <TableCell colSpan={7} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <Page title={t('ads.title') || 'Ads Management'}>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {t('ads.title') || 'Ads Management'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleAddClick}
          >
            {t('ads.addNew') || 'Add New Ad'}
          </Button>
        </Stack>

        <Card>
          <MuiTable
            columns={COLUMNS}
            data={sortedAds}
            order={order}
            setOrder={setOrder}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            filterName={filterName}
            setFilterName={setFilterName}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            selected={selected}
            setSelected={setSelected}
            TableBodyComponent={TableBodyComponent}
            numSelected={selected.length}
            loading={loading}
            getRowId={(row) => row._id}
          />
        </Card>

        <AdForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingAd(null);
          }}
          onSuccess={handleFormSuccess}
          ad={editingAd}
        />

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this ad? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}

