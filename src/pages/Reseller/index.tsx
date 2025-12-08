import { sentenceCase } from 'change-case';
import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// material
import {
    Stack,
    Avatar,
    Button,
    Checkbox,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    Chip,
    CircularProgress,
    Grid,
    Card,
    Box,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
} from '@mui/material';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import { useSnackbar } from 'notistack';
import MuiTable, { applySortFilter, getComparator } from '../../components/Tables/MuiTable';
import ActionsMenu from '../../components/Tables/ActionsMenu';
import UserListToolbar from '../../sections/@dashboard/user/UserListToolbar';
import { useTheme, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { UserAPI } from '@/api/user';
import { ReviewAPI } from '@/api/review';
import { ChangeEvent, MouseEvent } from 'react';

// Icons for Dialog
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import RecommendIcon from '@mui/icons-material/Recommend';
import InfoIcon from '@mui/icons-material/Info';

// Import icons for the cards
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import GppBadIcon from '@mui/icons-material/GppBad';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HowToRegIcon from '@mui/icons-material/HowToReg';

const COLUMNS = [
    { id: 'firstName', label: 'Nom', alignRight: false, searchable: true },
    { id: 'phone', label: 'Tel', alignRight: false, searchable: true },
    { id: 'isVerified', label: 'Vérifié', alignRight: false, searchable: false },
    { id: 'isActive', label: 'Activé', alignRight: false, searchable: false },
    { id: 'isBanned', label: 'Banni', alignRight: false, searchable: false },
    { id: 'isRecommended', label: 'Recommandé', alignRight: false, searchable: false },
    { id: 'rate', label: 'Rate', alignRight: false, searchable: false },
    { id: 'createdAt', label: 'Créé Le', alignRight: false, searchable: false },
    { id: '', label: '', alignRight: true, searchable: false },
];

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
        flexDirection: 'column',
        textAlign: 'center',
    },
}));

const IconWrapperStyle = styled('div')(({ theme }) => ({
    marginRight: theme.spacing(2),
    width: 48,
    height: 48,
    display: 'flex',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.16),
    [theme.breakpoints.down('sm')]: {
        marginRight: 0,
        marginBottom: theme.spacing(1),
        width: 40,
        height: 40,
        '& svg': {
            fontSize: 24,
        },
    },
}));

