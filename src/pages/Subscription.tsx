import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  CircularProgress,
  Container,
  ThemeProvider,
  createTheme,
  IconButton,
  Avatar,
  Divider,
  Fade,
  Slide,
  useTheme,
  alpha,
} from "@mui/material"
import {
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  People as UsersIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  WorkOutline as WorkIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Remove as RemoveIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  SupportAgent as SupportAgentIcon,
  FlashOn as FlashOnIcon,
  AllInclusive as AllInclusiveIcon,
  ListAlt as ListAltIcon,
  Analytics as AnalyticsIcon,
  BarChart as BarChartIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Gavel as GavelIcon,
  EmojiEvents as EmojiEventsIcon,
  LockOpen as LockOpenIcon,
  Verified as VerifiedIcon,
  AutoAwesome as AutoAwesomeIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  NotificationsActive as NotificationsActiveIcon,
  Visibility as VisibilityIcon,
  LocalOffer as LocalOfferIcon,
  LocalShipping as LocalShippingIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from "@mui/icons-material"

// Import your real API
import { SubscriptionAPI, SubscriptionPlan, CreatePlanDto } from '../api/subscription'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: "#0EA5E9",
      light: "#38BDF8",
      dark: "#0284C7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#06B6D4",
      light: "#22D3EE",
      dark: "#0891B2",
    },
    neutral: {
      main: "#64748B",
      light: "#94A3B8",
      dark: "#475569",
      contrastText: "#ffffff",
    },
    success: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
    },
    background: {
      default: "#F8FAFC",
      paper: "#ffffff",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      fontSize: '2.25rem',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.875rem',
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    }
  },
  status: {
    danger: '#FF5630',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: "none",
          fontWeight: 500,
          fontSize: '0.9rem',
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: 'none',
        },
        contained: {
          background: "linear-gradient(135deg, #0EA5E9 0%, #FFFFFF 100%)",
          color: "#1E293B",
          boxShadow: '0 4px 20px rgba(14, 165, 233, 0.3)',
          "&:hover": {
            background: "linear-gradient(135deg, #0284C7 0%, #F1F5F9 100%)",
            transform: "translateY(-2px)",
            boxShadow: '0 8px 30px rgba(14, 165, 233, 0.4)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          borderColor: 'rgba(14, 165, 233, 0.3)',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          "&:hover": {
            borderWidth: '1.5px',
            borderColor: 'rgba(14, 165, 233, 0.6)',
            background: 'rgba(255, 255, 255, 0.9)',
            transform: "translateY(-1px)",
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: 'none',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(14, 165, 233, 0.1)',
          transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
          "&:hover": {
            transform: "translateY(-12px)",
            boxShadow: "0 20px 60px rgba(14, 165, 233, 0.15), 0 0 0 1px rgba(14, 165, 233, 0.1)",
            background: 'rgba(255, 255, 255, 0.85)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: 'none',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(14, 165, 233, 0.08)',
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
          border: 'none',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          border: 'none',
        }
      }
    }
  },
})

interface UserSubscription {
  _id: string
  userId: string
  planId: string
  planName: string
  planPrice: number
  planDuration: number
  startDate: string
  endDate: string
  isActive: boolean
  status: string
}

const UserAPI = {
  addSubscriptionPlan: (planId: string): Promise<{ success: boolean; message?: string }> =>
    Promise.resolve({ success: true, message: 'Successfully subscribed!' })
}

