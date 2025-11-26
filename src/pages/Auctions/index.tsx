import { useState, useEffect } from 'react';
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
import { AuctionsAPI } from '@/api/auctions';
import { OffersAPI } from '@/api/offers';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function Auctions() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const COLUMNS = [
    { id: 'expand', label: '', alignRight: false, searchable: false },
    { id: 'title', label: t('auctions.title') || 'Titre', alignRight: false, searchable: true, sortable: true },
    { id: 'bidType', label: t('common.type') || 'Type', alignRight: false, searchable: false },
    { id: 'auctionType', label: t('auctions.mode') || 'Mode', alignRight: false, searchable: false },
    { id: 'startingPrice', label: t('auctions.startingPrice') || 'Prix Initial', alignRight: false, searchable: false, sortable: true },
    { id: 'currentPrice', label: t('auctions.currentPrice') || 'Prix Actuel', alignRight: false, searchable: false, sortable: true },
    { id: 'participants', label: t('auctions.participants') || 'Participants', alignRight: false, searchable: false },
    { id: 'endingAt', label: t('auctions.endingAt') || 'Se Termine Le', alignRight: false, searchable: false, sortable: true },
    { id: 'status', label: t('common.status') || 'Statut', alignRight: false, searchable: false },
    { id: 'actions', label: '', alignRight: true, searchable: false }
  ];
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState('title');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalAuctions, setTotalAuctions] = useState(0);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [auctionOffers, setAuctionOffers] = useState<{ [key: string]: any[] }>({});
  const [loadingOffers, setLoadingOffers] = useState<{ [key: string]: boolean }>({});
  const [participantCounts, setParticipantCounts] = useState<{ [key: string]: number }>({});
  const [loadingParticipantCounts, setLoadingParticipantCounts] = useState(true);

  const get = () => {
    setLoading(true);
    AuctionsAPI.getAuctions()
      .then((response) => {
        let auctionsData = [];
        if (response && Array.isArray(response)) {
          auctionsData = response;
          setTotalAuctions(response.length);
          console.log("Auctions state (direct response):", response);
        } else if (response && response.data && Array.isArray(response.data)) {
          auctionsData = response.data;
          setTotalAuctions(response.data.length);
          console.log("Auctions state (response.data):", response.data);
        } else {
          console.error("Unexpected response format:", response);
          enqueueSnackbar(t('common.unexpectedFormat') || 'Format de réponse inattendu.', { variant: 'error' });
          setAuctions([]);
          setTotalAuctions(0);
          return;
        }
        
        setAuctions(auctionsData);
        // Fetch participant counts for all auctions
        fetchAllParticipantCounts(auctionsData);
      })
      .catch((e) => {
        console.error("Error fetching auctions:", e);
        enqueueSnackbar('Erreur lors du chargement des enchères.', { variant: 'error' });
        setAuctions([]);
        setTotalAuctions(0);
      })
      .finally(() => setLoading(false));
  };

  const fetchAllParticipantCounts = async (auctionsData: any[]) => {
    setLoadingParticipantCounts(true);
    const counts: { [key: string]: number } = {};
    
    // Fetch participant counts for all auctions in parallel
    const promises = auctionsData.map(async (auction) => {
      try {
        const offers = await OffersAPI.getOffersByBidId(auction._id);
        counts[auction._id] = Array.isArray(offers) ? offers.length : 0;
      } catch (error) {
        console.error(`Error fetching offers for auction ${auction._id}:`, error);
        counts[auction._id] = 0;
      }
    });
    
    await Promise.all(promises);
    setParticipantCounts(counts);
    setLoadingParticipantCounts(false);
  };

  const fetchOffersForAuction = async (auctionId: string) => {
    if (auctionOffers[auctionId]) return; // Already loaded

    setLoadingOffers(prev => ({ ...prev, [auctionId]: true }));
    try {
      const offers = await OffersAPI.getOffersByBidId(auctionId);
      console.log('Offers for auction', auctionId, ':', offers);

      if (Array.isArray(offers)) {
        const formattedOffers = offers
          .map((offer: any) => ({
            id: offer._id,
            name: offer.user?.firstName && offer.user?.lastName
              ? `${offer.user.firstName} ${offer.user.lastName}`
              : offer.user?.email || 'Utilisateur Inconnu',
            avatar: offer.user?.avatar?.path || '',
            price: offer.price,
            createdAt: offer.createdAt,
            user: offer.user
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setAuctionOffers(prev => ({ ...prev, [auctionId]: formattedOffers }));
      } else {
        setAuctionOffers(prev => ({ ...prev, [auctionId]: [] }));
      }
    } catch (error) {
      console.error('Error fetching offers for auction:', auctionId, error);
      setAuctionOffers(prev => ({ ...prev, [auctionId]: [] }));
    } finally {
      setLoadingOffers(prev => ({ ...prev, [auctionId]: false }));
    }
  };

  const handleExpandRow = async (auctionId: string) => {
    const isExpanded = expandedRows[auctionId];
    setExpandedRows(prev => ({ ...prev, [auctionId]: !isExpanded }));

    if (!isExpanded) {
      await fetchOffersForAuction(auctionId);
    }
  };

  useEffect(() => {
    get();
  }, []);

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
      await Promise.all(selectedIds.map(id => AuctionsAPI.remove(id)));
      enqueueSnackbar('Enchères sélectionnées supprimées avec succès!', { variant: 'success' });
      get();
      setSelected([]);
    } catch (error) {
      console.error("Error deleting selected auctions:", error);
      enqueueSnackbar('Échec de la suppression des enchères sélectionnées.', { variant: 'error' });
    }
  };

  // Custom TableBodyComponent to render rows
  const TableBodyComponent = ({ data = [] }: { data: Auction[]; selected: string[]; setSelected: (selected: string[]) => void; }) => {
    console.log('TableBodyComponent - received data for rendering:', data);

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    return (
      <TableBody>
        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
          if (!row || !row._id) {
            console.warn("Skipping row due to missing _id:", row);
            return null;
          }

          const { _id, title, bidType, auctionType, startingPrice, currentPrice, endingAt, status } = row;
          const isExpanded = expandedRows[_id];
          const offers = auctionOffers[_id] || [];
          const isLoadingOffers = loadingOffers[_id];

          const formatPrice = (price: number | undefined) =>
            price != null ? `${price.toLocaleString()} DA` : 'N/A';

          const formattedEndingAt = endingAt ? format(new Date(endingAt), 'dd MMM yyyy, HH:mm') : 'N/A';

          return (
            <>
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
                <TableCell align="left">{bidType || 'N/A'}</TableCell>
                <TableCell align="left">
                  <Label
                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                    color={(auctionType === AUCTION_TYPE.CLASSIC && 'info') || 'success'}
                  >
                    {auctionType === AUCTION_TYPE.AUTO_SUB_BID
                      ? 'Enchère Automatique'
                      : 'Classique'}
                  </Label>
                </TableCell>
                <TableCell align="left">{formatPrice(startingPrice)}</TableCell>
                <TableCell align="left">{formatPrice(currentPrice)}</TableCell>
                <TableCell align="left">
                  {loadingParticipantCounts ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Chip
                      label={participantCounts[_id] || 0}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </TableCell>
                <TableCell align="left">{formattedEndingAt}</TableCell>
                <TableCell align="left">
                  <Label
                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                    color={
                      (status === BID_STATUS.CLOSED && 'error') ||
                      (status === BID_STATUS.ON_AUCTION && 'success') ||
                      'warning'
                    }
                  >
                    {status === BID_STATUS.CLOSED
                      ? 'Cloturée'
                      : status === BID_STATUS.ON_AUCTION
                      ? 'Enchère Activer'
                      : 'Ouverte'}
                  </Label>
                </TableCell>
                <TableCell align="right">
                  <Button
                    component={RouterLink}
                    to={`/dashboard/auctions/${_id}`}
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
                        Participants et Offres
                      </Typography>
                      {isLoadingOffers ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : offers.length > 0 ? (
                        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                          {offers.map((offer, index) => (
                            <Box key={offer.id}>
                              <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                  <Avatar src={offer.avatar} alt={offer.name}>
                                    {offer.name.charAt(0)}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Stack direction="row" spacing={2} alignItems="center">
                                      <Typography variant="subtitle2">
                                        {offer.name}
                                      </Typography>
                                      <Chip
                                        label={`${offer.price?.toLocaleString()} DA`}
                                        color="success"
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                      />
                                    </Stack>
                                  }
                                  secondary={
                                    <Typography
                                      sx={{ display: 'inline' }}
                                      component="span"
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Offre soumise le {format(new Date(offer.createdAt), 'dd MMM yyyy à HH:mm')}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                              {index < offers.length - 1 && <Divider variant="inset" component="li" />}
                            </Box>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                          Aucun participant pour cette enchère
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </>
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
    <Page title="Enchères">
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={{ xs: 3, sm: 5 }} spacing={isMobile ? 2 : 0}>
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom={isMobile} sx={{ fontWeight: 'bold' }}>
            Enchères
          </Typography>
        </Stack>
        <Breadcrumb />

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress size={isMobile ? 36 : 48} />
            </Box>
          )}

          {!loading && auctions.length === 0 && filterName === '' && (
            <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 5 } }}>
              <Typography variant={isMobile ? "h6" : "h6"} color="text.secondary">
                Aucune enchère trouvée.
              </Typography>
            </Box>
          )}

          {!loading && (auctions.length > 0 || filterName !== '') && (
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
              <MuiTable
                data={auctions}
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
                searchFields={['title']}
                loading={loading}
                selected={selected}
                setSelected={setSelected}
                onDeleteSelected={() => handleDeleteSelected(selected)}
                numSelected={selected.length}
              />
            </TableContainer>
          )}
        </Box>
      </Container>
    </Page>
  );
}