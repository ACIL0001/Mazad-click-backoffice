import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    MenuItem
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
import UserListToolbar from '../../sections/@dashboard/user/UserListToolbar';

// COLUMNS will be defined inside the component to use translations

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

export default function Clients() {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const COLUMNS = [
        { id: 'firstName', label: t('clients.table.name'), alignRight: false, searchable: true },
        { id: 'phone', label: t('clients.table.phone'), alignRight: false, searchable: true },
        { id: 'isVerified', label: t('clients.table.verified'), alignRight: false, searchable: false },
        { id: 'isActive', label: t('clients.table.active'), alignRight: false, searchable: false },
        { id: 'isBanned', label: t('clients.table.banned'), alignRight: false, searchable: false },
        { id: 'rate', label: t('clients.table.rate'), alignRight: false, searchable: false },
        { id: 'createdAt', label: t('clients.table.createdAt'), alignRight: false, searchable: false },
        { id: '', searchable: false }, // Actions column
    ];
    const [clients, setClients] = useState([]);
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

    useEffect(() => {
        fetchClients();
        return () => {};
    }, []);

    const fetchClients = () => {
        UserAPI.getClients()
            .then((data) => {
                setClients(data);
                console.log("Fetched clients:", data);
            })
            .catch((e) => {
                console.error("Failed to load clients:", e);
                enqueueSnackbar(t('clients.errorLoading'), { variant: 'error' });
            });
    };

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
            enqueueSnackbar(t('clients.noSelection'), { variant: 'warning' });
            return;
        }

        try {
            switch (actionType) {
                case 'enable':
                    await UserAPI.setUserActive(userToConfirmId, true);
                    enqueueSnackbar(t('clients.success.enabled'), { variant: 'success' });
                    break;
                case 'disable':
                    await UserAPI.setUserActive(userToConfirmId, false);
                    enqueueSnackbar(t('clients.success.disabled'), { variant: 'success' });
                    break;
                case 'ban':
                    await UserAPI.setUserBanned(userToConfirmId, true);
                    enqueueSnackbar(t('clients.success.banned'), { variant: 'success' });
                    break;
                case 'unban':
                    await UserAPI.setUserBanned(userToConfirmId, false);
                    enqueueSnackbar(t('clients.success.unbanned'), { variant: 'success' });
                    break;
                case 'verify':
                    await UserAPI.verifyUser(userToConfirmId, true);
                    enqueueSnackbar(t('clients.success.verified'), { variant: 'success' });
                    break;
                case 'unverify':
                    await UserAPI.verifyUser(userToConfirmId, false);
                    enqueueSnackbar(t('clients.success.unverified'), { variant: 'success' });
                    break;
                case 'promote':
                    await UserAPI.promoteToReseller(userToConfirmId);
                    enqueueSnackbar(t('clients.success.promoted'), { variant: 'success' });
                    break;
                case 'delete':
                    await UserAPI.deleteUser(userToConfirmId);
                    enqueueSnackbar(t('clients.success.deleted'), { variant: 'success' });
                    break;
                case 'deleteSelected':
                    await Promise.all(selectedUserIds.map(id => UserAPI.deleteUser(id)));
                    enqueueSnackbar(t('clients.success.deletedMultiple', { count: selectedUserIds.length }), { variant: 'success' });
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
        handleOpenConfirmDialog(id, 'enable', t('clients.confirmEnable'), name);
    };

    const disableClient = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'disable', t('clients.confirmDisable'), name);
    };

    const banClient = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'ban', t('clients.confirmBan'), name);
    };

    const unbanClient = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'unban', t('clients.confirmUnban'), name);
    };

    const verifyClient = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'verify', t('clients.confirmVerify'), name);
    };

    const unverifyClient = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'unverify', t('clients.confirmUnverify'), name);
    };

    const promoteToReseller = (id: string, name: string) => {
        handleOpenConfirmDialog(id, 'promote', 'Êtes-vous sûr de vouloir promouvoir', name + ' au rang de revendeur');
    };

    // Updated delete handlers to match professional table pattern
    const handleDeleteSingleClient = (id: string) => {
        const clientToDelete = clients.find((c: any) => c._id === id);
        if (clientToDelete) {
            const clientFullName = `${clientToDelete.firstName} ${clientToDelete.lastName}`;
            handleOpenConfirmDialog(id, 'delete', t('clients.confirmDelete'), clientFullName);
        }
    };

    const handleDeleteSelectedClients = () => {
        const selectedIds = clients.filter((c: any) => selected.includes(`${c.firstName} ${c.lastName}`)).map((c: any) => c._id);
        if (selectedIds.length > 0) {
            handleOpenConfirmDialog(
                selectedIds,
                'deleteSelected',
                t('clients.confirmDelete'),
                t('clients.confirmDeleteMultiple', { count: selectedIds.length })
            );
        } else {
            enqueueSnackbar(t('clients.noSelection'), { variant: 'warning' });
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
            enqueueSnackbar(t('clients.rateUpdateError'), { variant: 'error' });
            return;
        }

        const totalDelta = currentRate - initialRate;
        if (Math.abs(totalDelta) !== 1) {
            enqueueSnackbar(t('clients.rateAdjustmentInfo'), { variant: 'warning' });
            return;
        }

        const operationDelta = totalDelta;

        try {
            await ReviewAPI.adjustUserRateByAdmin(clientToRateId, operationDelta);
            enqueueSnackbar(t('clients.rateUpdateSuccess'), { variant: 'success' });
            fetchClients();
            handleCloseRateDialog();
        } catch (e: any) {
            console.error("Failed to update rate:", e);
            enqueueSnackbar(e.response?.data?.message || t('clients.rateUpdateFailed'), { variant: 'error' });
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
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;
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
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                    padding: isMobile ? '8px' : '16px',
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

                            {/* Name cell */}
                            <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2}>
                                    <Typography variant="subtitle2" noWrap sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                        <Chip onClick={() => goToProfile(row)} label={clientFullName} component="a" href="#" clickable sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }} />
                                    </Typography>
                                </Stack>
                            </TableCell>

                            {/* Phone cell */}
                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>{phone}</TableCell>

                            {/* Verified cell */}
                            <TableCell align="left">
                                <Label variant="ghost" color={isVerified ? 'success' : 'error'} sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                    {sentenceCase(isVerified ? t('reseller.status.validAccount') : t('reseller.status.invalidAccount'))}
                                </Label>
                            </TableCell>

                            {/* Active cell */}
                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Label variant="ghost" color={isActive ? 'success' : 'error'} sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                    {sentenceCase(isActive ? t('clients.table.active') : t('clients.table.active'))}
                                </Label>
                            </TableCell>

                            {/* Banned cell */}
                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Label variant="ghost" color={isBanned ? 'error' : 'success'} sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                    {sentenceCase(isBanned ? t('clients.table.banned') : t('clients.table.banned'))}
                                </Label>
                            </TableCell>

                            {/* Rate cell */}
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

                            {/* Created date cell */}
                            <TableCell align="left" sx={{ display: isTablet ? 'none' : 'table-cell' }}>{new Date(createdAt).toDateString()}</TableCell>

                            {/* Actions cell */}
                            <TableCell align="right">
                                <ActionsMenu
                                    _id={_id}
                                    actions={[
                                        { label: t('clients.actions.adjustRate'), onClick: () => handleOpenRateDialog(_id, clientFullName, rate), icon: 'eva:edit-fill' },
                                        ...(row.type === 'CLIENT' ? [{ label: t('clients.actions.promote'), onClick: () => promoteToReseller(_id, clientFullName), icon: 'eva:star-outline' }] : []),
                                        ...(isActive
                                            ? [{ label: t('clients.actions.disable'), onClick: () => disableClient(_id, clientFullName), icon: 'mdi:user-block-outline' }]
                                            : [{ label: t('clients.actions.enable'), onClick: () => enableClient(_id, clientFullName), icon: 'mdi:user-check-outline' }]),
                                        ...(isBanned
                                            ? [{ label: t('clients.actions.unban'), onClick: () => unbanClient(_id, clientFullName), icon: 'eva:person-done-outline' }]
                                            : [{ label: t('clients.actions.ban'), onClick: () => banClient(_id, clientFullName), icon: 'eva:slash-outline' }]),
                                        ...(isVerified
                                            ? [{ label: t('clients.actions.unverify'), onClick: () => unverifyClient(_id, clientFullName), icon: 'eva:close-circle-outline' }]
                                            : [{ label: t('clients.actions.verify'), onClick: () => verifyClient(_id, clientFullName), icon: 'eva:checkmark-circle-outline' }]),
                                        { label: t('clients.actions.delete'), onClick: () => handleDeleteSingleClient(_id), icon: 'eva:trash-2-outline' },
                                    ]}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
                {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={COLUMNS.length + 1} /> {/* +1 for checkbox column */}
                    </TableRow>
                )}
            </TableBody>
        );
    };

    const totalClients = clients.length;
    const bannedClients = clients.filter(c => c.isBanned).length;
    const verifiedClients = clients.filter(c => c.isVerified).length;
    const activeClients = clients.filter(c => c.isActive).length;

    return (
        <Page title="Users - Clients">
            <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
                <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: theme.palette.info.dark,
                                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0)} 0%, ${alpha(theme.palette.info.dark, 0.24)} 100%)`
                            }}>
                                <PeopleAltIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant={isMobile ? "body2" : "h6"} color="textSecondary" sx={{ opacity: 0.72 }}>
                                    {t('clients.stats.total')}
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {totalClients}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: theme.palette.error.dark,
                                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.error.dark, 0)} 0%, ${alpha(theme.palette.error.dark, 0.24)} 100%)`
                            }}>
                                <GppBadIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant={isMobile ? "body2" : "h6"} color="textSecondary" sx={{ opacity: 0.72 }}>
                                    {t('clients.stats.banned')}
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {bannedClients}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: theme.palette.success.dark,
                                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0)} 0%, ${alpha(theme.palette.success.dark, 0.24)} 100%)`
                            }}>
                                <VerifiedUserIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant={isMobile ? "body2" : "h6"} color="textSecondary" sx={{ opacity: 0.72 }}>
                                    {t('clients.stats.verified')}
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {verifiedClients}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard>
                            <IconWrapperStyle sx={{
                                color: theme.palette.warning.dark,
                                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.warning.dark, 0)} 0%, ${alpha(theme.palette.warning.dark, 0.24)} 100%)`
                            }}>
                                <HowToRegIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconWrapperStyle>
                            <Box>
                                <Typography variant={isMobile ? "body2" : "h6"} color="textSecondary" sx={{ opacity: 0.72 }}>
                                    {t('clients.stats.active')}
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {activeClients}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                </Grid>

                {/* FIXED: Add UserListToolbar with proper props */}
                <UserListToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={setFilterName}
                    onDeleteSelected={handleDeleteSelectedClients}
                />

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
                        searchFields={['firstName', 'lastName', 'phone']}
                        numSelected={selected.length}
                        loading={false}
                        // REMOVED: onDeleteSelected and onDeleteSingle props that don't exist in MuiTableProps
                        // Delete functionality is now handled through UserListToolbar and ActionsMenu
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
                        {actionType === 'ban' ? t('clients.actions.ban') :
                         actionType === 'unban' ? t('clients.actions.unban') :
                         actionType === 'enable' ? t('clients.actions.enable') :
                         actionType === 'disable' ? t('clients.actions.disable') :
                         actionType === 'verify' ? t('clients.actions.verify') :
                         actionType === 'unverify' ? t('clients.actions.unverify') :
                         actionType === 'promote' ? t('clients.actions.promote') :
                         actionType === 'delete' ? t('clients.actions.delete') :
                         actionType === 'deleteSelected' ? t('clients.actions.delete') : ''}
                    </DialogTitle>
                    <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Typography gutterBottom sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
                            {confirmMessage} <Typography component="span" fontWeight="bold">{clientNameForDialog}</Typography>?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Button onClick={handleCloseConfirmDialog} color="inherit" size={isMobile ? 'small' : 'medium'}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleConfirmAction}
                            variant="contained"
                            color={actionType === 'ban' || actionType === 'delete' || actionType === 'deleteSelected' ? 'error' : 'primary'}
                            autoFocus
                            size={isMobile ? 'small' : 'medium'}
                        >
                            {t('common.confirm')}
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
                        {t('clients.rateAdjustment')}
                    </DialogTitle>
                    <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Typography gutterBottom sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
                            {t('clients.rateAdjustment')} <Typography component="span" fontWeight="bold">{clientNameForRateDialog}</Typography>:
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
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSaveRate} variant="contained" color="primary" size={isMobile ? 'small' : 'medium'}>
                            {t('common.save')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Page>
    );
}