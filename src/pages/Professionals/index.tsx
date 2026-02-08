import { sentenceCase } from 'change-case';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
    Fade,
    Slide,
    Zoom,
    Paper,
    Divider,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import { useSnackbar } from 'notistack';
import MuiTable from '../../components/Tables/MuiTable';
import ActionsMenu from '../../components/Tables/ActionsMenu';
import { useTheme, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';

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
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

import { UserAPI } from '@/api/user';
import { ReviewAPI } from '@/api/review';
import { IdentityAPI, UserDocuments, UserDocument } from '@/api/identity';
import { SubscriptionAPI } from '@/api/subscription';
import app from '@/config';
import { ChangeEvent, MouseEvent } from 'react';

// COLUMNS will be defined inside the component to use translation

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

// Enhanced Modal Styled Components
const AnimatedDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        animation: 'slideInUp 0.3s ease-out',
    },
    '@keyframes slideInUp': {
        '0%': {
            transform: 'translateY(50px)',
            opacity: 0,
        },
        '100%': {
            transform: 'translateY(0)',
            opacity: 1,
        },
    },
}));

const DocumentCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    height: '100%',
    borderRadius: 12,
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        '& .document-icon': {
            transform: 'scale(1.1) rotate(5deg)',
        },
        '& .document-button': {
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            transform: 'scale(1.05)',
        },
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    },
}));

const DocumentIconWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
    margin: '0 auto 16px',
    transition: 'all 0.3s ease',
    '& .document-icon': {
        fontSize: 32,
        color: theme.palette.primary.main,
        transition: 'all 0.3s ease',
    },
}));

