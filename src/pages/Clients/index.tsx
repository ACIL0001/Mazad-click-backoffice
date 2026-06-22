import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Stack,
    Button,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    Box,
    alpha,
    IconButton,
    Checkbox,
    MenuItem,
    Link,
    Avatar
} from '@mui/material';
import Page from '../../components/Page';
import Label from '../../components/Label';
import { useSnackbar } from 'notistack';
import MuiTable from '../../components/Tables/MuiTable';
import ActionsMenu from '../../components/Tables/ActionsMenu';
import { useTheme, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import GppBadIcon from '@mui/icons-material/GppBad';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { UserAPI } from '@/api/user';
import { ReviewAPI } from '@/api/review';
import Iconify from '../../components/Iconify';


// Fixed COLUMNS to match the professional table structure (without checkbox in COLUMNS array)
const COLUMNS = [
    { id: 'firstName', label: 'Nom', alignRight: false, searchable: true },
    { id: 'lastName', label: 'Prénom', alignRight: false, searchable: true },
    { id: 'email', label: 'Email', alignRight: false, searchable: true },
    { id: 'phone', label: 'Tel', alignRight: false, searchable: true },
    { id: 'wilaya', label: 'Wilaya', alignRight: false, searchable: true },
    { id: 'isActive', label: 'Activé', alignRight: false, searchable: false },
    { id: 'isBanned', label: 'Banni', alignRight: false, searchable: false },
    { id: 'rate', label: 'Rate', alignRight: false, searchable: false },
    { id: 'createdAt', label: 'Créé Le', alignRight: false, searchable: false },
    { id: '', searchable: false }, // Actions column
];

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: theme.spacing(1.5, 1.5, 1.25),
    borderRadius: theme.shape.borderRadius * 1.5,
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(145, 158, 171, 0.12)',
    boxShadow: theme.customShadows ? theme.customShadows.z1 : '0 2px 8px rgba(0, 0, 0, 0.04)',
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    minHeight: 100,
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: theme.customShadows ? theme.customShadows.z16 : '0 10px 30px 0 rgba(0, 0, 0, 0.08)',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1.25),
        alignItems: 'center',
        textAlign: 'center',
    },
}));

const IconWrapperStyle = styled('div')(({ theme }) => ({
    width: 36,
    height: 36,
    display: 'flex',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    marginBottom: theme.spacing(1),
    '& svg': { fontSize: 18 },
    [theme.breakpoints.down('sm')]: {
        marginBottom: theme.spacing(0.75),
        width: 32,
        height: 32,
        '& svg': {
            fontSize: 18,
        },
    },
}));

