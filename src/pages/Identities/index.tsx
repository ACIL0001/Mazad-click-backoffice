// index.tsx - Updated to use IdentityDocument from API
import { sentenceCase } from 'change-case';
import { useState, useEffect, ReactNode, useCallback } from 'react';
import useAuth from '@/hooks/useAuth';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Stack,
    Avatar,
    Button,
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    Badge,
    Grid,
    Card,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Paper,
    CircularProgress
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Page from '../../components/Page';
import Label from '../../components/Label';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import UserVerificationModal from '@/shared/modal/UserVerificationModal';
import Breadcrumb from '@/components/Breadcrumbs';
import Iconify from '@/components/Iconify';

import AcceptedSellers from './AcceptedSellers';
import PendingAndRejectedSellers from './PendingAndRejectedSellers';

import { IdentityAPI, IdentityDocument } from '../../api/identity';
import { UserAPI } from '../../api/user';

export default function Identity() {
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { isLogged } = useAuth();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    // Updated to use IdentityDocument from API
    const [pendingProfessionals, setPendingProfessionals] = useState<IdentityDocument[]>([]);
    const [pendingResellers, setPendingResellers] = useState<IdentityDocument[]>([]);
    const [pendingClientToProfessional, setPendingClientToProfessional] = useState<IdentityDocument[]>([]);
    const [acceptedIdentities, setAcceptedIdentities] = useState<IdentityDocument[]>([]);
    const [rejectedIdentities, setRejectedIdentities] = useState<IdentityDocument[]>([]);
    
    const [value, setValue] = useState(0);
    const [openVerificationModal, setOpenVerificationModal] = useState<IdentityDocument | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    // Enhanced data fetching using the API methods
    const fetchAllData = useCallback(async () => {
        if (!isLogged) {
            setLoading(false);
            setError('User not logged in.');
            return;
        }
        
        try {
            setLoading(true);
            setError(null);

            // Use the specific API endpoints for better performance
            const [
                professionalVerifications,
                resellerConversions,
                acceptedResponse
            ] = await Promise.all([
                IdentityAPI.getPendingProfessionals(),
                IdentityAPI.getPendingResellers(),
                IdentityAPI.getAcceptedIdentities()
            ]);

            // Get all pending to separate client-to-professional conversions
            const allPending = await IdentityAPI.getPendingIdentities();
            
            // Filter for client-to-professional conversions
            const clientToProfessionalConversions = allPending.filter(identity => 
                identity.conversionType === 'CLIENT_TO_PROFESSIONAL'
            );

            // For legacy records without conversionType, use the API helper
            const legacyRecords = allPending.filter(identity => !identity.conversionType);
            const categorizedLegacy = {
                professionals: [] as IdentityDocument[],
                resellers: [] as IdentityDocument[],
                clientToProfessional: [] as IdentityDocument[]
            };

            legacyRecords.forEach(identity => {
                const conversionType = IdentityAPI.getConversionTypeFromIdentity(identity);
                switch (conversionType) {
                    case 'PROFESSIONAL_VERIFICATION':
                        categorizedLegacy.professionals.push(identity);
                        break;
                    case 'CLIENT_TO_RESELLER':
                        categorizedLegacy.resellers.push(identity);
                        break;
                    case 'CLIENT_TO_PROFESSIONAL':
                        categorizedLegacy.clientToProfessional.push(identity);
                        break;
                }
            });

            // Set state with combined data
            setPendingProfessionals([...professionalVerifications, ...categorizedLegacy.professionals]);
            setPendingResellers([...resellerConversions, ...categorizedLegacy.resellers]);
            setPendingClientToProfessional([...clientToProfessionalConversions, ...categorizedLegacy.clientToProfessional]);
            setAcceptedIdentities(acceptedResponse);

            console.log('Professional verifications:', professionalVerifications.length);
            console.log('Reseller conversions:', resellerConversions.length);
            console.log('Client to Professional:', clientToProfessionalConversions.length);
            console.log('Accepted identities:', acceptedResponse.length);

            // Don't show success snackbar on every load - only log to console

        } catch (err: any) {
            console.error("Failed to fetch data:", err);
            setError(err.message || "Failed to load data.");
            // Only show error snackbar, not success
            enqueueSnackbar('Failed to load data.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [isLogged]); // Remove enqueueSnackbar from dependencies

    useEffect(() => {
        fetchAllData();
    }, [isLogged]); // Only depend on isLogged, not fetchAllData

    // Handle verification using the API
    const handleVerifyIdentity = useCallback(async (identity: IdentityDocument, action: 'accept' | 'reject') => {
        try {
            await IdentityAPI.verifyIdentity(identity._id, action);
            
            // Remove from all pending lists immediately
            setPendingProfessionals(prev => prev.filter(item => item._id !== identity._id));
            setPendingResellers(prev => prev.filter(item => item._id !== identity._id));
            setPendingClientToProfessional(prev => prev.filter(item => item._id !== identity._id));

            // If accepted, add to accepted list
            if (action === 'accept') {
                const updatedIdentity = { ...identity, status: 'DONE' as const };
                setAcceptedIdentities(prev => [...prev, updatedIdentity]);
                
                // Show success message with conversion info
                const conversionInfo = IdentityAPI.getConversionDisplayInfo(
                    identity.conversionType || IdentityAPI.getConversionTypeFromIdentity(identity)
                );
                enqueueSnackbar(`${conversionInfo.label} accepté avec succès`, { variant: 'success' });
            } else {
                const updatedIdentity = { ...identity, status: 'REJECTED' as const };
                setRejectedIdentities(prev => [...prev, updatedIdentity]);
                
                const conversionInfo = IdentityAPI.getConversionDisplayInfo(
                    identity.conversionType || IdentityAPI.getConversionTypeFromIdentity(identity)
                );
                enqueueSnackbar(`${conversionInfo.label} rejeté`, { variant: 'warning' });
            }
            
        } catch (error: any) {
            console.error('Error verifying identity:', error);
            enqueueSnackbar(`Error ${action}ing identity: ${error.message}`, { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    const handleOpenVerificationModal = (identityDetails: IdentityDocument) => {
        setOpenVerificationModal(identityDetails);
    };

    const handleCloseVerificationModal = () => {
        setOpenVerificationModal(undefined);
    };

    // Delete handlers using the API
    const handleDeletePendingProfessionals = useCallback(async (idsToDelete: string[]) => {
        try {
            for (const id of idsToDelete) {
                await IdentityAPI.deleteIdentity(id);
            }
            setPendingProfessionals(prev => prev.filter(item => !idsToDelete.includes(item._id)));
            enqueueSnackbar(`${idsToDelete.length} vérifications professionnelles supprimées.`, { variant: "success" });
        } catch (error: any) {
            console.error("Error deleting pending professionals:", error);
            enqueueSnackbar(`Erreur lors de la suppression: ${error.message || "Erreur inconnue"}`, { variant: "error" });
            throw error; // Re-throw to let the component handle the error
        }
    }, [enqueueSnackbar]);

    const handleDeletePendingResellers = useCallback(async (idsToDelete: string[]) => {
        try {
            for (const id of idsToDelete) {
                await IdentityAPI.deleteIdentity(id);
            }
            setPendingResellers(prev => prev.filter(item => !idsToDelete.includes(item._id)));
            enqueueSnackbar(`${idsToDelete.length} conversions vers revendeur supprimées.`, { variant: "success" });
        } catch (error: any) {
            console.error("Error deleting pending resellers:", error);
            enqueueSnackbar(`Erreur lors de la suppression: ${error.message || "Erreur inconnue"}`, { variant: "error" });
            throw error;
        }
    }, [enqueueSnackbar]);

    const handleDeletePendingClientToProfessional = useCallback(async (idsToDelete: string[]) => {
        try {
            for (const id of idsToDelete) {
                await IdentityAPI.deleteIdentity(id);
            }
            setPendingClientToProfessional(prev => prev.filter(item => !idsToDelete.includes(item._id)));
            enqueueSnackbar(`${idsToDelete.length} conversions vers professionnel supprimées.`, { variant: "success" });
        } catch (error: any) {
            console.error("Error deleting pending client to professional:", error);
            enqueueSnackbar(`Erreur lors de la suppression: ${error.message || "Erreur inconnue"}`, { variant: "error" });
            throw error;
        }
    }, [enqueueSnackbar]);

    const handleDeleteAcceptedIdentities = useCallback(async (idsToDelete: string[]) => {
        try {
            for (const id of idsToDelete) {
                await IdentityAPI.deleteIdentity(id);
            }
            setAcceptedIdentities(prev => prev.filter(item => !idsToDelete.includes(item._id)));
            enqueueSnackbar(`${idsToDelete.length} identités acceptées supprimées.`, { variant: "success" });
        } catch (error: any) {
            console.error("Error deleting accepted identities:", error);
            enqueueSnackbar(`Erreur lors de la suppression: ${error.message || "Erreur inconnue"}`, { variant: "error" });
            throw error;
        }
    }, [enqueueSnackbar]);

    // Tab content rendering
    const renderTabContent = (): ReactNode => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: { xs: 150, sm: 200 } }}>
                    <CircularProgress size={isMobile ? 36 : 48} />
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ ml: { xs: 1, sm: 2 } }}>Loading data...</Typography>
                </Box>
            );
        }
        if (error) {
            return <Typography color="error" sx={{ textAlign: 'center', mt: { xs: 2, sm: 4 }, fontSize: isMobile ? '0.8rem' : 'inherit' }}>{error}</Typography>;
        }

        switch (value) {
            case 0:
                // Professional Verifications Tab
                return (
                    <PendingAndRejectedSellers 
                        pendingAndRejectedSellers={pendingProfessionals} 
                        onOpenVerificationModal={handleOpenVerificationModal}
                        onDeleteSellers={handleDeletePendingProfessionals}
                        onVerifyIdentity={handleVerifyIdentity}
                        title="Vérifications Professionnelles"
                        subtitle="Professionnels existants demandant une vérification d'identité"
                    />
                );
            case 1:
                // Client to Reseller Tab
                return (
                    <PendingAndRejectedSellers 
                        pendingAndRejectedSellers={pendingResellers} 
                        onOpenVerificationModal={handleOpenVerificationModal}
                        onDeleteSellers={handleDeletePendingResellers}
                        onVerifyIdentity={handleVerifyIdentity}
                        title="Clients → Revendeurs"
                        subtitle="Clients souhaitant devenir revendeurs"
                    />
                );
            case 2:
                // Client to Professional Tab
                return (
                    <PendingAndRejectedSellers 
                        pendingAndRejectedSellers={pendingClientToProfessional} 
                        onOpenVerificationModal={handleOpenVerificationModal}
                        onDeleteSellers={handleDeletePendingClientToProfessional}
                        onVerifyIdentity={handleVerifyIdentity}
                        title="Clients → Professionnels"
                        subtitle="Clients souhaitant devenir professionnels"
                    />
                );
            case 3:
                // Accepted Users Tab
                return (
                    <AcceptedSellers 
                        acceptedSellers={acceptedIdentities} 
                        onOpenVerificationModal={handleOpenVerificationModal} 
                        onDeleteSellers={handleDeleteAcceptedIdentities}
                    />
                );
            default:
                return (
                    <PendingAndRejectedSellers 
                        pendingAndRejectedSellers={pendingProfessionals} 
                        onOpenVerificationModal={handleOpenVerificationModal}
                        onDeleteSellers={handleDeletePendingProfessionals}
                        onVerifyIdentity={handleVerifyIdentity}
                        title="Vérifications Professionnelles"
                        subtitle="Professionnels existants demandant une vérification d'identité"
                    />
                );
        }
    };

    return (
        <Page title="User and Identity Management">
            <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={{ xs: 2, sm: 4 }} spacing={isMobile ? 2 : 0}>
                    <Box>
                        <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: 'bold' }}>
                            Gestion des Identités & Conversions
                        </Typography>
                        <Typography variant={isMobile ? "body2" : "body2"} color="text.secondary" sx={{ fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                            Gérez les vérifications d'identité et les conversions de types d'utilisateurs.
                        </Typography>
                    </Box>
                </Stack>

                <Box mb={{ xs: 2, sm: 4 }}>
                    <Breadcrumb />
                </Box>

                {/* Stats cards with proper conversion type counts */}
                <Grid container spacing={isMobile ? 2 : 3} mb={{ xs: 2, sm: 4 }}>
                    {[
                        { 
                            title: 'Vérifications Pro', 
                            count: pendingProfessionals.length, 
                            icon: 'eva:shield-checkmark-outline', 
                            color: theme.palette.info 
                        },
                        { 
                            title: 'Client → Revendeur', 
                            count: pendingResellers.length, 
                            icon: 'eva:trending-up-outline', 
                            color: theme.palette.warning 
                        },
                        { 
                            title: 'Client → Professionnel', 
                            count: pendingClientToProfessional.length, 
                            icon: 'eva:star-outline', 
                            color: theme.palette.primary 
                        },
                        { 
                            title: 'Acceptées', 
                            count: acceptedIdentities.length, 
                            icon: 'eva:checkmark-circle-outline', 
                            color: theme.palette.success 
                        },
                    ].map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 2 }}>
                                <Stack direction="row" spacing={isMobile ? 1.5 : 2} alignItems="center">
                                    <Avatar variant="rounded" sx={{ bgcolor: stat.color.light, color: stat.color.main, width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: 1.5 }}>
                                        <Iconify icon={stat.icon} width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ fontWeight: 'bold' }}>{stat.count}</Typography>
                                        <Typography variant={isMobile ? "body2" : "body2"} sx={{ color: 'text.secondary', fontSize: isMobile ? '0.75rem' : 'inherit' }}>{stat.title}</Typography>
                                    </Box>
                                </Stack>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Tab navigation with clearer conversion-based labels */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 2, sm: 3 } }}>
                    <Tabs
                        value={value}
                        onChange={handleTabChange}
                        aria-label="identity conversion categories"
                        variant={isMobile ? "scrollable" : "standard"}
                        scrollButtons="auto"
                    >
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, px: { xs: 0.5, sm: 1 } }}>
                                    <Iconify icon="eva:shield-checkmark-outline" width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} />
                                    <Typography variant="subtitle2" sx={{ textTransform: 'none', fontSize: isMobile ? '0.75rem' : 'inherit' }}>
                                        Vérifications Pro
                                        {pendingProfessionals.length > 0 && (
                                            <Badge badgeContent={pendingProfessionals.length} color="info" sx={{ ml: 1 }} />
                                        )}
                                    </Typography>
                                </Box>
                            }
                            sx={{ minHeight: isMobile ? 40 : 48 }}
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, px: { xs: 0.5, sm: 1 } }}>
                                    <Iconify icon="eva:trending-up-outline" width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} />
                                    <Typography variant="subtitle2" sx={{ textTransform: 'none', fontSize: isMobile ? '0.75rem' : 'inherit' }}>
                                        Client → Revendeur
                                        {pendingResellers.length > 0 && (
                                            <Badge badgeContent={pendingResellers.length} color="warning" sx={{ ml: 1 }} />
                                        )}
                                    </Typography>
                                </Box>
                            }
                            sx={{ minHeight: isMobile ? 40 : 48 }}
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, px: { xs: 0.5, sm: 1 } }}>
                                    <Iconify icon="eva:star-outline" width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} />
                                    <Typography variant="subtitle2" sx={{ textTransform: 'none', fontSize: isMobile ? '0.75rem' : 'inherit' }}>
                                        Client → Professionnel
                                        {pendingClientToProfessional.length > 0 && (
                                            <Badge badgeContent={pendingClientToProfessional.length} color="primary" sx={{ ml: 1 }} />
                                        )}
                                    </Typography>
                                </Box>
                            }
                            sx={{ minHeight: isMobile ? 40 : 48 }}
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, px: { xs: 0.5, sm: 1 } }}>
                                    <Iconify icon="eva:checkmark-circle-outline" width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} />
                                    <Typography variant="subtitle2" sx={{ textTransform: 'none', fontSize: isMobile ? '0.75rem' : 'inherit' }}>
                                        Acceptées
                                    </Typography>
                                </Box>
                            }
                            sx={{ minHeight: isMobile ? 40 : 48 }}
                        />
                    </Tabs>
                </Box>

                {renderTabContent()}

                {/* Verification modal */}
                {openVerificationModal && (
                    <UserVerificationModal
                        open={!!openVerificationModal}
                        setOpen={handleCloseVerificationModal}
                        identity={openVerificationModal}
                        accept={() => handleVerifyIdentity(openVerificationModal, 'accept')}
                        decline={() => handleVerifyIdentity(openVerificationModal, 'reject')}
                    />
                )}
            </Container>
        </Page>
    );
}