const UserInfoCard = styled(Card)(({ theme }) => ({
    borderRadius: 12,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    position: 'relative',
    overflow: 'hidden',
    color: theme.palette.common.white,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    color: theme.palette.primary.contrastText,
    borderRadius: '16px 16px 0 0',
    padding: theme.spacing(3),
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 60,
        height: 4,
        background: alpha(theme.palette.primary.contrastText, 0.3),
        borderRadius: 2,
    },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.2)}, transparent)`,
        transition: 'left 0.5s',
    },
    '&:hover::before': {
        left: '100%',
    },
}));

// Helper function to get subscription plan color
const getSubscriptionPlanColor = (plan: string | null | undefined): { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning', bgColor: string } => {
    if (!plan) {
        return { color: 'default', bgColor: '#e0e0e0' };
    }
    
    const planUpper = plan.toUpperCase();
    
    // Color mapping for different subscription plans
    const colorMap: { [key: string]: { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning', bgColor: string } } = {
        'BASIC': { color: 'info', bgColor: '#2196f3' },
        'BASIQUE': { color: 'info', bgColor: '#2196f3' },
        'PREMIUM': { color: 'warning', bgColor: '#ff9800' },
        'PRO': { color: 'success', bgColor: '#4caf50' },
        'PROFESSIONAL': { color: 'success', bgColor: '#4caf50' },
        'PROFESSIONNEL': { color: 'success', bgColor: '#4caf50' },
        'ENTERPRISE': { color: 'primary', bgColor: '#9c27b0' },
        'BUSINESS': { color: 'primary', bgColor: '#9c27b0' },
        'GOLD': { color: 'warning', bgColor: '#ffc107' },
        'PLATINUM': { color: 'secondary', bgColor: '#607d8b' },
        'DIAMOND': { color: 'error', bgColor: '#f44336' },
        '6MOIS': { color: 'info', bgColor: '#0288d1' },
        '6 MOIS': { color: 'info', bgColor: '#0288d1' },
        '1AN': { color: 'primary', bgColor: '#7b1fa2' },
        '1 AN': { color: 'primary', bgColor: '#7b1fa2' },
    };
    
    // Check for exact match
    if (colorMap[planUpper]) {
        return colorMap[planUpper];
    }
    
    // Check for partial matches (e.g., "PREMIUM_PLUS" contains "PREMIUM")
    for (const [key, value] of Object.entries(colorMap)) {
        if (planUpper.includes(key)) {
            return value;
        }
    }
    
    // Default color for unknown plans
    return { color: 'default', bgColor: '#9e9e9e' };
};

const formatSubscriptionPlanLabel = (plan: string | null | undefined) => {
    const normalized = normalizeSubscriptionPlanValue(plan);
    if (!normalized) {
        return normalized;
    }

    const lower = normalized.toLowerCase();

    if (lower === '6mois') {
        return '6 mois';
    }
    if (lower === '1an') {
        return '1 an';
    }

    return normalized;
};

const normalizeSubscriptionPlanValue = (plan: any): string | null => {
    if (!plan) {
        return null;
    }

    if (typeof plan === 'string') {
        const trimmed = plan.trim();
        if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'aucun' || trimmed.toLowerCase() === 'none') {
            return null;
        }
        return trimmed;
    }

    if (typeof plan === 'object') {
        if (plan?.name) {
            return normalizeSubscriptionPlanValue(plan.name);
        }
        if (plan?.label) {
            return normalizeSubscriptionPlanValue(plan.label);
        }
        if (plan?.plan) {
            return normalizeSubscriptionPlanValue(plan.plan);
        }
    }

    return null;
};

export default function Professionals() {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const { enqueueSnackbar } = useSnackbar();

    const COLUMNS = [
        { id: 'firstName', label: t('professionals.name') || 'Nom', alignRight: false, searchable: true },
        { id: 'phone', label: t('common.phone'), alignRight: false, searchable: true },
        { id: 'entreprise', label: t('professionals.company') || 'Entreprise', alignRight: false, searchable: false },
        { id: 'secteur', label: t('professionals.sector') || 'Secteur', alignRight: false, searchable: false },
        { id: 'postOccupé', label: t('professionals.position') || 'Post occupé', alignRight: false, searchable: false },
        { id: 'promoCode', label: t('professionals.promoCode') || 'Code promo', alignRight: false, searchable: true },
        { id: 'isVerified', label: t('professionals.verified') || 'Vérifié', alignRight: false, searchable: false },
        { id: 'isCertified', label: t('professionals.certified') || 'Certifié', alignRight: false, searchable: false },
        { id: 'isActive', label: t('professionals.active') || 'Activé', alignRight: false, searchable: false },
        { id: 'isBanned', label: t('professionals.banned') || 'Banni', alignRight: false, searchable: false },
        { id: 'isRecommended', label: t('professionals.recommended') || 'Recommandé', alignRight: false, searchable: false },
        { id: 'rate', label: t('professionals.rate') || 'Rate', alignRight: false, searchable: false },
        { id: 'createdAt', label: t('users.createdAt') || 'Créé Le', alignRight: false, searchable: false },
        { id: '', searchable: false },
    ];
    const navigate = useNavigate();
    const location = useLocation();
    const scrollToUserIdRef = useRef<string | null>(null);
    const hasScrolledRef = useRef(false);

    const [professionals, setProfessionals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Initialize state from URL params if available
    // Use a ref to track if we've initialized to prevent resetting on remount
    const initialSearchParams = new URLSearchParams(location.search);
    const [page, setPage] = useState(() => {
        const pageParam = initialSearchParams.get('page');
        const pageNum = pageParam ? parseInt(pageParam, 10) : 0;
        console.log('Initializing page state from URL:', pageNum, 'URL:', location.search);
        return isNaN(pageNum) ? 0 : pageNum;
    });
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [selected, setSelected] = useState<string[]>([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState(() => {
        return initialSearchParams.get('filterName') || '';
    });
    const [rowsPerPage, setRowsPerPage] = useState(() => {
        const rowsParam = initialSearchParams.get('rowsPerPage');
        return rowsParam ? parseInt(rowsParam, 10) : 10;
    });
    const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>(() => {
        const filterParam = initialSearchParams.get('verifiedFilter');
        return (filterParam === 'verified' || filterParam === 'unverified') ? filterParam : 'all';
    });

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

    // Documents modal state
    const [openDocumentsDialog, setOpenDocumentsDialog] = useState(false);
    const [userDocuments, setUserDocuments] = useState<UserDocuments | null>(null);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [professionalNameForDocumentsDialog, setProfessionalNameForDocumentsDialog] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');
    const [updatingDocument, setUpdatingDocument] = useState<string | null>(null);

    // Loading states for status toggles
    const [togglingStatus, setTogglingStatus] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        fetchProfessionals();
        return () => { };
    }, []);

    // Sync state with URL params when they change (e.g., when returning from details page)
    // Use useLayoutEffect to ensure state is updated before render
    useLayoutEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const pageParam = searchParams.get('page');
        const rowsPerPageParam = searchParams.get('rowsPerPage');
        const filterNameParam = searchParams.get('filterName');
        const verifiedFilterParam = searchParams.get('verifiedFilter');

        // Always update page from URL - force update to ensure correct page is displayed
        if (pageParam !== null) {
            const pageNum = parseInt(pageParam, 10);
            if (!isNaN(pageNum) && pageNum >= 0) {
                // Force update by always calling setPage, even if value seems the same
                // This ensures the table component receives the correct page prop
                setPage(prevPage => {
                    if (prevPage !== pageNum) {
                        console.log('useLayoutEffect: Updating page from', prevPage, 'to', pageNum);
                        return pageNum;
                    }
                    return prevPage;
                });
            }
        }

        // Always update rowsPerPage from URL
        if (rowsPerPageParam !== null) {
            const rowsNum = parseInt(rowsPerPageParam, 10);
            if (!isNaN(rowsNum) && rowsNum > 0) {
                setRowsPerPage(prevRows => {
                    if (prevRows !== rowsNum) {
                        return rowsNum;
                    }
                    return prevRows;
                });
            }
        }

        // Update filterName
        if (filterNameParam !== null && filterNameParam !== filterName) {
            setFilterName(filterNameParam);
        } else if (filterNameParam === null && filterName !== '') {
            setFilterName('');
        }

        // Update verifiedFilter
        if (verifiedFilterParam === 'verified' || verifiedFilterParam === 'unverified') {
            if (verifiedFilter !== verifiedFilterParam) {
                setVerifiedFilter(verifiedFilterParam);
            }
        } else if (verifiedFilterParam === null && verifiedFilter !== 'all') {
            setVerifiedFilter('all');
        }
    }, [location.search]);

    // Check for returnUserId in URL and set it up for scrolling
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const returnUserId = searchParams.get('returnUserId');
        if (returnUserId) {
            scrollToUserIdRef.current = returnUserId;
            hasScrolledRef.current = false;
        } else {
            scrollToUserIdRef.current = null;
            hasScrolledRef.current = false;
        }
    }, [location.search]);

    // Scroll to the user row when returning from details page
    useEffect(() => {
        if (!loading && professionals.length > 0 && scrollToUserIdRef.current && !hasScrolledRef.current) {
            // Wait for table to render on the correct page - use a longer delay to ensure pagination is applied
            const timer = setTimeout(() => {
                const userId = scrollToUserIdRef.current;
                if (userId) {
                    const rowElement = document.getElementById(`professional-row-${userId}`);
                    if (rowElement) {
                        rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Highlight the row briefly
                        rowElement.style.backgroundColor = 'rgba(25, 118, 210, 0.08)';
                        setTimeout(() => {
                            rowElement.style.backgroundColor = '';
                        }, 2000);
                        console.log('Scrolled to user row:', userId);
                        hasScrolledRef.current = true;
                        // Remove returnUserId from URL after scrolling
                        const params = new URLSearchParams(location.search);
                        params.delete('returnUserId');
                        navigate({ search: params.toString() }, { replace: true });
                    } else {
                        console.warn('Could not find row element for user:', userId, '- row may be on a different page');
                        // If row not found, it might be on a different page - try again after a longer delay
                        const retryTimer = setTimeout(() => {
                            const retryElement = document.getElementById(`professional-row-${userId}`);
                            if (retryElement) {
                                retryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                retryElement.style.backgroundColor = 'rgba(25, 118, 210, 0.08)';
                                setTimeout(() => {
                                    retryElement.style.backgroundColor = '';
                                }, 2000);
                                hasScrolledRef.current = true;
                                const params = new URLSearchParams(location.search);
                                params.delete('returnUserId');
                                navigate({ search: params.toString() }, { replace: true });
                            }
                        }, 1000);
                        return () => clearTimeout(retryTimer);
                    }
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loading, professionals, page, navigate, location.search]);

    const fetchProfessionals = async () => {
        setLoading(true);
        console.log('🔄 Fetching ALL professionals (verified and unverified)...');
        try {
            const [usersResponse, subscriptionsResponse] = await Promise.all([
                UserAPI.getProfessionals(),
                SubscriptionAPI.getAllSubscriptions().catch((error) => {
                    console.warn('⚠️ Failed to fetch subscriptions list, continuing without them.', error);
                    return [];
                })
            ]);

            console.log("✅ Fetched professionals response:", usersResponse);
            console.log("📊 Response type:", Array.isArray(usersResponse) ? 'array' : typeof usersResponse);
            console.log("📊 Response length:", Array.isArray(usersResponse) ? usersResponse.length : 'N/A');
                
                // Handle different response structures
            let professionalsList = usersResponse;
            if (usersResponse && !Array.isArray(usersResponse)) {
                    // If response is an object, try to extract the array
                if (usersResponse.users && Array.isArray(usersResponse.users)) {
                    professionalsList = usersResponse.users;
                } else if (usersResponse.data && Array.isArray(usersResponse.data)) {
                    professionalsList = usersResponse.data;
                    } else {
                    console.warn("⚠️ Unexpected response structure:", usersResponse);
                        professionalsList = [];
                    }
                }
                
            // Build subscription map keyed by userId -> latest active plan
            const subscriptionsArray = Array.isArray(subscriptionsResponse)
                ? subscriptionsResponse
                : (subscriptionsResponse?.data && Array.isArray(subscriptionsResponse.data)
                    ? subscriptionsResponse.data
                    : []);

            const subscriptionByUser: Record<string, { planName: string; expiresAt?: string; isActive?: boolean }> = {};

            subscriptionsArray.forEach((subscription: any) => {
                const rawUser =
                    subscription?.userId ??
                    subscription?.user?._id ??
                    subscription?.user?.id ??
                    subscription?.user ??
                    subscription?.userID;
                const userId = typeof rawUser === 'object' && rawUser?._id ? rawUser._id?.toString?.() : rawUser?.toString?.();

                const planNameCandidate =
                    subscription?.planName ??
                    subscription?.plan?.name ??
                    subscription?.plan ??
                    subscription?.subscriptionPlan;

                const planName = normalizeSubscriptionPlanValue(planNameCandidate);

                if (!userId || !planName) {
                    return;
                }

                const expiresAt = subscription?.endDate || subscription?.expiresAt;
                const existing = subscriptionByUser[userId];

                if (!existing) {
                    subscriptionByUser[userId] = {
                        planName,
                        expiresAt,
                        isActive: subscription?.isActive ?? (expiresAt ? new Date(expiresAt) > new Date() : undefined),
                    };
                    return;
                }

                if (expiresAt) {
                    const existingDate = existing.expiresAt ? new Date(existing.expiresAt).getTime() : 0;
                    const newDate = new Date(expiresAt).getTime();
                    if (newDate > existingDate) {
                        subscriptionByUser[userId] = {
                            planName,
                            expiresAt,
                            isActive: subscription?.isActive ?? (new Date(expiresAt) > new Date()),
                        };
                    }
                }
            });

            const professionalsWithPlans = await Promise.all(
                professionalsList.map(async (professional: any) => {
                    const normalizedId =
                        professional?._id ??
                        professional?.id ??
                        professional?.userId ??
                        professional?.user?._id ??
                        professional?.userId?._id;
                    const userId = normalizedId?.toString?.();

                    const directPlan = normalizeSubscriptionPlanValue(professional?.subscriptionPlan);
                    if (directPlan) {
                        return {
                            ...professional,
                            subscriptionPlan: formatSubscriptionPlanLabel(directPlan),
                        };
                    }

                    if (userId) {
                        const subscriptionInfo = subscriptionByUser[userId];
                        if (subscriptionInfo?.planName) {
                            return {
                                ...professional,
                                subscriptionPlan: formatSubscriptionPlanLabel(subscriptionInfo.planName),
                                subscriptionPlanExpiresAt: subscriptionInfo.expiresAt,
                                subscriptionPlanIsActive: subscriptionInfo.isActive,
                            };
                        }
                    }

                    if (!userId) {
                        return professional;
                    }

                    try {
                        const userDetails = await UserAPI.findById(userId);
                        const userPayload = userDetails?.user ?? userDetails?.data ?? userDetails;
                        const fallbackPlan =
                            normalizeSubscriptionPlanValue(userPayload?.subscriptionPlan) ??
                            normalizeSubscriptionPlanValue(userDetails?.subscriptionPlan) ??
                            normalizeSubscriptionPlanValue(userDetails?.data?.subscriptionPlan);

                        if (fallbackPlan) {
                            return {
                                ...professional,
                                subscriptionPlan: formatSubscriptionPlanLabel(fallbackPlan),
                            };
                        }
                    } catch (error) {
                        console.warn(`⚠️ Unable to fetch full user details for subscription plan of user ${userId}`, error);
                    }

                    return professional;
                })
            );
            
            console.log(`📋 Total professionals to display: ${professionalsWithPlans.length}`);
            const verifiedCount = professionalsWithPlans.filter((p: any) => p?.isVerified === true).length;
            const unverifiedCount = professionalsWithPlans.length - verifiedCount;
                console.log(`✅ Verified: ${verifiedCount}, ❌ Unverified: ${unverifiedCount}`);
                
            setProfessionals(professionalsWithPlans);
                enqueueSnackbar(
                `${professionalsWithPlans.length} professionnel${professionalsWithPlans.length > 1 ? 's' : ''} chargé${professionalsWithPlans.length > 1 ? 's' : ''} avec succès (${verifiedCount} vérifié${verifiedCount > 1 ? 's' : ''}, ${unverifiedCount} non vérifié${unverifiedCount > 1 ? 's' : ''}).`, 
                    { variant: 'success' }
                );
        } catch (e: any) {
                console.error("❌ Failed to load professionals:", e);
                console.error("❌ Error details:", e.response?.data || e.message);
                enqueueSnackbar('Chargement des professionnels échoué.', { variant: 'error' });
        } finally {
                setLoading(false);
        }
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

    const certifyProfessional = async (id: string, name: string) => {
        try {
            const documents = await IdentityAPI.getUserDocuments(id);
            if (!documents?._id) {
                enqueueSnackbar(`Impossible de certifier ${name} : documents d'identité introuvables.`, { variant: 'warning' });
                return;
            }

            await IdentityAPI.certifyIdentity(documents._id);
            enqueueSnackbar(`${name} a été certifié avec succès.`, { variant: 'success' });
            fetchProfessionals();
        } catch (error: any) {
            console.error('❌ Failed to certify professional:', error);
            const message = error?.response?.data?.message || 'Échec de la certification du professionnel.';
            enqueueSnackbar(message, { variant: 'error' });
        }
    };

    const deleteProfessional = (id: string) => {
        const professional = professionals.find(p => p._id === id);
        if (professional) {
            handleOpenConfirmDialog(id, `${professional.firstName} ${professional.lastName}`, 'delete', `Êtes-vous sûr de vouloir supprimer définitivement le compte de`);
        } else {
            console.error(`Professional with ID ${id} not found.`);
        }
    };

    // Toggle handler functions for direct label clicks
    const toggleVerified = async (id: string, currentValue: boolean) => {
        const statusKey = `verified-${id}`;
        setTogglingStatus(prev => ({ ...prev, [statusKey]: true }));
        try {
            await UserAPI.verifyUser(id, !currentValue);
            enqueueSnackbar(`Compte ${!currentValue ? 'vérifié' : 'non vérifié'} avec succès.`, { variant: 'success' });
            fetchProfessionals();
        } catch (error: any) {
            console.error('Failed to toggle verified status:', error);
            enqueueSnackbar(error?.response?.data?.message || 'Échec de la modification du statut.', { variant: 'error' });
        } finally {
            setTogglingStatus(prev => ({ ...prev, [statusKey]: false }));
        }
    };

    const toggleCertified = async (id: string, name: string, currentValue: boolean) => {
        const statusKey = `certified-${id}`;
        setTogglingStatus(prev => ({ ...prev, [statusKey]: true }));
        try {
            if (!currentValue) {
                // Certify
                const documents = await IdentityAPI.getUserDocuments(id);
                if (!documents?._id) {
                    enqueueSnackbar(`Impossible de certifier ${name} : documents d'identité introuvables.`, { variant: 'warning' });
                    setTogglingStatus(prev => ({ ...prev, [statusKey]: false }));
                    return;
                }
                await IdentityAPI.certifyIdentity(documents._id);
                enqueueSnackbar(`${name} a été certifié avec succès.`, { variant: 'success' });
            } else {
                // Uncertify
                await UserAPI.setUserCertified(id, false);
                enqueueSnackbar(`${name} a été décertifié avec succès.`, { variant: 'success' });
            }
            fetchProfessionals();
        } catch (error: any) {
            console.error('Failed to toggle certified status:', error);
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
            fetchProfessionals();
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
            fetchProfessionals();
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
            fetchProfessionals();
        } catch (error: any) {
            console.error('Failed to toggle recommended status:', error);
            enqueueSnackbar(error?.response?.data?.message || 'Échec de la modification du statut.', { variant: 'error' });
        } finally {
            setTogglingStatus(prev => ({ ...prev, [statusKey]: false }));
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
        // Preserve pagination state in URL - always include page and rowsPerPage
        // Note: page is 0-indexed in Material-UI tables (page 0 = rows 1-10, page 1 = rows 11-20, page 2 = rows 21-30)
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('rowsPerPage', rowsPerPage.toString());
        if (filterName) params.set('filterName', filterName);
        if (verifiedFilter !== 'all') params.set('verifiedFilter', verifiedFilter);
        // Also save the user ID so we can potentially scroll to it later
        params.set('returnUserId', user._id);
        console.log('Navigating to profile - saving state:', { 
            page, 
            rowsPerPage, 
            filterName, 
            verifiedFilter,
            url: `/dashboard/users/professionals/${user._id}?${params.toString()}`
        });
        navigate(`/dashboard/users/professionals/${user._id}?${params.toString()}`);
    };

    const handleViewDocuments = async (userId: string, professionalName: string) => {
        setCurrentUserId(userId);
        setProfessionalNameForDocumentsDialog(professionalName);
        setOpenDocumentsDialog(true);
        setDocumentsLoading(true);
        setUserDocuments(null);

        try {
            const documents = await IdentityAPI.getUserDocuments(userId);
            setUserDocuments(documents);
        } catch (error) {
            console.error('Failed to fetch user documents:', error);
            enqueueSnackbar('Erreur lors du chargement des documents.', { variant: 'error' });
        } finally {
            setDocumentsLoading(false);
        }
    };

    const handleDeleteDocument = async (documentField: string) => {
        if (!userDocuments?._id) return;
        
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document?')) {
            setUpdatingDocument(documentField);
            try {
                await IdentityAPI.deleteDocument(userDocuments._id, documentField);
                enqueueSnackbar('Document supprimé avec succès', { variant: 'success' });
                // Reload documents
                const documents = await IdentityAPI.getUserDocuments(currentUserId);
                setUserDocuments(documents);
            } catch (error) {
                console.error('Failed to delete document:', error);
                enqueueSnackbar('Erreur lors de la suppression du document', { variant: 'error' });
            } finally {
                setUpdatingDocument(null);
            }
        }
    };

    const handleUpdateDocument = async (documentField: string) => {
        if (!userDocuments?._id) return;
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,application/pdf';
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                enqueueSnackbar('Fichier trop volumineux. Maximum: 5MB', { variant: 'error' });
                return;
            }

            setUpdatingDocument(documentField);
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('field', documentField);
                
                await IdentityAPI.updateDocumentByIdentity(userDocuments._id, documentField, file);
                enqueueSnackbar('Document modifié avec succès', { variant: 'success' });
                // Reload documents
                const documents = await IdentityAPI.getUserDocuments(currentUserId);
                setUserDocuments(documents);
            } catch (error) {
                console.error('Failed to update document:', error);
                enqueueSnackbar('Erreur lors de la modification du document', { variant: 'error' });
            } finally {
                setUpdatingDocument(null);
            }
        };
        input.click();
    };

    const TableBodyComponent = ({ data = [], selected, setSelected, onDeleteSingle }: { data: any[], selected: string[], setSelected: (selected: string[]) => void, onDeleteSingle?: (id: string) => void }) => {
        // data is already paginated by MuiTable
        const displayedData = data;

        if (loading) {
            return (
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 4 }}>
                            <Typography>Chargement des professionnels...</Typography>
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
                                    Aucun professionnel trouvé
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
                                    Il n'y a pas encore de professionnels enregistrés dans le système.
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
                    const { _id, firstName, lastName, phone, entreprise, postOccupé, promoCode, isVerified, isCertified, isActive, isBanned, isRecommended, createdAt, rate, category, productCategory } = row;
                    const normalizedPromoCode = promoCode || row?.promo_code || row?.promotionCode || row?.promotion_code;

                    const professionalFullName = `${firstName} ${lastName}`;
                    const isItemSelected = selected.indexOf(professionalFullName) !== -1;
                    
                    // Get subscription plan color

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
                            id={`professional-row-${_id}`}
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

                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                    {entreprise || 'N/A'}
                                </Typography>
                            </TableCell>

                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                    {row.secteur || 'N/A'}
                                </Typography>
                            </TableCell>

                            <TableCell align="left" sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                    {postOccupé || 'N/A'}
                                </Typography>
                            </TableCell>

                            <TableCell align="left">
                                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                    {normalizedPromoCode || 'N/A'}
                                </Typography>
                            </TableCell>

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
                                    <Label 
                                        variant="ghost" 
                                        color={isVerified ? 'success' : 'error'} 
                                        sx={{ 
                                            fontSize: isMobile ? '0.7rem' : '0.75rem'
                                        }}
                                    >
                                        {togglingStatus[`verified-${_id}`] ? '...' : sentenceCase(isVerified ? "Compte Valide" : 'Compte Non Valide')}
                                    </Label>
                                </Box>
                            </TableCell>

                            <TableCell align="left">
                                <Box
                                    onClick={() => !togglingStatus[`certified-${_id}`] && toggleCertified(_id, professionalFullName, isCertified)}
                                    sx={{
                                        cursor: togglingStatus[`certified-${_id}`] ? 'wait' : 'pointer',
                                        opacity: togglingStatus[`certified-${_id}`] ? 0.6 : 1,
                                        pointerEvents: togglingStatus[`certified-${_id}`] ? 'none' : 'auto',
                                        display: 'inline-block'
                                    }}
                                >
                                    <Label 
                                        variant="ghost" 
                                        color={isCertified ? 'primary' : 'default'} 
                                        sx={{ 
                                            fontSize: isMobile ? '0.7rem' : '0.75rem'
                                        }}
                                    >
                                        {togglingStatus[`certified-${_id}`] ? '...' : sentenceCase(isCertified ? 'Certifié' : 'Non Certifié')}
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
                                    <Label 
                                        variant="ghost" 
                                        color={isActive ? 'success' : 'error'} 
                                        sx={{ 
                                            fontSize: isMobile ? '0.7rem' : '0.75rem'
                                        }}
                                    >
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
                                    <Label 
                                        variant="ghost" 
                                        color={isBanned ? 'error' : 'success'} 
                                        sx={{ 
                                            fontSize: isMobile ? '0.7rem' : '0.75rem'
                                        }}
                                    >
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
                                        onClick={() => handleOpenRateDialog(_id, professionalFullName, rate)}
                                        sx={{
                                            cursor: 'pointer',
                                            display: 'inline-block'
                                        }}
                                    >
                                        <Label 
                                            variant="ghost" 
                                            color={rateColor} 
                                            sx={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                fontSize: isMobile ? '0.7rem' : '0.75rem'
                                            }}
                                        >
                                            <StarIcon sx={{ fontSize: isMobile ? 14 : 16, mr: 0.5 }} />
                                            {rate.toFixed(1)}
                                        </Label>
                                    </Box>
                                ) : (
                                    <Box
                                        onClick={() => handleOpenRateDialog(_id, professionalFullName, undefined)}
                                        sx={{
                                            cursor: 'pointer',
                                            display: 'inline-block'
                                        }}
                                    >
                                        <Label 
                                            variant="ghost" 
                                            color="info" 
                                            sx={{ 
                                                fontSize: isMobile ? '0.7rem' : '0.75rem'
                                            }}
                                        >
                                            N/A
                                        </Label>
                                    </Box>
                                )}
                            </TableCell>

                            <TableCell align="left" sx={{ display: isTablet ? 'none' : 'table-cell' }}>{new Date(createdAt).toDateString()}</TableCell>

                            <TableCell align="right">
                                <ActionsMenu
                                    _id={_id}
                                    actions={[
                                        { label: 'Voir Documents', onClick: () => handleViewDocuments(_id, professionalFullName), icon: 'eva:file-text-outline', color: 'info' },
                                        { label: 'Supprimer', onClick: () => deleteProfessional(_id), icon: 'eva:trash-2-outline', color: 'error' }
                                    ]}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
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
                {/* Info Alert - Updated message */}
                <Alert 
                    severity="info" 
                    sx={{ mb: 3 }}
                    icon={<InfoIcon />}
                >
                    {t('professionals.infoMessage') || 'Cette page affiche tous les professionnels (vérifiés et non vérifiés). Utilisez les filtres ci-dessous pour affiner votre recherche.'}
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
                                    {t('professionals.total') || 'Total Professionnels'}
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
                                    {t('professionals.verified') || 'Comptes Validés'}
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
                                    {t('professionals.active') || 'Professionnels Actifs'}
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
                                    {t('professionals.recommended') || 'Recommandés'}
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
                                    {t('professionals.banned') || 'Professionnels Bannis'}
                                </Typography>
                                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                                    {bannedProfessionals}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                </Grid>

                {/* Verified Filter Toggle */}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {t('professionals.filterByVerification') || 'Filtrer par vérification'}:
                    </Typography>
                    <ToggleButtonGroup
                        value={verifiedFilter}
                        exclusive
                        onChange={(event, newValue) => {
                            if (newValue !== null && newValue !== verifiedFilter) {
                                // Only reset page if filter is actually changing (not when restoring from URL)
                                setVerifiedFilter(newValue);
                                setPage(0); // Reset to first page when filter changes
                                // Update URL params when filter changes
                                const params = new URLSearchParams(location.search);
                                params.delete('page');
                                if (newValue === 'all') {
                                    params.delete('verifiedFilter');
                                } else {
                                    params.set('verifiedFilter', newValue);
                                }
                                navigate({ search: params.toString() }, { replace: true });
                            }
                        }}
                        size="small"
                        sx={{
                            '& .MuiToggleButton-root': {
                                px: 2,
                                py: 0.75,
                                fontSize: '0.875rem',
                                textTransform: 'none',
                                borderColor: 'divider',
                                '&.Mui-selected': {
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark,
                                    },
                                },
                            },
                        }}
                    >
                        <ToggleButton value="all">
                            {t('professionals.all') || 'Tous'} ({professionals.length})
                        </ToggleButton>
                        <ToggleButton value="verified">
                            {t('professionals.verified') || 'Vérifiés'} ({professionals.filter((p: any) => p.isVerified).length})
                        </ToggleButton>
                        <ToggleButton value="unverified">
                            {t('professionals.unverified') || 'Non vérifiés'} ({professionals.filter((p: any) => !p.isVerified).length})
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {professionals && (() => {
                    // Filter professionals by verification status first
                    let filteredByVerification = professionals;
                    if (verifiedFilter === 'verified') {
                        filteredByVerification = professionals.filter((p: any) => p.isVerified === true);
                    } else if (verifiedFilter === 'unverified') {
                        filteredByVerification = professionals.filter((p: any) => p.isVerified !== true);
                    }

                    // Calculate numSelected based on filtered data only
                    // This ensures the checkbox state reflects only the filtered items
                    const filteredSelectedCount = filteredByVerification.filter((p: any) => 
                        selected.includes(`${p.firstName} ${p.lastName}`)
                    ).length;

                    // Get page from URL params to ensure we're always in sync
                    const urlSearchParams = new URLSearchParams(location.search);
                    const urlPageParam = urlSearchParams.get('page');
                    const urlPage = urlPageParam ? parseInt(urlPageParam, 10) : page;
                    const displayPage = !isNaN(urlPage) && urlPage >= 0 ? urlPage : page;
                    
                    // If URL has different page than state, update state
                    if (displayPage !== page) {
                        console.log('Page mismatch detected - URL page:', displayPage, 'State page:', page, 'Updating state...');
                        setPage(displayPage);
                    }
                    
                    console.log('Rendering MuiTable - URL page:', displayPage, 'State page:', page, 'Using:', displayPage);
                    
                    return (
                    <MuiTable
                            key={`table-${displayPage}-${rowsPerPage}-${verifiedFilter}`} // Force re-render when page/rowsPerPage/filter changes
                            data={filteredByVerification}
                        columns={COLUMNS}
                        page={displayPage}
                        setPage={(newPage) => {
                            console.log('MuiTable setPage called with:', newPage, 'current displayPage:', displayPage);
                            setPage(newPage);
                            // Update URL params when page changes - always include page for consistency
                            const params = new URLSearchParams(location.search);
                            params.set('page', newPage.toString());
                            navigate({ search: params.toString() }, { replace: true });
                        }}
                        order={order}
                        setOrder={setOrder}
                        orderBy={orderBy}
                        setOrderBy={setOrderBy}
                        selected={selected}
                        setSelected={setSelected}
                        filterName={filterName}
                        setFilterName={(newFilter) => {
                            setFilterName(newFilter);
                            // Update URL params when filter changes
                            const params = new URLSearchParams(location.search);
                            params.delete('page'); // Reset to first page when filter changes
                            if (newFilter) {
                                params.set('filterName', newFilter);
                            } else {
                                params.delete('filterName');
                            }
                            navigate({ search: params.toString() }, { replace: true });
                        }}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={(newRowsPerPage) => {
                            setRowsPerPage(newRowsPerPage);
                            // Update URL params when rows per page changes
                            const params = new URLSearchParams(location.search);
                            params.delete('page'); // Reset to first page when rows per page changes
                            if (newRowsPerPage === 10) {
                                params.delete('rowsPerPage');
                            } else {
                                params.set('rowsPerPage', newRowsPerPage.toString());
                            }
                            navigate({ search: params.toString() }, { replace: true });
                        }}
                        TableBodyComponent={TableBodyComponent}
                        numSelected={filteredSelectedCount}
                        onDeleteSelected={handleDeleteSelected}
                        loading={loading}
                        getRowId={(row) => `${row.firstName} ${row.lastName}`}
                    />
                    );
                })()}
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

            {/* Enhanced Documents Modal */}
            <AnimatedDialog
                open={openDocumentsDialog}
                onClose={() => setOpenDocumentsDialog(false)}
                maxWidth="lg"
                fullWidth
                fullScreen={isMobile}
            >
                <StyledDialogTitle>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ color: 'inherit' }}>
                        <Fade in={true} timeout={500}>
                            <DescriptionIcon sx={{ fontSize: 28 }} />
                        </Fade>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            Documents de {professionalNameForDocumentsDialog}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton
                            onClick={() => setOpenDocumentsDialog(false)}
                            sx={{ 
                                color: 'inherit',
                                '&:hover': { 
                                    backgroundColor: alpha('#fff', 0.1),
                                    transform: 'rotate(90deg)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </StyledDialogTitle>
                
                <DialogContent sx={{ p: { xs: 2, sm: 3 }, background: alpha(theme.palette.background.paper, 0.5) }}>
                    {documentsLoading ? (
                        <Fade in={documentsLoading} timeout={300}>
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                py: 6,
                                textAlign: 'center'
                            }}>
                                <Zoom in={true} timeout={600}>
                                    <Box sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3,
                                        animation: 'pulse 2s infinite',
                                        '@keyframes pulse': {
                                            '0%': { transform: 'scale(1)' },
                                            '50%': { transform: 'scale(1.1)' },
                                            '100%': { transform: 'scale(1)' },
                                        },
                                    }}>
                                        <DescriptionIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                        </Box>
                                </Zoom>
                                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    Chargement des documents...
                                </Typography>
                            </Box>
                        </Fade>
                    ) : userDocuments ? (
                        <Fade in={!documentsLoading} timeout={500}>
                        <Grid container spacing={3}>
                                {/* Enhanced User Info */}
                            <Grid item xs={12}>
                                    <UserInfoCard sx={{ p: 3, mb: 3 }}>
                                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                            <PersonIcon sx={{ color: alpha(theme.palette.common.white, 0.9), fontSize: 24 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: alpha(theme.palette.common.white, 0.95) }}>
                                                Informations du professionnel
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.common.white, 0.3) }} />
                                        <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <PersonIcon sx={{ color: alpha(theme.palette.common.white, 0.8), fontSize: 20 }} />
                                                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9) }}>
                                                        <strong>Nom:</strong> {userDocuments.user.firstName} {userDocuments.user.lastName}
                                            </Typography>
                                                </Stack>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <EmailIcon sx={{ color: alpha(theme.palette.common.white, 0.8), fontSize: 20 }} />
                                                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9) }}>
                                                        <strong>Email:</strong> {userDocuments.user.email}
                                            </Typography>
                                                </Stack>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <CheckCircleIcon sx={{ 
                                                        color: userDocuments.status === 'DONE' ? theme.palette.success.main : theme.palette.warning.main, 
                                                        fontSize: 20 
                                                    }} />
                                                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9) }}>
                                                        <strong>Statut:</strong> 
                                                        <Chip 
                                                            label={userDocuments.status} 
                                                            size="small" 
                                                            color={userDocuments.status === 'DONE' ? 'success' : 'warning'}
                                                            sx={{ ml: 1 }}
                                                        />
                                            </Typography>
                                                </Stack>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <CalendarTodayIcon sx={{ color: alpha(theme.palette.common.white, 0.8), fontSize: 20 }} />
                                                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9) }}>
                                                        <strong>Soumis le:</strong> {new Date(userDocuments.createdAt).toLocaleDateString()}
                                            </Typography>
                                                </Stack>
                                        </Grid>
                                    </Grid>
                                    </UserInfoCard>
                            </Grid>

                                {/* Enhanced Documents Grid */}
                                {Object.entries(userDocuments).map(([key, value], index) => {
                                if (key === '_id' || key === 'user' || key === 'status' || key === 'createdAt' || key === 'updatedAt' || !value || typeof value !== 'object' || !('url' in value)) {
                                    return null;
                                }

                                const document = value as any;
                                const documentName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                                return (
                                    <Grid item xs={12} sm={6} md={4} key={key}>
                                            <Zoom in={true} timeout={300 + index * 100}>
                                                <DocumentCard sx={{ p: 3, height: '100%' }}>
                                                    <DocumentIconWrapper>
                                                        <DescriptionIcon className="document-icon" />
                                                    </DocumentIconWrapper>
                                                    
                                                    <Typography 
                                                        variant="h6" 
                                                        gutterBottom 
                                                        sx={{ 
                                                            textAlign: 'center',
                                                            fontWeight: 600,
                                                            color: theme.palette.text.primary,
                                                            mb: 1
                                                        }}
                                                    >
                                                {documentName}
                                            </Typography>
                                                    
                                                    <Typography 
                                                        variant="body2" 
                                                        color="text.secondary" 
                                                        sx={{ 
                                                            mb: 3, 
                                                            textAlign: 'center',
                                                            wordBreak: 'break-word',
                                                            minHeight: '2.5em',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                {document.originalname}
                                            </Typography>
                                                    
                                                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                                                        <AnimatedButton
                                                            variant="contained"
                                                            className="document-button"
                                                            onClick={() => {
                                                                const baseUrl = app.baseURL.endsWith('/') ? app.baseURL.slice(0, -1) : app.baseURL;
                                                                const documentUrl = document.url.startsWith('/') ? document.url : `/${document.url}`;
                                                                window.open(`${baseUrl}${documentUrl}`, '_blank');
                                                            }}
                                                            startIcon={<VisibilityIcon />}
                                                            sx={{
                                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                                                color: 'white',
                                                                flex: 1,
                                                                '&:hover': {
                                                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                                                                },
                                                            }}
                                                        >
                                                            Voir
                                                        </AnimatedButton>
                                                        <AnimatedButton
                                                            variant="contained"
                                                            className="document-button"
                                                            onClick={() => handleUpdateDocument(key)}
                                                            disabled={updatingDocument === key}
                                                            startIcon={<RefreshIcon />}
                                                            sx={{
                                                                background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                                                                color: 'white',
                                                                flex: 1,
                                                                '&:hover': {
                                                                    background: `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, #e65100 100%)`,
                                                                },
                                                                '&:disabled': {
                                                                    background: alpha(theme.palette.warning.main, 0.5),
                                                                },
                                                            }}
                                                        >
                                                            {updatingDocument === key ? '...' : 'Modifier'}
                                                        </AnimatedButton>
                                                        <AnimatedButton
                                                            variant="contained"
                                                            className="document-button"
                                                            onClick={() => handleDeleteDocument(key)}
                                                            disabled={updatingDocument === key}
                                                            startIcon={<DeleteIcon />}
                                                            sx={{
                                                                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                                                                color: 'white',
                                                                flex: 1,
                                                                '&:hover': {
                                                                    background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, #b71c1c 100%)`,
                                                                },
                                                                '&:disabled': {
                                                                    background: alpha(theme.palette.error.main, 0.5),
                                                                },
                                                            }}
                                                        >
                                                            {updatingDocument === key ? '...' : 'Supprimer'}
                                                        </AnimatedButton>
                                                    </Stack>
                                                </DocumentCard>
                                            </Zoom>
                                    </Grid>
                                );
                            })}

                                {/* Enhanced No documents message */}
                            {Object.entries(userDocuments).filter(([key, value]) => 
                                key !== '_id' && key !== 'user' && key !== 'status' && key !== 'createdAt' && key !== 'updatedAt' && 
                                value && typeof value === 'object' && 'url' in value
                            ).length === 0 && (
                                <Grid item xs={12}>
                                        <Fade in={true} timeout={600}>
                                            <Box sx={{ 
                                                textAlign: 'center', 
                                                py: 6,
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.5)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                                                borderRadius: 2,
                                                border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                                            }}>
                                                <Zoom in={true} timeout={800}>
                                                    <Box sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: '50%',
                                                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        margin: '0 auto 16px',
                                                    }}>
                                                        <DescriptionIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                                                    </Box>
                                                </Zoom>
                                                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                            Aucun document trouvé
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Ce professionnel n'a pas encore soumis de documents d'identité.
                                        </Typography>
                                    </Box>
                                        </Fade>
                                </Grid>
                            )}
                        </Grid>
                        </Fade>
                    ) : (
                        <Fade in={true} timeout={300}>
                            <Box sx={{ 
                                textAlign: 'center', 
                                py: 6,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.02)} 100%)`,
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                            }}>
                                <Zoom in={true} timeout={600}>
                                    <Box sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 16px',
                                    }}>
                                        <CloseIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />
                                    </Box>
                                </Zoom>
                                <Typography variant="h6" color="error" sx={{ fontWeight: 500 }}>
                                Erreur lors du chargement des documents
                            </Typography>
                        </Box>
                        </Fade>
                    )}
                </DialogContent>
                
                <DialogActions sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    background: alpha(theme.palette.background.paper, 0.8),
                    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}>
                    <AnimatedButton 
                        onClick={() => setOpenDocumentsDialog(false)} 
                        variant="outlined"
                        sx={{
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            '&:hover': {
                                borderColor: theme.palette.primary.dark,
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                        }}
                    >
                        Fermer
                    </AnimatedButton>
                </DialogActions>
            </AnimatedDialog>
        </Page>
    );
}