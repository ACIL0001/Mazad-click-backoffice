import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// material
import {
  Box,
  Card,
  Grid,
  Stack,
  Avatar,
  Button,
  Container,
  Typography,
  CircularProgress,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import { useSnackbar } from 'notistack';
import { TendersAPI } from '@/api/tenders';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ChatIcon from '@mui/icons-material/Chat';
import useAuth from '@/hooks/useAuth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Slide from '@mui/material/Slide';
import { useCreateSocket } from '@/contexts/SocketContext';
import { ChatAPI } from '@/api/Chat';
import PersonIcon from '@mui/icons-material/Person';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DescriptionIcon from '@mui/icons-material/Description';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DetailSkeleton from '@/components/skeletons/DetailSkeleton';
import { Skeleton } from '@mui/material';

interface TenderOwner {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
}

interface TenderBid {
  _id: string;
  amount?: number;
  price?: number;
  bidAmount?: number;
  proposal: string;
  status: string;
  createdAt: string;
  bidder: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatar?: {
      path?: string;
    };
  };
}

interface Tender {
  _id: string;
  title: string;
  description: string;
  budget?: number;
  deadline?: string;
  requirements?: string[];
  status: string;
  createdAt: string;
  owner?: TenderOwner;
  acceptedBid?: TenderBid;
}

