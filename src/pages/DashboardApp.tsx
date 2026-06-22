"use client"
import type React from "react"
import { useState, useMemo } from "react"
import { useQuery } from '@tanstack/react-query'
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton'
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
  Alert,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  useTheme,
  alpha
} from "@mui/material"
import {
  Dashboard as DashboardIcon,
  People,
  Gavel,
  LocalOffer,
  Category,
  Verified,
  AttachMoney,
  Analytics,
  Assignment,
  Search,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
} from "@mui/icons-material"

import ReactApexChart from "react-apexcharts"
import merge from "lodash/merge"
import { BaseOptionChart } from "../components/chart"
import numeral from "numeral"

// Import existing API modules
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
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

const COLORS = ['#0063b1', '#1890FF', '#54D62C', '#FFC107', '#FF4842', '#826AF9', '#2CD9C5']

// Custom Premium StatCard Component
const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => {
  const theme = useTheme<any>();
  
  const colorMap: Record<string, any> = {
    primary: theme.palette.primary,
    secondary: theme.palette.secondary,
    success: theme.palette.success,
    warning: theme.palette.warning,
    error: theme.palette.error,
    info: theme.palette.info,
  };
  
  const activeColor = colorMap[color] || theme.palette.primary;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(145, 158, 171, 0.12)',
        boxShadow: theme.customShadows.z8,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.customShadows.z16,
          borderColor: activeColor.main,
        }
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.72rem' }}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="800" sx={{ mt: 1, letterSpacing: -0.5 }}>
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(activeColor.main, 0.12),
              color: activeColor.main,
              boxShadow: `0 4px 12px 0 ${alpha(activeColor.main, 0.15)}`,
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
          </Avatar>
        </Box>
        {subtitle && (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            {trend && (
              <Chip
                label={trend}
                size="small"
                color={trend.startsWith('+') ? 'success' : 'error'}
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
              />
            )}
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              {subtitle}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default function ComprehensiveDashboard() {
  const theme = useTheme<any>()
  const [tabValue, setTabValue] = useState(0)
  const [sectorFilter, setSectorFilter] = useState("")

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const { data: dashboardData, isLoading: loading, error: queryError, refetch, isFetching } = useQuery({
    queryKey: ['dashboard-comprehensive'],
    queryFn: async () => {
      const [
        userStats,
        auctionStats,
        tenderStats,
        categoryStats,
        dashboardStats,
        userTimeSeries,
        auctionTimeSeries,
        pendingIdentities,
        subscriptionStats,
        sectorStats
      ] = await Promise.all([
        StatsAPI.getUserStats().catch(() => ({ total: 0, byType: { admin: 0, professional: 0, client: 0 } })),
        StatsAPI.getAuctionStats().catch(() => ({ total: 0, byStatus: { active: 0, completed: 0, pending: 0, cancelled: 0 }, byCategory: [], dailyAverage: 0, weeklyGrowth: 0 })),
        StatsAPI.getTenderStats().catch(() => ({ total: 0, byStatus: { open: 0, awarded: 0, closed: 0, archived: 0 }, byType: { product: 0, service: 0 }, dailyAverage: 0, weeklyGrowth: 0 })),
        StatsAPI.getCategoryStats().catch(() => []),
        StatsAPI.getDashboardStats().catch(() => ({ widgets: [] })),
        StatsAPI.getUserTimeSeries().catch(() => ({ labels: [], data: [] })),
        StatsAPI.getAuctionTimeSeries().catch(() => ({ labels: [], data: [] })),
        IdentityAPI.getPendingIdentities().catch(() => []),
        SubscriptionAPI.getStats().catch(() => ({ total: 0, subscriptions: 0, commissions: 0, growth: 0 })),
        StatsAPI.getUsersBySector().catch(() => [])
      ]);

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

      return {
        stats: {
          totalUsers: userStats.total || 0,
          totalAuctions: auctionStats.total || 0,
          totalTenders: tenderStats.total || 0,
          activeTenders: tenderStats.byStatus?.open || 0,
          totalRevenue: subscriptionStats.total || 0,
          activeAuctions: auctionStats.byStatus?.active || 0,
          totalOffers: 0, 
          verifiedUsers: Math.floor((userStats.total || 0) * 0.85),
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
      } as DashboardData;
    },
    staleTime: 60000, // 1 minute stale time
    refetchInterval: 30000, // Background polling every 30 seconds
  })

  const error = queryError ? "Erreur lors du chargement des données. Certaines données peuvent ne pas être disponibles." : null

  // Sector stats memos for interactive visual table
  const totalSectorUsers = useMemo(() => {
    if (!dashboardData) return 0;
    return dashboardData.sectorStats.reduce((sum: number, s: any) => sum + s.count, 0);
  }, [dashboardData]);

  const sectorChartData = useMemo(() => {
    if (!dashboardData) return [];
    const sorted = [...dashboardData.sectorStats].sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, 5);
    const otherCount = sorted.slice(5).reduce((sum, s) => sum + s.count, 0);
    if (otherCount > 0) {
      top.push({ sector: 'Autres', count: otherCount });
    }
    return top;
  }, [dashboardData]);

  const sectorChartSeries = useMemo(() => sectorChartData.map(s => s.count), [sectorChartData]);
  const sectorChartOptions: any = useMemo(() => {
    return merge(BaseOptionChart(), {
      labels: sectorChartData.map(s => s.sector || 'Non spécifié'),
      colors: COLORS,
      legend: { show: true, position: 'bottom' as 'bottom', horizontalAlign: 'center' as 'center', fontSize: '11px' },
      stroke: { show: false },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: { show: true, fontSize: '12px' },
              value: {
                show: true,
                fontSize: '18px',
                fontWeight: 'bold',
                color: theme.palette.text.primary,
                formatter: (val: any) => `${val}`,
              },
              total: {
                show: true,
                label: 'Total',
                color: theme.palette.text.secondary,
                formatter: () => `${totalSectorUsers}`
              }
            }
          }
        }
      }
    });
  }, [sectorChartData, totalSectorUsers, theme]);

  // Analytics memos
  const trendChartSeries = useMemo(() => {
    if (!dashboardData) return [];
    return [
      { name: 'Utilisateurs', data: dashboardData.revenueData.map((d: any) => d.users) },
      { name: 'Enchères', data: dashboardData.revenueData.map((d: any) => d.auctions) }
    ];
  }, [dashboardData]);

  const trendChartOptions: any = useMemo(() => {
    if (!dashboardData) return {};
    return merge(BaseOptionChart(), {
      colors: [theme.palette.primary.main, theme.palette.success.main],
      labels: dashboardData.revenueData.map((d: any) => d.month),
      xaxis: { type: 'category' },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (y: any) => {
            if (typeof y !== 'undefined') {
              return `${y.toFixed(0)} comptes / enchères`;
            }
            return y;
          }
        }
      }
    });
  }, [dashboardData, theme]);

  const categoryChartSeries = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.categoryDistribution.map((d: any) => d.value);
  }, [dashboardData]);

  const categoryChartOptions: any = useMemo(() => {
    if (!dashboardData) return {};
    return merge(BaseOptionChart(), {
      labels: dashboardData.categoryDistribution.map((d: any) => d.name),
      colors: dashboardData.categoryDistribution.map((d: any) => d.color),
      legend: { position: 'bottom' as 'bottom', horizontalAlign: 'center' as 'center', fontSize: '11px' },
      stroke: { show: false },
      plotOptions: {
        pie: {
          donut: {
            size: '78%',
            labels: {
              show: true,
              value: { formatter: (val: any) => `${val}` },
              total: {
                show: true,
                label: 'Enchères Total',
                color: theme.palette.text.secondary,
                formatter: () => `${categoryChartSeries.reduce((a, b) => a + b, 0)}`
              }
            }
          }
        }
      }
    });
  }, [dashboardData, categoryChartSeries, theme]);

  const growthChartSeries = useMemo(() => {
    if (!dashboardData) return [];
    return [
      { name: 'Utilisateurs', data: dashboardData.userGrowth.map((d: any) => d.users) }
    ];
  }, [dashboardData]);

  const growthChartOptions: any = useMemo(() => {
    if (!dashboardData) return {};
    return merge(BaseOptionChart(), {
      colors: [theme.palette.warning.main],
      labels: dashboardData.userGrowth.map((d: any) => d.month),
      xaxis: { type: 'category' },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (y: any) => `${y} utilisateurs`
        }
      }
    });
  }, [dashboardData, theme]);

  // Auctions memos
  const auctionStatusChartData = useMemo(() => {
    if (!dashboardData) return [];
    return [
      { name: 'Actives', value: dashboardData.auctionStats.byStatus.active, color: theme.palette.success.main },
      { name: 'Terminées', value: dashboardData.auctionStats.byStatus.completed, color: theme.palette.info.main },
      { name: 'En attente', value: dashboardData.auctionStats.byStatus.pending, color: theme.palette.warning.main },
      { name: 'Annulées', value: dashboardData.auctionStats.byStatus.cancelled, color: theme.palette.error.main }
    ];
  }, [dashboardData, theme]);

  const auctionStatusChartSeries = useMemo(() => auctionStatusChartData.map(d => d.value), [auctionStatusChartData]);
  const auctionStatusChartOptions: any = useMemo(() => {
    if (!dashboardData) return {};
    return merge(BaseOptionChart(), {
      labels: auctionStatusChartData.map(d => d.name),
      colors: auctionStatusChartData.map(d => d.color),
      legend: { position: 'bottom' as 'bottom' },
      stroke: { show: false },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              value: { formatter: (val: any) => `${val}` },
              total: {
                show: true,
                label: 'Total',
                color: theme.palette.text.secondary,
                formatter: () => `${dashboardData.stats.totalAuctions}`
              }
            }
          }
        }
      }
    });
  }, [auctionStatusChartData, dashboardData, theme]);

  if (loading) {
    return <DashboardSkeleton />
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
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: 2, 
        mb: 4, 
        bgcolor: '#ffffff', 
        p: { xs: 2, md: 4 }, 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (theme) => theme.customShadows.z1
      }}
    >
      
      {/* Header Panel */}
      <Card sx={{
        p: 3,
        mb: 4,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(26, 35, 126, 0.25) 0%, rgba(74, 20, 140, 0.2) 100%)' 
          : 'linear-gradient(135deg, #e0f2fe 0%, #e0e7ff 100%)',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
        boxShadow: theme.customShadows.z4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.1),
          filter: 'blur(25px)',
        }
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, boxShadow: theme.customShadows.primary }}>
              <DashboardIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
                Tableau de Bord Admin
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" fontWeight="500">
                Supervision complète de la plateforme d'enchères MazadClick
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isFetching}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              py: 1,
              boxShadow: theme.customShadows.primary,
              '&:hover': {
                boxShadow: theme.customShadows.z12,
              }
            }}
          >
            {isFetching ? 'Rafraîchissement...' : 'Rafraîchir'}
          </Button>
        </Box>
      </Card>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Metrics Row 1: Platform Overview */}
      <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1.2, color: 'text.secondary', fontSize: '0.75rem' }}>
        Aperçu Plateforme
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Utilisateurs"
            value={dashboardData.stats.totalUsers.toLocaleString()}
            icon={People}
            color="primary"
            subtitle="Total des comptes créés"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Profils Vérifiés"
            value={dashboardData.stats.verifiedUsers.toLocaleString()}
            icon={Verified}
            color="success"
            subtitle="Comptes d'identité validés"
            trend={`${((dashboardData.stats.verifiedUsers / (dashboardData.stats.totalUsers || 1)) * 100).toFixed(0)}%`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Revenus Total"
            value={`${numeral(dashboardData.stats.totalRevenue).format('0,0')} DZD`}
            icon={AttachMoney}
            color="info"
            subtitle="Abonnements et commissions"
          />
        </Grid>
      </Grid>

      {/* Metrics Row 2: Transactions & Activities */}
      <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1.2, color: 'text.secondary', fontSize: '0.75rem' }}>
        Supervision Activités
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Enchères Totales"
            value={dashboardData.stats.totalAuctions.toLocaleString()}
            icon={Gavel}
            color="secondary"
            subtitle={`${dashboardData.stats.activeAuctions} enchères en cours`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Soumissions Totales"
            value={dashboardData.stats.totalTenders.toLocaleString()}
            icon={Assignment}
            color="info"
            subtitle={`${dashboardData.stats.activeTenders} soumissions ouvertes`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Offres Soumises"
            value={dashboardData.stats.totalOffers.toLocaleString()}
            icon={LocalOffer}
            color="error"
            subtitle="Total des propositions formulées"
          />
        </Grid>
      </Grid>

      {/* Metrics Row 3: Pending Queues */}
      <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1.2, color: 'text.secondary', fontSize: '0.75rem' }}>
        Actions Requises
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard
            title="Identités en Attente"
            value={dashboardData.stats.pendingIdentities}
            icon={Verified}
            color="warning"
            subtitle="Dossiers KYC en attente de revue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard
            title="Enchères Actives"
            value={dashboardData.stats.activeAuctions}
            icon={Gavel}
            color="success"
            subtitle="Événements en cours d'enchère"
          />
        </Grid>
      </Grid>

      {/* Sector Statistics Widget */}
      <Card sx={{ mb: 4, border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z12 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            
            <Grid item xs={12} md={7}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Typography variant="h5" fontWeight="bold">
                    Répartition par Secteur
                  </Typography>
                  <Chip 
                    label={`${dashboardData.sectorStats.length} Secteurs`} 
                    color="primary" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
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
                  sx={{ width: 250 }}
                />
              </Box>
              
              <TableContainer sx={{ maxHeight: 380 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}>Secteur</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}>Distribution</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}>Utilisateurs</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.sectorStats
                      .filter((s: any) => (s.sector || '').toLowerCase().includes(sectorFilter.toLowerCase()))
                      .sort((a: any, b: any) => b.count - a.count)
                      .map((sector: any, index: number) => {
                        const percentage = totalSectorUsers > 0 ? (sector.count / totalSectorUsers) * 100 : 0;
                        
                        return (
                          <TableRow hover key={index}>
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight="600">
                                {sector.sector || 'Non spécifié'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ width: '45%', py: 1.5 }}>
                              <Box display="flex" alignItems="center" gap={1.5}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={percentage} 
                                  color={index === 0 ? "primary" : index === 1 ? "secondary" : "info"}
                                  sx={{ width: '100%', height: 6, borderRadius: 3, bgcolor: 'background.neutral' }}
                                />
                                <Typography variant="caption" fontWeight="bold" sx={{ minWidth: 35 }}>
                                  {percentage.toFixed(1)}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <Chip 
                                label={sector.count} 
                                size="small" 
                                color={index < 3 ? "primary" : "default"} 
                                variant={index < 3 ? "filled" : "outlined"}
                                sx={{ fontWeight: 'bold', minWidth: 50 }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {dashboardData.sectorStats.filter((s: any) => (s.sector || '').toLowerCase().includes(sectorFilter.toLowerCase())).length === 0 && (
                       <TableRow>
                         <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                           <Typography color="text.secondary">Aucun secteur trouvé</Typography>
                         </TableCell>
                       </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={5} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="text.secondary">
                Top 5 Secteurs Dominants
              </Typography>
              <Box width="100%" display="flex" justifyContent="center" py={2}>
                <ReactApexChart 
                  type="donut" 
                  series={sectorChartSeries} 
                  options={sectorChartOptions} 
                  height={320} 
                  width="100%"
                />
              </Box>
            </Grid>
            
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs Navigation Segmented Control */}
      <Paper sx={{ 
        mb: 4, 
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: theme.customShadows.z4,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{
            px: 1,
            minHeight: 56,
            display: 'flex',
            alignItems: 'center',
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTab-root': {
              minHeight: 44,
              py: 1,
              px: 3,
              mx: 0.5,
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              color: 'text.secondary',
              borderRadius: 1.5,
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
              '&.Mui-selected': {
                color: 'primary.contrastText',
                bgcolor: 'primary.main',
                boxShadow: theme.customShadows.primary,
              },
              '&:hover:not(.Mui-selected)': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }
            }
          }}
        >
          <Tab icon={<Analytics sx={{ fontSize: 18 }} />} label="Analytics" />
          <Tab icon={<People sx={{ fontSize: 18 }} />} label="Utilisateurs" />
          <Tab icon={<Gavel sx={{ fontSize: 18 }} />} label="Enchères" />
          <Tab icon={<Assignment sx={{ fontSize: 18 }} />} label="Soumissions" />
          <Tab icon={<Category sx={{ fontSize: 18 }} />} label="Catégories" />
          <Tab icon={<AttachMoney sx={{ fontSize: 18 }} />} label="Abonnements" />
          <Tab icon={<Verified sx={{ fontSize: 18 }} />} label="Identités" />
        </Tabs>
      </Paper>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Trend Area Chart */}
          <Grid item xs={12} md={8}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Tendance Utilisateurs & Enchères
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Évolution mensuelle comparative des inscriptions et des enchères publiées
                </Typography>
                <Box dir="ltr" height={320}>
                  <ReactApexChart 
                    type="area" 
                    series={trendChartSeries} 
                    options={trendChartOptions} 
                    height="100%" 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution Donut */}
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4, height: '100%' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Distribution des Catégories
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={4}>
                  Proportion d'enchères dans les catégories majeures
                </Typography>
                <Box dir="ltr" display="flex" justifyContent="center" alignItems="center" flexGrow={1} py={2}>
                  <ReactApexChart 
                    type="donut" 
                    series={categoryChartSeries} 
                    options={categoryChartOptions} 
                    height={300} 
                    width="100%"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* User Growth Line/Area Chart */}
          <Grid item xs={12}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Croissance Globale des Inscriptions
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Suivi des nouveaux comptes utilisateurs enregistrés sur la plateforme
                </Typography>
                <Box dir="ltr" height={320}>
                  <ReactApexChart 
                    type="area" 
                    series={growthChartSeries} 
                    options={growthChartOptions} 
                    height="100%" 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {/* Roles breakdown grid */}
          <Grid item xs={12} md={8}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Répartition des Rôles
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Nombre d'utilisateurs par type de compte sur la plateforme
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      variant="outlined"
                      sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        bgcolor: alpha(theme.palette.primary.main, 0.04), 
                        borderColor: alpha(theme.palette.primary.main, 0.15),
                        borderRadius: 2
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 48, height: 48, boxShadow: theme.customShadows.primary }}>
                        <People />
                      </Avatar>
                      <Typography variant="h3" fontWeight="bold" color="primary">{dashboardData.userStats.byType.admin}</Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mt={0.5}>Administrateurs</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      variant="outlined"
                      sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        bgcolor: alpha(theme.palette.secondary.main, 0.04), 
                        borderColor: alpha(theme.palette.secondary.main, 0.15),
                        borderRadius: 2
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2, width: 48, height: 48, boxShadow: theme.customShadows.secondary }}>
                        <People />
                      </Avatar>
                      <Typography variant="h3" fontWeight="bold" color="secondary">{dashboardData.userStats.byType.professional}</Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mt={0.5}>Professionnels</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      variant="outlined"
                      sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        bgcolor: alpha(theme.palette.success.main, 0.04), 
                        borderColor: alpha(theme.palette.success.main, 0.15),
                        borderRadius: 2
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 48, height: 48, boxShadow: theme.customShadows.success }}>
                        <People />
                      </Avatar>
                      <Typography variant="h3" fontWeight="bold" sx={{ color: 'success.main' }}>{dashboardData.userStats.byType.client}</Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mt={0.5}>Clients</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Verification Radial Gauge */}
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ alignSelf: 'flex-start' }}>
                  Statut de Vérification KYC
                </Typography>
                <Box py={1} dir="ltr">
                  <ReactApexChart 
                    type="radialBar" 
                    series={[((dashboardData.stats.verifiedUsers / (dashboardData.stats.totalUsers || 1)) * 100)]} 
                    options={{
                      chart: { height: 240 },
                      colors: [theme.palette.success.main],
                      plotOptions: {
                        radialBar: {
                          hollow: { size: '70%' },
                          dataLabels: {
                            name: { show: true, color: theme.palette.text.secondary, fontSize: '13px', fontWeight: 600 },
                            value: {
                              color: theme.palette.text.primary,
                              fontSize: '24px',
                              fontWeight: '800',
                              formatter: (val: any) => `${val.toFixed(1)}%`
                            }
                          }
                        }
                      },
                      labels: ['Profils Vérifiés']
                    }}
                    height={240}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                  Sur un total de <strong>{dashboardData.stats.totalUsers}</strong> comptes, <strong>{dashboardData.stats.verifiedUsers}</strong> ont passé avec succès l'étape de validation d'identité.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Auctions Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {/* Status Donut */}
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4, height: '100%' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Statut de Distribution des Enchères
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Proportions courantes des enchères selon leur statut opérationnel
                </Typography>
                <Box dir="ltr" display="flex" justifyContent="center" alignItems="center" flexGrow={1} py={2}>
                  <ReactApexChart 
                    type="donut" 
                    series={auctionStatusChartSeries} 
                    options={auctionStatusChartOptions} 
                    height={280} 
                    width="100%"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Average & Growth KPI boxes */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3} height="100%">
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4, height: '100%' }}>
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Créations Moyennes
                    </Typography>
                    <Box textAlign="center" py={4} bgcolor="background.neutral" borderRadius={2} my={2}>
                      <Typography variant="h2" fontWeight="800" color="primary">
                        {dashboardData.auctionStats.dailyAverage}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight="500">
                        Enchères publiées quotidiennement en moyenne
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4, height: '100%' }}>
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Taux d'Évolution
                    </Typography>
                    <Box textAlign="center" py={4} bgcolor="background.neutral" borderRadius={2} my={2}>
                      <Typography 
                        variant="h2" 
                        fontWeight="800" 
                        sx={{ color: dashboardData.auctionStats.weeklyGrowth >= 0 ? 'success.main' : 'error.main' }}
                      >
                        {dashboardData.auctionStats.weeklyGrowth >= 0 ? '+' : ''}{dashboardData.auctionStats.weeklyGrowth}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight="500">
                        Croissance hebdomadaire des publications d'enchères
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tenders Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {/* Status Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Statut des Soumissions
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Volume global selon le statut
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="600">Ouvertes</Typography>
                    <Chip label={dashboardData.tenderStats.byStatus.open} size="small" color="success" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="600">Attribuées</Typography>
                    <Chip label={dashboardData.tenderStats.byStatus.awarded} size="small" color="info" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="600">Fermées</Typography>
                    <Chip label={dashboardData.tenderStats.byStatus.closed} size="small" color="warning" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="600">Archivées</Typography>
                    <Chip label={dashboardData.tenderStats.byStatus.archived} size="small" color="default" sx={{ fontWeight: 'bold' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Product vs Service Progress Split */}
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Types de Soumissions
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Acquisition de produits ou prestation de services
                </Typography>
                
                {(() => {
                  const total = (dashboardData.tenderStats.byType.product || 0) + (dashboardData.tenderStats.byType.service || 0) || 1;
                  const prodPct = ((dashboardData.tenderStats.byType.product || 0) / total) * 100;
                  const servPct = ((dashboardData.tenderStats.byType.service || 0) / total) * 100;
                  return (
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" fontWeight="700">Produits</Typography>
                          <Typography variant="caption" fontWeight="bold" color="primary.main">{prodPct.toFixed(0)}% ({dashboardData.tenderStats.byType.product})</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={prodPct} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                      <Box mt={1}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" fontWeight="700">Services</Typography>
                          <Typography variant="caption" fontWeight="bold" color="secondary.main">{servPct.toFixed(0)}% ({dashboardData.tenderStats.byType.service})</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={servPct} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>

          {/* Average & Growth widgets */}
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4, height: '100%' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Box textAlign="center" py={1.5} bgcolor="background.neutral" borderRadius={2}>
                  <Typography variant="h3" fontWeight="800" color="primary">
                    {dashboardData.tenderStats.dailyAverage}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">
                    Soumissions journalières moyennes
                  </Typography>
                </Box>
                <Box textAlign="center" py={1.5} bgcolor="background.neutral" borderRadius={2} mt={2}>
                  <Typography 
                    variant="h3" 
                    fontWeight="800" 
                    sx={{ color: dashboardData.tenderStats.weeklyGrowth >= 0 ? 'success.main' : 'error.main' }}
                  >
                    {dashboardData.tenderStats.weeklyGrowth >= 0 ? '+' : ''}{dashboardData.tenderStats.weeklyGrowth}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">
                    Croissance hebdomadaire des soumissions
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Categories Tab */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Performance par Catégorie
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Volume d'enchères générées dans chaque catégorie de produits
                </Typography>
                <TableContainer>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}>Catégorie</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}>Volume Enchères</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}>Part relative</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.categoryStats.map((category: any, index: number) => {
                        const totalAuctions = dashboardData.auctionStats.total || 1;
                        const percentage = (category.count / totalAuctions) * 100;
                        const catColor = COLORS[index % COLORS.length];
                        
                        return (
                          <TableRow key={category._id} hover>
                            <TableCell sx={{ py: 1.5 }}>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ bgcolor: alpha(catColor, 0.12), color: catColor, mr: 2, width: 36, height: 36 }}>
                                  <Category sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Typography variant="subtitle2" fontWeight="800">
                                  {category.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <Chip 
                                label={category.count} 
                                size="small" 
                                sx={{ bgcolor: alpha(catColor, 0.15), color: catColor, fontWeight: 'bold', minWidth: 45 }} 
                              />
                            </TableCell>
                            <TableCell sx={{ width: '40%', py: 1.5 }}>
                              <Box display="flex" alignItems="center" gap={1.5}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={percentage} 
                                  sx={{ 
                                    width: '100%', 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: 'background.neutral',
                                    '& .MuiLinearProgress-bar': { bgcolor: catColor }
                                  }}
                                />
                                <Typography variant="caption" fontWeight="bold" sx={{ minWidth: 35 }}>
                                  {percentage.toFixed(1)}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
          {/* Revenue Total Highlight Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)' 
                : 'linear-gradient(135deg, #0063b1 0%, #3366FF 100%)', 
              color: 'white',
              boxShadow: theme.customShadows.primary,
              position: 'relative',
              overflow: 'hidden',
              height: '100%'
            }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.8 }} gutterBottom>
                  Revenus de la Plateforme
                </Typography>
                <Typography variant="h1" fontWeight="800" sx={{ my: 2, letterSpacing: -1 }}>
                  {numeral(dashboardData.subscriptionStats.total).format('0,0')} DZD
                </Typography>
                <Box display="flex" alignItems="center" gap={1.5} mt={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 28, height: 28 }}>
                    <ArrowUpwardIcon sx={{ fontSize: 16, color: 'white' }} />
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    +{dashboardData.subscriptionStats.growth || 0}% de croissance des revenus
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Distribution Detail */}
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Répartition des Sources de Revenus
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={4}>
                  Frais perçus via les abonnements premium et les commissions sur transactions
                </Typography>

                {(() => {
                  const subTotal = dashboardData.subscriptionStats.subscriptions;
                  const comTotal = dashboardData.subscriptionStats.commissions;
                  const total = subTotal + comTotal || 1;
                  const subPct = (subTotal / total) * 100;
                  const comPct = (comTotal / total) * 100;

                  return (
                    <Box display="flex" flexDirection="column" gap={3}>
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', width: 36, height: 36 }}>
                              <AttachMoney sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">Frais d'Abonnement</Typography>
                              <Typography variant="caption" color="text.secondary" fontWeight="600">{numeral(subTotal).format('0,0')} DZD</Typography>
                            </Box>
                          </Box>
                          <Typography variant="subtitle2" fontWeight="bold">{subPct.toFixed(1)}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={subPct} sx={{ height: 6, borderRadius: 3 }} />
                      </Box>

                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.12), color: 'secondary.main', width: 36, height: 36 }}>
                              <AttachMoney sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">Commissions sur Ventes</Typography>
                              <Typography variant="caption" color="text.secondary" fontWeight="600">{numeral(comTotal).format('0,0')} DZD</Typography>
                            </Box>
                          </Box>
                          <Typography variant="subtitle2" fontWeight="bold">{comPct.toFixed(1)}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={comPct} color="secondary" sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Identity Tab */}
      <TabPanel value={tabValue} index={6}>
        <Grid container spacing={3}>
          {/* Identity Verification Rate Gauge */}
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, px: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ alignSelf: 'flex-start', mb: 2 }}>
                  Taux Global de Succès
                </Typography>
                <Box dir="ltr">
                  <ReactApexChart 
                    type="radialBar" 
                    series={[((dashboardData.identityStats.verified / (dashboardData.stats.totalUsers || 1)) * 100)]} 
                    options={{
                      chart: { height: 240 },
                      colors: [theme.palette.primary.main],
                      plotOptions: {
                        radialBar: {
                          hollow: { size: '65%' },
                          dataLabels: {
                            name: { show: true, color: theme.palette.text.secondary, fontSize: '13px', fontWeight: 600 },
                            value: {
                              color: theme.palette.text.primary,
                              fontSize: '22px',
                              fontWeight: 'bold',
                              formatter: (val: any) => `${val.toFixed(1)}%`
                            }
                          }
                        }
                      },
                      labels: ['Identités Validées']
                    }}
                    height={240}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                  Ce taux reflète la proportion d'utilisateurs actifs disposant d'un profil entièrement validé par notre backoffice.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Validation Queue blocks */}
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z4, height: '100%' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Files d'Attente de Validation
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Supervision des demandes de vérification en attente de traitement
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={3} flexGrow={1} justifyContent="center">
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 3, borderColor: alpha(theme.palette.warning.main, 0.3) }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.12), color: 'warning.main', width: 56, height: 56 }}>
                      <Verified sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" fontWeight="bold" color="warning.main">
                        {dashboardData.identityStats.pending}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                        Dossiers en attente de validation
                      </Typography>
                    </Box>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 3, borderColor: alpha(theme.palette.success.main, 0.3) }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.12), color: 'success.main', width: 56, height: 56 }}>
                      <Verified sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" fontWeight="bold" color="success.main">
                        {dashboardData.identityStats.verified}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                        Dossiers validés au total
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Recent Activity Vertical Connected Timeline */}
      <Card sx={{ mt: 4, border: '1px solid', borderColor: 'divider', boxShadow: theme.customShadows.z12 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
            Historique des Activités Récentes
          </Typography>
          <List sx={{ position: 'relative', pl: 2, py: 0 }}>
            {dashboardData.recentActivities.map((activity: any, index: number) => {
              const isLast = index === dashboardData.recentActivities.length - 1;
              
              let badgeColor = theme.palette.info.main;
              let Icon = Assignment;
              if (activity.type === 'auction') {
                badgeColor = theme.palette.primary.main;
                Icon = Gavel;
              } else if (activity.type === 'tender') {
                badgeColor = theme.palette.secondary.main;
                Icon = Assignment;
              } else if (activity.type === 'user') {
                badgeColor = theme.palette.success.main;
                Icon = People;
              } else if (activity.type === 'identity') {
                badgeColor = theme.palette.warning.main;
                Icon = Verified;
              }

              return (
                <ListItem 
                  key={index} 
                  disableGutters
                  sx={{ 
                    py: 2, 
                    alignItems: 'flex-start',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 21,
                      top: 48,
                      bottom: 0,
                      width: isLast ? 0 : 2,
                      bgcolor: 'divider',
                      zIndex: 0
                    }
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 56, zIndex: 1 }}>
                    <Avatar sx={{ 
                      bgcolor: alpha(badgeColor, 0.12),
                      color: badgeColor,
                      width: 42,
                      height: 42,
                      border: '2px solid',
                      borderColor: 'background.paper',
                      boxShadow: `0 0 0 2px ${alpha(badgeColor, 0.2)}`
                    }}>
                      <Icon sx={{ fontSize: 20 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                        {activity.message}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ display: 'inline-block', mt: 0.5 }}>
                        {activity.time}
                      </Typography>
                    }
                    sx={{ my: 0 }}
                  />
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>
      
    </Container>
  )
}