export default function Reseller() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [resellers, setResellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [selected, setSelected] = useState<string[]>([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Confirmation Dialog States
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [userToConfirmId, setUserToConfirmId] = useState('');
    const [actionType, setActionType] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [resellerNameForDialog, setResellerNameForDialog] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    // Rate Modification Dialog States
    const [openRateDialog, setOpenRateDialog] = useState(false);
    const [resellerToRateId, setResellerToRateId] = useState('');
    const [currentRate, setCurrentRate] = useState<number | null>(null);
    const [initialRate, setInitialRate] = useState<number | null>(null);
    const [resellerNameForRateDialog, setResellerNameForRateDialog] = useState('');

    // Loading states for status toggles
    const [togglingStatus, setTogglingStatus] = useState<{ [key: string]: boolean }>({});

    const fetchResellers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // UPDATED: Now fetches only verified resellers
            const data = await UserAPI.getResellers();
            console.log('Fetched verified resellers from API:', data);
            setResellers(data);
            enqueueSnackbar(`${data.length} revendeurs vérifiés chargés avec succès.`, { variant: 'success' });
        } catch (err: any) {
            console.error("Failed to load resellers:", err);
            setError(err.message || 'Chargement des revendeurs échoué.');
            enqueueSnackbar('Chargement des revendeurs échoué.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        fetchResellers();
        return () => { };
    }, [fetchResellers]);

    // Confirmation Dialog Handlers
    const handleOpenConfirmDialog = (id: string | string[], name: string, type: string, message: string) => {
        console.log("handleOpenConfirmDialog invoked!", { id, name, type, message });
        if (Array.isArray(id)) {
            setSelectedUserIds(id);
            setResellerNameForDialog(name);
        } else {
            setUserToConfirmId(id);
            setResellerNameForDialog(name);
        }
        setActionType(type);
        setConfirmMessage(message);
        setOpenConfirmDialog(true);
        console.log("Confirm dialog state set to open.");
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
        setUserToConfirmId('');
        setResellerNameForDialog('');
        setActionType('');
        setConfirmMessage('');
        setSelectedUserIds([]);
    };

    const handleConfirmAction = () => {
        let actionPromise: Promise<any> | null = null;
        let successMessage = '';
        let errorMessage = '';

        const idsToActOn = actionType === 'delete_bulk' ? selectedUserIds : [userToConfirmId];

        if (idsToActOn.length === 0 || (!userToConfirmId && actionType !== 'delete_bulk')) {
            enqueueSnackbar('Aucun utilisateur sélectionné pour cette action.', { variant: 'warning' });
            return;
        }

        switch (actionType) {
            case 'enable':
                actionPromise = UserAPI.setUserActive(userToConfirmId, true);
                successMessage = 'Revendeur activé avec succès.';
                errorMessage = 'Échec de l\'activation du revendeur.';
                break;
            case 'disable':
                actionPromise = UserAPI.setUserActive(userToConfirmId, false);
                successMessage = 'Revendeur désactivé avec succès.';
                errorMessage = 'Échec de la désactivation du revendeur.';
                break;
            case 'ban':
                actionPromise = UserAPI.setUserBanned(userToConfirmId, true);
                successMessage = 'Revendeur banni avec succès.';
                errorMessage = 'Échec du bannissement du revendeur.';
                break;
            case 'unban':
                actionPromise = UserAPI.setUserBanned(userToConfirmId, false);
                successMessage = 'Revendeur débanni avec succès.';
                errorMessage = 'Échec du débannissement du revendeur.';
                break;
            case 'verify':
                actionPromise = UserAPI.verifyUser(userToConfirmId, true);
                successMessage = 'Revendeur vérifié avec succès.';
                errorMessage = 'Échec de la vérification du revendeur.';
                break;
            case 'unverify':
                actionPromise = UserAPI.verifyUser(userToConfirmId, false);
                successMessage = 'Vérification du revendeur annulée avec succès.';
                errorMessage = 'Échec de l\'annulation de la vérification.';
                break;
            case 'recommend':
                actionPromise = UserAPI.recommendUser(userToConfirmId, true);
                successMessage = 'Revendeur recommandé avec succès.';
                errorMessage = 'Échec de la recommandation du revendeur.';
                break;
            case 'unrecommend':
                actionPromise = UserAPI.recommendUser(userToConfirmId, false);
                successMessage = 'Recommandation du revendeur retirée avec succès.';
                errorMessage = 'Échec du retrait de la recommandation.';
                break;
            case 'delete':
                actionPromise = UserAPI.deleteUser(userToConfirmId);
                successMessage = 'Revendeur supprimé avec succès.';
                errorMessage = 'Échec de la suppression du revendeur.';
                break;
            case 'delete_bulk':
                actionPromise = Promise.all(idsToActOn.map(id => UserAPI.deleteUser(id)));
                successMessage = `${idsToActOn.length} revendeurs supprimés avec succès.`;
                errorMessage = 'Échec de la suppression des revendeurs.';
                break;
            default:
                break;
        }

        if (actionPromise) {
            actionPromise
                .then((res) => {
                    enqueueSnackbar(successMessage, { variant: 'success' });
                    fetchResellers();
                    handleCloseConfirmDialog();
                    setSelected([]);
                })
                .catch((e) => {
                    console.error(`Failed to perform ${actionType} action:`, e);
                    enqueueSnackbar(e.response?.data?.message || errorMessage, { variant: 'error' });
                    handleCloseConfirmDialog();
                });
        }
    };

    // Rate Modification Dialog Handlers
    const handleOpenRateDialog = (id: string, name: string, rate: number | undefined) => {
        const rateValue = rate !== undefined && rate !== null ? rate : 1;
        setResellerToRateId(id);
        setResellerNameForRateDialog(name);
        setCurrentRate(rateValue);
        setInitialRate(rateValue);
        setOpenRateDialog(true);
    };

    const handleCloseRateDialog = () => {
        setOpenRateDialog(false);
        setResellerToRateId('');
        setCurrentRate(null);
        setInitialRate(null);
        setResellerNameForRateDialog('');
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
        if (resellerToRateId === '' || currentRate === null || initialRate === null) {
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
            await ReviewAPI.adjustUserRateByAdmin(resellerToRateId, operationDelta);
            enqueueSnackbar('Rate du revendeur mise à jour avec succès.', { variant: 'success' });
            fetchResellers();
            handleCloseRateDialog();
        } catch (e: any) {
            console.error("Failed to update rate:", e);
            enqueueSnackbar(e.response?.data?.message || 'Échec de la mise à jour de la cote.', { variant: 'error' });
        }
    };

    // Updated action functions
    const enableReseller = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'enable', `Êtes-vous sûr de vouloir activer le compte de`);
    };

    const disableReseller = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'disable', `Êtes-vous sûr de vouloir désactiver le compte de`);
    };

    const banReseller = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'ban', `Êtes-vous sûr de vouloir bannir le compte de`);
    };

    const unbanReseller = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'unban', `Êtes-vous sûr de vouloir débannir le compte de`);
    };

    const verifyReseller = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'verify', `Êtes-vous sûr de vouloir vérifier le compte de`);
    };

    const unverifyReseller = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'unverify', `Êtes-vous sûr de vouloir annuler la vérification du compte de`);
    };

    const recommendReseller = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'recommend', `Êtes-vous sûr de vouloir recommander le compte de`);
    };

    const unrecommendReseller = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'unrecommend', `Êtes-vous sûr de vouloir retirer la recommandation du compte de`);
    };

    const deleteReseller = (id: string) => {
        const reseller = resellers.find(r => r._id === id);
        if (reseller) {
            handleOpenConfirmDialog(id, `${reseller.firstName} ${reseller.lastName}`, 'delete', `Êtes-vous sûr de vouloir supprimer définitivement le compte de`);
        } else {
            console.error(`Reseller with ID ${id} not found.`);
        }
    };

    // Toggle handler functions for direct label clicks
    const toggleVerified = async (id: string, currentValue: boolean) => {
        const statusKey = `verified-${id}`;
        setTogglingStatus(prev => ({ ...prev, [statusKey]: true }));
        try {
            await UserAPI.verifyUser(id, !currentValue);
            enqueueSnackbar(`Compte ${!currentValue ? 'vérifié' : 'non vérifié'} avec succès.`, { variant: 'success' });
            fetchResellers();
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
            fetchResellers();
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
            fetchResellers();
        } catch (error: any) {
            console.error('Failed to toggle banned status:', error);
            enqueueSnackbar(error?.response?.data?.message || 'Échec de la modification du statut.', { variant: 'error' });
        } finally {
            setTogglingStatus(prev => ({ ...prev, [statusKey]: false }));
        }
    };

    const toggleRecommended = async (id: string, currentValue: boolean) => {
        const statusKey = `recommended-${id}`;
        setTogglingStatus(prev => ({ ...prev, [statusKey]: true }));
        try {
            await UserAPI.recommendUser(id, !currentValue);
            enqueueSnackbar(`Recommandation ${!currentValue ? 'ajoutée' : 'retirée'} avec succès.`, { variant: 'success' });
            fetchResellers();
        } catch (error: any) {
            console.error('Failed to toggle recommended status:', error);
            enqueueSnackbar(error?.response?.data?.message || 'Échec de la modification du statut.', { variant: 'error' });
        } finally {
            setTogglingStatus(prev => ({ ...prev, [statusKey]: false }));
        }
    };

    const handleDeleteSelected = () => {
        console.log("handleDeleteSelected invoked!");
        const selectedIds = resellers.filter(r => selected.includes(`${r.firstName} ${r.lastName}`)).map(r => r._id);
        console.log("Selected IDs for deletion:", selectedIds);
        if (selectedIds.length > 0) {
            handleOpenConfirmDialog(
                selectedIds,
                `ces ${selectedIds.length} revendeurs`,
                'delete_bulk',
                `Êtes-vous sûr de vouloir supprimer définitivement`
            );
        } else {
            enqueueSnackbar('Aucun revendeur sélectionné à supprimer.', { variant: 'warning' });
            console.log("No resellers selected for deletion. Showing snackbar.");
        }
    };

    const handleClick = (event: ChangeEvent<HTMLInputElement>, name: string) => {
        if (selected.includes(name)) setSelected(selected.filter((n) => n !== name));
        else setSelected([...selected, name]);
    };

    const goToProfile = (user: { _id: string }) => {
        navigate(`/dashboard/users/resellers/${user._id}`);
    };

    const TableBodyComponent = ({ data = [], selected, setSelected, onDeleteSingle }: { data: any[], selected: string[], setSelected: (selected: string[]) => void, onDeleteSingle?: (id: string) => void }) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

        const displayedData = applySortFilter(
            data,
            getComparator(order, orderBy),
            filterName,
            COLUMNS.filter(col => col.searchable).map(col => col.id)
        );

        if (loading) {
            return (
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 4 }}>
                            <Typography>Chargement des revendeurs vérifiés...</Typography>
                        </TableCell>
                    </TableRow>
                </TableBody>
            );
        }

        if (error) {
            return (
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 4 }}>
                            <Typography color="error" variant={isMobile ? "body2" : "body1"}>{error}</Typography>
                        </TableCell>
                    </TableRow>
                </TableBody>
            );
        }

        if (displayedData.length === 0) {
            return (
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                                    Aucun revendeur vérifié trouvé
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
                                    Les revendeurs n'apparaîtront dans cette liste qu'après avoir soumis et fait vérifier leurs documents d'identité par un administrateur.
                                </Typography>
                            </Box>
                        </TableCell>
                    </TableRow>
                </TableBody>
            );
        }

        return (
            <TableBody>
                {displayedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const { _id, firstName, lastName, phone, isVerified, isActive, isBanned, isRecommended, createdAt, rate } = row;
                    const resellerFullName = `${firstName} ${lastName}`;
                    const isItemSelected = selected.indexOf(resellerFullName) !== -1;

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
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                    padding: isMobile ? '8px' : '16px',
                                },
                            }}
                        >
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={isItemSelected}
                                    onChange={(event) => handleClick(event, resellerFullName)}
                                    sx={{
                                        '& .MuiSvgIcon-root': { fontSize: isMobile ? 20 : 24 },
                                    }}
                                />
                            </TableCell>

                            <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2}>
                                    <Typography variant="subtitle2" noWrap sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                        <Chip
                                            onClick={() => goToProfile(row)}
                                            label={resellerFullName}
                                            component="a"
                                            href="#"
                                            clickable
                                            sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                                            icon={isRecommended ? <RecommendIcon sx={{ fontSize: '16px !important' }} /> : undefined}
                                            color={isRecommended ? 'primary' : 'default'}
                                        />
                                    </Typography>
                                </Stack>
                            </TableCell>

                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>{phone || 'N/A'}</TableCell>

                            <TableCell align="left">
                                <Box
                                    onClick={() => !togglingStatus[`verified-${_id}`] && toggleVerified(_id, isVerified)}
                                    sx={{
                                        cursor: togglingStatus[`verified-${_id}`] ? 'wait' : 'pointer',
                                        opacity: togglingStatus[`verified-${_id}`] ? 0.6 : 1,
                                        pointerEvents: togglingStatus[`verified-${_id}`] ? 'none' : 'auto',
                                        display: 'inline-block'
                                    }}
                                >
                                    <Label variant="ghost" color={isVerified ? 'success' : 'error'} sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                        {togglingStatus[`verified-${_id}`] ? '...' : sentenceCase(isVerified ? "Compte Valide" : 'Compte Non Valide')}
                                    </Label>
                                </Box>
                            </TableCell>

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

                            <TableCell align="left">
                                <Box
                                    onClick={() => !togglingStatus[`recommended-${_id}`] && toggleRecommended(_id, isRecommended)}
                                    sx={{
                                        cursor: togglingStatus[`recommended-${_id}`] ? 'wait' : 'pointer',
                                        opacity: togglingStatus[`recommended-${_id}`] ? 0.6 : 1,
                                        pointerEvents: togglingStatus[`recommended-${_id}`] ? 'none' : 'auto',
                                        display: 'inline-block'
                                    }}
                                >
                                    <Label 
                                        variant="ghost" 
                                        color={isRecommended ? 'primary' : 'default'} 
                                        sx={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            fontSize: isMobile ? '0.7rem' : '0.75rem'
                                        }}
                                    >
                                        {togglingStatus[`recommended-${_id}`] ? '...' : (
                                            <>
                                                {isRecommended && <RecommendIcon sx={{ fontSize: isMobile ? 14 : 16, mr: 0.5 }} />}
                                                {isRecommended ? 'Recommandé' : 'Non Recommandé'}
                                            </>
                                        )}
                                    </Label>
                                </Box>
                            </TableCell>

                            <TableCell align="left">
                                {rate !== undefined && rate !== null ? (
                                    <Box
                                        onClick={() => handleOpenRateDialog(_id, resellerFullName, rate)}
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
                                        onClick={() => handleOpenRateDialog(_id, resellerFullName, undefined)}
                                        sx={{
                                            cursor: 'pointer',
                                            display: 'inline-block'
                                        }}
                                    >
                                        <Label variant="ghost" color="info" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>N/A</Label>
                                    </Box>
                                )}
                            </TableCell>

                            <TableCell align="left" sx={{ display: isTablet ? 'none' : 'table-cell' }}>{createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</TableCell>

                            <TableCell align="right">
                                <ActionsMenu
                                    _id={_id}
                                    actions={[
                                        { label: 'Supprimer', onClick: () => deleteReseller(_id), icon: 'eva:trash-2-outline' }
                                    ]}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
                {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={COLUMNS.length} />
                    </TableRow>
                )}
            </TableBody>
        );
    };

    // Calculate statistics for resellers
    const totalResellers = resellers.length;
    const bannedResellers = resellers.filter(r => r.isBanned).length;
    const verifiedResellers = resellers.filter(r => r.isVerified).length;
    const activeResellers = resellers.filter(r => r.isActive).length;
    const recommendedResellers = resellers.filter(r => r.isRecommended).length;

    return (
        <Page title="Users - Resellers">
            <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
                {/* Info Alert */}
                <Alert
                    severity="info"
                    sx={{ mb: 3 }}
                    icon={<InfoIcon />}
                >
                    Cette page n'affiche que les revendeurs dont les documents d'identité ont été vérifiés et acceptés (statut: DONE).
                </Alert>

                {/* Cards for reseller statistics */}
                <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 3 } }}>
                    {/* Total Resellers Card */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: theme.palette.info.dark,
                                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0)} 0%, ${alpha(theme.palette.info.dark, 0.24)} 100%)`
                            }}>
                                <PeopleAltIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant={isMobile ? "body2" : "h6"} color="textSecondary" sx={{ opacity: 0.72 }}>
                                    Revendeurs Vérifiés
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {totalResellers}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>

                    {/* Verified Resellers Card */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: theme.palette.success.dark,
                                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0)} 0%, ${alpha(theme.palette.success.dark, 0.24)} 100%)`
                            }}>
                                <VerifiedUserIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant={isMobile ? "body2" : "h6"} color="textSecondary" sx={{ opacity: 0.72 }}>
                                    Comptes Validés
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {verifiedResellers}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>

                    {/* Active Resellers Card */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: theme.palette.warning.dark,
                                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.warning.dark, 0)} 0%, ${alpha(theme.palette.warning.dark, 0.24)} 100%)`
                            }}>
                                <HowToRegIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant={isMobile ? "body2" : "h6"} color="textSecondary" sx={{ opacity: 0.72 }}>
                                    Revendeurs Actifs
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {activeResellers}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>

                    {/* Recommended Resellers Card */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: theme.palette.primary.dark,
                                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0)} 0%, ${alpha(theme.palette.primary.dark, 0.24)} 100%)`
                            }}>
                                <RecommendIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant={isMobile ? "body2" : "h6"} color="textSecondary" sx={{ opacity: 0.72 }}>
                                    Recommandés
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {recommendedResellers}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>

                    {/* Banned Resellers Card */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: theme.palette.error.dark,
                                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.error.dark, 0)} 0%, ${alpha(theme.palette.error.dark, 0.24)} 100%)`
                            }}>
                                <GppBadIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant={isMobile ? "body2" : "h6"} color="textSecondary" sx={{ opacity: 0.72 }}>
                                    Revendeurs Bannis
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {bannedResellers}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                </Grid>

                {resellers && (
                    <MuiTable
                        data={resellers}
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
                        searchFields={['firstName', 'lastName', 'phone']}
                        numSelected={selected.length}
                        onDeleteSelected={handleDeleteSelected}
                        loading={loading}
                    />
                )}
            </Container>

            {/* Confirmation Dialog */}
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
                    {(actionType === 'ban' || actionType === 'disable' || actionType === 'unverify' || actionType === 'delete' || actionType === 'delete_bulk' || actionType === 'unrecommend') && <WarningIcon sx={{ mr: 1, color: 'warning.main', fontSize: isMobile ? 20 : 24 }} />}
                    {(actionType === 'verify' || actionType === 'enable' || actionType === 'unban' || actionType === 'recommend') && <CheckCircleOutlineIcon sx={{ mr: 1, color: 'success.main', fontSize: isMobile ? 20 : 24 }} />}
                    {actionType === 'ban' ? 'Bannir Revendeur' :
                     actionType === 'unban' ? 'Débannir Revendeur' :
                     actionType === 'enable' ? 'Activer Revendeur' :
                     actionType === 'disable' ? 'Désactiver Revendeur' :
                     actionType === 'verify' ? 'Vérifier Revendeur' :
                     actionType === 'unverify' ? 'Annuler Vérification' :
                     actionType === 'recommend' ? 'Recommander Revendeur' :
                     actionType === 'unrecommend' ? 'Retirer Recommandation' :
                     actionType === 'delete' || actionType === 'delete_bulk' ? 'Supprimer Revendeur(s)' : ''}
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography gutterBottom sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
                        {confirmMessage} <Typography component="span" fontWeight="bold">{resellerNameForDialog}</Typography>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Button onClick={handleCloseConfirmDialog} color="inherit" size={isMobile ? 'small' : 'medium'}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        variant="contained"
                        color={actionType === 'ban' || actionType === 'delete' || actionType === 'delete_bulk' || actionType === 'unrecommend' ? 'error' : 'primary'}
                        autoFocus
                        size={isMobile ? 'small' : 'medium'}
                    >
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Rate Modification Dialog */}
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
                    Modifier la cote du revendeur
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography gutterBottom sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
                        Modifier la cote pour <Typography component="span" fontWeight="bold">{resellerNameForRateDialog}</Typography>:
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2} sx={{ mt: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 }, justifyContent: 'center' }}>
                        <IconButton
                            onClick={handleDecrementRate}
                            disabled={currentRate === null || currentRate <= 1}
                            color="error"
                        >
                            <RemoveCircleOutlineIcon sx={{ fontSize: isMobile ? 32 : 40 }} />
                        </IconButton>
                        <Typography variant={isMobile ? "h3" : "h2"}>
                            {currentRate !== null ? currentRate.toFixed(1) : 'N/A'}
                        </Typography>
                        <IconButton
                            onClick={handleIncrementRate}
                            disabled={currentRate === null || currentRate >= 10}
                            color="success"
                        >
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
        </Page>
    );
}