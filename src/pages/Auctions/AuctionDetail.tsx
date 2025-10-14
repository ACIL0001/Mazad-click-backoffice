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
// types
import { Auction, AUCTION_TYPE, BID_STATUS, BID_TYPE } from '../../types/Auction';
import { AuctionsAPI } from '@/api/auctions';
import { OffersAPI } from '@/api/offers';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';
import useAuth from '@/hooks/useAuth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Slide from '@mui/material/Slide';
import { useCreateSocket } from '@/contexts/SocketContext';
import { ChatAPI } from '@/api/Chat';
import PersonIcon from '@mui/icons-material/Person';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface AuctionOwner {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
}

interface AuctionWithOwner extends Omit<Auction, 'owner'> {
  owner?: AuctionOwner;
  user?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export default function AuctionDetail() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [auction, setAuction] = useState<AuctionWithOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const navigate = useNavigate();
  const { notificationSocket } = useCreateSocket();
  const { auth } = useAuth();

  console.log('Auth data:', auth);

  useEffect(() => {
    if (id) {
      getAuctionDetails(id);
      getAuctionParticipants(id);
    }
  }, [id, notificationSocket]);

  const getAuctionDetails = async (auctionId: string) => {
    try {
      const response = await AuctionsAPI.getAuctionById(auctionId);
      if (response) {
        console.log("response auction details:", response);
        setAuction(response);
      }
    } catch (error) {
      console.error('Error fetching auction details:', error);
      enqueueSnackbar(t('errors.loadingDetails'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getAuctionParticipants = async (auctionId: string) => {
    setParticipantsLoading(true);
    try {
      const offers = await OffersAPI.getOffersByBidId(auctionId);
      console.log('Offers data:', offers);
      
      if (Array.isArray(offers)) {
        console.log("Processing offers:", offers);
        
        const processedParticipants = offers
          .map((offer: any) => ({
            id: offer._id,
            name: offer.user?.firstName && offer.user?.lastName 
              ? `${offer.user.firstName} ${offer.user.lastName}` 
              : offer.user?.email || t('unknownUser'),
            email: offer.user?.email || 'N/A',
            phone: offer.user?.phone || 'N/A',
            avatar: offer.user?.avatar?.path || '',
            bidAmount: offer.price,
            bidDate: offer.createdAt,
            user: offer.user
          }))
          .sort((a, b) => new Date(b.bidDate).getTime() - new Date(a.bidDate).getTime());

        // Debug the processed participants
        console.log('Processed participants:', processedParticipants);
        processedParticipants.forEach((participant, index) => {
          console.log(`Participant ${index}:`, {
            name: participant.name,
            bidAmount: participant.bidAmount,
            bidAmountType: typeof participant.bidAmount
          });
        });
        
        setParticipants(processedParticipants);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      enqueueSnackbar(t('errors.loadingParticipants'), { variant: 'error' });
      setParticipants([]);
    } finally {
      setParticipantsLoading(false);
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

  const getStatusColor = (status: BID_STATUS) => {
    switch (status) {
      case BID_STATUS.OPEN:
        return 'info';
      case BID_STATUS.ON_AUCTION:
        return 'success';
      case BID_STATUS.CLOSED:
        return 'error';
      case BID_STATUS.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };

  const CreateChat = async () => {
    if (!participants.length || !participants[0] || !participants[0].user) {
      enqueueSnackbar(t('errors.noValidParticipant'), { variant: 'error' });
      return;
    }

    setChatLoading(true);
    
    let data = {
      createdAt: new Date().toISOString(),
      users: [auth.user, participants[0].user]
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
      enqueueSnackbar(t('errors.failedToCreateChat'), { variant: 'error' });
    } finally {
      setChatLoading(false);
    }
  };

  const WinnerBanner = ({ winner }: { winner: any }) => (
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
          src={winner.avatar?.path || ''}
          alt={winner.firstName}
          sx={{ width: 56, height: 56, border: '2px solid #fff', boxShadow: 2 }}
        >
          {winner?.firstName?.charAt(0) || 'W'}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            {t('winnerBanner')}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            <b>{winner?.firstName || ''} {winner?.lastName || ''}</b>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 400, opacity: 0.9 }}>
            <b>{t('phone')}: {winner?.phone || 'N/A'}</b>
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

  const getHighestBid = () => {
    if (participants.length === 0) return null;
    return participants.reduce((max, p) => p.bidAmount > max.bidAmount ? p : max, participants[0]);
  };

  const getLowestBid = () => {
    if (participants.length === 0) return null;
    return participants.reduce((min, p) => p.bidAmount < min.bidAmount ? p : min, participants[0]);
  };

  const getAverageBid = () => {
    if (participants.length === 0) return 0;
    const total = participants.reduce((sum, p) => sum + p.bidAmount, 0);
    return total / participants.length;
  };

  const getCurrentPrice = () => {
    if (participants.length === 0) {
      console.log('No participants, using starting price:', auction?.startingPrice);
      return auction?.startingPrice || 0;
    }
    const highestBid = getHighestBid();
    const currentPrice = highestBid ? highestBid.bidAmount : auction?.startingPrice || 0;
    console.log('Current price calculation:', {
      participantsCount: participants.length,
      highestBid: highestBid,
      highestBidAmount: highestBid?.bidAmount,
      startingPrice: auction?.startingPrice,
      calculatedCurrentPrice: currentPrice
    });
    return currentPrice;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!auction) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">{t('notFound')}</Typography>
      </Box>
    );
  }

  const isAuctionOwner = auth.user && auction.owner && typeof auction.owner === 'object' && auction.owner._id === auth.user._id;
  const highestBid = getHighestBid();
  const lowestBid = getLowestBid();
  const averageBid = getAverageBid();
  const currentPrice = getCurrentPrice();

  console.log('Notification socket data:', notificationSocket);

  return (
    <Page title={`${t('details')} - ${auction.title}`}>
      <Container>
        {/* Winner Banner */}
        {auction.winner && <WinnerBanner winner={auction.winner} />}
        
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {t('details')}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            {auction.status === BID_STATUS.OPEN && participants.length > 0 && (
              <Button
                variant="contained"
                startIcon={<ChatIcon />}
                onClick={CreateChat}
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
                {chatLoading ? <CircularProgress size={22} color="inherit" /> : t('contactWinner')}
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
                      const color = getStatusColor(auction.status);
                      return theme.palette[color]?.[theme.palette.mode === 'dark' ? 400 : 500] || theme.palette.primary[500];
                    },
                    boxShadow: (theme) => {
                      const color = getStatusColor(auction.status);
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
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                  }}
                >
                  {t('')}
                </Typography>
              </Box>
              <Chip
                label={auction.status === BID_STATUS.OPEN ? t('status.open') : t(`status.${auction.status.toLowerCase()}`)}
                color={getStatusColor(auction.status)}
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
          {/* Main Auction Info */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2, mb: 3, minHeight: '200px', maxHeight: '250px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {auction.title}
              </Typography>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('description')}
                  </Typography>
                  <Typography variant="body1" sx={{ maxHeight: '80px', overflow: 'auto' }}>
                    {auction.description}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('initialPrice')}
                    </Typography>
                    <Typography variant="h6">{auction.startingPrice.toFixed(2)} {t('DZD')}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('currentPrice')}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {currentPrice.toFixed(2)} {t('DZD')}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Card>

            {auction.owner && typeof auction.owner === 'object' && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('auctionOwner')}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ width: 56, height: 56 }}>
                    {(auction.owner.firstName || auction.owner.username || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {auction.owner.firstName && auction.owner.lastName 
                        ? `${auction.owner.firstName} ${auction.owner.lastName}`
                        : auction.owner.username || 'Unknown User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {auction.owner.email || 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            )}

            {/* Bid Statistics */}
            {participants.length > 0 && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon /> Statistiques des Offres
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
                        {highestBid?.bidAmount.toFixed(2)} DA
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        par {highestBid?.name}
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
                        {lowestBid?.bidAmount.toFixed(2)} DA
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        par {lowestBid?.name}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Card>
            )}

            {/* Participants Section - Enhanced Table View */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon /> {t('participants')} ({participants.length})
              </Typography>
              {participantsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60px">
                  <CircularProgress size={24} />
                </Box>
              ) : participants && participants.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.neutral' }}>
                        <TableCell>#</TableCell>
                        <TableCell>Participant</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell align="right">Montant de l'Offre</TableCell>
                        <TableCell align="right">Date de Soumission</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {participants.map((participant, index) => (
                        <TableRow
                          key={participant.id}
                          sx={{
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor: index === 0 ? 'success.lighter' : 'inherit'
                          }}
                        >
                          <TableCell>
                            {index === 0 ? (
                              <Chip
                                icon={<EmojiEventsIcon />}
                                label="1"
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
                              <Avatar src={participant.avatar} alt={participant.name}>
                                {participant.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={index === 0 ? 700 : 500}>
                                  {participant.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {participant.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {participant.phone}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
                              label={`${participant.bidAmount?.toFixed(2)} DA`}
                              color={index === 0 ? 'success' : 'default'}
                              variant={index === 0 ? 'filled' : 'outlined'}
                              sx={{ fontWeight: index === 0 ? 700 : 500 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(participant.bidDate)}
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
                  <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    {t('noParticipants')}
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                    Aucune offre n'a encore été soumise pour cette enchère
                  </Typography>
                </Paper>
              )}
            </Card>
          </Grid>

          {/* Sidebar Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, mb: 3, minHeight: '200px', maxHeight: '250px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('information')}
              </Typography>
              <Stack spacing={2} sx={{ flex: 1, justifyContent: 'space-around' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('type')}
                  </Typography>
                  <Label variant="ghost" color="default">
                    {auction.bidType === BID_TYPE.PRODUCT ? t('typeProduct') : t('typeService')}
                  </Label>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('mode')}
                  </Typography>
                  <Label
                    variant="ghost"
                    color={auction.auctionType === AUCTION_TYPE.EXPRESS ? 'warning' : 'default'}
                  >
                    {auction.auctionType === AUCTION_TYPE.EXPRESS
                      ? `${t('modeExpress')} (MEZROUB)`
                      : auction.auctionType === AUCTION_TYPE.AUTO_SUB_BID
                      ? t('modeAutomatic')
                      : t('modeClassic')}
                  </Label>
                </Box>
              </Stack>
            </Card>

            {/* Auction Timeline */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('timeline')}
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('startDate')}
                  </Typography>
                  <Typography variant="body1">{formatDate(auction.startingAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('endDate')}
                  </Typography>
                  <Typography variant="body1">{formatDate(auction.endingAt)}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}