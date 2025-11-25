// ProfessionalsDetailsPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
    Button,
    Stack,
    Divider,
    Chip,
    Avatar,
    Paper,
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
import Iconify from '@/components/Iconify';
import { PopulatedUser } from '@/types/PopulatedUser';
import app from '@/config';
import { UserAPI } from '../../api/user';
import { useSnackbar } from 'notistack';
import useMediaQuery from '@mui/material/useMediaQuery';

// Import recommend icon
import RecommendIcon from '@mui/icons-material/Recommend';

// Styled components for modern design
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    padding: theme.spacing(3),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
        borderRadius: 12,
    },
}));

const ActionCard = styled(Card)(({ theme }) => ({
    borderRadius: 12,
    padding: theme.spacing(2.5),
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
    border: `1px solid ${alpha(theme.palette.grey[300], 0.2)}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1.5),
        borderRadius: 10,
    },
}));

const InfoRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5, 0),
    borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
    '&:last-child': {
        borderBottom: 'none',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1, 0),
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: theme.spacing(0.5),
    },
}));

const StatusButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    minWidth: 120,
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(0.8, 1.5),
        minWidth: 'auto',
        fontSize: '0.8rem',
    },
}));

export default function ProfessionalsDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [professionalDetails, setProfessionalDetails] = useState<PopulatedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isUpdatingActiveStatus, setIsUpdatingActiveStatus] = useState(false);
    const [isUpdatingBannedStatus, setIsUpdatingBannedStatus] = useState(false);
    const [isUpdatingRecommendationStatus, setIsUpdatingRecommendationStatus] = useState(false);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        message: '',
        action: () => {},
        actionText: 'Confirmer',
        color: 'primary' as 'primary' | 'error' | 'success'
    });

    const fetchProfessionalDetails = useCallback(async () => {
        if (!id) {
            setError("L'ID du professionnel est manquant.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching professional with ID:', id);
            
            // Use UserAPI.findById to get direct user details
            const response = await UserAPI.findById(id);
            console.log('Full API Response:', response);
            
            // Handle different response structures
            let userData = null;
            if (response?.user) {
                userData = response.user;
            } else if (response?.data) {
                userData = response.data;
            } else if (response?._id) {
                userData = response;
            } else {
                throw new Error('Invalid response structure from API');
            }
            
            console.log('Extracted user data:', userData);
            setProfessionalDetails(userData);

        } catch (err: any) {
            console.error("Failed to fetch professional details:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to load professional details.";
            setError(errorMessage);
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, enqueueSnackbar]);

    useEffect(() => {
        fetchProfessionalDetails();
    }, [fetchProfessionalDetails]);

    const handleGoBack = () => {
        // Restore pagination state from URL params
        const searchParams = new URLSearchParams(location.search);
        const page = searchParams.get('page') || '0';
        const rowsPerPage = searchParams.get('rowsPerPage') || '10';
        const filterName = searchParams.get('filterName') || '';
        const verifiedFilter = searchParams.get('verifiedFilter') || 'all';
        
        console.log('Navigating back with page:', page, 'rowsPerPage:', rowsPerPage);
        
        // Navigate back with pagination params - always include page and rowsPerPage to ensure state is restored
        const params = new URLSearchParams();
        params.set('page', page);
        params.set('rowsPerPage', rowsPerPage);
        if (filterName) params.set('filterName', filterName);
        if (verifiedFilter !== 'all') params.set('verifiedFilter', verifiedFilter);
        
        navigate(`/dashboard/users/professionals?${params.toString()}`);
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
        if (!professionalDetails?._id) {
            enqueueSnackbar('ID du professionnel manquant.', { variant: 'error' });
            return;
        }

        const action = async () => {
            setIsVerifying(true);
            try {
                await UserAPI.verifyUser(professionalDetails._id, isVerified);
                enqueueSnackbar(`Utilisateur ${isVerified ? 'vérifié' : 'non vérifié'} avec succès.`, { variant: 'success' });
                await fetchProfessionalDetails(); // Refresh data
            } catch (err: any) {
                console.error('Verification error:', err);
                const errorMessage = err.response?.data?.message || err.message || `Échec de la ${isVerified ? 'vérification' : 'désvérification'}.`;
                enqueueSnackbar(errorMessage, { variant: 'error' });
            } finally {
                setIsVerifying(false);
            }
        };

        const title = isVerified ? 'Vérifier le professionnel' : 'Annuler la vérification';
        const message = `Êtes-vous sûr de vouloir ${isVerified ? 'vérifier' : 'annuler la vérification de'} ce professionnel ?`;
        
        openConfirmDialog(title, message, action, isVerified ? 'Vérifier' : 'Annuler vérification', isVerified ? 'success' : 'error');
    };

    const handleSetUserActive = async (isActive: boolean) => {
        if (!professionalDetails?._id) {
            enqueueSnackbar('ID du professionnel manquant.', { variant: 'error' });
            return;
        }

        const action = async () => {
            setIsUpdatingActiveStatus(true);
            try {
                await UserAPI.setUserActive(professionalDetails._id, isActive);
                enqueueSnackbar(`Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès.`, { variant: 'success' });
                await fetchProfessionalDetails(); // Refresh data
            } catch (err: any) {
                console.error('Active status update error:', err);
                const errorMessage = err.response?.data?.message || err.message || `Échec de l'${isActive ? 'activation' : 'désactivation'}.`;
                enqueueSnackbar(errorMessage, { variant: 'error' });
            } finally {
                setIsUpdatingActiveStatus(false);
            }
        };

        const title = isActive ? 'Activer le professionnel' : 'Désactiver le professionnel';
        const message = `Êtes-vous sûr de vouloir ${isActive ? 'activer' : 'désactiver'} ce professionnel ?`;
        
        openConfirmDialog(title, message, action, isActive ? 'Activer' : 'Désactiver', isActive ? 'success' : 'error');
    };

    const handleSetUserBanned = async (isBanned: boolean) => {
        if (!professionalDetails?._id) {
            enqueueSnackbar('ID du professionnel manquant.', { variant: 'error' });
            return;
        }

        const action = async () => {
            setIsUpdatingBannedStatus(true);
            try {
                await UserAPI.setUserBanned(professionalDetails._id, isBanned);
                enqueueSnackbar(`Utilisateur ${isBanned ? 'banni' : 'débanni'} avec succès.`, { variant: 'success' });
                await fetchProfessionalDetails(); // Refresh data
            } catch (err: any) {
                console.error('Ban status update error:', err);
                const errorMessage = err.response?.data?.message || err.message || `Échec du ${isBanned ? 'bannissement' : 'débannissement'}.`;
                enqueueSnackbar(errorMessage, { variant: 'error' });
            } finally {
                setIsUpdatingBannedStatus(false);
            }
        };

        const title = isBanned ? 'Bannir le professionnel' : 'Débannir le professionnel';
        const message = `Êtes-vous sûr de vouloir ${isBanned ? 'bannir' : 'débannir'} ce professionnel ?`;
        
        openConfirmDialog(title, message, action, isBanned ? 'Bannir' : 'Débannir', 'error');
    };

    const handleRecommendUser = async (isRecommended: boolean) => {
        if (!professionalDetails?._id) {
            enqueueSnackbar('ID du professionnel manquant.', { variant: 'error' });
            return;
        }

        const action = async () => {
            setIsUpdatingRecommendationStatus(true);
            try {
                await UserAPI.recommendUser(professionalDetails._id, isRecommended);
                enqueueSnackbar(`Professionnel ${isRecommended ? 'recommandé' : 'recommandation retirée'} avec succès.`, { variant: 'success' });
                await fetchProfessionalDetails(); // Refresh data
            } catch (err: any) {
                console.error('Recommendation status update error:', err);
                const errorMessage = err.response?.data?.message || err.message || `Échec de la ${isRecommended ? 'recommandation' : 'suppression de recommandation'}.`;
                enqueueSnackbar(errorMessage, { variant: 'error' });
            } finally {
                setIsUpdatingRecommendationStatus(false);
            }
        };

        const title = isRecommended ? 'Recommander le professionnel' : 'Retirer la recommandation';
        const message = `Êtes-vous sûr de vouloir ${isRecommended ? 'recommander' : 'retirer la recommandation de'} ce professionnel ?`;
        
        openConfirmDialog(title, message, action, isRecommended ? 'Recommander' : 'Retirer recommandation', isRecommended ? 'primary' : 'error');
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={isMobile ? 36 : 48} />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: { xs: 2, sm: 4 } }}>
                <Alert severity="error" sx={{ borderRadius: 2, fontSize: isMobile ? '0.8rem' : 'inherit', mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={handleGoBack} sx={{ borderRadius: 2, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                    Retour
                </Button>
            </Container>
        );
    }

    if (!professionalDetails) {
        return (
            <Container sx={{ mt: { xs: 2, sm: 4 } }}>
                <Alert severity="info" sx={{ borderRadius: 2, fontSize: isMobile ? '0.8rem' : 'inherit', mb: 2 }}>
                    Aucun détail de professionnel trouvé.
                </Alert>
                <Button variant="contained" onClick={handleGoBack} sx={{ borderRadius: 2, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                    Retour
                </Button>
            </Container>
        );
    }

    const user = professionalDetails;
    const isUserVerified = Boolean(user?.isVerified);
    const isUserActive = Boolean(user?.isActive ?? true);
    const isUserBanned = Boolean(user?.isBanned);
    const isUserRecommended = Boolean(user?.isRecommended);

    console.log('Rendering with user data:', {
        user: user,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phone: user?.phone,
        isVerified: isUserVerified,
        isActive: isUserActive,
        isBanned: isUserBanned,
        isRecommended: isUserRecommended,
        professionalDetails: professionalDetails
    });

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
            {/* Header Section */}
            <Paper 
                sx={{ 
                    p: { xs: 2, sm: 4 }, 
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    mb: { xs: 2, sm: 4 } 
                }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={isMobile ? 2 : 0}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 }, flexDirection: isMobile ? 'column' : 'row' }}>
                        <Avatar
                            sx={{
                                width: { xs: 60, sm: 80 },
                                height: { xs: 60, sm: 80 },
                                bgcolor: alpha(theme.palette.common.white, 0.2),
                                fontSize: { xs: '1.5rem', sm: '2rem' }, 
                                fontWeight: 'bold'
                            }}
                        >
                            {(user?.firstName?.[0] || 'U').toUpperCase()}{(user?.lastName?.[0] || 'N').toUpperCase()}
                        </Avatar>
                        <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
                            <Typography variant={isMobile ? "h5" : "h3"} sx={{ fontWeight: 700, mb: { xs: 0.5, sm: 1 } }}>
                                {user?.firstName || 'Prénom'} {user?.lastName || 'Nom'}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'} flexWrap="wrap">
                                <Chip
                                    label={user?.type || 'PROFESSIONAL'}
                                    sx={{
                                        bgcolor: alpha(theme.palette.common.white, 0.2),
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                                    }}
                                />
                                {isUserRecommended && (
                                    <Chip
                                        icon={<RecommendIcon />}
                                        label="Recommandé"
                                        sx={{
                                            bgcolor: alpha(theme.palette.warning.main, 0.9),
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                                        }}
                                    />
                                )}
                                <Typography variant={isMobile ? "body2" : "body1"} sx={{ opacity: 0.9, fontSize: isMobile ? '0.75rem' : 'inherit' }}>
                                    ID: {user?._id || 'N/A'}
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<Iconify icon="eva:arrow-back-outline" />}
                        onClick={handleGoBack}
                        size={isMobile ? 'small' : 'medium'} 
                        sx={{
                            borderColor: alpha(theme.palette.common.white, 0.3),
                            color: 'white',
                            borderRadius: 2,
                            '&:hover': {
                                borderColor: 'white',
                                bgcolor: alpha(theme.palette.common.white, 0.1)
                            },
                            width: isMobile ? '100%' : 'auto', 
                        }}
                    >
                        Retour
                    </Button>
                </Stack>
            </Paper>

            <Grid container spacing={isMobile ? 2 : 3}>
                {/* User Information Card */}
                <Grid item xs={12} md={8}>
                    <StyledCard sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                            <Iconify icon="eva:person-outline" sx={{ fontSize: { xs: 20, sm: 24 }, mr: { xs: 1.5, sm: 2 }, color: 'primary.main' }} />
                            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
                                Informations Personnelles
                            </Typography>
                        </Box>
                        
                        <Stack spacing={0}>
                            <InfoRow>
                                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                                    Nom complet
                                </Typography>
                                <Typography variant={isMobile ? "body1" : "body1"} sx={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                    {(user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : 'Non renseigné'}
                                </Typography>
                            </InfoRow>
                            
                            <InfoRow>
                                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                                    Adresse e-mail
                                </Typography>
                                <Typography variant={isMobile ? "body1" : "body1"} sx={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                    {user?.email || 'Non renseigné'}
                                </Typography>
                            </InfoRow>
                            
                            <InfoRow>
                                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                                    Téléphone
                                </Typography>
                                <Typography variant={isMobile ? "body1" : "body1"} sx={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                    {user?.phone || 'Non renseigné'}
                                </Typography>
                            </InfoRow>
                            
                            {user?.secteur && (
                                <InfoRow>
                                    <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Secteur d'activité
                                    </Typography>
                                    <Typography variant={isMobile ? "body1" : "body1"} sx={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                        {user.secteur}
                                    </Typography>
                                </InfoRow>
                            )}
                            
                            {user?.entreprise && (
                                <InfoRow>
                                    <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Nom de l'entreprise
                                    </Typography>
                                    <Typography variant={isMobile ? "body1" : "body1"} sx={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                        {user.entreprise}
                                    </Typography>
                                </InfoRow>
                            )}
                            
                            {(user?.category || user?.productCategory) && (
                                <InfoRow>
                                    <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Catégorie
                                    </Typography>
                                    <Typography variant={isMobile ? "body1" : "body1"} sx={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                        {typeof (user?.category || user?.productCategory) === 'object' 
                                            ? (user?.category?.name || user?.productCategory?.name || 'N/A')
                                            : (user?.category || user?.productCategory || 'Non renseigné')}
                                    </Typography>
                                </InfoRow>
                            )}
                            
                            <InfoRow>
                                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                                    Date de création
                                </Typography>
                                <Typography variant={isMobile ? "body1" : "body1"} sx={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'Non disponible'}
                                </Typography>
                            </InfoRow>

                            {(user?.rate !== undefined && user?.rate !== null) && (
                                <InfoRow>
                                    <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Note moyenne
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                                        <Iconify icon="eva:star-fill" sx={{ color: 'warning.main', fontSize: { xs: 18, sm: 20 } }} />
                                        <Typography variant={isMobile ? "body1" : "body1"} sx={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                            {user.rate}/10
                                        </Typography>
                                    </Box>
                                </InfoRow>
                            )}
                        </Stack>
                    </StyledCard>
                </Grid>

                {/* Actions Card */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={isMobile ? 2 : 3}>
                        {/* Status Overview */}
                        <StyledCard sx={{ p: { xs: 2, sm: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                                <Iconify icon="eva:checkmark-circle-2-outline" sx={{ fontSize: { xs: 20, sm: 24 }, mr: { xs: 1.5, sm: 2 }, color: 'success.main' }} />
                                <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 600 }}>
                                    Statut du Compte
                                </Typography>
                            </Box>
                            
                            <Stack spacing={isMobile ? 1.5 : 2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant={isMobile ? "body2" : "body2"} color="text.secondary">Vérification</Typography>
                                    <Chip
                                        label={isUserVerified ? 'Vérifié' : 'Non vérifié'}
                                        color={isUserVerified ? 'success' : 'warning'}
                                        size={isMobile ? "small" : "medium"} 
                                        variant="outlined"
                                        sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                                    />
                                </Box>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant={isMobile ? "body2" : "body2"} color="text.secondary">Activité</Typography>
                                    <Chip
                                        label={isUserActive ? 'Actif' : 'Inactif'}
                                        color={isUserActive ? 'success' : 'error'}
                                        size={isMobile ? "small" : "medium"} 
                                        variant="outlined"
                                        sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }} 
                                    />
                                </Box>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant={isMobile ? "body2" : "body2"} color="text.secondary">Bannissement</Typography>
                                    <Chip
                                        label={isUserBanned ? 'Banni' : 'Non banni'}
                                        color={isUserBanned ? 'error' : 'success'}
                                        size={isMobile ? "small" : "medium"} 
                                        variant="outlined"
                                        sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }} 
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant={isMobile ? "body2" : "body2"} color="text.secondary">Recommandation</Typography>
                                    <Chip
                                        label={isUserRecommended ? 'Recommandé' : 'Non recommandé'}
                                        color={isUserRecommended ? 'primary' : 'default'}
                                        size={isMobile ? "small" : "medium"} 
                                        variant="outlined"
                                        sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                                        icon={isUserRecommended ? <RecommendIcon sx={{ fontSize: '16px !important' }} /> : undefined}
                                    />
                                </Box>
                            </Stack>
                        </StyledCard>

                        {/* Action Buttons */}
                        <ActionCard sx={{ p: { xs: 2, sm: 2.5 } }}>
                            <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 600, mb: { xs: 1.5, sm: 2 } }}>
                                Actions Rapides
                            </Typography>
                            
                            <Stack spacing={isMobile ? 1 : 1.5}>
                                <StatusButton
                                    variant={isUserVerified ? "outlined" : "contained"}
                                    color={isUserVerified ? "error" : "success"}
                                    fullWidth
                                    startIcon={
                                        isVerifying ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : (
                                            <Iconify icon={isUserVerified ? "eva:close-circle-outline" : "eva:checkmark-circle-outline"} sx={{ fontSize: isMobile ? 20 : 24 }} />
                                        )
                                    }
                                    onClick={() => handleVerifyUser(!isUserVerified)}
                                    disabled={isVerifying}
                                >
                                    {isUserVerified ? 'Annuler vérification' : 'Vérifier'}
                                </StatusButton>

                                <StatusButton
                                    variant={isUserActive ? "outlined" : "contained"}
                                    color={isUserActive ? "error" : "success"}
                                    fullWidth
                                    startIcon={
                                        isUpdatingActiveStatus ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : (
                                            <Iconify icon={isUserActive ? "eva:person-remove-outline" : "eva:person-add-outline"} sx={{ fontSize: isMobile ? 20 : 24 }} />
                                        )
                                    }
                                    onClick={() => handleSetUserActive(!isUserActive)}
                                    disabled={isUpdatingActiveStatus}
                                >
                                    {isUserActive ? 'Désactiver' : 'Activer'}
                                </StatusButton>

                                <StatusButton
                                    variant={isUserBanned ? "contained" : "outlined"}
                                    color={isUserBanned ? "success" : "error"}
                                    fullWidth
                                    startIcon={
                                        isUpdatingBannedStatus ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : (
                                            <Iconify icon={isUserBanned ? "eva:person-done-outline" : "eva:slash-outline"} sx={{ fontSize: isMobile ? 20 : 24 }} />
                                        )
                                    }
                                    onClick={() => handleSetUserBanned(!isUserBanned)}
                                    disabled={isUpdatingBannedStatus}
                                >
                                    {isUserBanned ? 'Débannir' : 'Bannir'}
                                </StatusButton>

                                <StatusButton
                                    variant={isUserRecommended ? "outlined" : "contained"}
                                    color={isUserRecommended ? "error" : "primary"}
                                    fullWidth
                                    startIcon={
                                        isUpdatingRecommendationStatus ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : (
                                            <Iconify icon={isUserRecommended ? "eva:star-outline" : "eva:star-fill"} sx={{ fontSize: isMobile ? 20 : 24 }} />
                                        )
                                    }
                                    onClick={() => handleRecommendUser(!isUserRecommended)}
                                    disabled={isUpdatingRecommendationStatus}
                                >
                                    {isUserRecommended ? 'Retirer recommandation' : 'Recommander'}
                                </StatusButton>
                            </Stack>
                        </ActionCard>
                    </Stack>
                </Grid>
            </Grid>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={closeConfirmDialog}
                aria-labelledby="confirm-dialog-title"
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 },
                }}
            >
                <DialogTitle id="confirm-dialog-title">
                    {confirmDialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmDialog.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={closeConfirmDialog} color="inherit">
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        variant="contained"
                        color={confirmDialog.color}
                        autoFocus
                    >
                        {confirmDialog.actionText}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}