// Smart icon matching function for benefits
const getBenefitIcon = (benefitText: string) => {
  const text = benefitText.toLowerCase();
  const iconProps = { sx: { fontSize: 16 } };
  
  // Support & Service
  if (text.includes('support') || text.includes('assistance') || text.includes('aide') || text.includes('service client')) {
    return <SupportAgentIcon {...iconProps} />;
  }
  
  // Priority & Speed
  if (text.includes('prioritaire') || text.includes('priority') || text.includes('rapide') || text.includes('fast') || text.includes('instant')) {
    return <FlashOnIcon {...iconProps} />;
  }
  
  // Unlimited & Infinite
  if (text.includes('illimité') || text.includes('unlimited') || text.includes('infini') || text.includes('infinite')) {
    return <AllInclusiveIcon {...iconProps} />;
  }
  
  // Listings & Products
  if (text.includes('listing') || text.includes('annonce') || text.includes('produit') || text.includes('product')) {
    return <ListAltIcon {...iconProps} />;
  }
  
  // Analytics & Statistics & Reports
  if (text.includes('analytics') || text.includes('analyse') || text.includes('statistique') || text.includes('rapport') || text.includes('report') || text.includes('données') || text.includes('data')) {
    return <AnalyticsIcon {...iconProps} />;
  }
  
  // Charts & Market
  if (text.includes('marché') || text.includes('market') || text.includes('chart') || text.includes('graphique')) {
    return <BarChartIcon {...iconProps} />;
  }
  
  // Search & Discovery
  if (text.includes('recherche') || text.includes('search') || text.includes('trouver') || text.includes('find') || text.includes('découvrir')) {
    return <SearchIcon {...iconProps} />;
  }
  
  // Network & Professional & Community
  if (text.includes('réseau') || text.includes('network') || text.includes('professionnel') || text.includes('professional') || text.includes('communauté') || text.includes('community')) {
    return <GroupIcon {...iconProps} />;
  }
  
  // Auction & Bidding
  if (text.includes('enchère') || text.includes('auction') || text.includes('bid') || text.includes('offre')) {
    return <GavelIcon {...iconProps} />;
  }
  
  // Exclusive & Premium & VIP
  if (text.includes('exclusif') || text.includes('exclusive') || text.includes('premium') || text.includes('vip') || text.includes('privilège')) {
    return <EmojiEventsIcon {...iconProps} />;
  }
  
  // Access & Unlock
  if (text.includes('accès') || text.includes('access') || text.includes('débloque') || text.includes('unlock')) {
    return <LockOpenIcon {...iconProps} />;
  }
  
  // Security & Verified & Trust
  if (text.includes('sécurit') || text.includes('security') || text.includes('vérifié') || text.includes('verified') || text.includes('confiance') || text.includes('trust')) {
    return <VerifiedIcon {...iconProps} />;
  }
  
  // Tools & Features
  if (text.includes('outil') || text.includes('tool') || text.includes('fonctionnalit') || text.includes('feature') || text.includes('avancé') || text.includes('advanced')) {
    return <AutoAwesomeIcon {...iconProps} />;
  }
  
  // Profit & Revenue & Money
  if (text.includes('profit') || text.includes('revenu') || text.includes('revenue') || text.includes('gain') || text.includes('monétis')) {
    return <MoneyIcon {...iconProps} />;
  }
  
  // Resale & Reseller
  if (text.includes('revente') || text.includes('resale') || text.includes('revendeur') || text.includes('reseller')) {
    return <StoreIcon {...iconProps} />;
  }
  
  // Inventory & Stock
  if (text.includes('inventaire') || text.includes('inventory') || text.includes('stock')) {
    return <InventoryIcon {...iconProps} />;
  }
  
  // Notifications & Alerts
  if (text.includes('notification') || text.includes('alerte') || text.includes('alert') || text.includes('avis')) {
    return <NotificationsActiveIcon {...iconProps} />;
  }
  
  // Visibility & Featured & Promotion
  if (text.includes('visibilité') || text.includes('visibility') || text.includes('mis en avant') || text.includes('featured') || text.includes('promotion')) {
    return <VisibilityIcon {...iconProps} />;
  }
  
  // Discount & Offer & Deal
  if (text.includes('réduction') || text.includes('discount') || text.includes('offre spéciale') || text.includes('deal') || text.includes('promo')) {
    return <LocalOfferIcon {...iconProps} />;
  }
  
  // Shipping & Delivery & Logistics
  if (text.includes('livraison') || text.includes('shipping') || text.includes('delivery') || text.includes('logistique') || text.includes('transport')) {
    return <LocalShippingIcon {...iconProps} />;
  }
  
  // Business & Company & Enterprise
  if (text.includes('entreprise') || text.includes('business') || text.includes('company') || text.includes('société')) {
    return <BusinessIcon {...iconProps} />;
  }
  
  // Performance & Speed Metrics
  if (text.includes('performance') || text.includes('vitesse') || text.includes('speed') || text.includes('rapidité')) {
    return <SpeedIcon {...iconProps} />;
  }
  
  // Assessment & Evaluation
  if (text.includes('évaluation') || text.includes('assessment') || text.includes('analyse de profitabilité')) {
    return <AssessmentIcon {...iconProps} />;
  }
  
  // Documents & Reports & Files
  if (text.includes('document') || text.includes('fichier') || text.includes('file') || text.includes('certificat')) {
    return <DescriptionIcon {...iconProps} />;
  }
  
  // Premium & Quality
  if (text.includes('premium') || text.includes('qualité') || text.includes('quality') || text.includes('excellence')) {
    return <WorkspacePremiumIcon {...iconProps} />;
  }
  
  // Growth & Trending
  if (text.includes('croissance') || text.includes('growth') || text.includes('développement') || text.includes('development') || text.includes('augment')) {
    return <TrendingUpIcon {...iconProps} />;
  }
  
  // Default: checkmark for anything else
  return <CheckCircleIcon {...iconProps} />;
};

