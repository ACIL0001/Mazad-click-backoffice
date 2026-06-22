import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Tabs, Tab, Paper, Grid, Card, CardContent,
  Chip, Select, MenuItem, TextField, LinearProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress,
  IconButton, Tooltip as MuiTooltip, Alert, useTheme, alpha,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, People, Visibility, TouchApp, Search,
  LocationOn, Timeline, BarChart, Speed, Refresh, FiberManualRecord,
} from '@mui/icons-material';
import { AnalyticsAPI, DateRangeParams } from '../../api/analytics';
import type {
  OverviewData, TrafficData, GeographicData, FunnelsData,
  SearchData, EcommerceData, RealtimeData, JourneysData
} from '../../api/analytics';
import { useCreateSocket } from '../../contexts/SocketContext';
import JourneysTab from './components/JourneysTab';
import HeatmapsTab from './components/HeatmapsTab';

// ═══════════════════════════════════════════
// ██  REUSABLE COMPONENTS
// ═══════════════════════════════════════════

function KPICard({
  title, value, subtitle, icon, color, trend,
}: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ReactNode; color: string; trend?: number;
}) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.03)} 100%)`,
        border: `1px solid ${alpha(color, 0.15)}`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              p: 1.5, borderRadius: 2,
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          {trend !== undefined && (
            <Chip
              size="small"
              icon={trend >= 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
              label={`${trend >= 0 ? '+' : ''}${trend}%`}
              sx={{
                bgcolor: trend >= 0 ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
                color: trend >= 0 ? '#4caf50' : '#f44336',
                fontWeight: 600, fontSize: '0.75rem',
              }}
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: theme.palette.text.disabled, mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function DateRangePicker({
  from, to, onChange,
}: {
  from: string; to: string;
  onChange: (from: string, to: string) => void;
}) {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <TextField
        type="date" size="small" label="From" value={from}
        onChange={(e) => onChange(e.target.value, to)}
        InputLabelProps={{ shrink: true }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />
      <TextField
        type="date" size="small" label="To" value={to}
        onChange={(e) => onChange(from, e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />
    </Box>
  );
}

function FunnelBar({ steps }: { steps: { step: string; count: number; dropoff: number }[] }) {
  const maxCount = steps[0]?.count || 1;
  const theme = useTheme();
  const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

  return (
    <Box sx={{ mt: 2 }}>
      {steps.map((step, i) => {
        const width = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
        return (
          <Box key={step.step} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" fontWeight={600}>{step.step}</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={700}>{step.count.toLocaleString('fr-FR')}</Typography>
                {i > 0 && step.dropoff > 0 && (
                  <Chip
                    size="small"
                    label={`-${step.dropoff}%`}
                    sx={{ bgcolor: alpha('#f44336', 0.1), color: '#f44336', fontWeight: 600, fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={width}
              sx={{
                height: 28, borderRadius: 2,
                bgcolor: alpha(colors[i % colors.length], 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${alpha(colors[i % colors.length], 0.7)})`,
                },
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}

function RealTimeWidget({ data }: { data: RealtimeData | null }) {
  const theme = useTheme();
  if (!data) return null;
  return (
    <Paper
      sx={{
        p: 2, borderRadius: 3, mb: 3,
        background: `linear-gradient(135deg, ${alpha('#10b981', 0.08)} 0%, ${alpha('#059669', 0.03)} 100%)`,
        border: `1px solid ${alpha('#10b981', 0.2)}`,
        display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap',
      }}
    >
      <FiberManualRecord sx={{ color: '#10b981', fontSize: 14, animation: 'pulse 2s infinite' }} />
      <Typography variant="subtitle2" fontWeight={700} color="#10b981">LIVE</Typography>
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{data.activeUsers}</Typography>
          <Typography variant="caption" color="text.secondary">Active Users</Typography>
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>{data.pageViewsPerMinute}</Typography>
          <Typography variant="caption" color="text.secondary">Views/min</Typography>
        </Box>
        {data.activePages?.slice(0, 3).map((p) => (
          <Chip
            key={p.page}
            size="small"
            label={`${p.page.slice(0, 25)} (${p.viewers})`}
            sx={{ bgcolor: alpha('#10b981', 0.1), fontSize: '0.7rem' }}
          />
        ))}
      </Box>
    </Paper>
  );
}

// ═══════════════════════════════════════════
// ██  MAIN ANALYTICS PAGE
// ═══════════════════════════════════════════

