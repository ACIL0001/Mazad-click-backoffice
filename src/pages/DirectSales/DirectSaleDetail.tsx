import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Page from '../../components/Page';
import Label from '../../components/Label';
import Breadcrumb from '@/components/Breadcrumbs';
import Iconify from '@/components/Iconify';
import { DirectSaleAPI } from '@/api/direct-sale';
import { useSnackbar } from 'notistack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Slide from '@mui/material/Slide';

interface DirectSale {
  _id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  status: 'ACTIVE' | 'SOLD' | 'PAUSED' | 'ARCHIVED';
  owner?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
    avatar?: { url: string };
  };
  productCategory?: {
    _id: string;
    name: string;
  };
  productSubCategory?: {
    _id: string;
    name: string;
  };
  wilaya: string;
  location: string;
  thumbs?: Array<{ url: string; _id: string; filename?: string }>;
  videos?: Array<{ url: string; _id: string; filename?: string }>;
  isPro?: boolean;
  hidden?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Purchase {
  _id: string;
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
    username?: string;
    email: string;
    phone?: string;
    avatar?: { url: string };
  };
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  quantity: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

export default function DirectSaleDetail() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [directSale, setDirectSale] = useState<DirectSale | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDirectSale();
      fetchPurchases();
    }
  }, [id]);

  const fetchDirectSale = async () => {
    try {
      setLoading(true);
      const data = await DirectSaleAPI.getDirectSaleById(id!);
      setDirectSale(data);
    } catch (error: any) {
      console.error('Error fetching direct sale:', error);
      enqueueSnackbar(t('directSales.errors.loadingDetails'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    setPurchasesLoading(true);
    try {
      const response = await DirectSaleAPI.getPurchasesByDirectSale(id!);
      let purchasesData: Purchase[] = [];
      
      if (response) {
        if (Array.isArray(response.data)) {
          purchasesData = response.data;
        } else if (Array.isArray(response)) {
          purchasesData = response;
        } else {
          purchasesData = [];
        }
      }
      
      setPurchases(purchasesData);
    } catch (error: any) {
      console.error('Error fetching purchases:', error);
      enqueueSnackbar(t('directSales.errors.loadingOrders'), { variant: 'error' });
      setPurchases([]);
    } finally {
      setPurchasesLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    
    const dateString = typeof date === 'string' ? date : date.toISOString();
    const currentLanguage = i18n.language || 'en';
    
    const localeMap: { [key: string]: string } = {
      'en': 'en-US',
      'fr': 'fr-FR',
      'ar': 'ar-DZ',
      'es': 'es-ES',
      'de': 'de-DE',
    };
    
    const locale = localeMap[currentLanguage] || 'en-US';
    
    try {
      return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.warn(`Date formatting error with locale ${locale}, using default format`);
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getTotalRevenue = () => {
    return purchases
      .filter(p => p.status === 'CONFIRMED')
      .reduce((sum, p) => sum + p.totalPrice, 0);
  };

  const getTotalQuantitySold = () => {
    return purchases
      .filter(p => p.status === 'CONFIRMED')
      .reduce((sum, p) => sum + p.quantity, 0);
  };

  const getAveragePurchaseValue = () => {
    const confirmedPurchases = purchases.filter(p => p.status === 'CONFIRMED');
    if (confirmedPurchases.length === 0) return 0;
    return getTotalRevenue() / confirmedPurchases.length;
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    // For relative paths, try to construct full URL
    // This will be handled by the backend API response which should include full URLs
    if (imagePath.startsWith('/')) return imagePath;
    return imagePath;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'SOLD':
        return 'error';
      case 'PAUSED':
        return 'warning';
      case 'ARCHIVED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return t('directSales.active');
      case 'SOLD':
        return t('directSales.sold');
      case 'PAUSED':
        return t('directSales.paused');
      case 'ARCHIVED':
        return t('directSales.archived');
      default:
        return status;
    }
  };

  const getPurchaseStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'REFUNDED':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Page title={t('directSales.detailsTitle')}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Page>
    );
  }

  if (!directSale) {
    return (
      <Page title="Vente directe introuvable">
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Typography variant="h6">{t('directSales.notFound')}</Typography>
          </Box>
        </Container>
      </Page>
    );
  }

  const totalRevenue = getTotalRevenue();
  const totalQuantitySold = getTotalQuantitySold();
  const averagePurchaseValue = getAveragePurchaseValue();
  const availableQuantity = directSale.quantity - totalQuantitySold;

  return (
    <Page title={`${t('details') || 'Détails'} - ${directSale.title}`}>
      <Container maxWidth="xl" sx={{ 
        pt: { xs: '120px', sm: '130px', md: '140px' },
        minHeight: 'calc(100vh - 120px)'
      }}>
        <Breadcrumb links={[
          { name: t('navigation.directSales'), href: '/dashboard/direct-sales' },
          { name: directSale.title }
        ]} />

        {/* Title Display */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            mb: 2,
            fontSize: { xs: '24px', sm: '28px', md: '32px' }
          }}>
            {directSale.title}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {t('directSales.details')}
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: (theme) => {
                    const color = getStatusColor(directSale.status);
                    return theme.palette[color]?.[theme.palette.mode === 'dark' ? 400 : 500] || theme.palette.primary[500];
                  },
                  boxShadow: (theme) => {
                    const color = getStatusColor(directSale.status);
                    return `0 0 8px ${theme.palette[color]?.[theme.palette.mode === 'dark' ? 400 : 500] || theme.palette.primary[500]}`;
                  },
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(0.95)',
                      opacity: 0.8,
                    },
                    '70%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                    '100%': {
                      transform: 'scale(0.95)',
                      opacity: 0.8,
                    },
                  },
                }}
              />
            </Box>
            <Chip
              label={getStatusLabel(directSale.status)}
              color={getStatusColor(directSale.status) as any}
              variant="filled"
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 1.5,
                minWidth: 80,
                textAlign: 'center'
              }}
            />
          </Paper>
        </Stack>

        <Grid container spacing={3}>
          {/* Main Direct Sale Info */}
          <Grid item xs={12} md={8}>
            {/* Images Section */}
            {directSale.thumbs && directSale.thumbs.length > 0 && (
              <Card sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Images
                </Typography>
                <Grid container spacing={2}>
                  {directSale.thumbs.map((thumb, index) => (
                    <Grid item xs={12} sm={6} md={4} key={thumb._id || index}>
                      <Box
                        component="img"
                        src={getImageUrl(thumb.url)}
                        alt={`${directSale.title} - Image ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                        onClick={() => window.open(getImageUrl(thumb.url), '_blank')}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            )}

            <Card sx={{ p: 2, mb: 3, minHeight: '200px', maxHeight: '250px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {directSale.title}
              </Typography>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('directSales.description')}
                  </Typography>
                  <Typography variant="body1" sx={{ maxHeight: '80px', overflow: 'auto' }}>
                    {directSale.description}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('directSales.price')}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {directSale.price.toLocaleString()} DA
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('directSales.availableQuantity')}
                    </Typography>
                    <Typography variant="h6">
                      {directSale.quantity === 0 ? t('directSales.unlimited') : `${availableQuantity} / ${directSale.quantity}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Card>

            {directSale.owner && typeof directSale.owner === 'object' && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('directSales.seller')}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar 
                    src={directSale.owner.avatar?.url ? getImageUrl(directSale.owner.avatar.url) : undefined}
                    sx={{ width: 56, height: 56 }}
                  >
                    {(directSale.owner.firstName || directSale.owner.username || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {directSale.owner.firstName && directSale.owner.lastName 
                        ? `${directSale.owner.firstName} ${directSale.owner.lastName}`
                        : directSale.owner.username || 'Unknown User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {directSale.owner.email || t('common.na')}
                    </Typography>
                    {directSale.owner.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {directSale.owner.phone}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Card>
            )}

            {/* Purchase Statistics */}
            {purchases.length > 0 && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon /> Statistiques des Ventes
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'success.lighter',
                        border: '1px solid',
                        borderColor: 'success.light',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('directSales.totalRevenue')}
                      </Typography>
                      <Typography variant="h5" color="success.dark" fontWeight={700}>
                        {totalRevenue.toLocaleString()} DA
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'info.lighter',
                        border: '1px solid',
                        borderColor: 'info.light',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('directSales.totalSold')}
                      </Typography>
                      <Typography variant="h5" color="info.dark" fontWeight={700}>
                        {totalQuantitySold}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'primary.lighter',
                        border: '1px solid',
                        borderColor: 'primary.light',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('directSales.averagePurchase')}
                      </Typography>
                      <Typography variant="h5" color="primary.dark" fontWeight={700}>
                        {averagePurchaseValue.toFixed(0)} DA
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Card>
            )}

            {/* Purchases Section - Enhanced Table View */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCartIcon /> {t('directSales.purchases')} ({purchases.length})
              </Typography>
              {purchasesLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60px">
                  <CircularProgress size={24} />
                </Box>
              ) : purchases && purchases.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.neutral' }}>
                        <TableCell>#</TableCell>
                        <TableCell>{t('common.buyer') || 'Acheteur'}</TableCell>
                        <TableCell>{t('common.contact') || 'Contact'}</TableCell>
                        <TableCell align="right">{t('directSales.quantity')}</TableCell>
                        <TableCell align="right">{t('directSales.price')} {t('common.total') || 'Total'}</TableCell>
                        <TableCell>{t('directSales.status')}</TableCell>
                        <TableCell align="right">{t('common.date') || 'Date'}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchases.map((purchase, index) => (
                        <TableRow
                          key={purchase._id}
                          sx={{
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor: purchase.status === 'CONFIRMED' ? 'success.lighter' : 'inherit'
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {index + 1}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar 
                                src={purchase.buyer.avatar?.url ? getImageUrl(purchase.buyer.avatar.url) : undefined}
                                alt={purchase.buyer.firstName}
                              >
                                {purchase.buyer.firstName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={purchase.status === 'CONFIRMED' ? 700 : 500}>
                                  {purchase.buyer.firstName} {purchase.buyer.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {purchase.buyer.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {purchase.buyer.phone || t('common.na')}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              {purchase.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
                              label={`${purchase.totalPrice.toLocaleString()} DA`}
                              color={purchase.status === 'CONFIRMED' ? 'success' : 'default'}
                              variant={purchase.status === 'CONFIRMED' ? 'filled' : 'outlined'}
                              sx={{ fontWeight: purchase.status === 'CONFIRMED' ? 700 : 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={t(`directSales.purchaseStatus.${purchase.status.toLowerCase()}`) || purchase.status}
                              size="small"
                              color={getPurchaseStatusColor(purchase.status) as any}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(purchase.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'background.neutral',
                    borderRadius: 2
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    {t('directSales.noPurchases')}
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                    {t('directSales.purchasesWillAppear') || 'Les commandes apparaîtront ici une fois que les acheteurs auront effectué des achats'}
                  </Typography>
                </Paper>
              )}
            </Card>
          </Grid>

          {/* Sidebar Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, mb: 3, minHeight: '200px', maxHeight: '250px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('common.information')}
              </Typography>
              <Stack spacing={2} sx={{ flex: 1, justifyContent: 'space-around' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('directSales.category')}
                  </Typography>
                  <Label variant="ghost" color="default">
                    {directSale.productCategory?.name || t('common.na')}
                  </Label>
                </Box>
                {directSale.productSubCategory && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('navigation.subCategories')}
                    </Typography>
                    <Label variant="ghost" color="default">
                      {directSale.productSubCategory.name}
                    </Label>
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('directSales.type')}
                  </Typography>
                  <Label variant="ghost" color={directSale.isPro ? 'warning' : 'default'}>
                    {directSale.isPro ? t('common.professional') || 'Professionnel' : t('common.individual') || 'Particulier'}
                  </Label>
                </Box>
              </Stack>
            </Card>

            {/* Location Info */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Localisation
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Wilaya
                  </Typography>
                  <Typography variant="body1">{directSale.wilaya || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.address') || 'Adresse'}
                  </Typography>
                  <Typography variant="body1">{directSale.location || 'N/A'}</Typography>
                </Box>
              </Stack>
            </Card>

            {/* Timeline */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('common.timeline') || 'Chronologie'}
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('directSales.createdAt')}
                  </Typography>
                  <Typography variant="body1">{formatDate(directSale.createdAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.updatedAt') || 'Dernière mise à jour'}
                  </Typography>
                  <Typography variant="body1">{formatDate(directSale.updatedAt)}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}

