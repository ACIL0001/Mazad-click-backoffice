// ClientDetailsPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { PopulatedUser } from '../Identities/index';
import app from '@/config';
import { UserAPI } from '../../api/user';
import { useSnackbar } from 'notistack';
import useMediaQuery from '@mui/material/useMediaQuery';

// Extended type to handle additional properties that might exist
interface ExtendedPopulatedUser extends PopulatedUser {
    fullName?: string;
    photoURL?: string;
    isHasIdentity?: boolean;
    isPhoneVerified?: boolean;
    t?: string;
    id?: string;
}

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

export default function ClientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [clientDetails, setClientDetails] = useState<ExtendedPopulatedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isUpdatingActiveStatus, setIsUpdatingActiveStatus] = useState(false);
    const [isUpdatingBannedStatus, setIsUpdatingBannedStatus] = useState(false);
    const [isPromoting, setIsPromoting] = useState(false);
    
    // Promotion dialog state
    const [openPromotionDialog, setOpenPromotionDialog] = useState(false);

    const fetchClientDetails = useCallback(async () => {
        if (!id) {
            setError("L'ID du client est manquant.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            console.log('Fetching client details for ID:', id);
            const response = await UserAPI.findById(id);
            console.log('API Response:', response);
            
            // Handle different response structures from your API
            let userData = null;
            if (response?.user) {
                userData = response.user;
                console.log('Using response.user:', userData);
            } else if (response?.data) {
                userData = response.data;
                console.log('Using response.data:', userData);
            } else if (response?._id) {
                userData = response;
                console.log('Using direct response:', userData);
            }
            
            if (userData) {
                setClientDetails(userData as ExtendedPopulatedUser);
                console.log('Client details set:', userData);
            } else {
                console.error('No valid user data found in response:', response);
                setError('Aucune donnée utilisateur trouvée dans la réponse.');
            }
        } catch (err: any) {
            console.error("Échec de la récupération des détails du client :", err);
            setError(err.message || "Échec du chargement des détails du client.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchClientDetails();
    }, [fetchClientDetails]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleVerifyUser = async (isVerified: boolean) => {
        if (!clientDetails?._id) return;
        setIsVerifying(true);
        try {
            await UserAPI.verifyUser(clientDetails._id, isVerified);
            enqueueSnackbar(`Utilisateur ${isVerified ? 'vérifié' : 'non vérifié'} avec succès.`, { variant: 'success' });
            fetchClientDetails();
        } catch (err: any) {
            enqueueSnackbar(err.message || `Échec de la ${isVerified ? 'vérification' : 'désvérification'}.`, { variant: 'error' });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSetUserActive = async (isActive: boolean) => {
        if (!clientDetails?._id) return;
        setIsUpdatingActiveStatus(true);
        try {
            await UserAPI.setUserActive(clientDetails._id, isActive);
            enqueueSnackbar(`Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès.`, { variant: 'success' });
            fetchClientDetails();
        } catch (err: any) {
            enqueueSnackbar(err.message || `Échec de l'${isActive ? 'activation' : 'désactivation'}.`, { variant: 'error' });
        } finally {
            setIsUpdatingActiveStatus(false);
        }
    };

    const handleSetUserBanned = async (isBanned: boolean) => {
        if (!clientDetails?._id) return;
        setIsUpdatingBannedStatus(true);
        try {
            await UserAPI.setUserBanned(clientDetails._id, isBanned);
            enqueueSnackbar(`Utilisateur ${isBanned ? 'banni' : 'débanni'} avec succès.`, { variant: 'success' });
            fetchClientDetails();
        } catch (err: any) {
            enqueueSnackbar(err.message || `Échec du ${isBanned ? 'bannissement' : 'débannissement'}.`, { variant: 'error' });
        } finally {
            setIsUpdatingBannedStatus(false);
        }
    };

    const handlePromoteToReseller = async () => {
        if (!clientDetails?._id) return;
        setIsPromoting(true);
        try {
            await UserAPI.promoteToReseller(clientDetails._id);
            enqueueSnackbar('Client promu au rang de revendeur avec succès!', { variant: 'success' });
            setOpenPromotionDialog(false);
            fetchClientDetails();
        } catch (err: any) {
            enqueueSnackbar(err.message || 'Échec de la promotion au rang de revendeur.', { variant: 'error' });
        } finally {
            setIsPromoting(false);
        }
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
                <Alert severity="error" sx={{ borderRadius: 2, fontSize: isMobile ? '0.8rem' : 'inherit' }}>{error}</Alert>
                <Button variant="contained" onClick={handleGoBack} sx={{ mt: { xs: 1.5, sm: 2 }, borderRadius: 2, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                    Retour
                </Button>
            </Container>
        );
    }

    if (!clientDetails) {
        return (
            <Container sx={{ mt: { xs: 2, sm: 4 } }}>
                <Alert severity="info" sx={{ borderRadius: 2, fontSize: isMobile ? '0.8rem' : 'inherit' }}>Aucun détail de client trouvé.</Alert>
                <Button variant="contained" onClick={handleGoBack} sx={{ mt: { xs: 1.5, sm: 2 }, borderRadius: 2, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                    Retour
                </Button>
            </Container>
        );
    }

    const user = clientDetails;
    const isUserVerified = user?.isVerified || false;
    const isUserActive = user?.isActive ?? true;
    const isUserBanned = user?.isBanned || false;
    const isClient = user?.type === 'CLIENT';
    const isPhoneVerified = user?.isPhoneVerified || false;
    const hasIdentity = user?.isHasIdentity || false;

    // Get user initials safely
    const getInitials = () => {
        const firstName = user?.firstName || '';
        const lastName = user?.lastName || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    // Helper function to get full name
    const getFullName = () => {
        if (user?.fullName) {
            return user.fullName;
        }
        const firstName = user?.firstName || '';
        const lastName = user?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || 'Nom non disponible';
    };

    // Helper function to get user ID
    const getUserId = () => {
        return user?._id || user?.id || 'ID non disponible';
    };

    console.log('Rendering with user data:', user);

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
                            src={user?.photoURL || undefined}
                            sx={{
                                width: { xs: 60, sm: 80 }, 
                                height: { xs: 60, sm: 80 },
                                bgcolor: alpha(theme.palette.common.white, 0.2),
                                fontSize: { xs: '1.5rem', sm: '2rem' }, 
                                fontWeight: 'bold'
                            }}
                        >
                            {getInitials()}
                        </Avatar>
                        <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
                            <Typography variant={isMobile ? "h5" : "h3"} sx={{ fontWeight: 700, mb: { xs: 0.5, sm: 1 } }}>
                                {getFullName()}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'}>
                                <Chip
                                    label={user?.type || 'CLIENT'}
                                    sx={{
                                        bgcolor: alpha(theme.palette.common.white, 0.2),
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                                    }}
                                />
                                {user?.t && (
                                    <Chip
                                        label={user.t}
                                        sx={{
                                            bgcolor: alpha(theme.palette.warning.main, 0.3),
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                                        }}
                                    />
                                )}
                                <Typography variant={isMobile ? "body2" : "body1"} sx={{ opacity: 0.9, fontSize: isMobile ? '0.75rem' : 'inherit' }}> 
                                    ID: {getUserId()}
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
                                    {getFullName()}
                                </Typography>
                            </InfoRow>
                            
                            <InfoRow>
                                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                                    Adresse e-mail
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant={isMobile ? "body1" : "body1"} sx={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                        {user?.email || 'Non renseigné'}
                                    </Typography>
                                </Box>
                            </InfoRow>
                            
                            <InfoRow>
                                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                                    Téléphone
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant={isMobile ? "body1" : "body1"} sx={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                        {user?.phone || 'Non renseigné'}
                                    </Typography>
                                </Box>
                            </InfoRow>
                            
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

                            {user?.rate !== undefined && user?.rate !== null && (
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
                                            <CircularProgress size={16} />
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
                                            <CircularProgress size={16} />
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
                                            <CircularProgress size={16} />
                                        ) : (
                                            <Iconify icon={isUserBanned ? "eva:person-done-outline" : "eva:slash-outline"} sx={{ fontSize: isMobile ? 20 : 24 }} /> 
                                        )
                                    }
                                    onClick={() => handleSetUserBanned(!isUserBanned)}
                                    disabled={isUpdatingBannedStatus}
                                >
                                    {isUserBanned ? 'Débannir' : 'Bannir'}
                                </StatusButton>
                            </Stack>
                        </ActionCard>
                    </Stack>
                </Grid>
            </Grid>

        </Container>
    );
}