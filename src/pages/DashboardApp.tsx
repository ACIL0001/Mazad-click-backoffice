"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material"
import {
  Dashboard as DashboardIcon,
  People,
  ShoppingCart,
  Gavel,
  LocalOffer,
  Category,
  Verified,
  AttachMoney,
  MoreVert,
  Analytics,
  Assignment,
} from "@mui/icons-material"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TextField, InputAdornment } from "@mui/material"
import { Search } from "@mui/icons-material"

// Import your existing API modules
import { StatsAPI } from '../api/stats'
import { UserAPI } from '../api/user'
import { AuctionsAPI } from '../api/auctions'
import { TendersAPI } from '../api/tenders'
import { OffersAPI } from '../api/offers'
import { CategoryAPI } from '../api/category'
import { SubscriptionAPI } from '../api/subscription'
import { IdentityAPI } from '../api/identity'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

interface DashboardData {
  stats: {
    totalUsers: number
    totalAuctions: number
    totalTenders: number
    activeTenders: number
    totalRevenue: number
    activeAuctions: number
    totalOffers: number
    verifiedUsers: number
    pendingIdentities: number
  }
  userStats: any
  auctionStats: any
  tenderStats: any
  categoryStats: any
  identityStats: any
  subscriptionStats: any
  sectorStats: any[]
  revenueData: any[]
  userGrowth: any[]
  categoryDistribution: any[]
  recentActivities: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658']

export default function ComprehensiveDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [sectorFilter, setSectorFilter] = useState("")

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const fetchAllData = async () => {
    setError(null)
    
    try {
      
      const userStats = await StatsAPI.getUserStats().catch(err => {
        console.warn('User stats failed:', err);
        return { total: 0, byType: { admin: 0, professional: 0, client: 0, reseller: 0 } };
      });
      
      const auctionStats = await StatsAPI.getAuctionStats().catch(err => {
        console.warn('Auction stats failed:', err);
        return { 
          total: 0, 
          byStatus: { active: 0, completed: 0, pending: 0, cancelled: 0 },
          byCategory: [],
          dailyAverage: 0,
          weeklyGrowth: 0
        };
      });
      
      const tenderStats = await StatsAPI.getTenderStats().catch(err => {
        console.warn('Tender stats failed:', err);
        return { 
          total: 0, 
          byStatus: { open: 0, awarded: 0, closed: 0, archived: 0 },
          byType: { product: 0, service: 0 },
          dailyAverage: 0,
          weeklyGrowth: 0
        };
      });
      
      const categoryStats = await StatsAPI.getCategoryStats().catch(err => {
        console.warn('Category stats failed:', err);
        return [];
      });
      
      const dashboardStats = await StatsAPI.getDashboardStats().catch(err => {
        console.warn('Dashboard stats failed:', err);
        return { widgets: [] };
      });
      
      const userTimeSeries = await StatsAPI.getUserTimeSeries().catch(err => {
        console.warn('User time series failed:', err);
        return { labels: [], data: [] };
      });
      
      const auctionTimeSeries = await StatsAPI.getAuctionTimeSeries().catch(err => {
        console.warn('Auction time series failed:', err);
        return { labels: [], data: [] };
      });
      
      const pendingIdentities = await IdentityAPI.getPendingIdentities().catch(err => {
        console.warn('Pending identities failed:', err);
        return [];
      });
      
      const subscriptionStats = await SubscriptionAPI.getStats().catch(err => {
        console.warn('Subscription stats failed:', err);
        return { total: 0, subscriptions: 0, commissions: 0, growth: 0 };
      });

      const sectorStats = await StatsAPI.getUsersBySector().catch(err => {
        console.warn('Sector stats failed:', err);
        return [];
      });

      // Process category distribution for pie chart
      const categoryDistribution = categoryStats.slice(0, 5).map((cat, index) => ({
        name: cat.name,
        value: cat.count,
        color: COLORS[index % COLORS.length]
      }))

      // Process user growth data
      const userGrowthData = userTimeSeries.labels.map((label, index) => ({
        month: label,
        users: userTimeSeries.data[index] || 0
      }))

      // Process auction trend data
      const auctionTrendData = auctionTimeSeries.labels.map((label, index) => ({
        month: label,
        auctions: auctionTimeSeries.data[index] || 0,
        users: userTimeSeries.data[index] || 0
      }))

      // Generate recent activities
      const recentActivities = [
        { type: 'auction', message: `${auctionStats.byStatus.active} enchères actives en cours`, time: 'Maintenant' },
        { type: 'tender', message: `${tenderStats.byStatus.open} soumissions ouvertes`, time: '2 min' },
        { type: 'user', message: `${userStats.total} utilisateurs au total`, time: '5 min' },
        { type: 'identity', message: `${pendingIdentities.length} vérifications en attente`, time: '23 min' },
        { type: 'subscription', message: 'Revenus d\'abonnements mis à jour', time: '1 h' }
      ]

      const processedData: DashboardData = {
        stats: {
          totalUsers: userStats.total || 0,
          totalAuctions: auctionStats.total || 0,
          totalTenders: tenderStats.total || 0,
          activeTenders: tenderStats.byStatus?.open || 0,
          totalRevenue: subscriptionStats.total || 0,
          activeAuctions: auctionStats.byStatus?.active || 0,
          totalOffers: 0, // Will be updated when offers API is called
          verifiedUsers: Math.floor((userStats.total || 0) * 0.85), // Approximation
          pendingIdentities: pendingIdentities.length || 0
        },
        userStats,
        auctionStats,
        tenderStats,
        categoryStats,
        identityStats: {
          pending: pendingIdentities.length || 0,
          verified: Math.floor((userStats.total || 0) * 0.85)
        },
        subscriptionStats,
        sectorStats,
        revenueData: auctionTrendData,
        userGrowth: userGrowthData,
        categoryDistribution,
        recentActivities
      }

      setDashboardData(processedData)
    } catch (err) {
      setError("Erreur lors du chargement des données. Certaines données peuvent ne pas être disponibles.")
      
      // Set fallback data to prevent complete failure
      setDashboardData({
        stats: {
          totalUsers: 0,
          totalAuctions: 0,
          totalTenders: 0,
          activeTenders: 0,
          totalRevenue: 0,
          activeAuctions: 0,
          totalOffers: 0,
          verifiedUsers: 0,
          pendingIdentities: 0
        },
        userStats: { total: 0, byType: { admin: 0, professional: 0, client: 0, reseller: 0 } },
        auctionStats: { total: 0, byStatus: { active: 0, completed: 0, pending: 0, cancelled: 0 }, byCategory: [], dailyAverage: 0, weeklyGrowth: 0 },
        tenderStats: { total: 0, byStatus: { open: 0, awarded: 0, closed: 0, archived: 0 }, byType: { product: 0, service: 0 }, dailyAverage: 0, weeklyGrowth: 0 },
        categoryStats: [],
        identityStats: { pending: 0, verified: 0 },
        subscriptionStats: { total: 0, subscriptions: 0, commissions: 0, growth: 0 },
        sectorStats: [],
        revenueData: [],
        userGrowth: [],
        categoryDistribution: [],
        recentActivities: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchAllData()
    
    // Set up polling every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchAllData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{ mt: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Chargement du tableau de bord...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (!dashboardData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">
          Erreur critique lors du chargement des données.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <DashboardIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Tableau de Bord Admin
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Analyse complète de la plateforme d'enchères
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.stats.totalUsers.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Utilisateurs Total
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.stats.totalAuctions.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Enchères Total
                  </Typography>
                </Box>
                <Gavel sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", color: "white" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.stats.totalTenders.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Soumissions Total
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(dashboardData.stats.totalRevenue / 1000).toFixed(0)}DZD
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Revenus Total
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.stats.activeAuctions}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Enchères Actives
                  </Typography>
                </Box>
                <Gavel sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)", color: "white" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.stats.activeTenders}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Soumissions Actives
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second Row of Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", color: "#333" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.stats.verifiedUsers.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Utilisateurs Vérifiés
                  </Typography>
                </Box>
                <Verified sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", color: "#333" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.stats.pendingIdentities}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Vérifications en Attente
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", color: "#333" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.stats.totalOffers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Offres Total
                  </Typography>
                </Box>
                <LocalOffer sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sector Statistics Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Utilisateurs par Secteur
                  </Typography>
                  <Chip 
                    label={`${dashboardData.sectorStats.reduce((sum, s) => sum + s.count, 0)} Total`} 
                    color="primary" 
                    size="small"
                  />
                </Box>
                <TextField
                  placeholder="Rechercher un secteur..."
                  size="small"
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: { xs: '100%', sm: 300 } }}
                />
              </Box>
              
              <TableContainer sx={{ maxHeight: 450 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Secteur</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Utilisateurs</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.sectorStats
                      .filter(s => (s.sector || '').toLowerCase().includes(sectorFilter.toLowerCase()))
                      .sort((a, b) => b.count - a.count)
                      .map((sector, index) => {
                        const totalUsers = dashboardData.sectorStats.reduce((sum, s) => sum + s.count, 0);
                        const percentage = totalUsers > 0 ? (sector.count / totalUsers) * 100 : 0;
                        
                        return (
                          <TableRow hover key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="500">
                                {sector.sector || 'Non spécifié'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={sector.count} 
                                size="small" 
                                color="primary" 
                                variant={index < 3 ? "filled" : "outlined"}
                                sx={{ fontWeight: 'bold', minWidth: 40 }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {dashboardData.sectorStats.filter(s => (s.sector || '').toLowerCase().includes(sectorFilter.toLowerCase())).length === 0 && (
                       <TableRow>
                         <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                           <Typography color="text.secondary">Aucun secteur trouvé</Typography>
                         </TableCell>
                       </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Analytics />} label="Analytics" />
          <Tab icon={<People />} label="Utilisateurs" />
          <Tab icon={<Gavel />} label="Enchères" />
          <Tab icon={<Assignment />} label="Soumissions" />
          <Tab icon={<Category />} label="Catégories" />
          <Tab icon={<AttachMoney />} label="Abonnements" />
          <Tab icon={<Verified />} label="Identités" />
        </Tabs>
      </Paper>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Revenue Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tendance Utilisateurs & Enchères
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="auctions" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribution des Catégories
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {dashboardData.categoryDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* User Growth */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Croissance des Utilisateurs
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#ff7300" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Répartition des Utilisateurs
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center" p={2} bgcolor="#e3f2fd" borderRadius={2}>
                      <Typography variant="h4" color="primary">{dashboardData.userStats.byType.admin}</Typography>
                      <Typography variant="body2">Administrateurs</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center" p={2} bgcolor="#f3e5f5" borderRadius={2}>
                      <Typography variant="h4" color="secondary">{dashboardData.userStats.byType.professional}</Typography>
                      <Typography variant="body2">Professionnels</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center" p={2} bgcolor="#e8f5e8" borderRadius={2}>
                      <Typography variant="h4" style={{ color: '#4caf50' }}>{dashboardData.userStats.byType.client}</Typography>
                      <Typography variant="body2">Clients</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center" p={2} bgcolor="#fff3e0" borderRadius={2}>
                      <Typography variant="h4" style={{ color: '#ff9800' }}>{dashboardData.userStats.byType.reseller}</Typography>
                      <Typography variant="body2">Revendeurs</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Activité des Utilisateurs
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body2">Taux de Vérification</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(dashboardData.stats.verifiedUsers / dashboardData.stats.totalUsers) * 100} 
                      sx={{ mt: 1 }} 
                    />
                    <Typography variant="caption">
                      {((dashboardData.stats.verifiedUsers / dashboardData.stats.totalUsers) * 100).toFixed(1)}% des utilisateurs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Auctions Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statut des Enchères
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Enchères Actives</Typography>
                    <Chip label={dashboardData.auctionStats.byStatus.active} color="success" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Enchères Terminées</Typography>
                    <Chip label={dashboardData.auctionStats.byStatus.completed} color="info" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>En Attente</Typography>
                    <Chip label={dashboardData.auctionStats.byStatus.pending} color="warning" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Annulées</Typography>
                    <Chip label={dashboardData.auctionStats.byStatus.cancelled} color="error" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Métriques des Enchères
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="primary">
                      {dashboardData.auctionStats.dailyAverage}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enchères par jour en moyenne
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h4" color={dashboardData.auctionStats.weeklyGrowth >= 0 ? "success.main" : "error.main"}>
                      {dashboardData.auctionStats.weeklyGrowth >= 0 ? '+' : ''}{dashboardData.auctionStats.weeklyGrowth}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Croissance hebdomadaire
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tenders/Soumissions Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statut des Soumissions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Soumissions Ouvertes</Typography>
                    <Chip label={dashboardData.tenderStats.byStatus.open} color="success" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Attribuées</Typography>
                    <Chip label={dashboardData.tenderStats.byStatus.awarded} color="info" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Fermées</Typography>
                    <Chip label={dashboardData.tenderStats.byStatus.closed} color="warning" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Archivées</Typography>
                    <Chip label={dashboardData.tenderStats.byStatus.archived} color="default" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Types de Soumissions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Produits</Typography>
                    <Chip label={dashboardData.tenderStats.byType.product} color="primary" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Services</Typography>
                    <Chip label={dashboardData.tenderStats.byType.service} color="secondary" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Métriques des Soumissions
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box textAlign="center" p={3} bgcolor="#f5f5f5" borderRadius={2}>
                      <Typography variant="h3" color="primary">
                        {dashboardData.tenderStats.dailyAverage}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Soumissions par jour en moyenne
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box textAlign="center" p={3} bgcolor="#f5f5f5" borderRadius={2}>
                      <Typography variant="h3" color={dashboardData.tenderStats.weeklyGrowth >= 0 ? "success.main" : "error.main"}>
                        {dashboardData.tenderStats.weeklyGrowth >= 0 ? '+' : ''}{dashboardData.tenderStats.weeklyGrowth}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Croissance hebdomadaire
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Categories Tab */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance par Catégorie
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Catégorie</TableCell>
                        <TableCell align="right">Nombre d'enchères</TableCell>
                        <TableCell align="right">Pourcentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.categoryStats.map((category: any, index: number) => (
                        <TableRow key={category._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ bgcolor: COLORS[index % COLORS.length], mr: 2, width: 24, height: 24 }}>
                                <Category sx={{ fontSize: 16 }} />
                              </Avatar>
                              {category.name}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{category.count}</TableCell>
                          <TableCell align="right">
                            {dashboardData.auctionStats.total > 0 
                              ? ((category.count / dashboardData.auctionStats.total) * 100).toFixed(1)
                              : 0}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Subscriptions Tab */}
      <TabPanel value={tabValue} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenus des Abonnements
                </Typography>
                <Typography variant="h3">
                  {(dashboardData.subscriptionStats.total / 1000).toFixed(0)}DZD
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  Total des revenus
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
                  Croissance: +{dashboardData.subscriptionStats.growth || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Répartition des Revenus
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Abonnements</Typography>
                    <Typography fontWeight="bold">
                      {(dashboardData.subscriptionStats.subscriptions / 1000).toFixed(0)}DZD
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Commissions</Typography>
                    <Typography fontWeight="bold">
                      {(dashboardData.subscriptionStats.commissions / 1000).toFixed(0)}DZD
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Identity Tab */}
      <TabPanel value={tabValue} index={6}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statut de Vérification d'Identité
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Vérifications en Attente</Typography>
                    <Chip label={dashboardData.identityStats.pending} color="warning" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Utilisateurs Vérifiés</Typography>
                    <Chip label={dashboardData.identityStats.verified} color="success" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Taux de Vérification
                </Typography>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary">
                    {dashboardData.stats.totalUsers > 0 
                      ? ((dashboardData.identityStats.verified / dashboardData.stats.totalUsers) * 100).toFixed(1)
                      : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Taux de succès
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Recent Activity */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activité Récente
          </Typography>
          <List>
            {dashboardData.recentActivities.map((activity: any, index: number) => (
              <ListItem key={index} divider={index < dashboardData.recentActivities.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: activity.type === 'auction' ? 'primary.main' : 
                             activity.type === 'tender' ? 'secondary.main' :
                             activity.type === 'user' ? 'success.main' : 
                             activity.type === 'identity' ? 'warning.main' : 'info.main'
                  }}>
                    {activity.type === 'auction' ? <Gavel /> :
                     activity.type === 'tender' ? <Assignment /> :
                     activity.type === 'user' ? <People /> :
                     activity.type === 'identity' ? <Verified /> : <Assignment />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={activity.message}
                  secondary={activity.time}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

{/* Animation styles removed for performance optimization */}
    </Container>
  )
}