export default function Analytics() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date range state
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo);
  const [dateTo, setDateTo] = useState(today);

  // Data states
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [geographic, setGeographic] = useState<GeographicData | null>(null);
  const [funnels, setFunnels] = useState<FunnelsData | null>(null);
  const [search, setSearch] = useState<SearchData | null>(null);
  const [ecommerce, setEcommerce] = useState<EcommerceData | null>(null);
  const [realtime, setRealtime] = useState<RealtimeData | null>(null);
  const [journeys, setJourneys] = useState<JourneysData | null>(null);

  const params: DateRangeParams = { from: dateFrom, to: dateTo };
  const { addListener, removeListener, emit } = useCreateSocket();

  const loadTabData = useCallback(async (tab: number) => {
    setLoading(true);
    setError(null);
    try {
      switch (tab) {
        case 0: {
          const [ov, rt] = await Promise.all([
            AnalyticsAPI.getOverview(params),
            AnalyticsAPI.getRealtime(),
          ]);
          setOverview(ov);
          setRealtime(rt);
          break;
        }
        case 1: setTraffic(await AnalyticsAPI.getTraffic(params)); break;
        case 2: setFunnels(await AnalyticsAPI.getFunnels(params)); break;
        case 3: setEcommerce(await AnalyticsAPI.getEcommerce(params)); break;
        case 4: setGeographic(await AnalyticsAPI.getGeographic(params)); break;
        case 5: setSearch(await AnalyticsAPI.getSearch(params)); break;
        case 6: setJourneys(await AnalyticsAPI.getJourneys(params)); break;
        case 7: break; // Heatmaps tab manages its own data due to urlPath dependency
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { loadTabData(activeTab); }, [activeTab, loadTabData]);

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleRefresh = () => loadTabData(activeTab);

  // Realtime auto-refresh using WebSockets
  useEffect(() => {
    // Join analytics room (assuming auth'd user has admin role)
    emit('joinAnalytics', { userId: 'admin', role: 'admin' });

    const handleRealtimeUpdate = (data: RealtimeData) => {
      setRealtime(data);
    };

    addListener('analyticsRealtimeUpdate', handleRealtimeUpdate);

    return () => {
      removeListener('analyticsRealtimeUpdate', handleRealtimeUpdate);
      emit('leaveAnalytics');
    };
  }, [emit, addListener, removeListener]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enterprise intelligence hub — Understand your users, optimize conversions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <DateRangePicker from={dateFrom} to={dateTo} onChange={handleDateChange} />
          <MuiTooltip title="Refresh data">
            <IconButton onClick={handleRefresh} sx={{ bgcolor: alpha('#6366f1', 0.1), '&:hover': { bgcolor: alpha('#6366f1', 0.2) } }}>
              <Refresh />
            </IconButton>
          </MuiTooltip>
        </Box>
      </Box>

      {/* ── Tabs ── */}
      <Paper sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none', fontWeight: 600, minHeight: 56, fontSize: '0.9rem',
            },
            '& .Mui-selected': { color: '#6366f1' },
            '& .MuiTabs-indicator': { backgroundColor: '#6366f1', height: 3 },
          }}
        >
          <Tab icon={<Speed sx={{ fontSize: 20 }} />} iconPosition="start" label="Overview" />
          <Tab icon={<Timeline sx={{ fontSize: 20 }} />} iconPosition="start" label="Traffic" />
          <Tab icon={<BarChart sx={{ fontSize: 20 }} />} iconPosition="start" label="Funnels" />
          <Tab icon={<TrendingUp sx={{ fontSize: 20 }} />} iconPosition="start" label="Transactions & Bids" />
          <Tab icon={<LocationOn sx={{ fontSize: 20 }} />} iconPosition="start" label="Geographic" />
          <Tab icon={<Search sx={{ fontSize: 20 }} />} iconPosition="start" label="Search" />
          <Tab icon={<Timeline sx={{ fontSize: 20 }} />} iconPosition="start" label="Journeys" />
          <Tab icon={<Visibility sx={{ fontSize: 20 }} />} iconPosition="start" label="Heatmaps" />
        </Tabs>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* ═══ TAB 0: OVERVIEW ═══ */}
      {activeTab === 0 && overview && (
        <Box>
          <RealTimeWidget data={realtime} />
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <KPICard title="Total Sessions" value={overview.totalSessions} icon={<Visibility />} color="#6366f1" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <KPICard title="Unique Visitors" value={overview.uniqueVisitors} icon={<People />} color="#8b5cf6" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <KPICard title="Page Views" value={overview.pageViews} icon={<Visibility />} color="#06b6d4" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <KPICard title="Bounce Rate" value={`${overview.bounceRate}%`} icon={<TrendingDown />} color="#f59e0b" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <KPICard title="Avg Duration" value={`${overview.avgSessionDuration}s`} icon={<Speed />} color="#10b981" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <KPICard title="Pages/Session" value={overview.avgPagesPerSession} icon={<BarChart />} color="#ec4899" />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Device Breakdown */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Device Breakdown</Typography>
                {Object.entries(overview.deviceBreakdown).map(([device, count]) => {
                  const total = Object.values(overview.deviceBreakdown).reduce((a, b) => a + b, 0) || 1;
                  const pct = Math.round((count / total) * 100);
                  const colors: Record<string, string> = { desktop: '#6366f1', mobile: '#10b981', tablet: '#f59e0b' };
                  return (
                    <Box key={device} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} textTransform="capitalize">{device}</Typography>
                        <Typography variant="body2" fontWeight={700}>{pct}% ({count})</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate" value={pct}
                        sx={{
                          height: 10, borderRadius: 5, bgcolor: alpha(colors[device], 0.1),
                          '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: colors[device] },
                        }}
                      />
                    </Box>
                  );
                })}
              </Paper>
            </Grid>

            {/* Source Breakdown */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Traffic Sources</Typography>
                {Object.entries(overview.sourceBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => {
                    const total = Object.values(overview.sourceBreakdown).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    const colors: Record<string, string> = {
                      direct: '#6366f1', organic: '#10b981', social: '#ec4899',
                      referral: '#f59e0b', paid: '#ef4444', email: '#8b5cf6',
                    };
                    return (
                      <Box key={source} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors[source] || '#999' }} />
                          <Typography variant="body2" fontWeight={600} textTransform="capitalize">{source}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700}>{count} ({pct}%)</Typography>
                      </Box>
                    );
                  })}
              </Paper>
            </Grid>

            {/* Top Events */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Top Events</Typography>
                {overview.topEvents?.map((event, i) => (
                  <Box key={event.eventName} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ bgcolor: alpha('#6366f1', 0.1), px: 1, py: 0.5, borderRadius: 1, fontWeight: 700, color: '#6366f1' }}>
                        #{i + 1}
                      </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {event.eventName.replace(/_/g, ' ')}
                      </Typography>
                    </Box>
                    <Chip size="small" label={event.count.toLocaleString('fr-FR')} sx={{ fontWeight: 700, bgcolor: alpha('#6366f1', 0.08) }} />
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ═══ TAB 1: TRAFFIC ═══ */}
      {activeTab === 1 && traffic && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Top Landing Pages</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Page</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Sessions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {traffic.topLandingPages?.map((page) => (
                      <TableRow key={page.page} hover>
                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {page.page}
                        </TableCell>
                        <TableCell align="right">{page.sessions.toLocaleString('fr-FR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Top Referrers</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Referrer</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Sessions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {traffic.topReferrers?.map((ref) => (
                      <TableRow key={ref.referrer} hover>
                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ref.referrer}
                        </TableCell>
                        <TableCell align="right">{ref.sessions.toLocaleString('fr-FR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Session Trend</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {traffic.trend?.map((d, i) => {
                  const maxSessions = Math.max(...traffic.trend.map((t: any) => t.sessions || 0), 1);
                  const height = Math.max(((d.sessions || 0) / maxSessions) * 120, 4);
                  return (
                    <MuiTooltip key={i} title={`${d._id?.day || ''}/${d._id?.month || ''}: ${d.sessions || 0} sessions`}>
                      <Box
                        sx={{
                          width: 12, height, bgcolor: '#6366f1', borderRadius: 1,
                          transition: 'all 0.3s', alignSelf: 'flex-end',
                          '&:hover': { bgcolor: '#8b5cf6', transform: 'scaleY(1.1)' },
                        }}
                      />
                    </MuiTooltip>
                  );
                })}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ═══ TAB 2: FUNNELS ═══ */}
      {activeTab === 2 && funnels && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>🏷️ Auction Funnel</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                From listing to winning bid
              </Typography>
              <FunnelBar steps={funnels.auctionFunnel} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>📋 Tender Funnel</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                From browsing to bid submission
              </Typography>
              <FunnelBar steps={funnels.tenderFunnel} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>🛒 Direct Sales Funnel</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                From product view to purchase completion
              </Typography>
              <FunnelBar steps={funnels.directSalesFunnel} />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ═══ TAB 3: TRANSACTIONS & BIDS ═══ */}
      {activeTab === 3 && ecommerce && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="Total Bids Placed" value={ecommerce.bids.count.toLocaleString('fr-FR')} subtitle={`${ecommerce.bids.totalValue.toLocaleString('fr-FR')} DA`} icon={<TouchApp />} color="#6366f1" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="Tender Offers Submitted" value={ecommerce.tenders.count.toLocaleString('fr-FR')} subtitle={`${ecommerce.tenders.totalValue.toLocaleString('fr-FR')} DA`} icon={<TrendingUp />} color="#10b981" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="Direct Sales Completed" value={ecommerce.directSales.count.toLocaleString('fr-FR')} subtitle={`${ecommerce.directSales.totalValue.toLocaleString('fr-FR')} DA`} icon={<Speed />} color="#f59e0b" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="Subscriptions Purchased" value={ecommerce.subscriptions.count.toLocaleString('fr-FR')} subtitle={`${ecommerce.subscriptions.totalValue.toLocaleString('fr-FR')} DA`} icon={<People />} color="#ec4899" />
            </Grid>
          </Grid>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Transaction Breakdown by Category</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Transaction Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Count</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Total Value (DA)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ecommerce.transactionBreakdown?.map((tx, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{tx.category}</TableCell>
                      <TableCell>
                        <Chip size="small" label={tx.type.replace(/_/g, ' ')} sx={{ textTransform: 'capitalize', bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align="right">{tx.count.toLocaleString('fr-FR')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {tx.totalValue.toLocaleString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* ═══ TAB 4: GEOGRAPHIC ═══ */}
      {activeTab === 4 && geographic && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>🌍 Registered Users Geographic Distribution</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Wilaya</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Sessions</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Unique Visitors</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Avg Duration (s)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Bounce Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {geographic.wilayas?.map((w, i) => {
                  const maxSessions = geographic.wilayas[0]?.sessions || 1;
                  return (
                    <TableRow key={w.wilaya} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{
                            bgcolor: alpha('#6366f1', 0.1), px: 1, py: 0.5,
                            borderRadius: 1, fontWeight: 700, color: '#6366f1', minWidth: 28, textAlign: 'center',
                          }}>
                            #{i + 1}
                          </Typography>
                          <Typography fontWeight={600}>{w.wilaya}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                          <LinearProgress
                            variant="determinate"
                            value={(w.sessions / maxSessions) * 100}
                            sx={{
                              width: 80, height: 6, borderRadius: 3,
                              bgcolor: alpha('#6366f1', 0.1),
                              '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: '#6366f1' },
                            }}
                          />
                          <Typography fontWeight={700}>{w.sessions.toLocaleString('fr-FR')}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{w.uniqueVisitors.toLocaleString('fr-FR')}</TableCell>
                      <TableCell align="right">{w.avgDuration}s</TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          label={`${w.bounceRate}%`}
                          sx={{
                            bgcolor: w.bounceRate > 60 ? alpha('#f44336', 0.1) : alpha('#10b981', 0.1),
                            color: w.bounceRate > 60 ? '#f44336' : '#10b981',
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ═══ TAB 5: SEARCH ═══ */}
      {activeTab === 5 && search && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="Total Searches" value={search.totalSearches} icon={<Search />} color="#6366f1" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="Click-Through Rate" value={`${search.clickThroughRate}%`} icon={<TouchApp />} color="#10b981" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="Zero Result Queries" value={search.zeroResults?.length || 0} icon={<TrendingDown />} color="#f44336" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="Unique Queries" value={search.topSearches?.length || 0} icon={<BarChart />} color="#f59e0b" />
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>🔍 Top Search Queries</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Query</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Count</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Avg Results</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {search.topSearches?.map((s) => (
                        <TableRow key={s.query} hover>
                          <TableCell>{s.query}</TableCell>
                          <TableCell align="right">{s.count}</TableCell>
                          <TableCell align="right">{s.avgResults}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#f44336' }}>
                  ❌ Zero-Result Searches
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  These queries returned no results — improve your content or categories
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Query</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {search.zeroResults?.map((s) => (
                        <TableRow key={s.query} hover>
                          <TableCell>{s.query}</TableCell>
                          <TableCell align="right">
                            <Chip size="small" label={s.count} sx={{ bgcolor: alpha('#f44336', 0.1), color: '#f44336', fontWeight: 700 }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ═══ TAB 6: JOURNEYS ═══ */}
      {activeTab === 6 && (
        <JourneysTab data={journeys} />
      )}

      {/* ═══ TAB 7: HEATMAPS ═══ */}
      {activeTab === 7 && (
        <HeatmapsTab params={params} />
      )}

      {/* ── Loading state for empty data ── */}
      {loading && !overview && !traffic && !funnels && !ecommerce && !geographic && !search && !journeys && activeTab !== 7 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#6366f1' }} />
        </Box>
      )}

      {/* ── Pulse animation for live indicator ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </Container>
  );
}
