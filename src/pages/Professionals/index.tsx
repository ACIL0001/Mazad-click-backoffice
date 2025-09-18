import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// material
import {
    Stack,
    Button,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    Chip,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    Box,
    alpha,
    IconButton,
    Alert,
} from '@mui/material';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import { useSnackbar } from 'notistack';
import MuiTable from '../../components/Tables/MuiTable';
import ActionsMenu from '../../components/Tables/ActionsMenu';
import { useTheme, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Import specific icons for Dialog
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import RecommendIcon from '@mui/icons-material/Recommend';

// Import icons for the cards
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import GppBadIcon from '@mui/icons-material/GppBad';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import InfoIcon from '@mui/icons-material/Info';

import { UserAPI } from '@/api/user';
import { ReviewAPI } from '@/api/review';
import { ChangeEvent, MouseEvent } from 'react';

const COLUMNS = [
    { id: 'firstName', label: 'Nom', alignRight: false, searchable: true },
    { id: 'phone', label: 'Tel', alignRight: false, searchable: true },
    { id: 'isVerified', label: 'Vérifié', alignRight: false, searchable: false },
    { id: 'isActive', label: 'Activé', alignRight: false, searchable: false },
    { id: 'isBanned', label: 'Banni', alignRight: false, searchable: false },
    { id: 'isRecommended', label: 'Recommandé', alignRight: false, searchable: false },
    { id: 'rate', label: 'Rate', alignRight: false, searchable: false },
    { id: 'createdAt', label: 'Créé Le', alignRight: false, searchable: false },
    { id: '', searchable: false },
];

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.customShadows ? theme.customShadows.z4 : '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
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

export default function Professionals() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [professionals, setProfessionals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [selected, setSelected] = useState<string[]>([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [userToConfirmId, setUserToConfirmId] = useState('');
    const [actionType, setActionType] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [professionalNameForDialog, setProfessionalNameForDialog] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    const [openRateDialog, setOpenRateDialog] = useState(false);
    const [professionalToRateId, setProfessionalToRateId] = useState('');
    const [currentRate, setCurrentRate] = useState<number | null>(null);
    const [initialRate, setInitialRate] = useState<number | null>(null);
    const [professionalNameForRateDialog, setProfessionalNameForRateDialog] = useState('');

    useEffect(() => {
        fetchProfessionals();
        return () => { };
    }, []);

    const fetchProfessionals = () => {
        setLoading(true);
        UserAPI.getProfessionals()
            .then((data) => {
                setProfessionals(data);
                console.log("Fetched verified professionals:", data);
                enqueueSnackbar(`${data.length} professionnels vérifiés chargés avec succès.`, { variant: 'success' });
            })
            .catch((e) => {
                console.error("Failed to load professionals:", e);
                enqueueSnackbar('Chargement des professionnels échoué.', { variant: 'error' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleOpenConfirmDialog = (id: string | string[], name: string, type: string, message: string) => {
        console.log("handleOpenConfirmDialog invoked!", { id, name, type, message });
        if (Array.isArray(id)) {
            setSelectedUserIds(id);
            setProfessionalNameForDialog(name);
        } else {
            setUserToConfirmId(id);
            setProfessionalNameForDialog(name);
        }
        setActionType(type);
        setConfirmMessage(message);
        setOpenConfirmDialog(true);
        console.log("Confirm dialog state set to open.")
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
        setUserToConfirmId('');
        setProfessionalNameForDialog('');
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
                successMessage = 'Professionnel activé avec succès.';
                errorMessage = 'Échec de l\'activation du professionnel.';
                break;
            case 'disable':
                actionPromise = UserAPI.setUserActive(userToConfirmId, false);
                successMessage = 'Professionnel désactivé avec succès.';
                errorMessage = 'Échec de la désactivation du professionnel.';
                break;
            case 'ban':
                actionPromise = UserAPI.setUserBanned(userToConfirmId, true);
                successMessage = 'Professionnel banni avec succès.';
                errorMessage = 'Échec du bannissement du professionnel.';
                break;
            case 'unban':
                actionPromise = UserAPI.setUserBanned(userToConfirmId, false);
                successMessage = 'Professionnel débanni avec succès.';
                errorMessage = 'Échec du débannissement du professionnel.';
                break;
            case 'verify':
                actionPromise = UserAPI.verifyUser(userToConfirmId, true);
                successMessage = 'Professionnel vérifié avec succès.';
                errorMessage = 'Échec de la vérification du professionnel.';
                break;
            case 'unverify':
                actionPromise = UserAPI.verifyUser(userToConfirmId, false);
                successMessage = 'Vérification du professionnel annulée avec succès.';
                errorMessage = 'Échec de l\'annulation de la vérification.';
                break;
            case 'recommend':
                actionPromise = UserAPI.recommendUser(userToConfirmId, true);
                successMessage = 'Professionnel recommandé avec succès.';
                errorMessage = 'Échec de la recommandation du professionnel.';
                break;
            case 'unrecommend':
                actionPromise = UserAPI.recommendUser(userToConfirmId, false);
                successMessage = 'Recommandation du professionnel retirée avec succès.';
                errorMessage = 'Échec du retrait de la recommandation.';
                break;
            case 'delete':
                actionPromise = UserAPI.deleteUser(userToConfirmId);
                successMessage = 'Professionnel supprimé avec succès.';
                errorMessage = 'Échec de la suppression du professionnel.';
                break;
            case 'delete_bulk':
                actionPromise = Promise.all(idsToActOn.map(id => UserAPI.deleteUser(id)));
                successMessage = `${idsToActOn.length} professionnels supprimés avec succès.`;
                errorMessage = 'Échec de la suppression des professionnels.';
                break;
            default:
                break;
        }

        if (actionPromise) {
            actionPromise
                .then((res) => {
                    enqueueSnackbar(successMessage, { variant: 'success' });
                    fetchProfessionals();
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

    const handleOpenRateDialog = (id: string, name: string, rate: number | undefined) => {
        const rateValue = rate !== undefined && rate !== null ? rate : 1;
        setProfessionalToRateId(id);
        setProfessionalNameForRateDialog(name);
        setCurrentRate(rateValue);
        setInitialRate(rateValue);
        setOpenRateDialog(true);
    };

    const handleCloseRateDialog = () => {
        setOpenRateDialog(false);
        setProfessionalToRateId('');
        setCurrentRate(null);
        setInitialRate(null);
        setProfessionalNameForRateDialog('');
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
        if (professionalToRateId === '' || currentRate === null || initialRate === null) {
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
            await ReviewAPI.adjustUserRateByAdmin(professionalToRateId, operationDelta);
            enqueueSnackbar('Rate du professionnel mise à jour avec succès.', { variant: 'success' });
            fetchProfessionals();
            handleCloseRateDialog();
        } catch (e: any) {
            console.error("Failed to update rate:", e);
            enqueueSnackbar(e.response?.data?.message || 'Échec de la mise à jour de la cote.', { variant: 'error' });
        }
    };

    const enableProfessional = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'enable', `Êtes-vous sûr de vouloir activer le compte de`);
    };

    const disableProfessional = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'disable', `Êtes-vous sûr de vouloir désactiver le compte de`);
    };

    const banProfessional = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'ban', `Êtes-vous sûr de vouloir bannir le compte de`);
    };

    const unbanProfessional = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'unban', `Êtes-vous sûr de vouloir débannir le compte de`);
    };

    const verifyProfessional = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'verify', `Êtes-vous sûr de vouloir vérifier le compte de`);
    };

    const unverifyProfessional = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'unverify', `Êtes-vous sûr de vouloir annuler la vérification du compte de`);
    };

    const recommendProfessional = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'recommend', `Êtes-vous sûr de vouloir recommander le compte de`);
    };

    const unrecommendProfessional = (id: string, name: string) => {
        handleOpenConfirmDialog(id, name, 'unrecommend', `Êtes-vous sûr de vouloir retirer la recommandation du compte de`);
    };

    const deleteProfessional = (id: string) => {
        const professional = professionals.find(p => p._id === id);
        if (professional) {
            handleOpenConfirmDialog(id, `${professional.firstName} ${professional.lastName}`, 'delete', `Êtes-vous sûr de vouloir supprimer définitivement le compte de`);
        } else {
            console.error(`Professional with ID ${id} not found.`);
        }
    };

    const handleDeleteSelected = () => {
        console.log("handleDeleteSelected invoked!");
        const selectedIds = professionals.filter(p => selected.includes(`${p.firstName} ${p.lastName}`)).map(p => p._id);
        console.log("Selected IDs for deletion:", selectedIds);
        if (selectedIds.length > 0) {
            handleOpenConfirmDialog(
                selectedIds,
                `ces ${selectedIds.length} professionnels`,
                'delete_bulk',
                `Êtes-vous sûr de vouloir supprimer définitivement`
            );
        } else {
            enqueueSnackbar('Aucun professionnel sélectionné à supprimer.', { variant: 'warning' });
            console.log("No professionals selected for deletion. Showing snackbar.");
        }
    };

    const handleClick = (event: ChangeEvent<HTMLInputElement>, name: string) => {
        if (selected.includes(name)) setSelected(selected.filter((n) => n !== name));
        else setSelected([...selected, name]);
    };

    const goToProfile = (user: { _id: string }) => {
        navigate(`/dashboard/users/professionals/${user._id}`);
    };

    const TableBodyComponent = ({ data = [], selected, setSelected, onDeleteSingle }: { data: any[], selected: string[], setSelected: (selected: string[]) => void, onDeleteSingle?: (id: string) => void }) => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;
        const displayedData = data;

        if (loading) {
            return (
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 4 }}>
                            <Typography>Chargement des professionnels vérifiés...</Typography>
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
                                    Aucun professionnel vérifié trouvé
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
                                    Les professionnels n'apparaîtront dans cette liste qu'après avoir soumis et fait vérifier leurs documents d'identité par un administrateur.
                                </Typography>
                            </Box>
                        </TableCell>
                    </TableRow>
                </TableBody>
            );
        }

        return (
            <TableBody>
                {displayedData.map((row, index) => {
                    const { _id, firstName, lastName, phone, isVerified, isActive, isBanned, isRecommended, createdAt, rate } = row;
                    const professionalFullName = `${firstName} ${lastName}`;
                    const isItemSelected = selected.indexOf(professionalFullName) !== -1;

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
                                   onChange={(event) => handleClick(event, professionalFullName)}
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
                                            label={professionalFullName}
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

                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>{phone}</TableCell>

                            <TableCell align="left">
                                <Label variant="ghost" color={isVerified ? 'success' : 'error'} sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                    {sentenceCase(isVerified ? "Compte Valide" : 'Compte Non Valide')}
                                </Label>
                            </TableCell>

                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Label variant="ghost" color={isActive ? 'success' : 'error'} sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                    {sentenceCase(isActive ? 'Actif' : 'Inactif')}
                                </Label>
                            </TableCell>

                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Label variant="ghost" color={isBanned ? 'error' : 'success'} sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                    {sentenceCase(isBanned ? 'Banni' : 'Non Banni')}
                                </Label>
                            </TableCell>

                            <TableCell align="left">
                                <Label 
                                    variant="ghost" 
                                    color={isRecommended ? 'primary' : 'default'} 
                                    sx={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        fontSize: isMobile ? '0.7rem' : '0.75rem' 
                                    }}
                                >
                                    {isRecommended && <RecommendIcon sx={{ fontSize: isMobile ? 14 : 16, mr: 0.5 }} />}
                                    {isRecommended ? 'Recommandé' : 'Non Recommandé'}
                                </Label>
                            </TableCell>

                            <TableCell align="left">
                                {rate !== undefined && rate !== null ? (
                                    <Label variant="ghost" color={rateColor} sx={{ display: 'inline-flex', alignItems: 'center', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                        <StarIcon sx={{ fontSize: isMobile ? 14 : 16, mr: 0.5 }} />
                                        {rate.toFixed(1)}
                                    </Label>
                                ) : (
                                    <Label variant="ghost" color="info" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>N/A</Label>
                                )}
                            </TableCell>

                            <TableCell align="left" sx={{ display: isTablet ? 'none' : 'table-cell' }}>{new Date(createdAt).toDateString()}</TableCell>

                            <TableCell align="right">
                                <ActionsMenu
                                    _id={_id}
                                    actions={[
                                        { label: 'Modifier Rate', onClick: () => handleOpenRateDialog(_id, professionalFullName, rate), icon: 'eva:edit-fill' },
                                        isRecommended
                                            ? { label: 'Retirer Recommandation', onClick: () => unrecommendProfessional(_id, professionalFullName), icon: 'eva:star-outline' }
                                            : { label: 'Recommander', onClick: () => recommendProfessional(_id, professionalFullName), icon: 'eva:star-fill' },
                                        isActive
                                            ? { label: 'Désactiver', onClick: () => disableProfessional(_id, professionalFullName), icon: 'mdi:user-block-outline' }
                                            : { label: 'Activer', onClick: () => enableProfessional(_id, professionalFullName), icon: 'mdi:user-check-outline' },
                                        isBanned
                                            ? { label: 'Débannir', onClick: () => unbanProfessional(_id, professionalFullName), icon: 'eva:person-done-outline' }
                                            : { label: 'Bannir', onClick: () => banProfessional(_id, professionalFullName), icon: 'eva:slash-outline' },
                                        isVerified
                                            ? { label: 'Annuler la vérification', onClick: () => unverifyProfessional(_id, professionalFullName), icon: 'eva:close-circle-outline' }
                                            : { label: 'Vérifier', onClick: () => verifyProfessional(_id, professionalFullName), icon: 'eva:checkmark-circle-outline' },
                                        { label: 'Supprimer', onClick: () => deleteProfessional(_id), icon: 'eva:trash-2-outline' }
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

    const totalProfessionals = professionals.length;
    const bannedProfessionals = professionals.filter(p => p.isBanned).length;
    const verifiedProfessionals = professionals.filter(p => p.isVerified).length;
    const activeProfessionals = professionals.filter(p => p.isActive).length;
    const recommendedProfessionals = professionals.filter(p => p.isRecommended).length;

    return (
        <Page title="Users - Professionals">
            <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
                {/* Info Alert */}
                <Alert 
                    severity="info" 
                    sx={{ mb: 3 }}
                    icon={<InfoIcon />}
                >
                    Cette page n'affiche que les professionnels dont les documents d'identité ont été vérifiés et acceptés (statut: DONE).
                </Alert>

                <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 3 } }}>
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
                                    Professionnels Vérifiés
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {totalProfessionals}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>

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
                                    {verifiedProfessionals}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>

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
                                    Professionnels Actifs
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {activeProfessionals}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>

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
                                    {recommendedProfessionals}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>

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
                                    Professionnels Bannis
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {bannedProfessionals}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                </Grid>

                {professionals && (
                    <MuiTable
                        data={professionals}
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
                    {actionType === 'ban' ? 'Bannir Professionnel' :
                     actionType === 'unban' ? 'Débannir Professionnel' :
                     actionType === 'enable' ? 'Activer Professionnel' :
                     actionType === 'disable' ? 'Désactiver Professionnel' :
                     actionType === 'verify' ? 'Vérifier Professionnel' :
                     actionType === 'unverify' ? 'Annuler Vérification' :
                     actionType === 'recommend' ? 'Recommander Professionnel' :
                     actionType === 'unrecommend' ? 'Retirer Recommandation' :
                     actionType === 'delete' || actionType === 'delete_bulk' ? 'Supprimer Professionnel(s)' : ''}
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography gutterBottom sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
                        {confirmMessage} <Typography component="span" fontWeight="bold">{professionalNameForDialog}</Typography>?
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
                    Modifier la cote du professionnel
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography gutterBottom sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
                        Modifier la cote pour <Typography component="span" fontWeight="bold">{professionalNameForRateDialog}</Typography>:
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