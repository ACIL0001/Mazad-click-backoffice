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
  Grid,
  Paper,
  CircularProgress,
  Container,
  ThemeProvider,
  createTheme,
  IconButton,
  Avatar,
  Fade,
  Slide,
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
} from "@mui/icons-material"

// Import the real API - update the path based on your project structure
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
    },
    grey: {
      50: "#F8FAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
    }
  },
  // Add the required status property
  status: {
    danger: "#EF4444", // or any color value you prefer
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
  // Add customShadows if needed
  customShadows: {
    z1: '0 1px 2px rgba(0, 0, 0, 0.1)',
    z4: '0 4px 8px rgba(0, 0, 0, 0.1)',
    z8: '0 8px 16px rgba(0, 0, 0, 0.1)',
    z12: '0 12px 24px rgba(0, 0, 0, 0.1)',
    z16: '0 16px 32px rgba(0, 0, 0, 0.1)',
    z20: '0 20px 40px rgba(0, 0, 0, 0.1)',
    z24: '0 24px 48px rgba(0, 0, 0, 0.1)',
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
          background: "linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)",
          color: "#FFFFFF",
          boxShadow: '0 4px 20px rgba(14, 165, 233, 0.3)',
          "&:hover": {
            background: "linear-gradient(135deg, #0284C7 0%, #0891B2 100%)",
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
  status: string
}

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  // Subscription management states
  const [editSubscriptionDialogOpen, setEditSubscriptionDialogOpen] = useState(false)
  const [deleteSubscriptionDialogOpen, setDeleteSubscriptionDialogOpen] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)

  const [newPlan, setNewPlan] = useState<CreatePlanDto>({
    name: "",
    description: "",
    price: 0,
    duration: 1,
    role: "PROFESSIONAL",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load subscription plans
      const plansResponse = await SubscriptionAPI.getPlans()
      setPlans(plansResponse)

      // Load all user subscriptions
      try {
        const allSubsResponse = await SubscriptionAPI.getAllSubscriptions()
        setUserSubscriptions(allSubsResponse)
      } catch (subError) {
        console.warn("Could not load subscriptions:", subError)
        setUserSubscriptions([])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load subscription data. Please try again.")
      setPlans([])
      setUserSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async () => {
    try {
      setError(null)
      if (!newPlan.name.trim() || !newPlan.description.trim() || newPlan.price <= 0 || newPlan.duration <= 0) {
        setError("Please fill in all fields with valid values")
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
      })
    } catch (error) {
      console.error("Error creating plan:", error)
      setError("Failed to create plan. Please try again.")
    }
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan)
    setEditDialogOpen(true)
  }

  const handleUpdatePlan = async () => {
    if (!currentPlan || !currentPlan._id) return
    
    try {
      setError(null)
      if (!currentPlan.name.trim() || !currentPlan.description.trim() || currentPlan.price <= 0 || currentPlan.duration <= 0) {
        setError("Please fill in all fields with valid values")
        return
      }

      const updatedPlan = await SubscriptionAPI.updatePlan(currentPlan._id, {
        name: currentPlan.name,
        description: currentPlan.description,
        price: currentPlan.price,
        duration: currentPlan.duration,
        role: currentPlan.role,
      })
      
      setPlans(prev => prev.map(p => p._id === currentPlan._id ? updatedPlan : p))
      setEditDialogOpen(false)
      setCurrentPlan(null)
    } catch (error) {
      console.error("Error updating plan:", error)
      setError("Failed to update plan. Please try again.")
    }
  }

  const handleDeletePlan = async () => {
    if (!currentPlan || !currentPlan._id) return
    
    try {
      setError(null)
      await SubscriptionAPI.deletePlan(currentPlan._id)
      setPlans(prev => prev.filter(p => p._id !== currentPlan._id))
      setDeleteDialogOpen(false)
      setCurrentPlan(null)
    } catch (error) {
      console.error("Error deleting plan:", error)
      setError("Failed to delete plan. Please try again.")
    }
  }

  // Mock subscription management functions (since real API methods aren't available yet)
  const handleEditSubscription = (subscription: UserSubscription) => {
    setCurrentSubscription(subscription)
    setEditSubscriptionDialogOpen(true)
  }

  const handleUpdateSubscription = async () => {
    if (!currentSubscription) return

    try {
      // This would need a real API endpoint
      console.log("Updating subscription:", currentSubscription)
      setEditSubscriptionDialogOpen(false)
      setCurrentSubscription(null)
      // Reload data to get updated subscription
      await loadData()
    } catch (error) {
      console.error("Error updating subscription:", error)
      setError("Failed to update subscription. Please try again.")
    }
  }

  const handleDeleteSubscription = async () => {
    if (!currentSubscription) return

    try {
      // This would need a real API endpoint
      console.log("Deleting subscription:", currentSubscription._id)
      setUserSubscriptions(prev => prev.filter(s => s._id !== currentSubscription._id))
      setDeleteSubscriptionDialogOpen(false)
      setCurrentSubscription(null)
    } catch (error) {
      console.error("Error deleting subscription:", error)
      setError("Failed to delete subscription. Please try again.")
    }
  }

  const handleSubscribeToPlan = async (planId: string) => {
    if (!planId) return
    
    try {
      setError(null)
      // This would create a new subscription for the current user
      console.log("Subscribing to plan:", planId)
      // Reload data to show the new subscription
      await loadData()
    } catch (error) {
      console.error("Error subscribing to plan:", error)
      setError("Failed to subscribe to plan. Please try again.")
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
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price / 100)
  }

  const getRoleColor = (role: string) => {
    return role === 'PROFESSIONAL' ? 'primary' : 'secondary'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'EXPIRED': return 'error'
      case 'CANCELLED': return 'warning'
      default: return 'default'
    }
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
          }}
        >
          <Fade in={loading}>
            <Box textAlign="center">
              <CircularProgress size={60} sx={{ color: 'primary.main', mb: 3 }} />
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
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 6 }}>
          {error && (
            <Box mb={3}>
              <Card sx={{ backgroundColor: 'error.light', color: 'error.contrastText' }}>
                <CardContent>
                  <Typography variant="body1">{error}</Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          <Fade in timeout={800}>
            <Box mb={6} textAlign="center">
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: 'text.primary',
                  mb: 2,
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Subscription Management
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto', fontWeight: 400 }}>
                Create, manage, and monitor subscription plans and user subscriptions
              </Typography>
            </Box>
          </Fade>

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
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
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
                                  background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
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
                      Monitor and manage all user subscriptions
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
                            <Grid item xs={6} md={1.5}>
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
                            <Grid item xs={6} md={1.5}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Start Date
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                  {formatDate(subscription.startDate)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={1.5}>
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
                            <Grid item xs={6} md={1}>
                              <Chip
                                label={subscription.status}
                                color={getStatusColor(subscription.status) as any}
                                sx={{ fontWeight: 500 }}
                              />
                            </Grid>
                            <Grid item xs={6} md={1.5}>
                              <Box display="flex" gap={1}>
                                <IconButton
                                  onClick={() => handleEditSubscription(subscription)}
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
                                    setCurrentSubscription(subscription)
                                    setDeleteSubscriptionDialogOpen(true)
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
                              </Box>
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
                Fill in the details for your new subscription plan
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
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Price (Cents)"
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Duration (months)"
                    type="number"
                    value={newPlan.duration}
                    onChange={(e) => setNewPlan({ ...newPlan, duration: Number(e.target.value) })}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
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
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Price (Cents)"
                    type="number"
                    value={currentPlan?.price || 0}
                    onChange={(e) => setCurrentPlan({ ...currentPlan!, price: Number(e.target.value) })}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Duration (months)"
                    type="number"
                    value={currentPlan?.duration || 0}
                    onChange={(e) => setCurrentPlan({ ...currentPlan!, duration: Number(e.target.value) })}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
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

          {/* Delete Plan Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm">
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
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

          {/* Edit Subscription Dialog */}
          <Dialog open={editSubscriptionDialogOpen} onClose={() => setEditSubscriptionDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h5" fontWeight="600">
                  Edit User Subscription
                </Typography>
                <IconButton onClick={() => setEditSubscriptionDialogOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Modify the subscription details
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Plan Name"
                    value={currentSubscription?.planName || ""}
                    disabled
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Start Date"
                    type="datetime-local"
                    value={currentSubscription?.startDate ? new Date(currentSubscription.startDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setCurrentSubscription({ ...currentSubscription!, startDate: new Date(e.target.value).toISOString() })}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="End Date"
                    type="datetime-local"
                    value={currentSubscription?.endDate ? new Date(currentSubscription.endDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setCurrentSubscription({ ...currentSubscription!, endDate: new Date(e.target.value).toISOString() })}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={currentSubscription?.status || ""}
                      onChange={(e) => setCurrentSubscription({ ...currentSubscription!, status: e.target.value })}
                      label="Status"
                    >
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="EXPIRED">Expired</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={() => setEditSubscriptionDialogOpen(false)}
                variant="outlined"
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUpdateSubscription}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Subscription Dialog */}
          <Dialog open={deleteSubscriptionDialogOpen} onClose={() => setDeleteSubscriptionDialogOpen(false)} maxWidth="sm">
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <DeleteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    Delete User Subscription
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This action cannot be undone
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" color="text.secondary">
                Are you sure you want to delete the subscription for "<strong>{currentSubscription?.planName}</strong>"? 
                This will permanently remove the user subscription and cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={() => {
                  setDeleteSubscriptionDialogOpen(false)
                  setCurrentSubscription(null)
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={handleDeleteSubscription}
                startIcon={<DeleteIcon />}
              >
                Delete Subscription
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </ThemeProvider>
  )
}