// Countdown Timer Component
function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <TimeIcon sx={{ color: 'primary.main', fontSize: 16 }} />
      <Typography variant="body2" fontWeight="600" color="primary.main">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </Typography>
    </Box>
  );
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([])
  const [mySubscription, setMySubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  const [newPlan, setNewPlan] = useState<CreatePlanDto>({
    name: "",
    description: "",
    price: 0,
    duration: 1,
    role: "PROFESSIONAL",
    isActive: true,
    benefits: [],
  })

  const [newBenefit, setNewBenefit] = useState("")
  const [editBenefit, setEditBenefit] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const plansResponse = await SubscriptionAPI.getPlans()
      setPlans(plansResponse)

      try {
        const mySubResponse = await SubscriptionAPI.getMySubscription()
        setMySubscription(mySubResponse)
      } catch (error) {
        console.warn("No subscription found for user:", error)
        setMySubscription(null)
      }

      try {
        const allSubsResponse = await SubscriptionAPI.getAllSubscriptions()
        setUserSubscriptions(allSubsResponse)
      } catch (error) {
        console.warn("Error loading all subscriptions:", error)
        setUserSubscriptions([])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setPlans([])
      setUserSubscriptions([])
      setMySubscription(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async () => {
    try {
      if (!newPlan.name.trim() || !newPlan.description.trim() || newPlan.price < 0 || newPlan.duration <= 0) {
        return
      }

      const createdPlan = await SubscriptionAPI.createPlan(newPlan)
      setPlans(prev => [...prev, createdPlan])
      setCreateDialogOpen(false)
      
      setNewPlan({
        name: "",
        description: "",
        price: 0,
        duration: 1,
        role: "PROFESSIONAL",
        isActive: true,
        benefits: [],
      })
      setNewBenefit("")
    } catch (error) {
      console.error("Error creating plan:", error)
    }
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setCurrentPlan({ ...plan, benefits: plan.benefits || [] })
    setEditBenefit("")
    setEditDialogOpen(true)
  }

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setNewPlan({ ...newPlan, benefits: [...(newPlan.benefits || []), newBenefit.trim()] })
      setNewBenefit("")
    }
  }

  const handleRemoveBenefit = (index: number) => {
    const updatedBenefits = [...(newPlan.benefits || [])]
    updatedBenefits.splice(index, 1)
    setNewPlan({ ...newPlan, benefits: updatedBenefits })
  }

  const handleAddEditBenefit = () => {
    if (editBenefit.trim() && currentPlan) {
      setCurrentPlan({ ...currentPlan, benefits: [...(currentPlan.benefits || []), editBenefit.trim()] })
      setEditBenefit("")
    }
  }

  const handleRemoveEditBenefit = (index: number) => {
    if (currentPlan) {
      const updatedBenefits = [...(currentPlan.benefits || [])]
      updatedBenefits.splice(index, 1)
      setCurrentPlan({ ...currentPlan, benefits: updatedBenefits })
    }
  }

  const handleUpdatePlan = async () => {
    if (!currentPlan || !currentPlan._id) return
    
    try {
      if (!currentPlan.name.trim() || !currentPlan.description.trim() || currentPlan.price < 0 || currentPlan.duration <= 0) {
        return
      }

      const updatedPlan = await SubscriptionAPI.updatePlan(currentPlan._id, {
        name: currentPlan.name,
        description: currentPlan.description,
        price: currentPlan.price,
        duration: currentPlan.duration,
        isActive: currentPlan.isActive,
        role: currentPlan.role,
        benefits: currentPlan.benefits,
      })
      
      setPlans(prev => prev.map(p => p._id === currentPlan._id ? updatedPlan : p))
      setEditDialogOpen(false)
      setCurrentPlan(null)
    } catch (error) {
      console.error("Error updating plan:", error)
    }
  }

  const handleDeletePlan = async () => {
    if (!currentPlan || !currentPlan._id) return
    
    try {
      await SubscriptionAPI.deletePlan(currentPlan._id)
      setPlans(prev => prev.filter(p => p._id !== currentPlan._id))
      setDeleteDialogOpen(false)
      setCurrentPlan(null)
    } catch (error) {
      console.error("Error deleting plan:", error)
    }
  }

  const handleSubscribeToPlan = async (planId: string) => {
    if (!planId) return
    
    try {
      const result = await UserAPI.addSubscriptionPlan(planId)
      if (result.success) {
        loadData()
      }
    } catch (error) {
      console.error("Error subscribing to plan:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getRoleIcon = (role: string) => {
    return role === 'PROFESSIONAL' ? <WorkIcon /> : <BusinessIcon />
  }

  const getRoleColor = (role: string) => {
    return role === 'PROFESSIONAL' ? 'primary' : 'secondary'
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #E0F2FE 0%, #FFFFFF 50%, #F0F9FF 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: 'relative',
            "&::before": {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Fade in={loading}>
            <Box 
              textAlign="center" 
              sx={{ 
                p: 6,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(14, 165, 233, 0.1)',
                border: 'none'
              }}
            >
              <CircularProgress 
                size={60} 
                sx={{ 
                  color: 'primary.main', 
                  mb: 3,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }} 
              />
              <Typography variant="h5" fontWeight="600" color="text.primary" gutterBottom>
                Loading Subscription Data
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please wait while we fetch your information
              </Typography>
            </Box>
          </Fade>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #E0F2FE 0%, #FFFFFF 50%, #F0F9FF 100%)",
          position: 'relative',
          "&::before": {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 6 }}>
          <Fade in timeout={800}>
            <Box mb={6} textAlign="center">
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: 'text.primary',
                  mb: 2,
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #FFFFFF 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Subscription Management
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto', fontWeight: 400 }}>
                Create, manage, and monitor subscription plans with our comprehensive dashboard
              </Typography>
            </Box>
          </Fade>

          {(mySubscription || userSubscriptions.length > 0) && (
            <Fade in timeout={1000}>
              <Paper elevation={0} sx={{ mb: 4 }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  variant="fullWidth"
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: '1rem',
                      py: 3,
                      color: 'text.secondary',
                      transition: 'all 0.3s ease',
                    },
                    "& .Mui-selected": {
                      color: 'primary.main',
                      fontWeight: 600,
                    },
                    "& .MuiTabs-indicator": {
                      height: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #0EA5E9 0%, #FFFFFF 100%)',
                    }
                  }}
                >
                  <Tab 
                    label="Subscription Plans" 
                    icon={<StarIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label="User Subscriptions" 
                    icon={<UsersIcon />} 
                    iconPosition="start"
                  />
                </Tabs>
              </Paper>
            </Fade>
          )}

          {activeTab === 0 && (
            <Fade in timeout={1200}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                  <Box>
                    <Typography variant="h4" fontWeight="600" color="text.primary" gutterBottom>
                      Available Plans
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
                      Manage and create subscription plans for your users
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Create New Plan
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  {plans.length > 0 ? plans.map((plan, index) => (
                    <Grid item xs={12} md={6} lg={4} key={plan._id}>
                      <Slide in direction="up" timeout={800 + index * 200}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'visible',
                          }}
                        >
                          {plan.isActive && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                color: 'white',
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                zIndex: 2,
                              }}
                            >
                              Active
                            </Box>
                          )}
                          
                          <CardContent sx={{ flexGrow: 1, p: 4 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                              <Box flex={1}>
                                <Typography variant="h5" fontWeight="600" gutterBottom color="text.primary">
                                  {plan.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 3 }}>
                                  {plan.description}
                                </Typography>
                              </Box>
                            </Box>

                            <Box mb={3}>
                              <Typography 
                                variant="h3" 
                                fontWeight="700"
                                sx={{ 
                                  background: 'linear-gradient(135deg, #0EA5E9 0%, #FFFFFF 100%)',
                                  backgroundClip: 'text',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  mb: 1
                                }}
                              >
                                {formatPrice(plan.price)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                per {plan.duration} month{plan.duration > 1 ? 's' : ''}
                              </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" gap={1} mb={3}>
                              <CalendarIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                              <Typography variant="body2" color="text.secondary">
                                {plan.duration} month{plan.duration > 1 ? 's' : ''} duration
                              </Typography>
                            </Box>

                            {plan.benefits && plan.benefits.length > 0 && (
                              <Box mb={3}>
                                <Typography variant="body2" fontWeight="600" color="text.primary" mb={1.5}>
                                  What's Included:
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={1}>
                                  {plan.benefits.slice(0, 3).map((benefit, idx) => (
                                    <Box key={idx} display="flex" alignItems="center" gap={1}>
                                      <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                                        {getBenefitIcon(benefit)}
                                      </Box>
                                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                        {benefit}
                                      </Typography>
                                    </Box>
                                  ))}
                                  {plan.benefits.length > 3 && (
                                    <Typography variant="body2" color="primary.main" sx={{ ml: 3, fontWeight: 500 }}>
                                      +{plan.benefits.length - 3} more benefits
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            )}

                            <Chip
                              label={plan.role}
                              color={getRoleColor(plan.role) as any}
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </CardContent>
                          
                          <CardActions sx={{ p: 4, pt: 0, gap: 1 }}>
                            <Button
                              variant="contained"
                              onClick={() => handleSubscribeToPlan(plan._id!)}
                              disabled={!plan.isActive}
                              sx={{ flexGrow: 1 }}
                            >
                              Subscribe
                            </Button>
                            <IconButton
                              onClick={() => handleEditPlan(plan)}
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': { 
                                  background: alpha(theme.palette.primary.main, 0.1) 
                                }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setCurrentPlan(plan)
                                setDeleteDialogOpen(true)
                              }}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': { 
                                  background: alpha(theme.palette.error.main, 0.1) 
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Slide>
                    </Grid>
                  )) : (
                    <Grid item xs={12}>
                      <Fade in>
                        <Card>
                          <CardContent sx={{ textAlign: "center", py: 8 }}>
                            <StarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No subscription plans found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                              Create your first subscription plan to get started
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => setCreateDialogOpen(true)}
                            >
                              Create First Plan
                            </Button>
                          </CardContent>
                        </Card>
                      </Fade>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Fade>
          )}

          {activeTab === 1 && (
            <Fade in timeout={1200}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                  <Box>
                    <Typography variant="h4" fontWeight="600" color="text.primary" gutterBottom>
                      User Subscriptions
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Monitor and manage all active user subscriptions
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Paper sx={{ px: 3, py: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <TrendingUpIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Total Subscriptions
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {userSubscriptions.length}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                </Box>

                <Box display="flex" flexDirection="column" gap={3}>
                  {userSubscriptions.map((subscription, index) => (
                    <Slide key={subscription._id} in direction="left" timeout={600 + index * 150}>
                      <Card>
                        <CardContent sx={{ p: 4 }}>
                          <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Plan Name
                                </Typography>
                                <Typography variant="h6" fontWeight="600">
                                  {subscription.planName}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Price
                                </Typography>
                                <Typography variant="body1" fontWeight="600" color="primary.main">
                                  {formatPrice(subscription.planPrice)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={1}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Duration
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                  {subscription.planDuration}m
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Start Date
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {formatDate(subscription.startDate)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  End Date
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {formatDate(subscription.endDate)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Time Remaining
                                </Typography>
                                <CountdownTimer endDate={subscription.endDate} />
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={1}>
                              <Chip
                                label={subscription.status}
                                color={subscription.status === 'ACTIVE' ? 'success' : 'default'}
                                sx={{ fontWeight: 500 }}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Slide>
                  ))}

                  {userSubscriptions.length === 0 && (
                    <Fade in>
                      <Card>
                        <CardContent sx={{ textAlign: "center", py: 8 }}>
                          <UsersIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No subscriptions found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            When users subscribe to plans, they will appear here
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  )}
                </Box>
              </Box>
            </Fade>
          )}

          {/* Create Plan Dialog */}
          <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h5" fontWeight="600">
                  Create New Subscription Plan
                </Typography>
                <IconButton onClick={() => setCreateDialogOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Fill in the details to create a new subscription plan
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Plan Name"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Price (DZD)"
                    type="number"
                    value={newPlan.price === 0 ? '' : newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)) })}
                    fullWidth
                    variant="outlined"
                    inputProps={{ min: 0, step: 1 }}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontWeight: 600 }}>DA</Typography>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Duration (months)"
                    type="number"
                    value={newPlan.duration === 0 ? '' : newPlan.duration}
                    onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value === '' ? 0 : Math.max(1, Number(e.target.value)) })}
                    fullWidth
                    variant="outlined"
                    inputProps={{ min: 1, step: 1 }}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined" sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                    }
                  }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={newPlan.role}
                      onChange={(e) => setNewPlan({ ...newPlan, role: e.target.value })}
                      label="Role"
                    >
                      <MenuItem value="PROFESSIONAL">
                        <Box display="flex" alignItems="center" gap={1}>
                          <WorkIcon fontSize="small" />
                          Professional
                        </Box>
                      </MenuItem>
                      <MenuItem value="RESELLER">
                        <Box display="flex" alignItems="center" gap={1}>
                          <BusinessIcon fontSize="small" />
                          Reseller
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPlan.isActive}
                        onChange={(e) => setNewPlan({ ...newPlan, isActive: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Active Plan"
                    sx={{ mt: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight="600" color="text.primary" mb={2}>
                    Plan Benefits
                  </Typography>
                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      label="Add Benefit"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddBenefit()
                        }
                      }}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., Unlimited listings"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddBenefit}
                      startIcon={<AddIcon />}
                      sx={{ minWidth: '120px' }}
                    >
                      Add
                    </Button>
                  </Box>
                  {newPlan.benefits && newPlan.benefits.length > 0 && (
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        background: 'rgba(14, 165, 233, 0.05)',
                        border: '1px solid rgba(14, 165, 233, 0.1)'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" mb={1.5}>
                        Benefits List ({newPlan.benefits.length}):
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {newPlan.benefits.map((benefit, index) => (
                          <Box 
                            key={index} 
                            display="flex" 
                            alignItems="center" 
                            justifyContent="space-between"
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              background: 'white',
                              border: '1px solid rgba(0, 0, 0, 0.08)'
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                                {getBenefitIcon(benefit)}
                              </Box>
                              <Typography variant="body2" color="text.primary">
                                {benefit}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveBenefit(index)}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': { background: alpha(theme.palette.error.main, 0.1) }
                              }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={() => setCreateDialogOpen(false)}
                variant="outlined"
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleCreatePlan}
                startIcon={<SaveIcon />}
              >
                Create Plan
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Plan Dialog */}
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h5" fontWeight="600">
                  Edit Subscription Plan
                </Typography>
                <IconButton onClick={() => setEditDialogOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Modify the details of the selected subscription plan
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Plan Name"
                    value={currentPlan?.name || ""}
                    onChange={(e) => setCurrentPlan({ ...currentPlan!, name: e.target.value })}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    value={currentPlan?.description || ""}
                    onChange={(e) => setCurrentPlan({ ...currentPlan!, description: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Price (DZD)"
                    type="number"
                    value={(currentPlan?.price || 0) === 0 ? '' : currentPlan?.price}
                    onChange={(e) => setCurrentPlan({ ...currentPlan!, price: e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)) })}
                    fullWidth
                    variant="outlined"
                    inputProps={{ min: 0, step: 1 }}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontWeight: 600 }}>DA</Typography>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Duration (months)"
                    type="number"
                    value={(currentPlan?.duration || 0) === 0 ? '' : currentPlan?.duration}
                    onChange={(e) => setCurrentPlan({ ...currentPlan!, duration: e.target.value === '' ? 0 : Math.max(1, Number(e.target.value)) })}
                    fullWidth
                    variant="outlined"
                    inputProps={{ min: 1, step: 1 }}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined" sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                    }
                  }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={currentPlan?.role || ""}
                      onChange={(e) => setCurrentPlan({ ...currentPlan!, role: e.target.value })}
                      label="Role"
                    >
                      <MenuItem value="PROFESSIONAL">
                        <Box display="flex" alignItems="center" gap={1}>
                          <WorkIcon fontSize="small" />
                          Professional
                        </Box>
                      </MenuItem>
                      <MenuItem value="RESELLER">
                        <Box display="flex" alignItems="center" gap={1}>
                          <BusinessIcon fontSize="small" />
                          Reseller
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentPlan?.isActive || false}
                        onChange={(e) => setCurrentPlan({ ...currentPlan!, isActive: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Active Plan"
                    sx={{ mt: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight="600" color="text.primary" mb={2}>
                    Plan Benefits
                  </Typography>
                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      label="Add Benefit"
                      value={editBenefit}
                      onChange={(e) => setEditBenefit(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddEditBenefit()
                        }
                      }}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., Unlimited listings"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddEditBenefit}
                      startIcon={<AddIcon />}
                      sx={{ minWidth: '120px' }}
                    >
                      Add
                    </Button>
                  </Box>
                  {currentPlan?.benefits && currentPlan.benefits.length > 0 && (
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        background: 'rgba(14, 165, 233, 0.05)',
                        border: '1px solid rgba(14, 165, 233, 0.1)'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" mb={1.5}>
                        Benefits List ({currentPlan.benefits.length}):
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {currentPlan.benefits.map((benefit, index) => (
                          <Box 
                            key={index} 
                            display="flex" 
                            alignItems="center" 
                            justifyContent="space-between"
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              background: 'white',
                              border: '1px solid rgba(0, 0, 0, 0.08)'
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                                {getBenefitIcon(benefit)}
                              </Box>
                              <Typography variant="body2" color="text.primary">
                                {benefit}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveEditBenefit(index)}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': { background: alpha(theme.palette.error.main, 0.1) }
                              }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={() => setEditDialogOpen(false)}
                variant="outlined"
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUpdatePlan}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm">
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'error.main',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  }}
                >
                  <DeleteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    Delete Subscription Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This action cannot be undone
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" color="text.secondary">
                Are you sure you want to delete "<strong>{currentPlan?.name}</strong>"? 
                This will permanently remove the subscription plan and cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setCurrentPlan(null)
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={handleDeletePlan}
                startIcon={<DeleteIcon />}
              >
                Delete Plan
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </ThemeProvider>
  )
}