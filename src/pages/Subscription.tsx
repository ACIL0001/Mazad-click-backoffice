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
  Skeleton,
  Stack,
  Container,
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
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material"

import { SubscriptionAPI, SubscriptionPlan, CreatePlanDto } from '../api/subscription'
import { useQuery, useQueryClient } from '@tanstack/react-query'



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
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['subscription-data'],
    queryFn: async () => {
      let plans: SubscriptionPlan[] = [];
      let mySubscription: UserSubscription | null = null;
      let userSubscriptions: UserSubscription[] = [];

      try {
        plans = await SubscriptionAPI.getPlans()
      } catch (error) {
        console.error("Error loading plans:", error)
      }

      try {
        mySubscription = await SubscriptionAPI.getMySubscription()
      } catch (error) {
        console.warn("No subscription found for user:", error)
      }

      try {
        userSubscriptions = await SubscriptionAPI.getAllSubscriptions()
      } catch (error) {
        console.warn("Error loading all subscriptions:", error)
      }

      return { plans, mySubscription, userSubscriptions };
    }
  });

  const plans = data?.plans || [];
  const mySubscription = data?.mySubscription || null;
  const userSubscriptions = data?.userSubscriptions || [];

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [createStep, setCreateStep] = useState(0)
  const [editStep, setEditStep] = useState(0)
  const [planError, setPlanError] = useState<string | null>(null)

  const [newPlan, setNewPlan] = useState<CreatePlanDto>({
    name: "",
    description: "",
    price: 0,
    duration: 1,
    role: "PROFESSIONAL",
    isActive: true,
    benefits: [],
    announcesPerMonth: 10,
    photosLimit: 0,
    videosLimit: 0,
    enchereSoumissionLimit: 0,
    hasChatAndMessaging: false,
    hasRatingAndHistory: false,
    isDurationUnlimited: false,
    hasAutoTranslation: false,
    statisticsLevel: "STANDARD",
    hasMiseEnAvant: false,
    hasEmailNotification: false,
    color: "#0EA5E9",
  })

  const [newBenefit, setNewBenefit] = useState("")
  const [editBenefit, setEditBenefit] = useState("")

  // Dynamic preset colors state in localStorage
  const [presetColors, setPresetColors] = useState<string[]>(() => {
    const stored = localStorage.getItem('mazadclick_preset_colors')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {}
    }
    const defaults = ['#D4AF37', '#C0C0C0', '#0EA5E9', '#CD7F32', '#10B981', '#8B5CF6']
    localStorage.setItem('mazadclick_preset_colors', JSON.stringify(defaults))
    return defaults
  })

  // Blacklist for deleted colors so they don't auto-repopulate from plan colors
  const [deletedColors, setDeletedColors] = useState<string[]>(() => {
    const stored = localStorage.getItem('mazadclick_deleted_colors')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {}
    }
    return []
  })

  // Load and merge colors from existing subscription plans
  useEffect(() => {
    if (plans && plans.length > 0) {
      const planColors = plans
        .map(p => p.color)
        .filter((c): c is string => !!c && c.startsWith('#'))
      
      const stored = localStorage.getItem('mazadclick_preset_colors')
      let customColors: string[] = []
      if (stored) {
        try {
          customColors = JSON.parse(stored)
        } catch (e) {}
      } else {
        customColors = ['#D4AF37', '#C0C0C0', '#0EA5E9', '#CD7F32', '#10B981', '#8B5CF6']
      }
      
      const combined = Array.from(new Set([...customColors, ...planColors])).filter(
        (c) => !deletedColors.includes(c)
      )
      setPresetColors(combined)
      localStorage.setItem('mazadclick_preset_colors', JSON.stringify(combined))
    }
  }, [plans, deletedColors])

  // Scroll to edit workspace when edit opens
  useEffect(() => {
    if (editDialogOpen) {
      setTimeout(() => {
        const el = document.getElementById('edit-plan-workspace')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 80)
    }
    if (createDialogOpen) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [editDialogOpen, createDialogOpen])

  const addSavedColor = (color: string) => {
    if (color && color.startsWith('#')) {
      if (deletedColors.includes(color)) {
        const updatedDeleted = deletedColors.filter(c => c !== color)
        setDeletedColors(updatedDeleted)
        localStorage.setItem('mazadclick_deleted_colors', JSON.stringify(updatedDeleted))
      }
      
      if (!presetColors.includes(color)) {
        const updated = [...presetColors, color]
        setPresetColors(updated)
        localStorage.setItem('mazadclick_preset_colors', JSON.stringify(updated))
      }
    }
  }

  const deleteSavedColor = (color: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedPresets = presetColors.filter(c => c !== color)
    setPresetColors(updatedPresets)
    localStorage.setItem('mazadclick_preset_colors', JSON.stringify(updatedPresets))
    
    const updatedDeleted = Array.from(new Set([...deletedColors, color]))
    setDeletedColors(updatedDeleted)
    localStorage.setItem('mazadclick_deleted_colors', JSON.stringify(updatedDeleted))

    // Fallback if current selections were set to this color
    if (newPlan.color === color) {
      setNewPlan({ ...newPlan, color: updatedPresets[0] || '#0EA5E9' })
    }
    if (currentPlan && currentPlan.color === color) {
      setCurrentPlan({ ...currentPlan, color: updatedPresets[0] || '#0EA5E9' })
    }
  }

  const handleCreatePlan = async () => {
    setPlanError(null)
    try {
      if (!newPlan.name.trim() || !newPlan.description.trim() || (!newPlan.isDurationUnlimited && newPlan.duration <= 0)) {
        setPlanError("Veuillez remplir tous les champs obligatoires (nom, description, durée).")
        return
      }

      // Mongoose rejects duration=0 for required Number fields.
      // When unlimited, send 9999 months so the schema is satisfied;
      // the backend uses isDurationUnlimited=true to drive expiry logic.
      const payload = {
        ...newPlan,
        duration: newPlan.isDurationUnlimited ? 9999 : newPlan.duration,
      }

      await SubscriptionAPI.createPlan(payload)
      if (newPlan.color) {
        addSavedColor(newPlan.color)
      }
      queryClient.invalidateQueries({ queryKey: ['subscription-data'] });
      setCreateDialogOpen(false)
      setPlanError(null)
      setCreateStep(0)
      
      setNewPlan({
        name: "",
        description: "",
        price: 0,
        duration: 1,
        role: "PROFESSIONAL",
        isActive: true,
        benefits: [],
        announcesPerMonth: 10,
        photosLimit: 0,
        videosLimit: 0,
        enchereSoumissionLimit: 0,
        hasChatAndMessaging: false,
        hasRatingAndHistory: false,
        isDurationUnlimited: false,
        hasAutoTranslation: false,
        statisticsLevel: "STANDARD",
        hasMiseEnAvant: false,
        hasEmailNotification: false,
        color: "#0EA5E9",
      })
      setNewBenefit("")
    } catch (error: any) {
      console.error("Error creating plan:", error)
      const msg = error?.response?.data?.message || error?.message || "Erreur lors de la création du plan."
      setPlanError(Array.isArray(msg) ? msg.join(", ") : msg)
    }
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setCurrentPlan({
      ...plan,
      color: plan.color || "#0EA5E9",
      benefits: plan.benefits || [],
      announcesPerMonth: plan.announcesPerMonth !== undefined ? plan.announcesPerMonth : 10,
      photosLimit: plan.photosLimit !== undefined ? plan.photosLimit : 0,
      videosLimit: plan.videosLimit !== undefined ? plan.videosLimit : 0,
      enchereSoumissionLimit: plan.enchereSoumissionLimit !== undefined ? plan.enchereSoumissionLimit : 0,
      hasChatAndMessaging: plan.hasChatAndMessaging || false,
      hasRatingAndHistory: plan.hasRatingAndHistory || false,
      isDurationUnlimited: plan.isDurationUnlimited || false,
      hasAutoTranslation: plan.hasAutoTranslation || false,
      statisticsLevel: plan.statisticsLevel || "STANDARD",
      hasMiseEnAvant: plan.hasMiseEnAvant || false,
      hasEmailNotification: plan.hasEmailNotification || false,
    })
    setEditBenefit("")
    setEditStep(0)
    setEditDialogOpen(true)
    // scrollIntoView is handled via useEffect after the edit page renders
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
    setPlanError(null)
    
    try {
      if (!currentPlan.name.trim() || !currentPlan.description.trim() || (!currentPlan.isDurationUnlimited && currentPlan.duration <= 0)) {
        setPlanError("Veuillez remplir tous les champs obligatoires (nom, description, durée).")
        return
      }

      const updatedPlan = await SubscriptionAPI.updatePlan(currentPlan._id, {
        name: currentPlan.name,
        description: currentPlan.description,
        price: currentPlan.price,
        // Same fix: Mongoose required Number rejects 0
        duration: currentPlan.isDurationUnlimited ? 9999 : currentPlan.duration,
        isActive: currentPlan.isActive,
        role: currentPlan.role,
        benefits: currentPlan.benefits,
        announcesPerMonth: currentPlan.announcesPerMonth,
        photosLimit: currentPlan.photosLimit,
        videosLimit: currentPlan.videosLimit,
        enchereSoumissionLimit: currentPlan.enchereSoumissionLimit,
        hasChatAndMessaging: currentPlan.hasChatAndMessaging,
        hasRatingAndHistory: currentPlan.hasRatingAndHistory,
        isDurationUnlimited: currentPlan.isDurationUnlimited,
        hasAutoTranslation: currentPlan.hasAutoTranslation,
        statisticsLevel: currentPlan.statisticsLevel,
        hasMiseEnAvant: currentPlan.hasMiseEnAvant,
        hasEmailNotification: currentPlan.hasEmailNotification,
        color: currentPlan.color,
      })
      
      if (currentPlan.color) {
        addSavedColor(currentPlan.color)
      }
      queryClient.invalidateQueries({ queryKey: ['subscription-data'] });
      setPlanError(null)
      setEditDialogOpen(false)
      setCurrentPlan(null)
    } catch (error: any) {
      console.error("Error updating plan:", error)
      const msg = error?.response?.data?.message || error?.message || "Erreur lors de la mise à jour du plan."
      setPlanError(Array.isArray(msg) ? msg.join(", ") : msg)
    }
  }

  const handleDeletePlan = async () => {
    if (!currentPlan || !currentPlan._id) return
    
    try {
      await SubscriptionAPI.deletePlan(currentPlan._id)
      queryClient.invalidateQueries({ queryKey: ['subscription-data'] });
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
        queryClient.invalidateQueries({ queryKey: ['subscription-data'] });
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
    return role === 'PROFESSIONAL' ? <WorkIcon /> : <UsersIcon />
  }

  const getRoleColor = (role: string) => {
    return role === 'PROFESSIONAL' ? 'primary' : 'info'
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: 'relative',
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
            <Stack spacing={2} alignItems="center" mb={3} width="100%">
              <Skeleton variant="circular" width={60} height={60} />
              <Skeleton variant="text" width={200} height={30} />
              <Skeleton variant="text" width={250} height={20} />
            </Stack>
          </Box>
        </Fade>
      </Box>
    )
  }

  if (createDialogOpen) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "transparent",
          position: 'relative',
          py: 6,
        }}
      >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            {/* Header / Navigation */}
            <Box mb={4} display="flex" flexDirection="column" gap={2}>
              <Box>
                <Button
                  onClick={() => setCreateDialogOpen(false)}
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    borderRadius: '16px',
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                    bgcolor: 'white',
                    color: 'text.secondary',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                      transform: 'translateX(-4px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Retour aux abonnements
                </Button>
              </Box>
              
              <Box mt={1} display="flex" flexDirection="column" alignItems="center" gap={3} sx={{ width: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    fontWeight="800" 
                    sx={{ 
                      color: 'text.primary',
                      background: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                      letterSpacing: '-0.02em',
                      textAlign: 'center'
                    }}
                  >
                    Créer un plan d'abonnement
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 400, opacity: 0.8, textAlign: 'center' }}>
                    Définir les configurations avancées et les structures cibles pour un nouveau plan
                  </Typography>
                </Box>
                
                {/* Steps Navigator */}
                <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)', p: 0.5, borderRadius: 4, display: 'flex', gap: 1 }}>
                  {[
                    { label: "1. Bases & Rôle", step: 0, icon: <AssignmentIcon sx={{ fontSize: 16 }} /> },
                    { label: "2. Limites & Analyses", step: 1, icon: <TrendingUpIcon sx={{ fontSize: 16 }} /> },
                    { label: "3. Fonctionnalités", step: 2, icon: <WorkspacePremiumIcon sx={{ fontSize: 16 }} /> }
                  ].map((s) => (
                    <Button
                      key={s.step}
                      onClick={() => setCreateStep(s.step)}
                      startIcon={s.icon}
                      sx={{
                        px: 3,
                        py: 1,
                        borderRadius: 3.5,
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        bgcolor: createStep === s.step ? 'white' : 'transparent',
                        color: createStep === s.step ? 'primary.main' : 'text.secondary',
                        boxShadow: createStep === s.step ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                        '&:hover': {
                          bgcolor: createStep === s.step ? 'white' : 'rgba(0,0,0,0.02)',
                        }
                      }}
                    >
                      {s.label}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Stepper Progress Bar */}
            <Box sx={{ width: '100%', mb: 4, height: 4, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2, overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  width: `${((createStep + 1) / 3) * 100}%`, 
                  height: '100%', 
                  bgcolor: 'primary.main', 
                  transition: 'width 0.4s ease-in-out' 
                }} 
              />
            </Box>

            {/* Spacious, premium workspace block */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 5, 
                borderRadius: 6, 
                background: 'white',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.02)'
              }}
            >
              {/* Step 0: Plan Basics & Identity */}
              {createStep === 0 && (
                <Stack spacing={5}>
                  <Box>
                    <Typography variant="h5" fontWeight="800" color="text.primary" mb={1} sx={{ letterSpacing: '-0.015em' }}>
                      Identité du Plan & Rôle Ciblé
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Définissez les détails fondamentaux, les tarifs cibles et les rôles utilisateurs.
                    </Typography>
                  </Box>

                  {/* Dynamic Role Cards Selector */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary" mb={2}>
                      Rôle Ciblé
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box
                          onClick={() => setNewPlan({ ...newPlan, role: 'PROFESSIONAL' })}
                          sx={{
                            p: 3,
                            borderRadius: 4,
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: newPlan.role === 'PROFESSIONAL' ? 'primary.main' : 'rgba(0,0,0,0.06)',
                            bgcolor: newPlan.role === 'PROFESSIONAL' ? alpha(theme.palette.primary.main, 0.04) : 'white',
                            boxShadow: newPlan.role === 'PROFESSIONAL' ? '0 8px 24px rgba(14, 165, 233, 0.12)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(14, 165, 233, 0.06)',
                            }
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: newPlan.role === 'PROFESSIONAL' ? 'primary.main' : 'rgba(0,0,0,0.04)',
                              color: newPlan.role === 'PROFESSIONAL' ? 'white' : 'text.secondary',
                              transition: 'all 0.3s'
                            }}
                          >
                            <WorkIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="700" color="text.primary" display="flex" alignItems="center" gap={1}>
                              Professionnel
                              {newPlan.role === 'PROFESSIONAL' && <CheckCircleIcon color="primary" sx={{ fontSize: 20 }} />}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.85 }}>
                              Pour les comptes professionnels, vendeurs réguliers et entreprises.
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box
                          onClick={() => setNewPlan({ ...newPlan, role: 'CLIENT' })}
                          sx={{
                            p: 3,
                            borderRadius: 4,
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: newPlan.role === 'CLIENT' ? 'success.main' : 'rgba(0,0,0,0.06)',
                            bgcolor: newPlan.role === 'CLIENT' ? alpha(theme.palette.success.main, 0.04) : 'white',
                            boxShadow: newPlan.role === 'CLIENT' ? '0 8px 24px rgba(16, 185, 129, 0.12)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            '&:hover': {
                              borderColor: 'success.main',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.06)',
                            }
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: newPlan.role === 'CLIENT' ? 'success.main' : 'rgba(0,0,0,0.04)',
                              color: newPlan.role === 'CLIENT' ? 'white' : 'text.secondary',
                              transition: 'all 0.3s'
                            }}
                          >
                            <UsersIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="700" color="text.primary" display="flex" alignItems="center" gap={1}>
                              Particulier
                              {newPlan.role === 'CLIENT' && <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.85 }}>
                              Pour les acheteurs individuels, clients réguliers et consommateurs.
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <TextField
                    label="Nom du Plan"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    fullWidth
                    variant="outlined"
                    placeholder="ex: Premium Pro Mensuel, Particulier Premium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3.5,
                        background: '#F8FAFC',
                      }
                    }}
                  />

                  {/* Plan Color Selector */}
                  <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 4, border: '1px solid rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" fontWeight="700" color="text.primary">Couleur Thème du Plan</Typography>
                      <Typography variant="caption" color="text.secondary">Sélectionnez une couleur pour personnaliser la carte de ce plan à travers la plateforme.</Typography>
                    </Box>
                    <Box display="flex" flexWrap="wrap" alignItems="center" gap={1.5}>
                      {presetColors.map((color) => {
                        const isSelected = newPlan.color === color;
                        return (
                          <Box
                            key={color}
                            onClick={() => setNewPlan({ ...newPlan, color })}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: color,
                              cursor: 'pointer',
                              border: '3px solid',
                              borderColor: isSelected ? 'primary.main' : 'transparent',
                              boxShadow: isSelected ? '0 0 10px rgba(14, 165, 233, 0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                              transform: isSelected ? 'scale(1.15)' : 'none',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              '&:hover': {
                                transform: 'scale(1.15)',
                                '& .delete-color-btn': {
                                  opacity: 1,
                                }
                              }
                            }}
                            title={color}
                          >
                            {isSelected && <CheckCircleOutlineIcon sx={{ color: 'white', fontSize: 18 }} />}
                            
                            <IconButton
                              className="delete-color-btn"
                              onClick={(e) => deleteSavedColor(color, e)}
                              sx={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                width: 16,
                                height: 16,
                                bgcolor: 'error.main',
                                color: 'white',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                '&:hover': {
                                  bgcolor: 'error.dark',
                                },
                                p: 0,
                              }}
                              size="small"
                            >
                              <CloseIcon sx={{ fontSize: 10 }} />
                            </IconButton>
                          </Box>
                        );
                      })}
                      
                      {/* Custom color picker circle */}
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FF0000 0%, #00FF00 50%, #0000FF 100%)',
                          cursor: 'pointer',
                          border: '2px solid white',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': { transform: 'scale(1.15)' }
                        }}
                        title="Couleur personnalisée"
                      >
                        <AddIcon sx={{ color: 'white', fontSize: 20 }} />
                        <input 
                          type="color" 
                          id="custom-color-picker-new"
                          value={presetColors.includes(newPlan.color || '') ? '#0EA5E9' : newPlan.color || '#0EA5E9'} 
                          onChange={(e) => setNewPlan({ ...newPlan, color: e.target.value })}
                          style={{ position: 'absolute', top: -10, left: -10, width: '60px', height: '60px', opacity: 0, cursor: 'pointer' }}
                        />
                      </Box>
                      
                      {/* Active Hex view */}
                      {!presetColors.includes(newPlan.color || '') && (
                        <Chip
                          label={newPlan.color}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            borderRadius: 2, 
                            fontWeight: 600, 
                            borderColor: newPlan.color,
                            color: newPlan.color,
                            bgcolor: alpha(newPlan.color || '#0EA5E9', 0.05)
                          }}
                          onDelete={() => setNewPlan({ ...newPlan, color: '#0EA5E9' })}
                        />
                      )}
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <TextField
                          label="Prix (DZD)"
                          type="number"
                          value={newPlan.price}
                          onChange={(e) => setNewPlan({ ...newPlan, price: Math.max(0, Number(e.target.value)) })}
                          fullWidth
                          variant="outlined"
                          inputProps={{ min: 0, step: 1 }}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontWeight: 600, fontSize: '0.9rem' }}>DA</Typography>
                          }}
                          sx={{
                            mb: 1.5,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3.5,
                              background: '#F8FAFC',
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <TextField
                          label="Durée (mois)"
                          type="number"
                          value={newPlan.duration === 0 ? "" : newPlan.duration}
                          onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value === "" ? 0 : Math.max(1, Number(e.target.value)) })}
                          fullWidth
                          variant="outlined"
                          inputProps={{ min: 1, step: 1 }}
                          InputProps={{
                            startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                          }}
                          sx={{
                            mb: 1.5,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3.5,
                              background: '#F8FAFC',
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  <Box>
                    <TextField
                      label="Description du Plan"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                      multiline
                      rows={3}
                      fullWidth
                      variant="outlined"
                      placeholder="Décrivez brièvement les fonctionnalités incluses dans ce plan..."
                      sx={{
                        mb: 1.5,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3.5,
                          background: '#F8FAFC',
                        }
                      }}
                    />

                  </Box>

                  <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 4, border: '1px solid rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="700" color="text.primary">Visibilité du Plan</Typography>
                      <Typography variant="caption" color="text.secondary">Rendre ce plan actif et visible immédiatement pour les comptes éligibles.</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newPlan.isActive}
                          onChange={(e) => setNewPlan({ ...newPlan, isActive: e.target.checked })}
                          color="primary"
                        />
                      }
                      label=""
                      sx={{ mr: 0 }}
                    />
                  </Box>
                </Stack>
              )}

              {/* Step 1: Limits & Analytics */}
              {createStep === 1 && (
                <Stack spacing={5}>
                  <Box>
                    <Typography variant="h5" fontWeight="800" color="text.primary" mb={1} sx={{ letterSpacing: '-0.015em' }}>
                      Limites du Plan & Accès aux Analyses
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Établissez des limites précises pour les annonces, les médias et les niveaux d'accès analytique.
                    </Typography>
                  </Box>

                  {/* Analytics Dashboard Tiers Selection Cards */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary" mb={2}>
                      Niveau d'Accès au Tableau de Bord Analytique
                    </Typography>
                    <Grid container spacing={3}>
                      {[
                        { 
                          value: 'BASIC', 
                          title: 'Analyses Basiques', 
                          desc: 'Suivi essentiel des vues et résumés des statuts.', 
                          icon: <BarChartIcon sx={{ fontSize: 24 }} />,
                          color: '#64748B'
                        },
                        { 
                          value: 'STANDARD', 
                          title: 'Tableau de Bord Standard', 
                          desc: "Statistiques mensuelles complètes, graphiques d'activité et journaux clients.", 
                          icon: <AnalyticsIcon sx={{ fontSize: 24 }} />,
                          color: '#0EA5E9'
                        },
                        { 
                          value: 'ADVANCED', 
                          title: 'Analyses Avancées en Temps Réel', 
                          desc: 'Graphiques en temps réel, conversions prédictives et rapports prioritaires.', 
                          icon: <AssessmentIcon sx={{ fontSize: 24 }} />,
                          color: '#F59E0B'
                        }
                      ].map((tier) => {
                        const isSelected = (newPlan.statisticsLevel || 'STANDARD') === tier.value;
                        return (
                          <Grid item xs={12} md={4} key={tier.value}>
                            <Box
                              onClick={() => setNewPlan({ ...newPlan, statisticsLevel: tier.value })}
                              sx={{
                                p: 2.5,
                                borderRadius: 4,
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: isSelected ? tier.color : 'rgba(0,0,0,0.06)',
                                bgcolor: isSelected ? alpha(tier.color, 0.04) : 'white',
                                boxShadow: isSelected ? `0 8px 24px ${alpha(tier.color, 0.12)}` : 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                '&:hover': {
                                  borderColor: tier.color,
                                  transform: 'translateY(-2px)',
                                }
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Avatar sx={{ bgcolor: isSelected ? tier.color : 'rgba(0,0,0,0.04)', color: isSelected ? 'white' : 'text.secondary', width: 44, height: 44 }}>
                                  {tier.icon}
                                </Avatar>
                                {isSelected && <CheckCircleIcon sx={{ color: tier.color, fontSize: 20 }} />}
                              </Box>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                                  {tier.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                                  {tier.desc}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>

                  {/* Quantitative Limits Configuration */}
                  <Grid container spacing={4}>
                    {/* Announces Limit */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 4, bgcolor: '#F8FAFC' }}>
                        <Typography variant="subtitle2" fontWeight="700" mb={1}>Limite d'Annonces</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          Nombre maximum d'annonces actives que l'utilisateur peut publier par mois civil.
                        </Typography>
                        
                        <TextField
                          label="Limite d'Annonces"
                          type="number"
                          value={newPlan.announcesPerMonth}
                          onChange={(e) => setNewPlan({ ...newPlan, announcesPerMonth: Math.max(0, Number(e.target.value)) })}
                          fullWidth
                          sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } 
                          }}
                        />

                      </Box>
                    </Grid>

                    {/* Enchères/Soumissions Limit */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 4, bgcolor: '#F8FAFC' }}>
                        <Typography variant="subtitle2" fontWeight="700" mb={1}>Limite d'Enchères/Soumissions</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          Nombre d'enchères ou de soumissions actives autorisées simultanément.
                        </Typography>
                        
                        <TextField
                          label="Limite d'Enchères/Soumissions"
                          type="number"
                          value={newPlan.enchereSoumissionLimit}
                          onChange={(e) => setNewPlan({ ...newPlan, enchereSoumissionLimit: Math.max(0, Number(e.target.value)) })}
                          fullWidth
                          sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } 
                          }}
                        />

                      </Box>
                    </Grid>
                  </Grid>

                  {/* Photos and Videos limit */}
                  <Box sx={{ p: 3.5, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 4, bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    {/* Photos Limit Control */}
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="700">Photos Illimitées</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Permettre aux utilisateurs de télécharger des galeries de photos illimitées par publication.
                          </Typography>
                        </Box>
                        <Switch
                          checked={newPlan.photosLimit === -1}
                          onChange={(e) => setNewPlan({ ...newPlan, photosLimit: e.target.checked ? -1 : 10 })}
                          color="primary"
                        />
                      </Box>

                      {newPlan.photosLimit !== -1 && (
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} sm={8}>
                            <TextField
                              label="Photos Max par Publication"
                              type="number"
                              value={newPlan.photosLimit}
                              onChange={(e) => setNewPlan({ ...newPlan, photosLimit: Math.max(0, Number(e.target.value)) })}
                              fullWidth
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box display="flex" gap={1}>
                              {[5, 10, 15, 20].map((num) => (
                                <Chip
                                  key={num}
                                  label={`${num} photos`}
                                  onClick={() => setNewPlan({ ...newPlan, photosLimit: num })}
                                  color={newPlan.photosLimit === num ? 'primary' : 'default'}
                                  sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer' }}
                                />
                              ))}
                            </Box>
                          </Grid>
                        </Grid>
                      )}
                    </Box>

                    <Divider />

                    {/* Videos Limit Control */}
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="700">Vidéos Illimitées</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Permettre aux utilisateurs de télécharger des galeries de vidéos illimitées par publication.
                          </Typography>
                        </Box>
                        <Switch
                          checked={newPlan.videosLimit === -1}
                          onChange={(e) => setNewPlan({ ...newPlan, videosLimit: e.target.checked ? -1 : 2 })}
                          color="primary"
                        />
                      </Box>

                      {newPlan.videosLimit !== -1 && (
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} sm={8}>
                            <TextField
                              label="Vidéos Max par Publication"
                              type="number"
                              value={newPlan.videosLimit}
                              onChange={(e) => setNewPlan({ ...newPlan, videosLimit: Math.max(0, Number(e.target.value)) })}
                              fullWidth
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box display="flex" gap={1}>
                              {[1, 2, 3, 5].map((num) => (
                                <Chip
                                  key={num}
                                  label={`${num} vidéos`}
                                  onClick={() => setNewPlan({ ...newPlan, videosLimit: num })}
                                  color={newPlan.videosLimit === num ? 'primary' : 'default'}
                                  sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer' }}
                                />
                              ))}
                            </Box>
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </Box>
                </Stack>
              )}

              {/* Step 2: Capabilities & Benefits */}
              {createStep === 2 && (
                <Stack spacing={5}>
                  <Box>
                    <Typography variant="h5" fontWeight="800" color="text.primary" mb={1} sx={{ letterSpacing: '-0.015em' }}>
                      Capacités du Plan & Avantages Vedettes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Activez les autorisations opérationnelles et définissez les avantages présentés aux utilisateurs.
                    </Typography>
                  </Box>

                  {/* Capabilities Interactive Tiles Grid */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary" mb={2.5}>
                      Capacités du Plan
                    </Typography>
                    <Grid container spacing={3}>
                      {[
                        { 
                          key: "hasChatAndMessaging", 
                          label: "Chat & Messagerie", 
                          desc: "Messagerie en direct instantanée entre acheteurs et vendeurs.", 
                          icon: <SupportAgentIcon sx={{ fontSize: 24 }} /> 
                        },
                        { 
                          key: "hasRatingAndHistory", 
                          label: "Rating & Historique", 
                          desc: "Permet aux acheteurs de soumettre des évaluations et des avis.", 
                          icon: <StarIcon sx={{ fontSize: 24 }} /> 
                        },
                        { 
                          key: "isDurationUnlimited", 
                          label: "Durée Illimitée", 
                          desc: "N'expire jamais et ne requiert aucun réabonnement mensuel.", 
                          icon: <AllInclusiveIcon sx={{ fontSize: 24 }} /> 
                        },
                        { 
                          key: "hasAutoTranslation", 
                          label: "Traduction Automatique", 
                          desc: "Traduction automatique en temps réel des annonces.", 
                          icon: <AutoAwesomeIcon sx={{ fontSize: 24 }} /> 
                        },
                        { 
                          key: "hasMiseEnAvant", 
                          label: "Mise en Avant", 
                          desc: "Met en avant les publications en tête de liste.", 
                          icon: <VisibilityIcon sx={{ fontSize: 24 }} /> 
                        },
                        { 
                          key: "hasEmailNotification", 
                          label: "Notifications E-mail", 
                          desc: "Alertes e-mail pour les nouvelles enchères et messages.", 
                          icon: <NotificationsActiveIcon sx={{ fontSize: 24 }} /> 
                        }
                      ].map((item) => {
                        const isToggleOn = (newPlan as any)[item.key] || false;
                        return (
                          <Grid item xs={12} sm={6} md={4} key={item.key}>
                            <Box
                              onClick={() => {
                                if (item.key === 'isDurationUnlimited') {
                                  setNewPlan({ 
                                    ...newPlan, 
                                    isDurationUnlimited: !isToggleOn, 
                                  });
                                } else {
                                  setNewPlan({ ...newPlan, [item.key]: !isToggleOn });
                                }
                              }}
                              sx={{
                                p: 2.5,
                                borderRadius: 4,
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: isToggleOn ? 'primary.main' : 'rgba(0,0,0,0.06)',
                                bgcolor: isToggleOn ? alpha(theme.palette.primary.main, 0.04) : 'white',
                                boxShadow: isToggleOn ? '0 8px 24px rgba(14, 165, 233, 0.08)' : 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  transform: 'translateY(-2px)',
                                }
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Avatar sx={{ bgcolor: isToggleOn ? 'primary.main' : 'rgba(0,0,0,0.04)', color: isToggleOn ? 'white' : 'text.secondary', width: 44, height: 44 }}>
                                  {item.icon}
                                </Avatar>
                                <Switch
                                  size="small"
                                  checked={isToggleOn}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (item.key === 'isDurationUnlimited') {
                                      setNewPlan({ 
                                        ...newPlan, 
                                        isDurationUnlimited: e.target.checked, 
                                      });
                                    } else {
                                      setNewPlan({ ...newPlan, [item.key]: e.target.checked });
                                    }
                                  }}
                                  color="primary"
                                />
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                                  {item.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                                  {item.desc}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>

                  {/* Plan Benefits Builder */}
                  <Box sx={{ p: 4, borderRadius: 4, bgcolor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <Typography variant="subtitle2" fontWeight="700" mb={1.5}>
                      Générateur d'Avantages Vedettes
                    </Typography>
                    
                    <Box display="flex" gap={2} mb={3}>
                      <TextField
                        label="Nouveau Point d'Avantage"
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
                        placeholder="ex: support client VIP, badge de profil vérifié, etc."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: 'white',
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddBenefit}
                        startIcon={<AddIcon />}
                        sx={{ px: 4, borderRadius: 3, boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)', color: 'white' }}
                      >
                        Ajouter
                      </Button>
                    </Box>

                    {/* Pre-fill Preset Benefits Suggestions */}
                    <Box mb={3.5}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1.5 }}>
                        Cliquez sur les étiquettes ci-dessous pour ajouter instantanément un avantage :
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1.2}>
                        {[
                          "Support Client VIP 24/7",
                          "Profil vérifié de confiance",
                          "Outils avancés de statistiques",
                          "Mise en avant prioritaire",
                          "Assistance commerciale dédiée",
                          "Traduction en temps réel"
                        ].map((sug) => {
                          const alreadyAdded = newPlan.benefits?.includes(sug);
                          return (
                            <Chip
                              key={sug}
                              label={`+ ${sug}`}
                              onClick={() => {
                                if (!alreadyAdded) {
                                  setNewPlan({ ...newPlan, benefits: [...(newPlan.benefits || []), sug] });
                                }
                              }}
                              disabled={alreadyAdded}
                              sx={{ 
                                borderRadius: 2.5, 
                                fontSize: '0.72rem', 
                                fontWeight: 600,
                                bgcolor: 'white',
                                border: '1px dashed rgba(14, 165, 233, 0.3)',
                                color: 'primary.main',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>

                    {newPlan.benefits && newPlan.benefits.length > 0 ? (
                      <Box>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1.5 }}>
                          Liste des Avantages Actifs ({newPlan.benefits.length}) :
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {newPlan.benefits.map((benefit, index) => (
                            <Chip
                              key={index}
                              label={benefit}
                              onDelete={() => handleRemoveBenefit(index)}
                              size="medium"
                              color="primary"
                              variant="outlined"
                              sx={{ 
                                borderRadius: 2.5, 
                                fontWeight: 600, 
                                py: 1.8, 
                                px: 0.8,
                                bgcolor: 'white',
                                borderColor: 'primary.main' 
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ border: '1px dashed rgba(0,0,0,0.1)', p: 3, borderRadius: 3, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontStyle: 'italic' }}>
                          Aucun avantage ajouté. Saisissez un avantage ci-dessus ou cliquez sur une suggestion.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Stack>
              )}

              {/* Error message display */}
              {planError && createStep === 2 && (
                <Box mt={3} p={2.5} borderRadius={3} bgcolor="#FEF2F2" border="1px solid #FECACA" display="flex" alignItems="center" gap={1.5}>
                  <Typography variant="body2" color="error.main" fontWeight={600} sx={{ flex: 1 }}>
                    ❌ {planError}
                  </Typography>
                  <Button size="small" onClick={() => setPlanError(null)} sx={{ minWidth: 'auto', p: 0.5 }}>✕</Button>
                </Box>
              )}

              {/* Wizard Footer Navigation Controls */}
              <Box mt={6} pt={4} borderTop="1px solid rgba(0, 0, 0, 0.06)" display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  variant="outlined"
                  onClick={() => setCreateDialogOpen(false)}
                  startIcon={<CancelIcon />}
                  sx={{ borderRadius: 3.5, px: 3, py: 1.2, color: 'text.secondary', borderColor: 'rgba(0,0,0,0.1)' }}
                >
                  Annuler
                </Button>
                
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    disabled={createStep === 0}
                    onClick={() => setCreateStep((prev) => Math.max(0, prev - 1))}
                    sx={{ borderRadius: 3.5, px: 3, py: 1.2 }}
                  >
                    Retour
                  </Button>
                  
                  {createStep < 2 ? (
                    <Button
                      variant="contained"
                      onClick={() => setCreateStep((prev) => Math.min(2, prev + 1))}
                      sx={{ borderRadius: 3.5, px: 4, py: 1.2, color: 'white' }}
                    >
                      Étape suivante
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleCreatePlan}
                      startIcon={<SaveIcon />}
                      disabled={!newPlan.name.trim() || !newPlan.description.trim()}
                      sx={{
                        borderRadius: 3.5,
                        px: 5,
                        py: 1.2,
                        background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                        color: 'white',
                        boxShadow: '0 6px 20px rgba(14, 165, 233, 0.2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                          boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
                        }
                      }}
                    >
                      Créer le plan d'abonnement
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>
    );
  }

  if (editDialogOpen && currentPlan) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "transparent",
          position: 'relative',
          py: 6,
        }}
      >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            {/* Header / Navigation */}
            <Box mb={4} display="flex" flexDirection="column" gap={2}>
              <Box>
                <Button
                  onClick={() => { setEditDialogOpen(false); setCurrentPlan(null); }}
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    borderRadius: '16px',
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                    bgcolor: 'white',
                    color: 'text.secondary',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                      transform: 'translateX(-4px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Retour aux abonnements
                </Button>
              </Box>
 
              <Box mt={1} display="flex" flexDirection="column" alignItems="center" gap={3} sx={{ width: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    component="h1"
                    fontWeight="800"
                    sx={{
                      color: 'text.primary',
                      background: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                      letterSpacing: '-0.02em',
                      textAlign: 'center'
                    }}
                  >
                    Modifier le plan d'abonnement
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 400, opacity: 0.8, textAlign: 'center' }}>
                    Modifier les détails et la configuration de "{currentPlan.name}"
                  </Typography>
                </Box>
 
                {/* Steps Navigator */}
                <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)', p: 0.5, borderRadius: 4, display: 'flex', gap: 1 }}>
                  {[
                    { label: "1. Bases & Rôle", step: 0, icon: <AssignmentIcon sx={{ fontSize: 16 }} /> },
                    { label: "2. Limites & Analyses", step: 1, icon: <TrendingUpIcon sx={{ fontSize: 16 }} /> },
                    { label: "3. Fonctionnalités", step: 2, icon: <WorkspacePremiumIcon sx={{ fontSize: 16 }} /> }
                  ].map((s) => (
                    <Button
                      key={s.step}
                      onClick={() => setEditStep(s.step)}
                      startIcon={s.icon}
                      sx={{
                        px: 3,
                        py: 1,
                        borderRadius: 3.5,
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        bgcolor: editStep === s.step ? 'white' : 'transparent',
                        color: editStep === s.step ? 'primary.main' : 'text.secondary',
                        boxShadow: editStep === s.step ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                        '&:hover': {
                          bgcolor: editStep === s.step ? 'white' : 'rgba(0,0,0,0.02)',
                        }
                      }}
                    >
                      {s.label}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Stepper Progress Bar */}
            <Box sx={{ width: '100%', mb: 4, height: 4, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2, overflow: 'hidden' }}>
              <Box
                sx={{
                  width: `${((editStep + 1) / 3) * 100}%`,
                  height: '100%',
                  bgcolor: 'primary.main',
                  transition: 'width 0.4s ease-in-out'
                }}
              />
            </Box>

            {/* Workspace Paper */}
            <Paper
              id="edit-plan-workspace"
              elevation={0}
              sx={{
                p: 5,
                borderRadius: 6,
                background: 'white',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.02)'
              }}
            >
              {/* Step 0: Basics & Role */}
              {editStep === 0 && (
                <Stack spacing={5}>
                  <Box>
                    <Typography variant="h5" fontWeight="800" color="text.primary" mb={1} sx={{ letterSpacing: '-0.015em' }}>
                      Identité du Plan & Rôle Ciblé
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Modifiez les détails fondamentaux, les tarifs cibles et les rôles utilisateurs.
                    </Typography>
                  </Box>

                  {/* Role Cards */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary" mb={2}>
                      Rôle Ciblé
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box
                          onClick={() => setCurrentPlan({ ...currentPlan, role: 'PROFESSIONAL' })}
                          sx={{
                            p: 3,
                            borderRadius: 4,
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: currentPlan.role === 'PROFESSIONAL' ? 'primary.main' : 'rgba(0,0,0,0.06)',
                            bgcolor: currentPlan.role === 'PROFESSIONAL' ? alpha(theme.palette.primary.main, 0.04) : 'white',
                            boxShadow: currentPlan.role === 'PROFESSIONAL' ? '0 8px 24px rgba(14, 165, 233, 0.12)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(14, 165, 233, 0.06)',
                            }
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: currentPlan.role === 'PROFESSIONAL' ? 'primary.main' : 'rgba(0,0,0,0.04)',
                              color: currentPlan.role === 'PROFESSIONAL' ? 'white' : 'text.secondary',
                              transition: 'all 0.3s'
                            }}
                          >
                            <WorkIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="700" color="text.primary" display="flex" alignItems="center" gap={1}>
                              Professionnel
                              {currentPlan.role === 'PROFESSIONAL' && <CheckCircleIcon color="primary" sx={{ fontSize: 20 }} />}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.85 }}>
                              Pour les comptes professionnels, vendeurs réguliers et entreprises.
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box
                          onClick={() => setCurrentPlan({ ...currentPlan, role: 'CLIENT' })}
                          sx={{
                            p: 3,
                            borderRadius: 4,
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: currentPlan.role === 'CLIENT' ? 'success.main' : 'rgba(0,0,0,0.06)',
                            bgcolor: currentPlan.role === 'CLIENT' ? alpha(theme.palette.success.main, 0.04) : 'white',
                            boxShadow: currentPlan.role === 'CLIENT' ? '0 8px 24px rgba(16, 185, 129, 0.12)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            '&:hover': {
                              borderColor: 'success.main',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.06)',
                            }
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: currentPlan.role === 'CLIENT' ? 'success.main' : 'rgba(0,0,0,0.04)',
                              color: currentPlan.role === 'CLIENT' ? 'white' : 'text.secondary',
                              transition: 'all 0.3s'
                            }}
                          >
                            <UsersIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="700" color="text.primary" display="flex" alignItems="center" gap={1}>
                              Particulier
                              {currentPlan.role === 'CLIENT' && <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.85 }}>
                              Pour les acheteurs individuels, clients réguliers et consommateurs.
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <TextField
                    label="Nom du Plan"
                    value={currentPlan.name}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                    fullWidth
                    variant="outlined"
                    placeholder="ex: Premium Pro Mensuel, Particulier Premium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3.5,
                        background: '#F8FAFC',
                      }
                    }}
                  />

                  {/* Plan Color Selector */}
                  <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 4, border: '1px solid rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" fontWeight="700" color="text.primary">Couleur Thème du Plan</Typography>
                      <Typography variant="caption" color="text.secondary">Sélectionnez une couleur pour personnaliser la carte de ce plan à travers la plateforme.</Typography>
                    </Box>
                    <Box display="flex" flexWrap="wrap" alignItems="center" gap={1.5}>
                      {presetColors.map((color) => {
                        const isSelected = currentPlan.color === color;
                        return (
                          <Box
                            key={color}
                            onClick={() => setCurrentPlan({ ...currentPlan, color })}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: color,
                              cursor: 'pointer',
                              border: '3px solid',
                              borderColor: isSelected ? 'primary.main' : 'transparent',
                              boxShadow: isSelected ? '0 0 10px rgba(14, 165, 233, 0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                              transform: isSelected ? 'scale(1.15)' : 'none',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              '&:hover': {
                                transform: 'scale(1.15)',
                                '& .delete-color-btn-edit': {
                                  opacity: 1,
                                }
                              }
                            }}
                            title={color}
                          >
                            {isSelected && <CheckCircleOutlineIcon sx={{ color: 'white', fontSize: 18 }} />}

                            <IconButton
                              className="delete-color-btn-edit"
                              onClick={(e) => deleteSavedColor(color, e)}
                              sx={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                width: 16,
                                height: 16,
                                bgcolor: 'error.main',
                                color: 'white',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                '&:hover': {
                                  bgcolor: 'error.dark',
                                },
                                p: 0,
                              }}
                              size="small"
                            >
                              <CloseIcon sx={{ fontSize: 10 }} />
                            </IconButton>
                          </Box>
                        );
                      })}
                      
                      {/* Custom color picker circle */}
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FF0000 0%, #00FF00 50%, #0000FF 100%)',
                          cursor: 'pointer',
                          border: '2px solid white',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': { transform: 'scale(1.15)' }
                        }}
                        title="Couleur personnalisée"
                      >
                        <AddIcon sx={{ color: 'white', fontSize: 20 }} />
                        <input 
                          type="color" 
                          id="custom-color-picker-edit"
                          value={presetColors.includes(currentPlan.color || '') ? '#0EA5E9' : currentPlan.color || '#0EA5E9'} 
                          onChange={(e) => setCurrentPlan({ ...currentPlan, color: e.target.value })}
                          style={{ position: 'absolute', top: -10, left: -10, width: '60px', height: '60px', opacity: 0, cursor: 'pointer' }}
                        />
                      </Box>
                      
                      {/* Active Hex view */}
                      {!presetColors.includes(currentPlan.color || '') && (
                        <Chip
                          label={currentPlan.color}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            borderRadius: 2, 
                            fontWeight: 600, 
                            borderColor: currentPlan.color,
                            color: currentPlan.color,
                            bgcolor: alpha(currentPlan.color || '#0EA5E9', 0.05)
                          }}
                          onDelete={() => setCurrentPlan({ ...currentPlan, color: '#0EA5E9' })}
                        />
                      )}
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Prix (DZD)"
                        type="number"
                        value={currentPlan.price}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, price: Math.max(0, Number(e.target.value)) })}
                        fullWidth
                        variant="outlined"
                        inputProps={{ min: 0, step: 1 }}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontWeight: 600, fontSize: '0.9rem' }}>DA</Typography>
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3.5,
                            background: '#F8FAFC',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Durée (mois)"
                        type="number"
                        value={currentPlan.duration === 0 ? "" : currentPlan.duration}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, duration: e.target.value === "" ? 0 : Math.max(1, Number(e.target.value)) })}
                        fullWidth
                        variant="outlined"
                        inputProps={{ min: 1, step: 1 }}
                        InputProps={{
                          startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3.5,
                            background: '#F8FAFC',
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Description du Plan"
                    value={currentPlan.description}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, description: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    placeholder="Décrivez brièvement les fonctionnalités incluses dans ce plan..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3.5,
                        background: '#F8FAFC',
                      }
                    }}
                  />

                  <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 4, border: '1px solid rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="700" color="text.primary">Visibilité du Plan</Typography>
                      <Typography variant="caption" color="text.secondary">Rendre ce plan actif et visible immédiatement pour les comptes éligibles.</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={currentPlan.isActive || false}
                          onChange={(e) => setCurrentPlan({ ...currentPlan, isActive: e.target.checked })}
                          color="primary"
                        />
                      }
                      label=""
                      sx={{ mr: 0 }}
                    />
                  </Box>
                </Stack>
              )}

              {/* Step 1: Limits & Analytics */}
              {editStep === 1 && (
                <Stack spacing={5}>
                  <Box>
                    <Typography variant="h5" fontWeight="800" color="text.primary" mb={1} sx={{ letterSpacing: '-0.015em' }}>
                      Limites du Plan & Accès aux Analyses
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Établissez des limites précises pour les annonces, les médias et les niveaux d'accès analytique.
                    </Typography>
                  </Box>

                  {/* Analytics Tier Selection Cards */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary" mb={2}>
                      Niveau d'Accès au Tableau de Bord Analytique
                    </Typography>
                    <Grid container spacing={3}>
                      {[
                        {
                          value: 'BASIC',
                          title: 'Analyses Basiques',
                          desc: 'Suivi essentiel des vues et résumés des statuts.',
                          icon: <BarChartIcon sx={{ fontSize: 24 }} />,
                          color: '#64748B'
                        },
                        {
                          value: 'STANDARD',
                          title: 'Tableau de Bord Standard',
                          desc: "Statistiques mensuelles complètes, graphiques d'activité et journaux clients.",
                          icon: <AnalyticsIcon sx={{ fontSize: 24 }} />,
                          color: '#0EA5E9'
                        },
                        {
                          value: 'ADVANCED',
                          title: 'Analyses Avancées en Temps Réel',
                          desc: 'Graphiques en temps réel, conversions prédictives et rapports prioritaires.',
                          icon: <AssessmentIcon sx={{ fontSize: 24 }} />,
                          color: '#F59E0B'
                        }
                      ].map((tier) => {
                        const isSelected = (currentPlan.statisticsLevel || 'STANDARD') === tier.value;
                        return (
                          <Grid item xs={12} md={4} key={tier.value}>
                            <Box
                              onClick={() => setCurrentPlan({ ...currentPlan, statisticsLevel: tier.value })}
                              sx={{
                                p: 2.5,
                                borderRadius: 4,
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: isSelected ? tier.color : 'rgba(0,0,0,0.06)',
                                bgcolor: isSelected ? alpha(tier.color, 0.04) : 'white',
                                boxShadow: isSelected ? `0 8px 24px ${alpha(tier.color, 0.12)}` : 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                '&:hover': {
                                  borderColor: tier.color,
                                  transform: 'translateY(-2px)',
                                }
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Avatar sx={{ bgcolor: isSelected ? tier.color : 'rgba(0,0,0,0.04)', color: isSelected ? 'white' : 'text.secondary', width: 44, height: 44 }}>
                                  {tier.icon}
                                </Avatar>
                                {isSelected && <CheckCircleIcon sx={{ color: tier.color, fontSize: 20 }} />}
                              </Box>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                                  {tier.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                                  {tier.desc}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>

                  {/* Quantitative Limits */}
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 4, bgcolor: '#F8FAFC' }}>
                        <Typography variant="subtitle2" fontWeight="700" mb={1}>Limite d'Annonces</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          Nombre maximum d'annonces actives que l'utilisateur peut publier par mois civil.
                        </Typography>
                        <TextField
                          label="Limite d'Annonces"
                          type="number"
                          value={currentPlan.announcesPerMonth || 0}
                          onChange={(e) => setCurrentPlan({ ...currentPlan, announcesPerMonth: Math.max(0, Number(e.target.value)) })}
                          fullWidth
                          sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 4, bgcolor: '#F8FAFC' }}>
                        <Typography variant="subtitle2" fontWeight="700" mb={1}>Limite d'Enchères/Soumissions</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          Nombre d'enchères ou de soumissions actives autorisées simultanément.
                        </Typography>
                        <TextField
                          label="Limite d'Enchères/Soumissions"
                          type="number"
                          value={currentPlan.enchereSoumissionLimit || 0}
                          onChange={(e) => setCurrentPlan({ ...currentPlan, enchereSoumissionLimit: Math.max(0, Number(e.target.value)) })}
                          fullWidth
                          sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' }
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Photos and Videos limit */}
                  <Box sx={{ p: 3.5, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 4, bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    {/* Photos Limit Control */}
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="700">Photos Illimitées</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Permettre aux utilisateurs de télécharger des galeries de photos illimitées par publication.
                          </Typography>
                        </Box>
                        <Switch
                          checked={currentPlan.photosLimit === -1}
                          onChange={(e) => setCurrentPlan({ ...currentPlan, photosLimit: e.target.checked ? -1 : 10 })}
                          color="primary"
                        />
                      </Box>

                      {currentPlan.photosLimit !== -1 && (
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} sm={8}>
                            <TextField
                              label="Photos Max par Publication"
                              type="number"
                              value={currentPlan.photosLimit || 0}
                              onChange={(e) => setCurrentPlan({ ...currentPlan, photosLimit: Math.max(0, Number(e.target.value)) })}
                              fullWidth
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box display="flex" gap={1}>
                              {[5, 10, 15, 20].map((num) => (
                                <Chip
                                  key={num}
                                  label={`${num} photos`}
                                  onClick={() => setCurrentPlan({ ...currentPlan, photosLimit: num })}
                                  color={currentPlan.photosLimit === num ? 'primary' : 'default'}
                                  sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer' }}
                                />
                              ))}
                            </Box>
                          </Grid>
                        </Grid>
                      )}
                    </Box>

                    <Divider />

                    {/* Videos Limit Control */}
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="700">Vidéos Illimitées</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Permettre aux utilisateurs de télécharger des galeries de vidéos illimitées par publication.
                          </Typography>
                        </Box>
                        <Switch
                          checked={currentPlan.videosLimit === -1}
                          onChange={(e) => setCurrentPlan({ ...currentPlan, videosLimit: e.target.checked ? -1 : 2 })}
                          color="primary"
                        />
                      </Box>

                      {currentPlan.videosLimit !== -1 && (
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} sm={8}>
                            <TextField
                              label="Vidéos Max par Publication"
                              type="number"
                              value={currentPlan.videosLimit || 0}
                              onChange={(e) => setCurrentPlan({ ...currentPlan, videosLimit: Math.max(0, Number(e.target.value)) })}
                              fullWidth
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box display="flex" gap={1}>
                              {[1, 2, 3, 5].map((num) => (
                                <Chip
                                  key={num}
                                  label={`${num} vidéos`}
                                  onClick={() => setCurrentPlan({ ...currentPlan, videosLimit: num })}
                                  color={currentPlan.videosLimit === num ? 'primary' : 'default'}
                                  sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer' }}
                                />
                              ))}
                            </Box>
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </Box>
                </Stack>
              )}

              {/* Step 2: Capabilities & Benefits */}
              {editStep === 2 && (
                <Stack spacing={5}>
                  <Box>
                    <Typography variant="h5" fontWeight="800" color="text.primary" mb={1} sx={{ letterSpacing: '-0.015em' }}>
                      Capacités du Plan & Avantages Vedettes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Activez les autorisations opérationnelles et définissez les avantages présentés aux utilisateurs.
                    </Typography>
                  </Box>

                  {/* Capabilities Tiles */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary" mb={2.5}>
                      Capacités du Plan
                    </Typography>
                    <Grid container spacing={3}>
                      {[
                        { key: "hasChatAndMessaging", label: "Chat & Messagerie", desc: "Messagerie en direct instantanée entre acheteurs et vendeurs.", icon: <SupportAgentIcon sx={{ fontSize: 24 }} /> },
                        { key: "hasRatingAndHistory", label: "Rating & Historique", desc: "Permet aux acheteurs de soumettre des évaluations et des avis.", icon: <StarIcon sx={{ fontSize: 24 }} /> },
                        { key: "isDurationUnlimited", label: "Durée Illimitée", desc: "N'expire jamais et ne requiert aucun réabonnement mensuel.", icon: <AllInclusiveIcon sx={{ fontSize: 24 }} /> },
                        { key: "hasAutoTranslation", label: "Traduction Automatique", desc: "Traduction automatique en temps réel des annonces.", icon: <AutoAwesomeIcon sx={{ fontSize: 24 }} /> },
                        { key: "hasMiseEnAvant", label: "Mise en Avant", desc: "Met en avant les publications en tête de liste.", icon: <VisibilityIcon sx={{ fontSize: 24 }} /> },
                        { key: "hasEmailNotification", label: "Notifications E-mail", desc: "Alertes e-mail pour les nouvelles enchères et messages.", icon: <NotificationsActiveIcon sx={{ fontSize: 24 }} /> }
                      ].map((item) => {
                        const isToggleOn = (currentPlan as any)[item.key] || false;
                        return (
                          <Grid item xs={12} sm={6} md={4} key={item.key}>
                            <Box
                              onClick={() => {
                                if (item.key === 'isDurationUnlimited') {
                                  setCurrentPlan({
                                    ...currentPlan,
                                    isDurationUnlimited: !isToggleOn,
                                  });
                                } else {
                                  setCurrentPlan({ ...currentPlan, [item.key]: !isToggleOn });
                                }
                              }}
                              sx={{
                                p: 2.5,
                                borderRadius: 4,
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: isToggleOn ? 'primary.main' : 'rgba(0,0,0,0.06)',
                                bgcolor: isToggleOn ? alpha(theme.palette.primary.main, 0.04) : 'white',
                                boxShadow: isToggleOn ? '0 8px 24px rgba(14, 165, 233, 0.08)' : 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  transform: 'translateY(-2px)',
                                }
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Avatar sx={{ bgcolor: isToggleOn ? 'primary.main' : 'rgba(0,0,0,0.04)', color: isToggleOn ? 'white' : 'text.secondary', width: 44, height: 44 }}>
                                  {item.icon}
                                </Avatar>
                                <Switch
                                  size="small"
                                  checked={isToggleOn}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (item.key === 'isDurationUnlimited') {
                                      setCurrentPlan({
                                        ...currentPlan,
                                        isDurationUnlimited: e.target.checked,
                                      });
                                    } else {
                                      setCurrentPlan({ ...currentPlan, [item.key]: e.target.checked });
                                    }
                                  }}
                                  color="primary"
                                />
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                                  {item.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                                  {item.desc}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>

                  {/* Benefits Builder */}
                  <Box sx={{ p: 4, borderRadius: 4, bgcolor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <Typography variant="subtitle2" fontWeight="700" mb={1.5}>
                      Générateur d'Avantages Vedettes
                    </Typography>
                    <Box display="flex" gap={2} mb={3}>
                      <TextField
                        label="Nouveau Point d'Avantage"
                        value={editBenefit}
                        onChange={(e) => setEditBenefit(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEditBenefit();
                          }
                        }}
                        fullWidth
                        variant="outlined"
                        placeholder="ex: support client VIP, badge de profil vérifié, etc."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: 'white',
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddEditBenefit}
                        startIcon={<AddIcon />}
                        sx={{ px: 4, borderRadius: 3, boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)', color: 'white' }}
                      >
                        Ajouter
                      </Button>
                    </Box>

                    {currentPlan.benefits && currentPlan.benefits.length > 0 ? (
                      <Box>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1.5 }}>
                          Liste des Avantages Actifs ({currentPlan.benefits.length}) :
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {currentPlan.benefits.map((benefit, index) => (
                            <Chip
                              key={index}
                              label={benefit}
                              onDelete={() => handleRemoveEditBenefit(index)}
                              size="medium"
                              color="primary"
                              variant="outlined"
                              sx={{
                                borderRadius: 2.5,
                                fontWeight: 600,
                                py: 1.8,
                                px: 0.8,
                                bgcolor: 'white',
                                borderColor: 'primary.main'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ border: '1px dashed rgba(0,0,0,0.1)', p: 3, borderRadius: 3, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontStyle: 'italic' }}>
                          Aucun avantage ajouté. Saisissez un avantage ci-dessus ou cliquez sur une suggestion.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Stack>
              )}
              {/* Error message display */}
              {planError && editStep === 2 && (
                <Box mt={3} p={2.5} borderRadius={3} bgcolor="#FEF2F2" border="1px solid #FECACA" display="flex" alignItems="center" gap={1.5}>
                  <Typography variant="body2" color="error.main" fontWeight={600} sx={{ flex: 1 }}>
                    ❌ {planError}
                  </Typography>
                  <Button size="small" onClick={() => setPlanError(null)} sx={{ minWidth: 'auto', p: 0.5 }}>✕</Button>
                </Box>
              )}

              {/* Wizard Footer Navigation */}
              <Box mt={6} pt={4} borderTop="1px solid rgba(0, 0, 0, 0.06)" display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  variant="outlined"
                  onClick={() => { setEditDialogOpen(false); setCurrentPlan(null); }}
                  startIcon={<CancelIcon />}
                  sx={{ borderRadius: 3.5, px: 3, py: 1.2, color: 'text.secondary', borderColor: 'rgba(0,0,0,0.1)' }}
                >
                  Annuler
                </Button>

                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    disabled={editStep === 0}
                    onClick={() => setEditStep((prev) => Math.max(0, prev - 1))}
                    sx={{ borderRadius: 3.5, px: 3, py: 1.2 }}
                  >
                    Retour
                  </Button>

                  {editStep < 2 ? (
                    <Button
                      variant="contained"
                      onClick={() => setEditStep((prev) => Math.min(2, prev + 1))}
                      sx={{ borderRadius: 3.5, px: 4, py: 1.2, color: 'white' }}
                    >
                      Étape suivante
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleUpdatePlan}
                      startIcon={<SaveIcon />}
                      disabled={!currentPlan.name.trim() || !currentPlan.description.trim()}
                      sx={{
                        borderRadius: 3.5,
                        px: 5,
                        py: 1.2,
                        background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                        color: 'white',
                        boxShadow: '0 6px 20px rgba(14, 165, 233, 0.2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                          boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
                        }
                      }}
                    >
                      Enregistrer les modifications
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "transparent",
        position: 'relative',
      }}
    >
        <Container
          maxWidth="xl"
          sx={{
            py: { xs: 2, sm: 3 },
            bgcolor: '#ffffff',
            p: { xs: 2, md: 4 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.customShadows.z1,
            position: 'relative',
            zIndex: 1
          }}
        >
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
                Gestion des abonnements
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto', fontWeight: 400 }}>
                Créez, gérez et suivez les plans d'abonnement avec notre tableau de bord complet
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
                    label="Plans d'abonnement" 
                    icon={<StarIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label="Abonnements utilisateurs" 
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
                      Plans disponibles
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
                      Gérez et créez des plans d'abonnement pour vos utilisateurs
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => { setCreateStep(0); setCreateDialogOpen(true); }}
                  >
                    Créer un nouveau plan
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
                            border: '1.5px solid #E2E8F0',
                            borderRadius: '24px',
                            background: 'white',
                            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.04)',
                            transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            "&:hover": {
                              transform: "translateY(-12px)",
                              boxShadow: "0 20px 60px rgba(14, 165, 233, 0.12)",
                            },
                          }}
                        >
                          {plan.isActive && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -12,
                                left: 16,
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                color: 'white',
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                zIndex: 3,
                                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
                              }}
                            >
                              Actif
                            </Box>
                          )}
                          
                          {/* Card Header matching the top blue banner */}
                          <Box
                            sx={{
                              background: plan.color || 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
                              color: 'white',
                              py: 2,
                              textAlign: 'center',
                              borderRadius: '22px 22px 0 0',
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '1.4rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              {plan.name}
                            </Typography>
                          </Box>

                          <CardContent 
                            sx={{ 
                              flexGrow: 1, 
                              p: 4.5,
                              pt: 3,
                              background: 'linear-gradient(to bottom, #F0F9FF 0%, #FFFFFF 100%)',
                              borderRadius: '0 0 22px 22px',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            {/* Quote Description */}
                            <Typography 
                              sx={{ 
                                color: '#1E3A8A', 
                                fontSize: '0.875rem', 
                                fontWeight: 600, 
                                fontStyle: 'italic', 
                                textAlign: 'center',
                                mt: 1.5,
                                px: 1,
                                lineHeight: 1.4
                              }}
                            >
                              « {plan.description} »
                            </Typography>

                            {/* Price Section */}
                            <Box display="flex" alignItems="baseline" justifyContent="center" mt={3.5} mb={2.5}>
                              <Typography sx={{ fontSize: '2.8rem', fontWeight: 800, color: '#1E3A8A', mr: 0.5, lineHeight: 1 }}>
                                {plan.price}
                              </Typography>
                              <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#1E3A8A' }}>
                                DA/mois
                              </Typography>
                            </Box>

                            {/* Obtenir maintenant Button */}
                            <Button
                              variant="contained"
                              onClick={() => handleSubscribeToPlan(plan._id!)}
                              disabled={!plan.isActive}
                              sx={{
                                alignSelf: 'center',
                                background: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)',
                                color: 'white !important',
                                borderRadius: '24px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                py: 1.5,
                                px: 4,
                                width: '85%',
                                mb: 4,
                                boxShadow: '0 4px 15px rgba(14, 165, 233, 0.25)',
                                "&:hover": {
                                  background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                                  transform: 'translateY(-1px)',
                                }
                              }}
                            >
                              Obtenir maintenant
                            </Button>

                            {/* Dynamic Bullet Lists */}
                            <Stack spacing={3.5} sx={{ textAlign: 'left', mb: 3 }}>
                              
                              {/* Ideal For Section */}
                              <Box>
                                <Typography sx={{ color: '#1E3A8A', fontWeight: 800, fontSize: '0.925rem', mb: 1.5 }}>
                                  Idéal pour :
                                </Typography>
                                <Box display="flex" alignItems="flex-start" gap={1.25}>
                                  <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                  <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                    Idéal pour les comptes {plan.role.toLowerCase() === 'professional' ? 'professionnels' : 'particuliers'}, booster votre activité et maximiser vos performances.
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Key Advantages Section */}
                              {plan.benefits && plan.benefits.length > 0 && (
                                <Box>
                                  <Typography sx={{ color: '#1E3A8A', fontWeight: 800, fontSize: '0.925rem', mb: 1.5 }}>
                                    Avantages clés :
                                  </Typography>
                                  <Stack spacing={1.25}>
                                    {plan.benefits.map((benefit, idx) => (
                                      <Box key={idx} display="flex" alignItems="flex-start" gap={1.25}>
                                        <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                        <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                          {benefit}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {/* Included Features Section */}
                              <Box>
                                <Typography sx={{ color: '#1E3A8A', fontWeight: 800, fontSize: '0.925rem', mb: 1.5 }}>
                                  Ce qui est inclus :
                                </Typography>
                                <Stack spacing={1.25}>
                                  {/* Announces */}
                                  <Box display="flex" alignItems="flex-start" gap={1.25}>
                                    <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                    <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                      {plan.announcesPerMonth === -1 ? 'Annonces par mois : Illimitées' : `${plan.announcesPerMonth} annonces par mois`} (active pendant {plan.isDurationUnlimited ? 'illimité' : plan.duration * 30} jours)
                                    </Typography>
                                  </Box>

                                  {/* Media Limits */}
                                  <Box display="flex" alignItems="flex-start" gap={1.25}>
                                    <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                    <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                      {plan.photosLimit === -1 ? 'Photos : Illimitées' : `Jusqu'à ${plan.photosLimit || 0} photos`}
                                    </Typography>
                                  </Box>
                                  <Box display="flex" alignItems="flex-start" gap={1.25}>
                                    <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                    <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                      {plan.videosLimit === -1 ? 'Vidéos : Illimitées' : `Jusqu'à ${plan.videosLimit || 0} vidéos`}
                                    </Typography>
                                  </Box>

                                  {/* Soumission Limit */}
                                  <Box display="flex" alignItems="flex-start" gap={1.25}>
                                    <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                    <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                      {plan.enchereSoumissionLimit === -1 ? 'Enchères / soumissions simultanées : Illimitées' : `${plan.enchereSoumissionLimit} enchères / soumissions simultanées`}
                                    </Typography>
                                  </Box>

                                  {/* Stats / Analytics */}
                                  <Box display="flex" alignItems="flex-start" gap={1.25}>
                                    <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                    <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                      Niveau d'analyse : {plan.statisticsLevel === 'BASIC' ? 'Basique' : plan.statisticsLevel === 'ADVANCED' ? 'Avancé' : 'Standard'}
                                    </Typography>
                                  </Box>

                                  {/* Switch features */}
                                  {plan.hasChatAndMessaging && (
                                    <Box display="flex" alignItems="flex-start" gap={1.25}>
                                      <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                      <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                        Chat & messagerie instantanés
                                      </Typography>
                                    </Box>
                                  )}

                                  {plan.hasRatingAndHistory && (
                                    <Box display="flex" alignItems="flex-start" gap={1.25}>
                                      <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                      <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                        Historique & évaluations
                                      </Typography>
                                    </Box>
                                  )}

                                  {plan.hasAutoTranslation && (
                                    <Box display="flex" alignItems="flex-start" gap={1.25}>
                                      <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                      <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                        Traduction automatique en temps réel
                                      </Typography>
                                    </Box>
                                  )}

                                  {plan.hasMiseEnAvant && (
                                    <Box display="flex" alignItems="flex-start" gap={1.25}>
                                      <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                      <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                        Mise en avant prioritaire de l'annonce
                                      </Typography>
                                    </Box>
                                  )}

                                  {plan.hasEmailNotification && (
                                    <Box display="flex" alignItems="flex-start" gap={1.25}>
                                      <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                      <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                        Notifications par e-mail
                                      </Typography>
                                    </Box>
                                  )}

                                  {plan.isDurationUnlimited && (
                                    <Box display="flex" alignItems="flex-start" gap={1.25}>
                                      <Typography sx={{ color: '#0EA5E9', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>✓</Typography>
                                      <Typography sx={{ color: '#1E3A8A', fontSize: '0.875rem', fontWeight: 550, opacity: 0.9, lineHeight: 1.45 }}>
                                        Durée illimitée (N&apos;expire jamais et ne requiert aucun réabonnement)
                                      </Typography>
                                    </Box>
                                  )}
                                </Stack>
                              </Box>

                            </Stack>

                            {/* Card Administration Actions */}
                            <Box display="flex" justifyContent="center" gap={1.5} mt="auto" pt={3} borderTop="1px dashed rgba(30, 58, 138, 0.08)">
                              <IconButton
                                onClick={() => handleEditPlan(plan)}
                                sx={{ 
                                  color: '#1E3A8A',
                                  bgcolor: 'rgba(30, 58, 138, 0.04)',
                                  '&:hover': { 
                                    background: 'rgba(30, 58, 138, 0.12)' 
                                  }
                                }}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                onClick={() => {
                                  setCurrentPlan(plan)
                                  setDeleteDialogOpen(true)
                                }}
                                sx={{ 
                                  color: '#EF4444',
                                  bgcolor: 'rgba(239, 68, 68, 0.04)',
                                  '&:hover': { 
                                    background: 'rgba(239, 68, 68, 0.12)' 
                                  }
                                }}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardContent>
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
                              Aucun plan d'abonnement trouvé
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                              Créez votre premier plan d'abonnement pour commencer
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => { setCreateStep(0); setCreateDialogOpen(true); }}
                            >
                              Créer le premier plan
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
                      Abonnements des utilisateurs
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Suivre et gérer tous les abonnements actifs des utilisateurs
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Paper sx={{ px: 3, py: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <TrendingUpIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Total des abonnements
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
                                  Nom du plan
                                </Typography>
                                <Typography variant="h6" fontWeight="600">
                                  {subscription.planName}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Prix
                                </Typography>
                                <Typography variant="body1" fontWeight="600" color="primary.main">
                                  {formatPrice(subscription.planPrice)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={1}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Durée
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                  {subscription.planDuration}m
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Date de début
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {formatDate(subscription.startDate)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Date de fin
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {formatDate(subscription.endDate)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Temps restant
                                </Typography>
                                <CountdownTimer endDate={subscription.endDate} />
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={1}>
                              <Chip
                                label={subscription.status === 'ACTIVE' ? 'ACTIF' : 'EXPIRÉ'}
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
                            Aucun abonnement trouvé
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Les abonnements des utilisateurs s'afficheront ici lorsqu'ils s'inscriront.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  )}
                </Box>
              </Box>
            </Fade>
          )}

          {/* Create Plan Dialog (Rendered as inline full-page instead) */}
          <Dialog open={false} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth sx={{ display: 'none' }}>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h5" fontWeight="600">
                  Créer un nouveau plan d'abonnement
                </Typography>
                <IconButton onClick={() => setCreateDialogOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Remplissez les détails pour créer un nouveau plan d'abonnement
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Nom du Plan"
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
                    label="Prix (DZD)"
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: Math.max(0, Number(e.target.value)) })}
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
                    label="Durée (mois)"
                    type="number"
                    value={newPlan.duration === 0 ? "" : newPlan.duration}
                    onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value === "" ? 0 : Math.max(1, Number(e.target.value)) })}
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
                    <InputLabel>Rôle</InputLabel>
                    <Select
                      value={newPlan.role}
                      onChange={(e) => setNewPlan({ ...newPlan, role: e.target.value })}
                      label="Rôle"
                    >
                      <MenuItem value="PROFESSIONAL">
                        <Box display="flex" alignItems="center" gap={1}>
                          <WorkIcon fontSize="small" />
                          Professionnel
                        </Box>
                      </MenuItem>
                      <MenuItem value="CLIENT">
                        <Box display="flex" alignItems="center" gap={1}>
                          <UsersIcon fontSize="small" />
                          Particulier
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
                    label="Plan Actif"
                    sx={{ mt: 2 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" fontWeight="600" color="primary.main" gutterBottom>
                    Fonctionnalités avancées & limites
                  </Typography>
                </Grid>
                
                {/* Announces limit */}
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Annonces / Mois"
                    type="number"
                    size="small"
                    value={newPlan.announcesPerMonth === -1 ? "" : newPlan.announcesPerMonth}
                    onChange={(e) => setNewPlan({ ...newPlan, announcesPerMonth: Math.max(0, Number(e.target.value)) })}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                {/* Photos Limit */}
                <Grid item xs={12} md={4}>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newPlan.photosLimit === -1}
                          onChange={(e) => setNewPlan({ ...newPlan, photosLimit: e.target.checked ? -1 : 10 })}
                          color="primary"
                        />
                      }
                      label="Photos illimitées"
                    />
                    {newPlan.photosLimit !== -1 && (
                      <TextField
                        label="Photos / Publication"
                        type="number"
                        size="small"
                        value={newPlan.photosLimit}
                        onChange={(e) => setNewPlan({ ...newPlan, photosLimit: Math.max(0, Number(e.target.value)) })}
                        fullWidth
                        inputProps={{ min: 0 }}
                      />
                    )}
                  </Stack>
                </Grid>

                {/* Videos Limit */}
                <Grid item xs={12} md={4}>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newPlan.videosLimit === -1}
                          onChange={(e) => setNewPlan({ ...newPlan, videosLimit: e.target.checked ? -1 : 2 })}
                          color="primary"
                        />
                      }
                      label="Vidéos illimitées"
                    />
                    {newPlan.videosLimit !== -1 && (
                      <TextField
                        label="Vidéos / Publication"
                        type="number"
                        size="small"
                        value={newPlan.videosLimit}
                        onChange={(e) => setNewPlan({ ...newPlan, videosLimit: Math.max(0, Number(e.target.value)) })}
                        fullWidth
                        inputProps={{ min: 0 }}
                      />
                    )}
                  </Stack>
                </Grid>

                {/* Bid submission limit */}
                <Grid item xs={6} md={4}>
                  <TextField
                    label="Enchères/Soumissions"
                    type="number"
                    size="small"
                    value={newPlan.enchereSoumissionLimit}
                    onChange={(e) => setNewPlan({ ...newPlan, enchereSoumissionLimit: Math.max(0, Number(e.target.value)) })}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                {/* Switch flags */}
                <Grid item xs={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPlan.hasChatAndMessaging || false}
                        onChange={(e) => setNewPlan({ ...newPlan, hasChatAndMessaging: e.target.checked })}
                      />
                    }
                    label="Chat & Messagerie"
                  />
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPlan.hasRatingAndHistory || false}
                        onChange={(e) => setNewPlan({ ...newPlan, hasRatingAndHistory: e.target.checked })}
                      />
                    }
                    label="Rating & Historique"
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPlan.isDurationUnlimited || false}
                        onChange={(e) => {
                          const isUnlimited = e.target.checked;
                          setNewPlan({ 
                            ...newPlan, 
                            isDurationUnlimited: isUnlimited, 
                          });
                        }}
                      />
                    }
                    label="Durée illimitée"
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPlan.hasAutoTranslation || false}
                        onChange={(e) => setNewPlan({ ...newPlan, hasAutoTranslation: e.target.checked })}
                      />
                    }
                    label="Traduction Automatique"
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Niveau de statistiques</InputLabel>
                    <Select
                      value={newPlan.statisticsLevel || "STANDARD"}
                      onChange={(e) => setNewPlan({ ...newPlan, statisticsLevel: e.target.value })}
                      label="Niveau de statistiques"
                    >
                      <MenuItem value="STANDARD">Standard</MenuItem>
                      <MenuItem value="BASIC">Basique</MenuItem>
                      <MenuItem value="ADVANCED">Avancé</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPlan.hasMiseEnAvant || false}
                        onChange={(e) => setNewPlan({ ...newPlan, hasMiseEnAvant: e.target.checked })}
                      />
                    }
                    label="Mise en avant"
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPlan.hasEmailNotification || false}
                        onChange={(e) => setNewPlan({ ...newPlan, hasEmailNotification: e.target.checked })}
                      />
                    }
                    label="Notifications E-mail"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight="600" color="text.primary" mb={2}>
                    Avantages du Plan
                  </Typography>
                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      label="Ajouter un avantage"
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
                      placeholder="ex: Annonces illimitées"
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
                      Ajouter
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
                        Liste des Avantages ({newPlan.benefits.length}) :
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
                Annuler
              </Button>
              <Button 
                variant="contained" 
                onClick={handleCreatePlan}
                startIcon={<SaveIcon />}
              >
                Créer le plan
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
                    Supprimer le plan d'abonnement
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cette action est irréversible
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" color="text.secondary">
                Êtes-vous sûr de vouloir supprimer le plan d'abonnement « <strong>{currentPlan?.name}</strong> » ? 
                Cette opération supprimera définitivement le plan d'abonnement et ne peut pas être annulée.
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
                Annuler
              </Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={handleDeletePlan}
                startIcon={<DeleteIcon />}
              >
                Supprimer le plan
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    )
  }
