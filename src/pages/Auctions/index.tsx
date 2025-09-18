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
} from '@mui/material';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import { useSnackbar } from 'notistack';
import MuiTable from '../../components/Tables/MuiTable';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery'; // Import useMediaQuery for responsive design
// types
import { Auction, AUCTION_TYPE, BID_STATUS } from '../../types/Auction';
import Breadcrumb from '@/components/Breadcrumbs';
import { AuctionsAPI } from '@/api/auctions'; // Assuming this path is correct
import { format } from 'date-fns'; 

// ----------------------------------------------------------------------

const COLUMNS = [
  { id: 'title', label: 'Titre', alignRight: false, searchable: true, sortable: true },
  { id: 'bidType', label: 'Type', alignRight: false, searchable: false },
  { id: 'auctionType', label: 'Mode', alignRight: false, searchable: false },
  { id: 'startingPrice', label: 'Prix Initial', alignRight: false, searchable: false, sortable: true },
  { id: 'currentPrice', label: 'Prix Actuel', alignRight: false, searchable: false, sortable: true },
  { id: 'endingAt', label: 'Se Termine Le', alignRight: false, searchable: false, sortable: true },
  { id: 'status', label: 'Statut', alignRight: false, searchable: false },
  { id: 'actions', label: '', alignRight: true, searchable: false }
];

export default function Auctions() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
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
  const [totalAuctions, setTotalAuctions] = useState(0); // State to hold the total count

  const get = () => {
    setLoading(true);
    AuctionsAPI.getAuctions()
      .then((response) => {
        if (response && Array.isArray(response)) {
          setAuctions(response);
          setTotalAuctions(response.length); // Update total count
          console.log("1. Auctions state (direct response):", response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setAuctions(response.data);
          setTotalAuctions(response.data.length); // Update total count
          console.log("1. Auctions state (response.data):", response.data);
        } else {
          console.error("Unexpected response format:", response);
          enqueueSnackbar('Format de réponse inattendu.', { variant: 'error' });
          setAuctions([]);
          setTotalAuctions(0);
        }
      })
      .catch((e) => {
        console.error("Error fetching auctions:", e);
        enqueueSnackbar('Erreur lors du chargement des enchères.', { variant: 'error' });
        setAuctions([]);
        setTotalAuctions(0);
      })
      .finally(() => setLoading(false));
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
    setPage(0); // Reset page to 0 when filtering
  };

  const handleDeleteSelected = async (selectedIds: string[]) => {
    try {
      // Use Promise.all to send delete requests concurrently for all selected IDs
      await Promise.all(selectedIds.map(id => AuctionsAPI.remove(id)));
      enqueueSnackbar('Enchères sélectionnées supprimées avec succès!', { variant: 'success' });
      // After successful deletion, refetch the auctions to update the list
      get(); 
      setSelected([]); // Clear selection
    } catch (error) {
      console.error("Error deleting selected auctions:", error);
      enqueueSnackbar('Échec de la suppression des enchères sélectionnées.', { variant: 'error' });
    }
  };

  // Custom TableBodyComponent to render rows
  const TableBodyComponent = ({ data = [] }: { data: Auction[]; selected: string[]; setSelected: (selected: string[]) => void; }) => {
    console.log('6. TableBodyComponent - received data for rendering:', data);

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    return (
      <TableBody>
        {/* Render rows if data exists */}
        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
          console.log('7. TableBodyComponent - mapping row:', row);
          // Ensure row and _id exist before rendering
          if (!row || !row._id) {
            console.warn("Skipping row due to missing _id:", row);
            return null; // Skip rendering this row
          }

          const { _id, title, bidType, auctionType, startingPrice, currentPrice, endingAt, status } = row;

          // Format prices to a fixed number of decimal places or currency format
          const formatPrice = (price: number | undefined) =>
            price != null ? `${price.toLocaleString()} DA` : 'N/A';

          // Ensure endingAt is a valid Date object before formatting
          const formattedEndingAt = endingAt ? format(new Date(endingAt), 'dd MMM yyyy, HH:mm') : 'N/A'; // Corrected format string

          return (
            <TableRow hover key={String(_id)} // Ensure key is a string
              tabIndex={-1}
              sx={{ '& .MuiTableCell-root': {
                fontSize: isMobile ? '0.75rem' : '0.875rem', // Smaller font on mobile
                padding: isMobile ? '8px' : '16px', // Smaller padding on mobile
              }, }}
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
                  size={isMobile ? 'small' : 'medium'} // Responsive checkbox size
                />
              </TableCell>
              <TableCell component="th" scope="row">
                <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2}> {/* Responsive spacing */}
                  <Typography variant="subtitle2" noWrap sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}> {/* Responsive font size */}
                    {title || 'N/A'} {/* Display 'N/A' if title is null/undefined */}
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
                  size={isMobile ? 'small' : 'medium'} // Responsive button size
                  variant="outlined"
                  startIcon={<Iconify icon="eva:eye-outline" />}
                  sx={{ borderRadius: 2 }}
                >
                  Détails
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
        {emptyRows > 0 && (
          <TableRow style={{ height: (isMobile ? 53 : 73) * emptyRows }}> {/* Responsive row height */}
            <TableCell colSpan={COLUMNS.length} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <Page title="Enchères">
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}> {/* Responsive padding */}
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={{ xs: 3, sm: 5 }} spacing={isMobile ? 2 : 0}> {/* Responsive direction, alignment, margin, and spacing */}
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom={isMobile} sx={{ fontWeight: 'bold' }}> {/* Responsive font size and gutterBottom */}
            Enchères
          </Typography>

        </Stack>
        <Breadcrumb />

        <Box sx={{ mt: { xs: 2, sm: 3 } }}> {/* Responsive margin top */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress size={isMobile ? 36 : 48} /> {/* Responsive size */}
            </Box>
          )}

          {!loading && auctions.length === 0 && filterName === '' && (
            <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 5 } }}> {/* Responsive padding */}
              <Typography variant={isMobile ? "h6" : "h6"} color="text.secondary"> {/* Responsive font size */}
                Aucune enchère trouvée.
              </Typography>
            </Box>
          )}

          {/* Table display */}
          {!loading && (auctions.length > 0 || filterName !== '') && (
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}> {/* Enable horizontal scroll on small screens */}
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
                TableBodyComponent={TableBodyComponent} // Pass the custom TableBodyComponent
                searchFields={['title']}
                loading={loading}
                selected={selected} // Pass selected to MuiTable
                setSelected={setSelected} // Pass setSelected to MuiTable
                onDeleteSelected={() => handleDeleteSelected(selected)} // Pass delete handler as zero-arg function
                numSelected={selected.length} // Pass the number of selected items
              />
            </TableContainer>
          )}
        </Box>
      </Container>
    </Page>
  );
}