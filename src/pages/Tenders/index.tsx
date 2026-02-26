import { useState, useEffect, Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  TableContainer,
  Box,
  Checkbox,
  Collapse,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Skeleton,
} from '@mui/material';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import { useSnackbar } from 'notistack';
import MuiTable from '../../components/Tables/MuiTable';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// types
import { Auction, AUCTION_TYPE, BID_STATUS } from '../../types/Auction';
import Breadcrumb from '@/components/Breadcrumbs';
import { TendersAPI } from '@/api/tenders';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// ----------------------------------------------------------------------
// Lazy-loaded component to fetch participant count per tender row
const ParticipantCountCell = ({ tenderId }: { tenderId: string }) => {
  const { data: bids, isLoading } = useQuery({
    queryKey: ['tender-bids-count', tenderId],
    queryFn: async () => {
      const resp = await TendersAPI.getTenderBids(tenderId);
      return Array.isArray(resp) ? resp : [];
    },
    staleTime: 60000, // Cache for 1 minute
  });

  if (isLoading) return <Skeleton variant="circular" width={24} height={24} />;
  
  return (
    <Chip
      label={bids?.length || 0}
      color="primary"
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
};


export default function Tenders() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const COLUMNS = [
    { id: 'expand', label: '', alignRight: false, searchable: false },
    { id: 'title', label: t('tenders.title') || 'Titre', alignRight: false, searchable: true, sortable: true },
    { id: 'tenderType', label: t('common.type') || 'Type', alignRight: false, searchable: false },
    { id: 'participants', label: t('tenders.participants') || 'Participants', alignRight: false, searchable: false },
    { id: 'endingAt', label: t('tenders.endingAt') || 'Se Termine Le', alignRight: false, searchable: false, sortable: true },
    { id: 'status', label: t('common.status') || 'Statut', alignRight: false, searchable: false },
    { id: 'actions', label: '', alignRight: true, searchable: false }
  ];
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const queryClient = useQueryClient();
  const [tenderBids, setTenderBids] = useState<{ [key: string]: any[] }>({});
  const [loadingBids, setLoadingBids] = useState<{ [key: string]: boolean }>({});


  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState('title');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalTenders, setTotalTenders] = useState(0);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  const { data: tendersData, isLoading: loading, error } = useQuery({
    queryKey: ['tenders'],
    queryFn: async () => {
      const response = await TendersAPI.getAllTenders();
      let data = [];
      if (response && Array.isArray(response)) {
        data = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        data = response.data;
      } else {
        throw new Error('Unexpected response format');
      }
      return data;
    }
  });

  const tenders = tendersData || [];
  
  useEffect(() => {
    if (tenders.length > 0) {
      setTotalTenders(tenders.length);
    }
  }, [tenders]);

  // Removed fetchAllParticipantCounts to avoid 429 Too Many Requests
  // Using lazy-loaded ParticipantCountCell component instead


  const fetchBidsForTender = async (tenderId: string) => {
    if (tenderBids[tenderId]) return; // Already loaded

    setLoadingBids(prev => ({ ...prev, [tenderId]: true }));
    try {
      const bids = await TendersAPI.getTenderBids(tenderId);
      console.log('Bids for tender', tenderId, ':', bids);

      if (Array.isArray(bids)) {
        const formattedBids = bids
          .map((bid: any) => ({
            id: bid._id,
            name: bid.bidder?.firstName && bid.bidder?.lastName
              ? `${bid.bidder.firstName} ${bid.bidder.lastName}`
              : bid.bidder?.email || 'Utilisateur Inconnu',
            avatar: bid.bidder?.avatar?.path || '',
            amount: bid.amount,
            proposal: bid.proposal,
            createdAt: bid.createdAt,
            status: bid.status,
            bidder: bid.bidder
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setTenderBids(prev => ({ ...prev, [tenderId]: formattedBids }));
      } else {
        setTenderBids(prev => ({ ...prev, [tenderId]: [] }));
      }
    } catch (error) {
      console.error('Error fetching bids for tender:', tenderId, error);
      setTenderBids(prev => ({ ...prev, [tenderId]: [] }));
    } finally {
      setLoadingBids(prev => ({ ...prev, [tenderId]: false }));
    }
  };

  const handleExpandRow = async (tenderId: string) => {
    const isExpanded = expandedRows[tenderId];
    setExpandedRows(prev => ({ ...prev, [tenderId]: !isExpanded }));

    if (!isExpanded) {
      await fetchBidsForTender(tenderId);
    }
  };

  // get() is no longer called with useEffect

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    setPage(0);
  };

  const handleDeleteSelected = async (selectedIds: string[]) => {
    try {
      await Promise.all(selectedIds.map(id => TendersAPI.deleteTender(id)));
      enqueueSnackbar('Appels d\'offres sélectionnés supprimés avec succès!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      setSelected([]);
    } catch (error) {
      console.error("Error deleting selected tenders:", error);
      enqueueSnackbar('Échec de la suppression des appels d\'offres sélectionnés.', { variant: 'error' });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Ouvert';
      case 'closed':
        return 'Fermé';
      case 'in_progress':
        return 'En Cours';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'open':
        return 'success';
      case 'closed':
        return 'error';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Custom TableBodyComponent to render rows
  const TableBodyComponent = ({ data = [] }: { data: any[]; selected: string[]; setSelected: (selected: string[]) => void; }) => {
    console.log('TableBodyComponent - received data for rendering:', data);

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    return (
      <TableBody>
        {data.map((row) => {
          if (!row || !row._id) {
            console.warn("Skipping row due to missing _id:", row);
            return null;
          }

          const { _id, title, description, budget, createdAt, status } = row;
          const isExpanded = expandedRows[_id];
          const bids = tenderBids[_id] || [];
          const isLoadingBids = loadingBids[_id];

          const formatPrice = (price: number | undefined) =>
            price != null ? `${price.toLocaleString()} DA` : 'N/A';

          const formattedCreatedAt = createdAt ? format(new Date(createdAt), 'dd MMM yyyy, HH:mm') : 'N/A';

          return (
            <Fragment key={String(_id)}>
              <TableRow
                hover
                key={String(_id)}
                tabIndex={-1}
                sx={{
                  '& .MuiTableCell-root': {
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    padding: isMobile ? '8px' : '16px',
                  },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.indexOf(String(_id)) !== -1}
                    onChange={() => {
                      const selectedIndex = selected.indexOf(String(_id));
                      let newSelected: string[] = [];

                      if (selectedIndex === -1) {
                        newSelected = newSelected.concat(selected, String(_id));
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
                    }}
                    size={isMobile ? 'small' : 'medium'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleExpandRow(_id)}
                  >
                    {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                  <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2}>
                    <Typography variant="subtitle2" noWrap sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                      {title || 'N/A'}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="left">
                  <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                    {description || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell align="left">
                    <ParticipantCountCell tenderId={_id} />
                </TableCell>
                <TableCell align="left">{formattedCreatedAt}</TableCell>
                <TableCell align="left">
                  <Label
                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                    color={getStatusColor(status)}
                  >
                    {getStatusLabel(status)}
                  </Label>
                </TableCell>
                <TableCell align="right">
                  <Button
                    component={RouterLink}
                    to={`/dashboard/tenders/${_id}`}
                    size={isMobile ? 'small' : 'medium'}
                    variant="outlined"
                    startIcon={<Iconify icon="eva:eye-outline" />}
                    sx={{ borderRadius: 2 }}
                  >
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow key={`${_id}-details`}>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 2 }}>
                      <Typography variant="h6" gutterBottom component="div" sx={{ mb: 2 }}>
                        Soumissions
                      </Typography>
                      {isLoadingBids ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                          <Stack spacing={1} sx={{ width: '100%' }}>
                            <Skeleton variant="rounded" width="100%" height={60} />
                            <Skeleton variant="rounded" width="100%" height={60} />
                          </Stack>
                        </Box>
                      ) : bids.length > 0 ? (
                        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                          {bids.map((bid, index) => (
                            <Box key={bid.id}>
                              <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                  <Avatar src={bid.avatar} alt={bid.name}>
                                    {bid.name.charAt(0)}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Stack direction="row" spacing={2} alignItems="center">
                                      <Typography variant="subtitle2">
                                        {bid.name}
                                      </Typography>
                                      <Chip
                                        label={`${bid.amount && typeof bid.amount === 'number' ? bid.amount.toLocaleString() : '0'} DA`}
                                        color="success"
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                      />
                                      <Chip
                                        label={bid.status === 'pending' ? 'En Attente' : bid.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                                        color={bid.status === 'pending' ? 'warning' : bid.status === 'accepted' ? 'success' : 'error'}
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
                                        Soumise le {format(new Date(bid.createdAt), 'dd MMM yyyy à HH:mm')}
                                      </Typography>
                                      <Typography
                                        sx={{ display: 'block' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                      >
                                        Proposition: {bid.proposal}
                                      </Typography>
                                    </>
                                  }
                                />
                              </ListItem>
                              {index < bids.length - 1 && <Divider variant="inset" component="li" />}
                            </Box>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                          Aucune soumission pour cet appel d'offres
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
          <TableRow style={{ height: (isMobile ? 53 : 73) * emptyRows }}>
            <TableCell colSpan={COLUMNS.length} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <Page title="Appels d'Offres">
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={{ xs: 3, sm: 5 }} spacing={isMobile ? 2 : 0}>
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom={isMobile} sx={{ fontWeight: 'bold' }}>
            Appels d'Offres (Soumissions)
          </Typography>
        </Stack>
        <Breadcrumb />

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
            <MuiTable
              data={tenders}
              columns={COLUMNS}
              page={page}
              setPage={setPage}
              order={order}
              setOrder={setOrder}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              filterName={filterName}
              setFilterName={setFilterName}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              TableBodyComponent={TableBodyComponent}
              searchFields={['title', 'description']}
              loading={loading}
              selected={selected}
              setSelected={setSelected}
              onDeleteSelected={() => handleDeleteSelected(selected)}
              numSelected={selected.length}
            />
          </TableContainer>
        </Box>
      </Container>
    </Page>
  );
}