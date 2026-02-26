import { useState, useEffect, Fragment } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  Chip,
  Box,
  IconButton,
  Checkbox,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  CircularProgress,
  Paper,
  TableContainer
} from '@mui/material';
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import { useSnackbar } from 'notistack';
import MuiTable from '../../components/Tables/MuiTable';
import Breadcrumb from '@/components/Breadcrumbs';
import { DirectSaleAPI } from '@/api/direct-sale';
import { format } from 'date-fns';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

interface DirectSale {
  _id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  status: string;
  saleType: string;
  owner?: {
    firstName: string;
    lastName: string;
  };
  productCategory?: {
    name: string;
  };
  createdAt: string;
}

export default function DirectSales() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const COLUMNS = [
    { id: 'expand', label: '', alignRight: false, searchable: false },
    { id: 'title', label: t('directSales.titre'), alignRight: false, searchable: true, sortable: true },
    { id: 'saleType', label: t('directSales.type'), alignRight: false, searchable: false },
    { id: 'price', label: t('directSales.price'), alignRight: false, searchable: false, sortable: true },
    { id: 'quantity', label: t('directSales.quantity'), alignRight: false, searchable: false },
    { id: 'status', label: t('directSales.status'), alignRight: false, searchable: false },
    { id: 'owner', label: t('directSales.seller'), alignRight: false, searchable: false },
    { id: 'createdAt', label: t('directSales.createdAt'), alignRight: false, searchable: false, sortable: true },
    { id: 'actions', label: '', alignRight: true, searchable: false },
  ];

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Refactored to React Query
  const { data: directSalesData, isLoading: loading } = useQuery({
    queryKey: ['admin-direct-sales'],
    queryFn: async () => {
      const data = await DirectSaleAPI.getDirectSales();
      return Array.isArray(data) ? data : [];
    },
    staleTime: Infinity,
  });
  const directSales = directSalesData || [];
  
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [salePurchases, setSalePurchases] = useState<{ [key: string]: any[] }>({});
  const [loadingPurchases, setLoadingPurchases] = useState<{ [key: string]: boolean }>({});

  // Data fetching handled by useQuery
  /*
  useEffect(() => {
    fetchDirectSales();
  }, []);

  const fetchDirectSales = async () => {
    // ...
  };
  */

  const fetchPurchasesForSale = async (saleId: string) => {
    if (salePurchases[saleId]) return; // Already loaded

    setLoadingPurchases(prev => ({ ...prev, [saleId]: true }));
    try {
      const purchases = await DirectSaleAPI.getPurchasesByDirectSale(saleId);
      console.log('Purchases for sale', saleId, ':', purchases);

      if (Array.isArray(purchases)) {
        setSalePurchases(prev => ({ ...prev, [saleId]: purchases }));
      } else {
        setSalePurchases(prev => ({ ...prev, [saleId]: [] }));
      }
    } catch (error) {
      console.error('Error fetching purchases for sale:', saleId, error);
      setSalePurchases(prev => ({ ...prev, [saleId]: [] }));
    } finally {
      setLoadingPurchases(prev => ({ ...prev, [saleId]: false }));
    }
  };

  const handleExpandRow = async (saleId: string) => {
    const isExpanded = expandedRows[saleId];
    setExpandedRows(prev => ({ ...prev, [saleId]: !isExpanded }));

    if (!isExpanded) {
      await fetchPurchasesForSale(saleId);
    }
  };

  const handleDeleteSelected = async () => {
    console.log('🗑️ handleDeleteSelected Triggered');
    console.log('Selected IDs:', selected);

    if (!selected || selected.length === 0) {
      console.warn('⚠️ No items selected for deletion');
      enqueueSnackbar(t('Aucun élément sélectionné'), { variant: 'warning' });
      return;
    }

    try {
      const deletePromises = selected.map((id) => {
        console.log(`Deleting ID: ${id}`);
        return DirectSaleAPI.delete(id);
      });

      await Promise.all(deletePromises);
      
      console.log('✅ Deletion successful');
      enqueueSnackbar(t('Supprimé avec succès'), { variant: 'success' });
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ['admin-direct-sales'] });
    } catch (error) {
      console.error('❌ Error during deletion:', error);
      enqueueSnackbar(t('Erreur lors de la suppression'), { variant: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'SOLD_OUT':
        return 'warning';
      case 'INACTIVE':
        return 'default';
      case 'ARCHIVED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return t('directSales.active');
      case 'SOLD_OUT':
        return t('directSales.soldOut');
      case 'INACTIVE':
        return t('directSales.inactive');
      case 'ARCHIVED':
        return t('directSales.archived');
      default:
        return status;
    }
  };

  const filteredData = directSales.filter((sale) => {
    const matchesSearch = sale.title.toLowerCase().includes(filterName.toLowerCase()) ||
      sale.description.toLowerCase().includes(filterName.toLowerCase());
    return matchesSearch;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: any = a[orderBy as keyof DirectSale];
    let bValue: any = b[orderBy as keyof DirectSale];

    if (orderBy === 'createdAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const TableBodyComponent = ({ data, selected, setSelected }: { data: DirectSale[]; selected: string[]; setSelected: (selected: string[]) => void }) => {
    const isSelected = (id: string) => selected.indexOf(id) !== -1;

    const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
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
          selected.slice(selectedIndex + 1),
        );
      }
      setSelected(newSelected);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    return (
      <TableBody>
        {data.map((row) => {
          const isItemSelected = isSelected(row._id);
          const isExpanded = expandedRows[row._id];
          const purchases = salePurchases[row._id] || [];
          const isLoadingPurchases = loadingPurchases[row._id];

          return (
            <Fragment key={row._id}>
              <TableRow
                hover
                key={row._id}
                tabIndex={-1}
                role="checkbox"
                selected={isItemSelected}
              >
                <TableCell padding="checkbox">
                  <Checkbox 
                    checked={isItemSelected} 
                    onClick={(event) => handleClick(event, row._id)}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleExpandRow(row._id)}
                  >
                    {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" padding="none">
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="subtitle2" noWrap>
                      {row.title}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell align="left">
                  <Chip
                    label={row.saleType === 'PRODUCT' ? t('directSales.product') : t('directSales.service')}
                    size="small"
                    color={row.saleType === 'PRODUCT' ? 'primary' : 'secondary'}
                  />
                </TableCell>

                <TableCell align="left">
                  <Typography variant="subtitle2">{row.price.toLocaleString()} DA</Typography>
                </TableCell>

                <TableCell align="left">
                  {row.quantity === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('directSales.unlimited')}
                    </Typography>
                  ) : (
                    <Typography variant="body2">
                      {row.quantity - row.soldQuantity} / {row.quantity}
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="left">
                  <Label color={getStatusColor(row.status) as any}>
                    {getStatusLabel(row.status)}
                  </Label>
                </TableCell>

                <TableCell align="left">
                  {row.owner ? (
                    <Typography variant="body2">
                      {row.owner.firstName} {row.owner.lastName}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('common.na')}
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="left">
                  <Typography variant="body2">
                    {new Date(row.createdAt).toLocaleDateString('fr-FR')}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Button
                    component={RouterLink}
                    to={`/dashboard/direct-sales/${row._id}`}
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="eva:eye-outline" />}
                  >
                    {t('directSales.details')}
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow key={`${row._id}-details`}>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 2 }}>
                      <Typography variant="h6" gutterBottom component="div" sx={{ mb: 2 }}>
                        {t('directSales.purchases')}
                      </Typography>
                      {isLoadingPurchases ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : purchases.length > 0 ? (
                        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                          {purchases.map((purchase, index) => (
                            <Box key={purchase._id}>
                              <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                  <Avatar src={purchase.buyer?.avatar?.path} alt={purchase.buyer?.firstName}>
                                    {purchase.buyer?.firstName?.charAt(0) || 'U'}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Stack direction="row" spacing={2} alignItems="center">
                                      <Typography variant="subtitle2">
                                        {purchase.buyer?.firstName} {purchase.buyer?.lastName}
                                      </Typography>
                                      <Chip
                                        label={`${purchase.totalPrice?.toLocaleString() || 0} DA`}
                                        color="success"
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                      />
                                      <Chip
                                        label={purchase.status}
                                        color={purchase.status === 'CONFIRMED' ? 'success' : 'warning'}
                                        size="small"
                                      />
                                    </Stack>
                                  }
                                  secondary={
                                    <>
                                      <Typography
                                        sx={{ display: 'block', mb: 0.5 }}
                                        component="span"
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {t('directSales.purchasedOn')} {format(new Date(purchase.createdAt), 'dd MMM yyyy à HH:mm')}
                                      </Typography>
                                      <Typography
                                        sx={{ display: 'block' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                      >
                                        {t('directSales.quantityLabel')}: {purchase.quantity}
                                      </Typography>
                                    </>
                                  }
                                />
                              </ListItem>
                              {index < purchases.length - 1 && <Divider variant="inset" component="li" />}
                            </Box>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                          {t('directSales.noPurchases')}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Fragment>
          );
        })}
        {emptyRows > 0 && (
          <TableRow style={{ height: 53 * emptyRows }}>
            <TableCell colSpan={COLUMNS.length} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <Page title={t('directSales.title')}>
      <Container maxWidth="xl">
        <Breadcrumb links={[{ name: t('navigation.directSales') }]} />

        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {t('directSales.title')}
          </Typography>
        </Stack>

        {loading ? (
          <TableSkeleton rows={10} columns={COLUMNS.length} />
        ) : (
        <MuiTable
          data={sortedData}
          columns={COLUMNS}
          loading={loading}
          page={page}
          setPage={setPage}
          order={order}
          setOrder={setOrder}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          selected={selected}
          setSelected={setSelected}
          filterName={filterName}
          setFilterName={setFilterName}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          TableBodyComponent={TableBodyComponent}
          numSelected={selected.length}
          getRowId={(row) => row._id}
          onDeleteSelected={handleDeleteSelected}
        />
        )}
      </Container>
    </Page>
  );
}
