// IdentityVerificationDetailsPage.tsx - UPDATED with new documents
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
    Fade,
    IconButton,
    Tooltip,
    useTheme,
    alpha,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { sentenceCase } from 'change-case';
import Iconify from '@/components/Iconify';
import Label from '../../components/Label';
import { IdentityAPI } from '../../api/identity';
import { IdentityDocument } from '@/api/identity';
import app from '@/config';
import { UserAPI } from '../../api/user';
import { useSnackbar } from 'notistack';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function IdentityVerificationDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [identityDetails, setIdentityDetails] = useState<IdentityDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    
    // Confirmation dialog states
    const [confirmationDialog, setConfirmationDialog] = useState<{
        open: boolean;
        action: 'accept' | 'reject' | null;
        title: string;
        message: string;
    }>({
        open: false,
        action: null,
        title: '',
        message: ''
    });

    const fetchIdentityDetails = useCallback(async () => {
        if (!id) {
            setError("L'ID d'identité est manquant.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await IdentityAPI.getIdentityById(id);
            let userProfile: any = (response.user && typeof response.user === 'object' && response.user._id)
                ? response.user
                : { _id: response.user?.toString() || 'unknown', firstName: 'Inconnu', lastName: '', email: 'unknown@example.com' };

            // Always fetch user details if a user ID is available to ensure latest verification status
            if (userProfile._id && userProfile._id !== 'unknown') {
                try {
                    const userDetails = await UserAPI.findById(userProfile._id);
                    userProfile = { ...userProfile, ...userDetails }; // Merge existing userProfile with fresh userDetails
                } catch (userErr) {
                    console.warn("Failed to fetch full user details, using partial data:", userErr);
                    // Continue with the existing userProfile if fetching full details fails
                }
            }

            const updatedIdentityDetails = { ...response, user: userProfile };
            setIdentityDetails(updatedIdentityDetails);

            console.log('Fetched and set identity details:', updatedIdentityDetails);

        } catch (err: any) {
            console.error("Échec de la récupération des détails d'identité :", err);
            setError(err.message || "Échec du chargement des détails d'identité.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchIdentityDetails();
    }, [fetchIdentityDetails]);

    const handleGoBack = () => {
        navigate(-1);
    };

    // Enhanced verification handlers with confirmation
    const handleVerifyIdentity = useCallback(async (action: 'accept' | 'reject') => {
        if (!identityDetails) {
            enqueueSnackbar("Identity details not available.", { variant: 'error' });
            return;
        }

        const userName = `${identityDetails.user?.firstName} ${identityDetails.user?.lastName}`.trim();
        const userType = identityDetails.user?.type === 'PROFESSIONAL' ? 'professionnel' : 'client';
        
        const actionText = action === 'accept' ? 'accepter' : 'rejeter';
        const resultText = action === 'accept' ? 'accepté' : 'rejeté';

        setConfirmationDialog({
            open: true,
            action,
            title: `${action === 'accept' ? 'Accepter' : 'Rejeter'} la demande`,
            message: `Êtes-vous sûr de vouloir ${actionText} la demande de ${userName} (${userType}) ? Cette action est irréversible.${action === 'accept' && identityDetails.user?.type === 'CLIENT' ? ' L\'utilisateur sera converti en revendeur.' : ''}`
        });
    }, [identityDetails]);

    const handleConfirmVerification = useCallback(async () => {
        if (!confirmationDialog.action || !identityDetails) return;

        setIsVerifying(true);
        try {
            await IdentityAPI.verifyIdentity(identityDetails._id, confirmationDialog.action);
            
            const actionText = confirmationDialog.action === 'accept' ? 'acceptée' : 'rejetée';
            enqueueSnackbar(`Demande ${actionText} avec succès.`, { variant: 'success' });
            
            // Navigate back to the main identity page after successful verification
            navigate('/dashboard/identities');
            
        } catch (err: any) {
            console.error("Failed to verify identity:", err);
            enqueueSnackbar(err.message || `Failed to ${confirmationDialog.action} identity.`, { variant: 'error' });
        } finally {
            setIsVerifying(false);
            setConfirmationDialog({ open: false, action: null, title: '', message: '' });
        }
    }, [confirmationDialog, identityDetails, enqueueSnackbar, navigate]);

    const handleCloseConfirmation = () => {
        if (isVerifying) return; // Prevent closing during verification
        setConfirmationDialog({ open: false, action: null, title: '', message: '' });
    };

    // Conditional rendering for loading, error, and no details states
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '80vh',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
                }}
            >
                <CircularProgress size={isMobile ? 40 : 60} thickness={4} />
                <Typography variant={isMobile ? "body1" : "h6"} sx={{ mt: { xs: 1.5, sm: 2 }, color: 'text.secondary' }}>
                    Chargement des détails d'identité...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth={isMobile ? "xs" : "md"} sx={{ mt: { xs: 2, sm: 4 } }}>
                <Fade in>
                    <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[10], p: { xs: 1.5, sm: 2 } }}>
                        <CardContent sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
                            <Iconify
                                icon="eva:alert-triangle-outline"
                                sx={{ fontSize: isMobile ? 48 : 64, color: 'error.main', mb: { xs: 1.5, sm: 2 } }}
                            />
                            <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                                {error}
                            </Alert>
                            <Button
                                variant="contained"
                                onClick={handleGoBack}
                                size={isMobile ? "medium" : "large"}
                                sx={{ borderRadius: 2, px: { xs: 3, sm: 4 }, fontSize: isMobile ? '0.85rem' : 'inherit' }}
                            >
                                Retour
                            </Button>
                        </CardContent>
                    </Card>
                </Fade>
            </Container>
        );
    }

    if (!identityDetails) {
        return (
            <Container maxWidth={isMobile ? "xs" : "md"} sx={{ mt: { xs: 2, sm: 4 } }}>
                <Fade in>
                    <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[10], p: { xs: 1.5, sm: 2 } }}>
                        <CardContent sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
                            <Iconify
                                icon="eva:search-outline"
                                sx={{ fontSize: isMobile ? 48 : 64, color: 'info.main', mb: { xs: 1.5, sm: 2 } }}
                            />
                            <Alert severity="info" sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                                Aucun détail d'identité trouvé.
                            </Alert>
                            <Button
                                variant="contained"
                                onClick={handleGoBack}
                                size={isMobile ? "medium" : "large"}
                                sx={{ borderRadius: 2, px: { xs: 3, sm: 4 }, fontSize: isMobile ? '0.85rem' : 'inherit' }}
                            >
                                Retour
                            </Button>
                        </CardContent>
                    </Card>
                </Fade>
            </Container>
        );
    }

    // If we reach this point, identityDetails is guaranteed to be available
    const {
        user,
        commercialRegister,
        nif,
        nis,
        last3YearsBalanceSheet,
        certificates,
        identityCard,
        // NEW DOCUMENTS
        registreCommerceCarteAuto,
        nifRequired,
        numeroArticle,
        c20,
        misesAJourCnas,
        carteFellah,
        status,
        conversionType,
        createdAt
    } = identityDetails;

    // Type cast user to any to access additional properties like secteur and entreprise
    const userWithExtendedProps = user as any;

    // Determine user type and status information
    const getUserTypeInfo = () => {
        switch (conversionType) {
            case 'PROFESSIONAL_VERIFICATION':
                return {
                    label: 'Vérification Professionnelle',
                    description: 'Demande de vérification professionnelle',
                    color: theme.palette.warning.main,
                    icon: 'eva:shield-checkmark-outline'
                };
            case 'CLIENT_TO_PROFESSIONAL':
                return {
                    label: 'Client → Professionnel',
                    description: 'Demande de conversion en professionnel',
                    color: theme.palette.success.main,
                    icon: 'eva:star-outline'
                };
            case 'CLIENT_TO_RESELLER':
                return {
                    label: 'Client → Revendeur',
                    description: 'Demande de conversion en revendeur',
                    color: theme.palette.info.main,
                    icon: 'eva:shopping-bag-outline'
                };
            default:
                return {
                    label: user?.type === 'PROFESSIONAL' ? 'Professionnel' : 'Client',
                    description: user?.type === 'PROFESSIONAL' ? 'Demande de vérification professionnelle' : 'Demande de conversion',
                    color: theme.palette.grey[500],
                    icon: 'eva:person-outline'
                };
        }
    };

    const userTypeInfo = getUserTypeInfo();

    const StatusCard = ({ title, status, color, icon, actions }: any) => (
        <Card
            sx={{
                borderRadius: 3,
                border: `2px solid ${alpha(color, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: theme.shadows[8],
                    transform: 'translateY(-2px)'
                },
                p: { xs: 1.5, sm: 2 }
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" alignItems="center" spacing={isMobile ? 1.5 : 2} mb={isMobile ? 1.5 : 2}>
                    <Avatar
                        sx={{
                            bgcolor: alpha(color, 0.1),
                            color: color,
                            width: isMobile ? 40 : 48,
                            height: isMobile ? 40 : 48
                        }}
                    >
                        <Iconify icon={icon} sx={{ fontSize: isMobile ? 20 : 24 }} />
                    </Avatar>
                    <Box>
                        <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 600 }}>
                            {title}
                        </Typography>
                        <Chip
                            label={status.label}
                            color={status.chipColor}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                borderRadius: 1.5,
                                fontWeight: 600,
                                fontSize: isMobile ? '0.7rem' : '0.75rem'
                            }}
                        />
                    </Box>
                </Stack>
                {actions}
            </CardContent>
        </Card>
    );

    const DocumentCard = ({ title, document, icon }: any) => {
  // Construct the correct document URL
  const getDocumentUrl = () => {
    if (!document?.url) return '';
    
    // If the URL is already a full URL, use it directly
    if (document.url.startsWith('http')) {
      return document.url;
    }
    
    // For relative paths, construct the full URL
    // Use your app's baseURL (which should be your backend API URL)
    const baseUrl = app.baseURL.replace('/v1/', '').replace(/\/$/, ''); // Remove API version and trailing slash
    return `${baseUrl}${document.url}`;
  };

  const documentUrl = getDocumentUrl();

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[6],
          transform: 'translateY(-1px)'
        },
        p: { xs: 1.5, sm: 2 }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={isMobile ? 1.5 : 2} mb={isMobile ? 1.5 : 2}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              width: isMobile ? 32 : 40,
              height: isMobile ? 32 : 40
            }}
          >
            <Iconify icon={icon} sx={{ fontSize: isMobile ? 18 : 20 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant={isMobile ? "body1" : "subtitle1"} sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant={isMobile ? "caption" : "caption"} color="text.secondary">
              {document.filename || document.fileName || 'Document'}
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          fullWidth
          startIcon={<Iconify icon="eva:external-link-outline" sx={{ fontSize: isMobile ? 18 : 20 }} />}
          href={documentUrl}
          target="_blank"
          rel="noopener"
          size={isMobile ? "small" : "medium"}
          sx={{
            borderRadius: 2,
            py: isMobile ? 1 : 1.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            },
            fontSize: isMobile ? '0.8rem' : 'inherit'
          }}
        >
          Voir le document
        </Button>
      </CardContent>
    </Card>
  );
};

    // Check if there are any documents to show
    const hasDocuments = commercialRegister || nif || nis || last3YearsBalanceSheet || certificates || identityCard || registreCommerceCarteAuto || nifRequired || numeroArticle || c20 || misesAJourCnas || carteFellah;
    
    
    // Debug logging
    console.log('🔍 Identity details debug:', {
      identityDetails: identityDetails,
      allDocumentFields: {
        commercialRegister: !!commercialRegister,
        nif: !!nif,
        nis: !!nis,
        last3YearsBalanceSheet: !!last3YearsBalanceSheet,
        certificates: !!certificates,
        identityCard: !!identityCard,
        registreCommerceCarteAuto: !!registreCommerceCarteAuto,
        nifRequired: !!nifRequired,
        numeroArticle: !!numeroArticle,
        c20: !!c20,
        misesAJourCnas: !!misesAJourCnas,
        carteFellah: !!carteFellah
      },
      documentDetails: {
        carteFellah: carteFellah,
        registreCommerceCarteAuto: registreCommerceCarteAuto,
        nifRequired: nifRequired
      },
      hasDocuments: hasDocuments
    });

    return (
        <Box sx={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
        }}>
            <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
                <Fade in timeout={600}>
                    <Box>
                        {/* Header Section */}
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                color: 'white',
                                p: { xs: 2, sm: 4 },
                                mb: { xs: 2, sm: 4 },
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: isMobile ? 150 : 200,
                                height: isMobile ? 150 : 200,
                                borderRadius: '50%',
                                background: alpha('#fff', 0.1)
                            }} />
                            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={isMobile ? 2 : 0}>
                                <Box sx={{ zIndex: 1, textAlign: isMobile ? 'center' : 'left' }}>
                                    <Stack direction="row" alignItems="center" spacing={isMobile ? 1.5 : 3} mb={isMobile ? 1 : 2} justifyContent={isMobile ? 'center' : 'flex-start'}>
                                        <Avatar
                                            sx={{
                                                width: isMobile ? 56 : 64,
                                                height: isMobile ? 56 : 64,
                                                bgcolor: alpha('#fff', 0.2),
                                                color: 'white',
                                                fontSize: isMobile ? '20px' : '24px',
                                                fontWeight: 600
                                            }}
                                        >
                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 0.5 }}>
                                                {user.firstName} {user.lastName}
                                            </Typography>
                                            <Typography variant={isMobile ? "body2" : "body1"} sx={{ opacity: 0.9, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                                                {userTypeInfo.description}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                                <Tooltip title="Retour">
                                    <IconButton
                                        onClick={handleGoBack}
                                        size={isMobile ? 'small' : 'medium'}
                                        sx={{
                                            bgcolor: alpha('#fff', 0.2),
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: alpha('#fff', 0.3)
                                            },
                                            width: isMobile ? '100%' : 'auto',
                                        }}
                                    >
                                        <Iconify icon="eva:arrow-back-outline" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Paper>

                        <Grid container spacing={isMobile ? 2 : 3}>
                            {/* User Information Card */}
                            <Grid item xs={12} lg={4}>
                                <Card
                                    sx={{
                                        borderRadius: 3,
                                        height: 'fit-content',
                                        boxShadow: theme.shadows[6],
                                        p: { xs: 1.5, sm: 2 }
                                    }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                                        <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 600, mb: { xs: 1.5, sm: 3 }, display: 'flex', alignItems: 'center', fontSize: isMobile ? '1rem' : 'inherit' }}>
                                            <Iconify icon="eva:person-outline" sx={{ mr: { xs: 1, sm: 1 }, fontSize: isMobile ? 20 : 24 }} />
                                            Informations utilisateur
                                        </Typography>
                                        <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

                                        <Stack spacing={isMobile ? 2 : 3}>
                                            <Box>
                                                <Typography variant={isMobile ? "caption" : "caption"} color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontSize: isMobile ? '0.65rem' : 'inherit' }}>
                                                    Nom complet
                                                </Typography>
                                                <Typography variant={isMobile ? "body2" : "body1"} sx={{ fontWeight: 500, mt: 0.5, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                                                    {user.firstName} {user.lastName}
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Typography variant={isMobile ? "caption" : "caption"} color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontSize: isMobile ? '0.65rem' : 'inherit' }}>
                                                    Adresse e-mail
                                                </Typography>
                                                <Typography variant={isMobile ? "body2" : "body1"} sx={{ fontWeight: 500, mt: 0.5, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                                                    {user.email}
                                                </Typography>
                                            </Box>

                                            {userWithExtendedProps?.secteur && (
                                                <Box>
                                                    <Typography variant={isMobile ? "caption" : "caption"} color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontSize: isMobile ? '0.65rem' : 'inherit' }}>
                                                        Secteur d'activité
                                                    </Typography>
                                                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ fontWeight: 500, mt: 0.5, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                                                        {userWithExtendedProps.secteur}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {userWithExtendedProps?.entreprise && (
                                                <Box>
                                                    <Typography variant={isMobile ? "caption" : "caption"} color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontSize: isMobile ? '0.65rem' : 'inherit' }}>
                                                        Nom de l'entreprise
                                                    </Typography>
                                                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ fontWeight: 500, mt: 0.5, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                                                        {userWithExtendedProps.entreprise}
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1 }}>
                                                <Typography variant={isMobile ? "caption" : "caption"} color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontSize: isMobile ? '0.65rem' : 'inherit' }}>
                                                    Type:
                                                </Typography>
                                                <Chip
                                                    label={userTypeInfo.label}
                                                    color={
                                                        conversionType === 'PROFESSIONAL_VERIFICATION' ? 'warning' :
                                                        conversionType === 'CLIENT_TO_PROFESSIONAL' ? 'success' :
                                                        conversionType === 'CLIENT_TO_RESELLER' ? 'info' : 'default'
                                                    }
                                                    size={isMobile ? "small" : "medium"}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        fontWeight: 600,
                                                        fontSize: isMobile ? '0.7rem' : '0.75rem'
                                                    }}
                                                />
                                            </Box>

                                            <Box>
                                                <Typography variant={isMobile ? "caption" : "caption"} color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontSize: isMobile ? '0.65rem' : 'inherit' }}>
                                                    Statut de la demande
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Chip
                                                        label={
                                                            status === 'WAITING' ? 'En attente' :
                                                            status === 'DONE' ? 'Acceptée' :
                                                            status === 'REJECTED' ? 'Rejetée' : 'En attente'
                                                        }
                                                        color={
                                                            status === 'WAITING' ? 'warning' :
                                                            status === 'DONE' ? 'success' :
                                                            status === 'REJECTED' ? 'error' : 'warning'
                                                        }
                                                        size={isMobile ? "small" : "medium"}
                                                        sx={{
                                                            borderRadius: 1.5,
                                                            fontWeight: 600,
                                                            fontSize: isMobile ? '0.7rem' : '0.75rem'
                                                        }}
                                                    />
                                                </Box>
                                            </Box>

                                            <Box>
                                                <Typography variant={isMobile ? "caption" : "caption"} color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontSize: isMobile ? '0.65rem' : 'inherit' }}>
                                                    Date de soumission
                                                </Typography>
                                                <Typography variant={isMobile ? "body2" : "body1"} sx={{ fontWeight: 500, mt: 0.5, fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                                                    {createdAt ? new Date(createdAt).toLocaleDateString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Verification Actions Card */}
                            <Grid item xs={12} lg={8}>
                                {status === 'WAITING' && (
                                    <StatusCard
                                        title="Actions de vérification"
                                        status={{
                                            label: 'En attente de vérification',
                                            chipColor: 'warning'
                                        }}
                                        color={theme.palette.warning.main}
                                        icon="eva:clock-outline"
                                        actions={
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<Iconify icon="eva:checkmark-circle-outline" sx={{ fontSize: isMobile ? 20 : 24 }} />}
                                                        onClick={() => handleVerifyIdentity('accept')}
                                                        disabled={isVerifying}
                                                        size={isMobile ? "medium" : "large"}
                                                        sx={{ borderRadius: 2, py: isMobile ? 1.5 : 2, fontSize: isMobile ? '0.9rem' : 'inherit' }}
                                                    >
                                                        {isVerifying ? <CircularProgress size={20} color="inherit" /> : 'Accepter'}
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="error"
                                                        startIcon={<Iconify icon="eva:close-circle-outline" sx={{ fontSize: isMobile ? 20 : 24 }} />}
                                                        onClick={() => handleVerifyIdentity('reject')}
                                                        disabled={isVerifying}
                                                        size={isMobile ? "medium" : "large"}
                                                        sx={{ borderRadius: 2, py: isMobile ? 1.5 : 2, fontSize: isMobile ? '0.9rem' : 'inherit' }}
                                                    >
                                                        {isVerifying ? <CircularProgress size={20} color="inherit" /> : 'Rejeter'}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        }
                                    />
                                )}

                                {status === 'DONE' && (
                                    <StatusCard
                                        title="Demande acceptée"
                                        status={{
                                            label: 'Vérifiée et acceptée',
                                            chipColor: 'success'
                                        }}
                                        color={theme.palette.success.main}
                                        icon="eva:checkmark-circle-2-outline"
                                        actions={
                                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                                                Cette demande a été acceptée. L'utilisateur a été vérifié avec succès.
                                            </Alert>
                                        }
                                    />
                                )}

                                {status === 'REJECTED' && (
                                    <StatusCard
                                        title="Demande rejetée"
                                        status={{
                                            label: 'Rejetée',
                                            chipColor: 'error'
                                        }}
                                        color={theme.palette.error.main}
                                        icon="eva:close-circle-outline"
                                        actions={
                                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                                Cette demande a été rejetée. L'utilisateur n'a pas pu être vérifié.
                                            </Alert>
                                        }
                                    />
                                )}
                            </Grid>

                            {/* Documents Section */}
                            <Grid item xs={12}>
                                <Card
                                    sx={{
                                        borderRadius: 3,
                                        boxShadow: theme.shadows[6],
                                        p: { xs: 1.5, sm: 2 }
                                    }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                                        <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 600, mb: { xs: 1.5, sm: 3 }, display: 'flex', alignItems: 'center', fontSize: isMobile ? '1rem' : 'inherit' }}>
                                            <Iconify icon="eva:file-text-outline" sx={{ mr: { xs: 1, sm: 1 }, fontSize: isMobile ? 20 : 24 }} />
                                            Documents soumis
                                        </Typography>
                                        <Divider sx={{ mb: { xs: 2, sm: 4 } }} />

                                        <Grid container spacing={isMobile ? 2 : 3}>
                                            {/* Existing optional documents */}
                                            {commercialRegister && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="Registre de commerce"
                                                        document={commercialRegister}
                                                        icon="eva:briefcase-outline"
                                                    />
                                                </Grid>
                                            )}

                                            {nif && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="NIF"
                                                        document={nif}
                                                        icon="eva:credit-card-outline"
                                                    />
                                                </Grid>
                                            )}

                                            {nis && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="NIS"
                                                        document={nis}
                                                        icon="eva:shield-outline"
                                                    />
                                                </Grid>
                                            )}

                                            {last3YearsBalanceSheet && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="Bilan 3 dernières années"
                                                        document={last3YearsBalanceSheet}
                                                        icon="eva:bar-chart-outline"
                                                    />
                                                </Grid>
                                            )}

                                            {certificates && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="Certificats"
                                                        document={certificates}
                                                        icon="eva:award-outline"
                                                    />
                                                </Grid>
                                            )}

                                            {identityCard && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="Carte d'identité"
                                                        document={identityCard}
                                                        icon="eva:person-outline"
                                                    />
                                                </Grid>
                                            )}

                                            {/* NEW REQUIRED DOCUMENTS */}
                                            {registreCommerceCarteAuto && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="Registre de commerce/Carte auto-entrepreneur"
                                                        document={registreCommerceCarteAuto}
                                                        icon="eva:file-done-outline"
                                                    />
                                                </Grid>
                                            )}

                                            {nifRequired && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="NIF (Obligatoire)"
                                                        document={nifRequired}
                                                        icon="eva:credit-card-outline"
                                                    />
                                                </Grid>
                                            )}

                                            {numeroArticle && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="Numéro d'article"
                                                        document={numeroArticle}
                                                        icon="eva:hash-outline"
                                                    />
                                                </Grid>
                                            )}

                                            {c20 && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="C20"
                                                        document={c20}
                                                        icon="eva:file-text-outline"
                                                    />
                                                </Grid>
                                            )}

                                            {misesAJourCnas && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="Mises à jour CNAS/CASNOS"
                                                        document={misesAJourCnas}
                                                        icon="eva:refresh-outline"
                                                    />
                                                </Grid>
                                            )}

                                            {carteFellah && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <DocumentCard
                                                        title="Carte Fellah"
                                                        document={carteFellah}
                                                        icon="eva:file-add-outline"
                                                    />
                                                </Grid>
                                            )}
                                        </Grid>

                                        {!hasDocuments && (
                                            <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 6 } }}>
                                                <Iconify
                                                    icon="eva:file-outline"
                                                    sx={{ fontSize: isMobile ? 48 : 64, color: 'text.disabled', mb: { xs: 1.5, sm: 2 } }}
                                                />
                                                <Typography variant={isMobile ? "h6" : "h6"} color="text.secondary">
                                                    Aucun document disponible
                                                </Typography>
                                                <Typography variant={isMobile ? "body2" : "body2"} color="text.disabled" sx={{ fontSize: isMobile ? '0.75rem' : 'inherit' }}>
                                                    Aucun document d'identité n'a été téléchargé pour cet utilisateur.
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                        </Grid>
                    </Box>
                </Fade>
            </Container>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmationDialog.open}
                onClose={handleCloseConfirmation}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Iconify 
                        icon={confirmationDialog.action === 'accept' ? 'eva:checkmark-circle-outline' : 'eva:close-circle-outline'}
                        color={confirmationDialog.action === 'accept' ? theme.palette.success.main : theme.palette.error.main}
                        width={24} 
                        height={24}
                    />
                    {confirmationDialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmationDialog.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button 
                        onClick={handleCloseConfirmation} 
                        disabled={isVerifying}
                        variant="outlined"
                        color="inherit"
                    >
                        Annuler
                    </Button>
                    <Button 
                        onClick={handleConfirmVerification} 
                        disabled={isVerifying}
                        variant="contained"
                        color={confirmationDialog.action === 'accept' ? 'success' : 'error'}
                        startIcon={isVerifying ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {isVerifying ? 'En cours...' : (confirmationDialog.action === 'accept' ? 'Accepter' : 'Rejeter')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}