export default function Clients() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { data: clients = [], isLoading, refetch: fetchClients } = useQuery({
        queryKey: ['clients-list'],
        queryFn: async () => {
            try {
                const data = await UserAPI.getClients();
                console.log("Fetched clients:", data);
                return data;
            } catch (e) {
                console.error("Failed to load clients:", e);
                enqueueSnackbar('Chargement des clients échoué.', { variant: 'error' });
                throw e;
            }
        },
        staleTime: 5 * 60 * 1000,
    });
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [selected, setSelected] = useState<string[]>([]); // Changed to use client names like professional table
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [userToConfirmId, setUserToConfirmId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<string | null>(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [clientNameForDialog, setClientNameForDialog] = useState<string>('');
    const [openRateDialog, setOpenRateDialog] = useState(false);
    const [clientToRateId, setClientToRateId] = useState('');
    const [currentRate, setCurrentRate] = useState<number | null>(null);
    const [initialRate, setInitialRate] = useState<number | null>(null);
    const [clientNameForRateDialog, setClientNameForRateDialog] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]); // For bulk actions

    // Loading states for status toggles
    const [togglingStatus, setTogglingStatus] = useState<{ [key: string]: boolean }>({});

    

    const handleOpenConfirmDialog = (userId: string | string[], type: string, message: string, clientName: string) => {
        if (Array.isArray(userId)) {
            setSelectedUserIds(userId);
            setClientNameForDialog(clientName);
        } else {
            setUserToConfirmId(userId);
            setClientNameForDialog(clientName);
        }
        setActionType(type);
        setConfirmMessage(message);
        setOpenConfirmDialog(true);
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
        setUserToConfirmId(null);
        setActionType(null);
        setConfirmMessage('');
        setClientNameForDialog('');
        setSelectedUserIds([]);
    };

    const handleConfirmAction = async () => {
        const idsToActOn = actionType === 'deleteSelected' ? selectedUserIds : [userToConfirmId];
        
        if (idsToActOn.length === 0 || (!userToConfirmId && actionType !== 'deleteSelected')) {
            enqueueSnackbar('Aucun utilisateur sélectionné pour cette action.', { variant: 'warning' });
            return;
        }

        try {
            switch (actionType) {
                case 'enable':
                    await UserAPI.setUserActive(userToConfirmId, true);
                    enqueueSnackbar('Client activé.', { variant: 'success' });
                    break;
                case 'disable':
                    await UserAPI.setUserActive(userToConfirmId, false);
                    enqueueSnackbar('Client désactivé.', { variant: 'success' });
                    break;
                case 'ban':
                    await UserAPI.setUserBanned(userToConfirmId, true);
                    enqueueSnackbar('Client banni.', { variant: 'success' });
                    break;
                case 'unban':
                    await UserAPI.setUserBanned(userToConfirmId, false);
                    enqueueSnackbar('Client débanni.', { variant: 'success' });
                    break;
                case 'verify':
                    await UserAPI.verifyUser(userToConfirmId, true);
                    enqueueSnackbar('Client vérifié.', { variant: 'success' });
                    break;
                case 'unverify':
                    await UserAPI.verifyUser(userToConfirmId, false);
                    enqueueSnackbar('Vérification du client annulée.', { variant: 'success' });
                    break;

                case 'delete':
                    await UserAPI.deleteUser(userToConfirmId);
                    enqueueSnackbar('Client supprimé avec succès.', { variant: 'success' });
                    break;
                case 'deleteSelected':
                    await Promise.all(selectedUserIds.map(id => UserAPI.deleteUser(id)));
                    enqueueSnackbar(`${selectedUserIds.length} clients supprimés avec succès.`, { variant: 'success' });
                    break;
                default:
                    break;
            }
            fetchClients();
            setSelected([]);
        } catch (e: any) {
            enqueueSnackbar(e.response?.data?.message || `Failed to ${actionType} user.`, { variant: 'error' });
            console.error(e);
        } finally {
            handleCloseConfirmDialog();
        }
    };

    const enableClient = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'enable', "Êtes-vous sûr de vouloir activer", name);
    };

    const disableClient = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'disable', 'Êtes-vous sûr de vouloir désactiver', name);
    };

    const banClient = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'ban', 'Êtes-vous sûr de vouloir bannir', name);
    };

    const unbanClient = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'unban', 'Êtes-vous sûr de vouloir débannir', name);
    };

    const verifyClient = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'verify', 'Êtes-vous sûr de vouloir vérifier', name);
    };

    const unverifyClient = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'unverify', 'Êtes-vous sûr de vouloir annuler la vérification de', name);
    };


    // Updated delete handlers to match professional table pattern
    const handleDeleteSingleClient = (id: string) => {
        const clientToDelete = clients.find((c: any) => c._id === id);
        if (clientToDelete) {
            const clientFullName = `${clientToDelete.firstName} ${clientToDelete.lastName}`;
            handleOpenConfirmDialog(id, 'delete', 'Êtes-vous sûr de vouloir supprimer définitivement le compte de', clientFullName);
        }
    };

    const handleDeleteSelectedClients = () => {
        const selectedIds = clients.filter((c: any) => selected.includes(`${c.firstName} ${c.lastName}`)).map((c: any) => c._id);
        if (selectedIds.length > 0) {
            handleOpenConfirmDialog(
                selectedIds,
                'deleteSelected',
                `Êtes-vous sûr de vouloir supprimer définitivement`,
                `ces ${selectedIds.length} clients`
            );
        } else {
            enqueueSnackbar('Aucun client sélectionné à supprimer.', { variant: 'warning' });
        }
    };

    // Rate Modification Dialog Handlers
    const handleOpenRateDialog = (id: string, name: string, rate: number | undefined) => {
        const rateValue = rate !== undefined && rate !== null ? rate : 1;
        setClientToRateId(id);
        setClientNameForRateDialog(name);
        setCurrentRate(rateValue);
        setInitialRate(rateValue);
        setOpenRateDialog(true);
    };

    const handleCloseRateDialog = () => {
        setOpenRateDialog(false);
        setClientToRateId('');
        setCurrentRate(null);
        setInitialRate(null);
        setClientNameForRateDialog('');
    };

    const handleIncrementRate = () => {
        setCurrentRate((prevRate) => {
            if (prevRate === null) return 1;
            const newRate = prevRate + 1;
            return newRate > 10 ? 10 : newRate;
        });
    };

    const handleDecrementRate = () => {
        setCurrentRate((prevRate) => {
            if (prevRate === null) return 1;
            const newRate = prevRate - 1;
            return newRate < 1 ? 1 : newRate;
        });
    };

    const handleSaveRate = async () => {
        if (clientToRateId === '' || currentRate === null || initialRate === null) {
            enqueueSnackbar('Erreur: Impossible de modifier la cote. Informations manquantes.', { variant: 'error' });
            return;
        }

        const totalDelta = currentRate - initialRate;
        if (Math.abs(totalDelta) !== 1) {
            enqueueSnackbar('La cote ne peut être ajustée que par un seul point à la fois (+1 ou -1).', { variant: 'warning' });
            return;
        }

        const operationDelta = totalDelta;

        try {
            await ReviewAPI.adjustUserRateByAdmin(clientToRateId, operationDelta);
            enqueueSnackbar('Rate du client mise à jour avec succès.', { variant: 'success' });
            fetchClients();
            handleCloseRateDialog();
        } catch (e: any) {
            console.error("Failed to update rate:", e);
            enqueueSnackbar(e.response?.data?.message || 'Échec de la mise à jour de la cote.', { variant: 'error' });
        }
    };

    // Toggle handler functions for direct label clicks
    const toggleVerified = async (id: string, currentValue: boolean) => {
        const statusKey = `verified-${id}`;
        setTogglingStatus(prev => ({ ...prev, [statusKey]: true }));
        try {
            await UserAPI.verifyUser(id, !currentValue);
            enqueueSnackbar(`Compte ${!currentValue ? 'vérifié' : 'non vérifié'} avec succès.`, { variant: 'success' });
            fetchClients();
        } catch (error: any) {
            console.error('Failed to toggle verified status:', error);
            enqueueSnackbar(error?.response?.data?.message || 'Échec de la modification du statut.', { variant: 'error' });
        } finally {
            setTogglingStatus(prev => ({ ...prev, [statusKey]: false }));
        }
    };

    const toggleActive = async (id: string, currentValue: boolean) => {
        const statusKey = `active-${id}`;
        setTogglingStatus(prev => ({ ...prev, [statusKey]: true }));
        try {
            await UserAPI.setUserActive(id, !currentValue);
            enqueueSnackbar(`Compte ${!currentValue ? 'activé' : 'désactivé'} avec succès.`, { variant: 'success' });
            fetchClients();
        } catch (error: any) {
            console.error('Failed to toggle active status:', error);
            enqueueSnackbar(error?.response?.data?.message || 'Échec de la modification du statut.', { variant: 'error' });
        } finally {
            setTogglingStatus(prev => ({ ...prev, [statusKey]: false }));
        }
    };

    const toggleBanned = async (id: string, currentValue: boolean) => {
        const statusKey = `banned-${id}`;
        setTogglingStatus(prev => ({ ...prev, [statusKey]: true }));
        try {
            await UserAPI.setUserBanned(id, !currentValue);
            enqueueSnackbar(`Compte ${!currentValue ? 'banni' : 'débanni'} avec succès.`, { variant: 'success' });
            fetchClients();
        } catch (error: any) {
            console.error('Failed to toggle banned status:', error);
            enqueueSnackbar(error?.response?.data?.message || 'Échec de la modification du statut.', { variant: 'error' });
        } finally {
            setTogglingStatus(prev => ({ ...prev, [statusKey]: false }));
        }
    };

    // Updated handleClick to match professional table pattern
    const handleClick = (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
        if (selected.includes(name)) {
            setSelected(selected.filter((n) => n !== name));
        } else {
            setSelected([...selected, name]);
        }
    };

    const goToProfile = (user: { _id: string }) => {
        navigate(`/dashboard/users/clients/${user._id}`);
    };

    // Fixed TableBodyComponent to match professional table structure
    const TableBodyComponent = ({ data = [] }: { data: any[] }) => {
        const displayedData = data;

        return (
            <TableBody>
                {displayedData.map((row, index) => {
                    const { _id, firstName, lastName, phone, isVerified, isActive, isBanned, createdAt, rate } = row;
                    const clientFullName = `${firstName} ${lastName}`;
                    const isItemSelected = selected.indexOf(clientFullName) !== -1; // Changed to use clientFullName like professional table
                    
                    let rateColor: 'success' | 'warning' | 'error' | 'info' = 'info';
                    if (rate !== undefined && rate !== null) {
                        if (rate >= 7) {
                            rateColor = 'success';
                        } else if (rate >= 4) {
                            rateColor = 'warning';
                        } else {
                            rateColor = 'error';
                        }
                    }

                    return (
                        <TableRow
                            hover
                            key={_id}
                            tabIndex={-1}
                            role="checkbox"
                            selected={isItemSelected}
                            aria-checked={isItemSelected}
                            sx={{
                                '& .MuiTableCell-root': {
                                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                                    padding: isMobile ? '6px 8px' : '8px 12px',
                                },
                            }}
                        >
                            {/* Checkbox cell - matching professional table */}
                            <TableCell padding="checkbox">
                                <Checkbox 
                                    checked={isItemSelected} 
                                    onChange={(event) => handleClick(event, clientFullName)}
                                    sx={{
                                        '& .MuiSvgIcon-root': { 
                                            fontSize: isMobile ? 20 : 24 
                                        },
                                    }}
                                />
                            </TableCell>

                            {/* First Name cell */}
                            <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2}>
                                    <Avatar 
                                        sx={{ 
                                            width: 32, 
                                            height: 32, 
                                            fontSize: '0.8rem', 
                                            fontWeight: 'bold',
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                                            color: 'primary.main',
                                            boxShadow: (theme) => `0 2px 8px 0 ${alpha(theme.palette.primary.main, 0.15)}`
                                        }}
                                    >
                                        {(firstName?.[0] || '').toUpperCase() + (lastName?.[0] || '').toUpperCase()}
                                    </Avatar>
                                    <Link
                                        component="button"
                                        variant="subtitle2"
                                        onClick={() => goToProfile(row)}
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            color: 'text.primary',
                                            textDecoration: 'none',
                                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                                            textAlign: 'left',
                                            '&:hover': { color: 'primary.main' }
                                        }}
                                    >
                                        {firstName || 'N/A'}
                                    </Link>
                                </Stack>
                            </TableCell>

                            {/* Last Name cell */}
                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Typography variant="subtitle2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', fontWeight: 'bold' }}>
                                    {lastName || 'N/A'}
                                </Typography>
                            </TableCell>

                            {/* Email cell */}
                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                    {row.email || 'N/A'}
                                </Typography>
                            </TableCell>

                            {/* Phone cell */}
                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>{phone}</TableCell>

                            {/* Wilaya cell */}
                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                    {row.wilaya || 'N/A'}
                                </Typography>
                            </TableCell>

                            {/* Active cell */}
                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Box
                                    onClick={() => !togglingStatus[`active-${_id}`] && toggleActive(_id, isActive)}
                                    sx={{
                                        cursor: togglingStatus[`active-${_id}`] ? 'wait' : 'pointer',
                                        opacity: togglingStatus[`active-${_id}`] ? 0.6 : 1,
                                        pointerEvents: togglingStatus[`active-${_id}`] ? 'none' : 'auto',
                                        display: 'inline-block'
                                    }}
                                >
                                    <Label variant="ghost" color={isActive ? 'success' : 'error'} sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                        {togglingStatus[`active-${_id}`] ? '...' : sentenceCase(isActive ? 'Actif' : 'Inactif')}
                                    </Label>
                                </Box>
                            </TableCell>

                            {/* Banned cell */}
                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Box
                                    onClick={() => !togglingStatus[`banned-${_id}`] && toggleBanned(_id, isBanned)}
                                    sx={{
                                        cursor: togglingStatus[`banned-${_id}`] ? 'wait' : 'pointer',
                                        opacity: togglingStatus[`banned-${_id}`] ? 0.6 : 1,
                                        pointerEvents: togglingStatus[`banned-${_id}`] ? 'none' : 'auto',
                                        display: 'inline-block'
                                    }}
                                >
                                    <Label variant="ghost" color={isBanned ? 'error' : 'success'} sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                        {togglingStatus[`banned-${_id}`] ? '...' : sentenceCase(isBanned ? 'Banni' : 'Non Banni')}
                                    </Label>
                                </Box>
                            </TableCell>

                            {/* Rate cell */}
                            <TableCell align="left">
                                {rate !== undefined && rate !== null ? (
                                    <Box
                                        onClick={() => handleOpenRateDialog(_id, clientFullName, rate)}
                                        sx={{
                                            cursor: 'pointer',
                                            display: 'inline-block'
                                        }}
                                    >
                                        <Label variant="ghost" color={rateColor} sx={{ display: 'inline-flex', alignItems: 'center', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                            <StarIcon sx={{ fontSize: isMobile ? 14 : 16, mr: 0.5 }} />
                                            {rate.toFixed(1)}
                                        </Label>
                                    </Box>
                                ) : (
                                    <Box
                                        onClick={() => handleOpenRateDialog(_id, clientFullName, undefined)}
                                        sx={{
                                            cursor: 'pointer',
                                            display: 'inline-block'
                                        }}
                                    >
                                        <Label variant="ghost" color="info" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>N/A</Label>
                                    </Box>
                                )}
                            </TableCell>

                            {/* Created date cell */}
                            <TableCell align="left" sx={{ display: isTablet ? 'none' : 'table-cell' }}>{new Date(createdAt).toDateString()}</TableCell>

                            {/* Actions cell */}
                            <TableCell align="right">
                                <ActionsMenu
                                    _id={_id}
                                    actions={[
                                        { label: 'Supprimer', onClick: () => handleDeleteSingleClient(_id), icon: 'eva:trash-2-outline' },
                                    ]}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        );
    };

    const totalClients = clients.length;
    const bannedClients = clients.filter(c => c.isBanned).length;
    const verifiedClients = clients.filter(c => c.isVerified).length;
    const activeClients = clients.filter(c => c.isActive).length;

    return (
        <Page title="Users - Clients">
            <Container 
                maxWidth="xl" 
                sx={{ 
                    py: { xs: 2, sm: 3 }, 
                    bgcolor: '#ffffff', 
                    p: { xs: 2, md: 4 }, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: (theme) => theme.customShadows.z1
                }}
            >
                <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: 'info.main',
                                bgcolor: (theme) => alpha(theme.palette.info.main, 0.12),
                                boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.info.main, 0.15)}`
                            }}>
                                <PeopleAltIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant="body2" color="textSecondary" sx={{ opacity: 0.72, fontSize: '0.68rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Total Clients
                                </Typography>
                                <Typography variant="h6" component="div" fontWeight="800" sx={{ mt: 0.25, fontSize: '1.15rem', lineHeight: 1.2 }}>
                                    {totalClients}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: 'error.main',
                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
                                boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.error.main, 0.15)}`
                            }}>
                                <GppBadIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant="body2" color="textSecondary" sx={{ opacity: 0.72, fontSize: '0.68rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Clients Bannis
                                </Typography>
                                <Typography variant="h6" component="div" fontWeight="800" sx={{ mt: 0.25, fontSize: '1.15rem', lineHeight: 1.2 }}>
                                    {bannedClients}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: 'success.main',
                                bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
                                boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.success.main, 0.15)}`
                            }}>
                                <VerifiedUserIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant="body2" color="textSecondary" sx={{ opacity: 0.72, fontSize: '0.68rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Clients Vérifiés
                                </Typography>
                                <Typography variant="h6" component="div" fontWeight="800" sx={{ mt: 0.25, fontSize: '1.15rem', lineHeight: 1.2 }}>
                                    {verifiedClients}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: 'warning.main',
                                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
                                boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.warning.main, 0.15)}`
                            }}>
                                <HowToRegIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant="body2" color="textSecondary" sx={{ opacity: 0.72, fontSize: '0.68rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Clients Actifs
                                </Typography>
                                <Typography variant="h6" component="div" fontWeight="800" sx={{ mt: 0.25, fontSize: '1.15rem', lineHeight: 1.2 }}>
                                    {activeClients}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                </Grid>

                {clients && (
                    <MuiTable
                        data={clients}
                        columns={COLUMNS}
                        page={page}
                        setPage={setPage}
                        order={order}
                        setOrder={setOrder}
                        orderBy={orderBy}
                        setOrderBy={setOrderBy}
                        selected={selected}
                        setSelected={setSelected}
                        filterName={filterName}
                        setFilterName={setFilterName}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        TableBodyComponent={TableBodyComponent}
                        searchFields={['firstName', 'lastName', 'email', 'phone', 'wilaya']}
                        numSelected={selected.length}
                        loading={isLoading}
                        onDeleteSelected={handleDeleteSelectedClients}
                    />
                )}
                <Dialog
                    open={openConfirmDialog}
                    onClose={handleCloseConfirmDialog}
                    aria-labelledby="confirm-dialog-title"
                    maxWidth={isMobile ? 'xs' : 'sm'}
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            p: isMobile ? 1 : 2,
                        },
                    }}
                >
                    <DialogTitle sx={{ m: 0, p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center', fontSize: isMobile ? '1rem' : '1.25rem' }} id="confirm-dialog-title">
                        {(actionType === 'ban' || actionType === 'disable' || actionType === 'unverify' || actionType === 'delete' || actionType === 'deleteSelected') && <WarningIcon sx={{ mr: 1, color: 'warning.main', fontSize: isMobile ? 20 : 24 }} />}
                        {(actionType === 'verify' || actionType === 'enable' || actionType === 'unban' || actionType === 'promote') && <CheckCircleOutlineIcon sx={{ mr: 1, color: 'success.main', fontSize: isMobile ? 20 : 24 }} />}
                        {actionType === 'ban' ? 'Bannir Client' :
                         actionType === 'unban' ? 'Débannir Client' :
                         actionType === 'enable' ? 'Activer Client' :
                         actionType === 'disable' ? 'Désactiver Client' :
                         actionType === 'verify' ? 'Vérifier Client' :
                         actionType === 'unverify' ? 'Annuler Vérification' :
                         actionType === 'delete' ? 'Supprimer Client' :
                         actionType === 'deleteSelected' ? 'Supprimer Clients' : ''}
                    </DialogTitle>
                    <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Typography gutterBottom sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
                            {confirmMessage} <Typography component="span" fontWeight="bold">{clientNameForDialog}</Typography>?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Button onClick={handleCloseConfirmDialog} color="inherit" size={isMobile ? 'small' : 'medium'}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleConfirmAction}
                            variant="contained"
                            color={actionType === 'ban' || actionType === 'delete' || actionType === 'deleteSelected' ? 'error' : 'primary'}
                            autoFocus
                            size={isMobile ? 'small' : 'medium'}
                        >
                            Confirmer
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={openRateDialog}
                    onClose={handleCloseRateDialog}
                    aria-labelledby="rate-dialog-title"
                    maxWidth={isMobile ? 'xs' : 'sm'}
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            p: isMobile ? 1 : 2,
                        },
                    }}
                >
                    <DialogTitle sx={{ m: 0, p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center', fontSize: isMobile ? '1rem' : '1.25rem' }} id="rate-dialog-title">
                        <EditIcon sx={{ mr: 1, fontSize: isMobile ? 20 : 24 }} />
                        Modifier la cote du client
                    </DialogTitle>
                    <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Typography gutterBottom sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
                            Modifier la cote pour <Typography component="span" fontWeight="bold">{clientNameForRateDialog}</Typography>:
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2} sx={{ mt: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 }, justifyContent: 'center' }}>
                            <IconButton onClick={handleDecrementRate} disabled={currentRate === null || currentRate <= 1} color="error">
                                <RemoveCircleOutlineIcon sx={{ fontSize: isMobile ? 32 : 40 }} />
                            </IconButton>
                            <Typography variant={isMobile ? "h3" : "h2"}>
                                {currentRate !== null ? currentRate.toFixed(1) : 'N/A'}
                            </Typography>
                            <IconButton onClick={handleIncrementRate} disabled={currentRate === null || currentRate >= 10} color="success">
                                <AddCircleOutlineIcon sx={{ fontSize: isMobile ? 32 : 40 }} />
                            </IconButton>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Button onClick={handleCloseRateDialog} color="inherit" size={isMobile ? 'small' : 'medium'}>
                            Annuler
                        </Button>
                        <Button onClick={handleSaveRate} variant="contained" color="primary" size={isMobile ? 'small' : 'medium'}>
                            Enregistrer
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Page>
    );
}