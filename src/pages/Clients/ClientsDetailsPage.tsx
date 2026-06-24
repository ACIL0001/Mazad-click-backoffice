// ClientsDetailsPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Card,
    Grid,
    Button,
    Stack,
    Divider,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    alpha,
    useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RedeemIcon from '@mui/icons-material/Redeem';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import PopulatedUser from '@/types/PopulatedUser';
import { UserAPI } from '../../api/user';
import DetailSkeleton from '@/components/skeletons/DetailSkeleton';

// Styled components for dashboard UI/UX
const DashboardCard = styled(Card)(({ theme }) => ({
    borderRadius: 20,
    boxShadow: '0 4px 20px 0 rgba(145, 158, 171, 0.04)',
    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
    padding: theme.spacing(3.5),
    backgroundColor: theme.palette.background.paper,
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'visible',
    '&:hover': {
        boxShadow: '0 12px 40px 0 rgba(145, 158, 171, 0.12)',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2.5),
        borderRadius: 16,
    },
}));

const DetailRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.8, 0),
    borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.06)}`,
    '&:last-child': {
        borderBottom: 'none',
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: theme.spacing(0.5),
        padding: theme.spacing(1.5, 0),
    },
}));

const RowLabel = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    color: theme.palette.text.secondary,
    '& svg': {
        fontSize: 20,
        color: theme.palette.text.secondary,
    },
}));

const StatusButton = styled(Button)(({ theme }) => ({
    borderRadius: 10,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1, 1.5),
    fontSize: '0.8rem',
    boxShadow: 'none',
    transition: 'all 200ms ease-in-out',
    '&:hover': {
        boxShadow: 'none',
    },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
    '& svg': {
        fontSize: 22,
        color: theme.palette.primary.main,
    },
}));

export default function ClientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const queryClient = useQueryClient();

    const [isVerifying, setIsVerifying] = useState(false);
    const [isUpdatingActiveStatus, setIsUpdatingActiveStatus] = useState(false);
    const [isUpdatingBannedStatus, setIsUpdatingBannedStatus] = useState(false);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        message: '',
        action: () => {},
        actionText: 'Confirmer',
        color: 'primary' as 'primary' | 'error' | 'success'
    });

    const { data: clientDetails, isLoading: loading, error } = useQuery({
        queryKey: ['client', id],
        queryFn: async () => {
            if (!id) throw new Error("L'ID du client est manquant.");
            const response = await UserAPI.findById(id);
            let userData = null;
            if (response?.user) {
                userData = response.user;
            } else if (response?.data) {
                userData = response.data;
            } else if (response?._id) {
                userData = response;
            }
            if (userData) {
                return userData as PopulatedUser;
            } else {
                throw new Error('Aucune donnée utilisateur trouvée.');
            }
        },
        enabled: !!id,
    });

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleCopy = (text: string | undefined, label: string) => {
        if (!text) {
            enqueueSnackbar('Aucune donnée à copier.', { variant: 'warning' });
            return;
        }
        navigator.clipboard.writeText(text);
        enqueueSnackbar(`${label} copié dans le presse-papiers.`, { variant: 'success' });
    };

    const openConfirmDialog = (title: string, message: string, action: () => void, actionText: string = 'Confirmer', color: 'primary' | 'error' | 'success' = 'primary') => {
        setConfirmDialog({
            open: true,
            title,
            message,
            action,
            actionText,
            color
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({
            open: false,
            title: '',
            message: '',
            action: () => {},
            actionText: 'Confirmer',
            color: 'primary'
        });
    };

    const handleConfirmAction = () => {
        confirmDialog.action();
        closeConfirmDialog();
    };

    const handleVerifyUser = async (isVerified: boolean) => {
        if (!clientDetails?._id) return;

        const action = async () => {
            setIsVerifying(true);
            try {
                await UserAPI.verifyUser(clientDetails._id, isVerified);
                enqueueSnackbar(`Compte ${isVerified ? 'vérifié' : 'non vérifié'} avec succès.`, { variant: 'success' });
                queryClient.invalidateQueries({ queryKey: ['client', id] });
                queryClient.invalidateQueries({ queryKey: ['users'] });
            } catch (err: any) {
                enqueueSnackbar(err.message || 'Échec de la validation.', { variant: 'error' });
            } finally {
                setIsVerifying(false);
            }
        };

        const title = isVerified ? 'Valider le compte' : 'Annuler la validation';
        const message = `Voulez-vous vraiment ${isVerified ? 'valider' : 'annuler la validation de'} ce client ?`;
        openConfirmDialog(title, message, action, isVerified ? 'Valider' : 'Annuler', isVerified ? 'success' : 'error');
    };

    const handleSetUserActive = async (isActive: boolean) => {
        if (!clientDetails?._id) return;

        const action = async () => {
            setIsUpdatingActiveStatus(true);
            try {
                await UserAPI.setUserActive(clientDetails._id, isActive);
                enqueueSnackbar(`Compte ${isActive ? 'activé' : 'désactivé'} avec succès.`, { variant: 'success' });
                queryClient.invalidateQueries({ queryKey: ['client', id] });
                queryClient.invalidateQueries({ queryKey: ['users'] });
            } catch (err: any) {
                enqueueSnackbar(err.message || 'Échec de la modification.', { variant: 'error' });
            } finally {
                setIsUpdatingActiveStatus(false);
            }
        };

        const title = isActive ? 'Activer le client' : 'Désactiver le client';
        const message = `Voulez-vous vraiment ${isActive ? 'activer' : 'désactiver'} ce compte ?`;
        openConfirmDialog(title, message, action, isActive ? 'Activer' : 'Désactiver', isActive ? 'success' : 'error');
    };

    const handleSetUserBanned = async (isBanned: boolean) => {
        if (!clientDetails?._id) return;

        const action = async () => {
            setIsUpdatingBannedStatus(true);
            try {
                await UserAPI.setUserBanned(clientDetails._id, isBanned);
                enqueueSnackbar(`Compte ${isBanned ? 'banni' : 'débanni'} avec succès.`, { variant: 'success' });
                queryClient.invalidateQueries({ queryKey: ['client', id] });
                queryClient.invalidateQueries({ queryKey: ['users'] });
            } catch (err: any) {
                enqueueSnackbar(err.message || 'Échec de la modification.', { variant: 'error' });
            } finally {
                setIsUpdatingBannedStatus(false);
            }
        };

        const title = isBanned ? 'Bannir le client' : 'Débannir le client';
        const message = `Voulez-vous vraiment ${isBanned ? 'bannir' : 'débannir'} ce compte ?`;
        openConfirmDialog(title, message, action, isBanned ? 'Bannir' : 'Débannir', 'error');
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <DetailSkeleton />
            </Container>
        );
    }

    if (error || !clientDetails) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
                    {error instanceof Error ? error.message : "Impossible de charger le profil de ce client."}
                </Alert>
                <Button variant="contained" onClick={handleGoBack} startIcon={<ArrowBackIcon />} sx={{ borderRadius: 2 }}>
                    Retour
                </Button>
            </Container>
        );
    }

    const user = clientDetails;
    const isUserVerified = Boolean(user?.isVerified);
    const isUserActive = Boolean(user?.isActive ?? true);
    const isUserBanned = Boolean(user?.isBanned);

    const userPromoCode = user?.promoCode || user?.promo_code || user?.promotionCode || user?.promotion_code;
    const userWilaya = user?.wilaya || user?.city || user?.region;

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
            {/* Header / Breadcrumb navigation */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Button 
                    onClick={handleGoBack} 
                    startIcon={<ArrowBackIcon />} 
                    sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: alpha(theme.palette.text.secondary, 0.08) } }}
                >
                    Retour à la liste
                </Button>
                <KeyboardArrowRightIcon sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Détails du Client
                </Typography>
            </Stack>

            <Grid container spacing={4}>
                {/* LEFT COLUMN: Sidebar Profile & Actions (Single Card) */}
                <Grid item xs={12} md={4}>
                    <DashboardCard sx={{ px: 3, py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <Avatar
                                src={user?.photoURL || undefined}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    mb: 2,
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    border: `3px solid ${theme.palette.background.paper}`,
                                    boxShadow: `0 8px 24px 0 ${alpha(theme.palette.primary.main, 0.15)}`
                                }}
                            >
                                {(user?.firstName?.[0] || 'U').toUpperCase()}{(user?.lastName?.[0] || 'N').toUpperCase()}
                            </Avatar>

                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                                {user?.firstName || ''} {user?.lastName || ''}
                            </Typography>

                            <Stack direction="row" spacing={1} sx={{ mb: 3, justifyContent: 'center' }}>
                                <Chip
                                    label={user?.type || 'CLIENT'}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        color: 'primary.main',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                    }}
                                />
                            </Stack>

                            <Divider sx={{ width: '100%', mb: 2.5, borderStyle: 'dashed' }} />

                            {/* Mini Status Chips */}
                            <Stack spacing={1.5} sx={{ width: '100%', mb: 3 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Validation</Typography>
                                    <Chip 
                                        label={isUserVerified ? "Compte Valide" : "Non Valide"} 
                                        size="small"
                                        sx={{ 
                                            fontWeight: 600, 
                                            fontSize: '0.75rem', 
                                            px: 1,
                                            bgcolor: alpha(theme.palette[isUserVerified ? 'success' : 'warning'].main, 0.1),
                                            color: theme.palette[isUserVerified ? 'success' : 'warning'].dark
                                        }}
                                    />
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Activité</Typography>
                                    <Chip 
                                        label={isUserActive ? "Actif" : "Inactif"} 
                                        size="small"
                                        sx={{ 
                                            fontWeight: 600, 
                                            fontSize: '0.75rem', 
                                            px: 1,
                                            bgcolor: alpha(theme.palette[isUserActive ? 'success' : 'error'].main, 0.1),
                                            color: theme.palette[isUserActive ? 'success' : 'error'].dark
                                        }}
                                    />
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Bannissement</Typography>
                                    <Chip 
                                        label={isUserBanned ? "Banni" : "Sain"} 
                                        size="small"
                                        sx={{ 
                                            fontWeight: 600, 
                                            fontSize: '0.75rem', 
                                            px: 1,
                                            bgcolor: alpha(theme.palette[isUserBanned ? 'error' : 'success'].main, 0.1),
                                            color: theme.palette[isUserBanned ? 'error' : 'success'].dark
                                        }}
                                    />
                                </Stack>
                            </Stack>

                            <Divider sx={{ width: '100%', mb: 2.5, borderStyle: 'dashed' }} />

                            {/* Actions Grid */}
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', width: '100%', textAlign: 'left', mb: 1.5 }}>
                                Actions Administratives
                            </Typography>
                            
                            <Grid container spacing={1.5} sx={{ width: '100%' }}>
                                <Grid item xs={6}>
                                    <StatusButton
                                        variant="contained"
                                        fullWidth
                                        size="small"
                                        disabled={isVerifying}
                                        onClick={() => handleVerifyUser(!isUserVerified)}
                                        sx={{
                                            bgcolor: isUserVerified ? alpha(theme.palette.warning.main, 0.1) : theme.palette.success.main,
                                            color: isUserVerified ? 'warning.dark' : 'white',
                                            '&:hover': {
                                                bgcolor: isUserVerified ? alpha(theme.palette.warning.main, 0.2) : theme.palette.success.dark,
                                            }
                                        }}
                                    >
                                        {isVerifying ? <CircularProgress size={14} color="inherit" /> : (isUserVerified ? 'Invalider' : 'Valider')}
                                    </StatusButton>
                                </Grid>

                                <Grid item xs={6}>
                                    <StatusButton
                                        variant="contained"
                                        fullWidth
                                        size="small"
                                        disabled={isUpdatingActiveStatus}
                                        onClick={() => handleSetUserActive(!isUserActive)}
                                        sx={{
                                            bgcolor: isUserActive ? alpha(theme.palette.error.main, 0.08) : theme.palette.success.main,
                                            color: isUserActive ? 'error.main' : 'white',
                                            '&:hover': {
                                                bgcolor: isUserActive ? alpha(theme.palette.error.main, 0.15) : theme.palette.success.dark,
                                            }
                                        }}
                                    >
                                        {isUpdatingActiveStatus ? <CircularProgress size={14} color="inherit" /> : (isUserActive ? 'Désactiver' : 'Activer')}
                                    </StatusButton>
                                </Grid>

                                <Grid item xs={12}>
                                    <StatusButton
                                        variant="contained"
                                        fullWidth
                                        size="small"
                                        disabled={isUpdatingBannedStatus}
                                        onClick={() => handleSetUserBanned(!isUserBanned)}
                                        sx={{
                                            bgcolor: isUserBanned ? theme.palette.success.main : alpha(theme.palette.error.main, 0.08),
                                            color: isUserBanned ? 'white' : 'error.main',
                                            '&:hover': {
                                                bgcolor: isUserBanned ? theme.palette.success.dark : alpha(theme.palette.error.main, 0.15),
                                            }
                                        }}
                                    >
                                        {isUpdatingBannedStatus ? <CircularProgress size={14} color="inherit" /> : (isUserBanned ? 'Débannir' : 'Bannir')}
                                    </StatusButton>
                                </Grid>
                            </Grid>
                        </Box>
                    </DashboardCard>
                </Grid>

                {/* RIGHT COLUMN: Grouped Information in a Single Card */}
                <Grid item xs={12} md={8}>
                    <DashboardCard>
                        {/* Section 1: Personal & Contact */}
                        <SectionHeader>
                            <PersonIcon />
                            <Typography variant="h6" fontWeight={700} color="text.primary">
                                Informations Personnelles
                            </Typography>
                        </SectionHeader>

                        <Stack spacing={0} sx={{ mb: 4 }}>
                            <DetailRow>
                                <RowLabel>
                                    <PersonIcon />
                                    <Typography variant="body2" fontWeight={600}>Prénom</Typography>
                                </RowLabel>
                                <Typography variant="body2" fontWeight={700} color="text.primary">
                                    {user?.firstName || 'Non renseigné'}
                                </Typography>
                            </DetailRow>

                            <DetailRow>
                                <RowLabel>
                                    <PersonIcon />
                                    <Typography variant="body2" fontWeight={600}>Nom</Typography>
                                </RowLabel>
                                <Typography variant="body2" fontWeight={700} color="text.primary">
                                    {user?.lastName || 'Non renseigné'}
                                </Typography>
                            </DetailRow>

                            <DetailRow>
                                <RowLabel>
                                    <EmailIcon />
                                    <Typography variant="body2" fontWeight={600}>Adresse e-mail</Typography>
                                </RowLabel>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                        {user?.email || 'Non renseigné'}
                                    </Typography>
                                    {user?.email && (
                                        <Tooltip title="Copier l'e-mail">
                                            <IconButton size="small" onClick={() => handleCopy(user.email, 'E-mail')} sx={{ color: 'text.secondary' }}>
                                                <ContentCopyIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Stack>
                            </DetailRow>

                            <DetailRow>
                                <RowLabel>
                                    <PhoneIcon />
                                    <Typography variant="body2" fontWeight={600}>Téléphone</Typography>
                                </RowLabel>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    {user?.phone ? (
                                        <>
                                            <Typography 
                                                component="a" 
                                                href={`tel:${user.phone}`}
                                                variant="body2" 
                                                fontWeight={600} 
                                                sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                            >
                                                {user.phone}
                                            </Typography>
                                            <Tooltip title="Copier le téléphone">
                                                <IconButton size="small" onClick={() => handleCopy(user.phone, 'Téléphone')} sx={{ color: 'text.secondary' }}>
                                                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    ) : (
                                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                                            Non renseigné
                                        </Typography>
                                    )}
                                </Stack>
                            </DetailRow>

                            <DetailRow>
                                <RowLabel>
                                    <LocationOnIcon />
                                    <Typography variant="body2" fontWeight={600}>Wilaya</Typography>
                                </RowLabel>
                                <Typography variant="body2" fontWeight={700} color="text.primary">
                                    {userWilaya || 'Non renseignée'}
                                </Typography>
                            </DetailRow>
                        </Stack>

                        <Divider sx={{ mb: 4 }} />

                        {/* Section 2: Metas & System */}
                        <SectionHeader>
                            <RedeemIcon />
                            <Typography variant="h6" fontWeight={700} color="text.primary">
                                Système & Code Promo
                            </Typography>
                        </SectionHeader>

                        <Stack spacing={0}>
                            <DetailRow>
                                <RowLabel>
                                    <RedeemIcon />
                                    <Typography variant="body2" fontWeight={600}>Code Promo</Typography>
                                </RowLabel>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    {userPromoCode ? (
                                        <>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: 'success.main', bgcolor: alpha(theme.palette.success.main, 0.08), px: 1.5, py: 0.5, borderRadius: 1 }}>
                                                {userPromoCode}
                                            </Typography>
                                            <Tooltip title="Copier le code promo">
                                                <IconButton size="small" onClick={() => handleCopy(userPromoCode, 'Code promo')} sx={{ color: 'text.secondary' }}>
                                                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    ) : (
                                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                                            Aucun
                                        </Typography>
                                    )}
                                </Stack>
                            </DetailRow>

                            <DetailRow>
                                <RowLabel>
                                    <CalendarTodayIcon />
                                    <Typography variant="body2" fontWeight={600}>Date de création</Typography>
                                </RowLabel>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'Non disponible'}
                                </Typography>
                            </DetailRow>

                            {user?.rate !== undefined && user?.rate !== null && (
                                <DetailRow>
                                    <RowLabel>
                                        <StarIcon />
                                        <Typography variant="body2" fontWeight={600}>Note moyenne</Typography>
                                    </RowLabel>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <StarIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                                        <Typography variant="body2" fontWeight={700} color="text.primary">
                                            {user.rate.toFixed(1)}/10
                                        </Typography>
                                    </Stack>
                                </DetailRow>
                            )}


                        </Stack>
                    </DashboardCard>
                </Grid>
            </Grid>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={closeConfirmDialog}
                aria-labelledby="confirm-dialog-title"
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 },
                }}
            >
                <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 700, pb: 1 }}>
                    {confirmDialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
                        {confirmDialog.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
                    <Button onClick={closeConfirmDialog} color="inherit" sx={{ fontWeight: 600, textTransform: 'none' }}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        variant="contained"
                        color={confirmDialog.color}
                        sx={{ fontWeight: 600, borderRadius: 1.5, textTransform: 'none' }}
                        autoFocus
                    >
                        {confirmDialog.actionText}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}