export default function TenderDetail() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [acceptLoading, setAcceptLoading] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const navigate = useNavigate();
  const { notificationSocket } = useCreateSocket();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  const { data: tender, isLoading: loading } = useQuery({
    queryKey: ['tender', id],
    queryFn: async () => {
      const response = await TendersAPI.getTenderById(id!);
      return response;
    },
    enabled: !!id,
  });

  const { data: bidsData, isLoading: bidsLoading } = useQuery({
    queryKey: ['tender', id, 'bids'],
    queryFn: async () => {
      const bidsData = await TendersAPI.getTenderBids(id!);
      if (Array.isArray(bidsData)) {
        return bidsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return [];
    },
    enabled: !!id,
  });

  const bids = bidsData || [];

  const handleAcceptBid = async (bidId: string) => {
    setAcceptLoading(bidId);
    try {
      await TendersAPI.acceptTenderBid(bidId);
      enqueueSnackbar('Soumission acceptée avec succès!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['tender', id] });
      queryClient.invalidateQueries({ queryKey: ['tender', id, 'bids'] });
    } catch (error) {
      console.error('Error accepting bid:', error);
      enqueueSnackbar('Erreur lors de l\'acceptation de la soumission', { variant: 'error' });
    } finally {
      setAcceptLoading(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    setRejectLoading(bidId);
    try {
      await TendersAPI.rejectTenderBid(bidId);
      enqueueSnackbar('Soumission rejetée avec succès!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['tender', id] });
      queryClient.invalidateQueries({ queryKey: ['tender', id, 'bids'] });
    } catch (error) {
      console.error('Error rejecting bid:', error);
      enqueueSnackbar('Erreur lors du rejet de la soumission', { variant: 'error' });
    } finally {
      setRejectLoading(null);
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

  const getBidStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const CreateChat = async (bidder: any) => {
    if (!bidder) {
      enqueueSnackbar(t('errors.noValidParticipant') || 'Aucun participant valide', { variant: 'error' });
      return;
    }

    setChatLoading(true);
    
    let data = {
      createdAt: new Date().toISOString(),
      users: [auth.user, bidder]
    };

    console.log('Creating chat:', data);
    
    try {
      const res = await ChatAPI.createChat(data);
      console.log('Chat created:', res);

      if (res._id) {
        navigate(`/dashboard/chat`, { state: { chat: res } });
      }
    } catch (err) {
      console.error('Error creating chat:', err);
      enqueueSnackbar(t('errors.failedToCreateChat') || 'Échec de la création du chat', { variant: 'error' });
    } finally {
      setChatLoading(false);
    }
  };

  const AcceptedBidBanner = ({ bid }: { bid: TenderBid }) => (
    <Slide in direction="down" timeout={600}>
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
          color: '#fff',
          boxShadow: '0 8px 32px 0 rgba(34, 197, 94, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <EmojiEventsIcon sx={{ fontSize: 40, color: '#fff', mr: 2, animation: 'trophy-bounce 1.2s infinite alternate' }} />
        <Avatar
          src={bid.bidder.avatar?.path || ''}
          alt={bid.bidder.firstName}
          sx={{ width: 56, height: 56, border: '2px solid #fff', boxShadow: 2 }}
        >
          {bid.bidder?.firstName?.charAt(0) || 'W'}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Soumission Acceptée
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            <b>{bid.bidder?.firstName || ''} {bid.bidder?.lastName || ''}</b>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 400, opacity: 0.9 }}>
            <b>{t('phone')}: {bid.bidder?.phone || 'N/A'}</b>
          </Typography>
        </Box>
        <style>{`
          @keyframes trophy-bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-8px); }
          }
        `}</style>
      </Paper>
    </Slide>
  );

  const getBidAmount = (bid: TenderBid): number => {
    return bid.amount || bid.price || bid.bidAmount || 0;
  };

  const getHighestBid = () => {
    if (bids.length === 0) return null;
    const validBids = bids.filter(b => {
      const amount = getBidAmount(b);
      return b && typeof amount === 'number' && !isNaN(amount) && amount > 0;
    });
    if (validBids.length === 0) return null;
    return validBids.reduce((max, b) => getBidAmount(b) > getBidAmount(max) ? b : max, validBids[0]);
  };

  const getLowestBid = () => {
    if (bids.length === 0) return null;
    const validBids = bids.filter(b => {
      const amount = getBidAmount(b);
      return b && typeof amount === 'number' && !isNaN(amount) && amount > 0;
    });
    if (validBids.length === 0) return null;
    return validBids.reduce((min, b) => getBidAmount(b) < getBidAmount(min) ? b : min, validBids[0]);
  };

  const getAverageBid = () => {
    if (bids.length === 0) return 0;
    const validBids = bids.filter(b => {
      const amount = getBidAmount(b);
      return b && typeof amount === 'number' && !isNaN(amount) && amount > 0;
    });
    if (validBids.length === 0) return 0;
    const total = validBids.reduce((sum, b) => sum + getBidAmount(b), 0);
    return total / validBids.length;
  };

  if (loading) {
    return (
      <Page title={t('details') || 'Détails'}>
        <Container>
          <DetailSkeleton />
        </Container>
      </Page>
    );
  }

  if (!tender) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">{t('notFound') || 'Non trouvé'}</Typography>
      </Box>
    );
  }

  const isTenderOwner = auth.user && tender.owner && typeof tender.owner === 'object' && tender.owner._id === auth.user._id;
  const highestBid = getHighestBid();
  const lowestBid = getLowestBid();
  const averageBid = getAverageBid();

  console.log('Notification socket data:', notificationSocket);

  return (
    <Page title={`${t('details') || 'Détails'} - ${tender.title}`}>
      <Container>
        {/* Accepted Bid Banner */}
        {tender.acceptedBid && <AcceptedBidBanner bid={tender.acceptedBid} />}
        
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {t('details') || 'Détails de l\'Appel d\'Offres'}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            {tender.acceptedBid && (
              <Button
                variant="contained"
                startIcon={<ChatIcon />}
                onClick={() => CreateChat(tender.acceptedBid!.bidder)}
                disabled={chatLoading}
                sx={{
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px 0 rgba(34, 197, 94, 0.15)',
                  px: 3,
                  py: 1.2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)',
                  },
                }}
                size="large"
              >
                {chatLoading ? <CircularProgress size={22} color="inherit" /> : 'Contacter le Soumissionnaire'}
              </Button>
            )}
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
                      const color = getStatusColor(tender.status);
                      return theme.palette[color]?.main || theme.palette.primary.main;
                    },
                    boxShadow: (theme) => {
                      const color = getStatusColor(tender.status);
                      return `0 0 8px ${theme.palette[color]?.main || theme.palette.primary.main}`;
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
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                  }}
                >
                  Statut
                </Typography>
              </Box>
              <Chip
                label={tender.status === 'open' ? 'Ouvert' : tender.status === 'closed' ? 'Fermé' : 'En Cours'}
                color={getStatusColor(tender.status)}
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
          </Box>
        </Stack>

        <Grid container spacing={3}>
          {/* Main Tender Info */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {tender.title}
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {tender.description}
                  </Typography>
                </Box>
                {tender.budget && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Budget
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {tender.budget && typeof tender.budget === 'number' ? tender.budget.toFixed(2) : '0.00'} DZD
                    </Typography>
                  </Box>
                )}
                {tender.requirements && tender.requirements.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Exigences
                    </Typography>
                    <List dense>
                      {tender.requirements.map((req, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <Typography variant="body2">• {req}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Stack>
            </Card>

            {tender.owner && typeof tender.owner === 'object' && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Propriétaire de l'Appel d'Offres
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ width: 56, height: 56 }}>
                    {(tender.owner.firstName || tender.owner.username || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {tender.owner.firstName && tender.owner.lastName 
                        ? `${tender.owner.firstName} ${tender.owner.lastName}`
                        : tender.owner.username || 'Utilisateur Inconnu'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tender.owner.email || 'N/A'}
                    </Typography>
                    {tender.owner.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {tender.owner.phone}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Card>
            )}

            {/* Bid Statistics */}
            {bids.length > 0 && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon /> Statistiques des Soumissions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
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
                        Offre la Plus Haute
                      </Typography>
                      <Typography variant="h5" color="success.dark" fontWeight={700}>
                        {highestBid ? getBidAmount(highestBid).toFixed(2) : '0.00'} DA
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        par {highestBid?.bidder.firstName} {highestBid?.bidder.lastName}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'error.lighter',
                        border: '1px solid',
                        borderColor: 'error.light',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Offre la Plus Basse
                      </Typography>
                      <Typography variant="h5" color="error.dark" fontWeight={700}>
                        {lowestBid ? getBidAmount(lowestBid).toFixed(2) : '0.00'} DA
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        par {lowestBid?.bidder.firstName} {lowestBid?.bidder.lastName}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Card>
            )}

            {/* Bids Section - Enhanced Table View */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon /> Soumissions ({bids.length})
              </Typography>
              {bidsLoading ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} variant="rounded" width="100%" height={60} />
                  ))}
                </Stack>
              ) : bids && bids.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.neutral' }}>
                        <TableCell>#</TableCell>
                        <TableCell>Soumissionnaire</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Proposition</TableCell>
                        <TableCell align="right">Montant</TableCell>
                        <TableCell align="center">Statut</TableCell>
                        <TableCell align="right">Date</TableCell>
                        {isTenderOwner && <TableCell align="center">Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bids.map((bid, index) => (
                        <TableRow
                          key={bid._id}
                          sx={{
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor: bid.status === 'accepted' ? 'success.lighter' : 'inherit'
                          }}
                        >
                          <TableCell>
                            {bid.status === 'accepted' ? (
                              <Chip
                                icon={<EmojiEventsIcon />}
                                label={index + 1}
                                color="success"
                                size="small"
                                sx={{ fontWeight: 700 }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                {index + 1}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar src={bid.bidder.avatar?.path || ''} alt={`${bid.bidder.firstName} ${bid.bidder.lastName}`}>
                                {bid.bidder.firstName?.charAt(0) || 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={bid.status === 'accepted' ? 700 : 500}>
                                  {bid.bidder.firstName} {bid.bidder.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {bid.bidder.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {bid.bidder.phone || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                              {bid.proposal}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
                              label={`${getBidAmount(bid).toFixed(2)} DA`}
                              color={bid.status === 'accepted' ? 'success' : 'default'}
                              variant={bid.status === 'accepted' ? 'filled' : 'outlined'}
                              sx={{ fontWeight: bid.status === 'accepted' ? 700 : 500 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={bid.status === 'pending' ? 'En Attente' : bid.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                              color={getBidStatusColor(bid.status)}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(bid.createdAt)}
                            </Typography>
                          </TableCell>
                          {isTenderOwner && (
                            <TableCell align="center">
                              {bid.status === 'pending' && (
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={() => handleAcceptBid(bid._id)}
                                    disabled={!!acceptLoading}
                                    sx={{ minWidth: 90 }}
                                  >
                                    {acceptLoading === bid._id ? <CircularProgress size={20} /> : 'Accepter'}
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    onClick={() => handleRejectBid(bid._id)}
                                    disabled={!!rejectLoading}
                                    sx={{ minWidth: 90 }}
                                  >
                                    {rejectLoading === bid._id ? <CircularProgress size={20} /> : 'Rejeter'}
                                  </Button>
                                </Stack>
                              )}
                            </TableCell>
                          )}
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
                  <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Aucune soumission
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                    Aucune soumission n'a encore été faite pour cet appel d'offres
                  </Typography>
                </Paper>
              )}
            </Card>
          </Grid>

          {/* Sidebar Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Informations
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Date de Création
                  </Typography>
                  <Typography variant="body1">{formatDate(tender.createdAt)}</Typography>
                </Box>
                {tender.deadline && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date Limite
                    </Typography>
                    <Typography variant="body1">{formatDate(tender.deadline)}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nombre de Soumissions
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {bids.length}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}