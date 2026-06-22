import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, CircularProgress, alpha, useTheme,
  TextField, Button, Grid, Tooltip, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import { AnalyticsAPI, DateRangeParams, HeatmapsData } from '../../../api/analytics';

const formatElementName = (selector: string | null | undefined): string => {
  if (!selector) return 'Unknown Element';
  const parts = selector.split('>');
  const lastPart = parts[parts.length - 1].trim();
  return lastPart || selector;
};

export default function HeatmapsTab({ params }: { params: DateRangeParams }) {
  const theme = useTheme();
  const [urlPath, setUrlPath] = useState('/');
  const [data, setData] = useState<HeatmapsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRage, setShowRage] = useState(true);
  const [showDead, setShowDead] = useState(true);

  const fetchHeatmap = async () => {
    setLoading(true);
    try {
      const res = await AnalyticsAPI.getHeatmaps({ ...params, urlPath });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.from, params.to]);

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          label="URL Path"
          value={urlPath}
          onChange={(e) => setUrlPath(e.target.value)}
          sx={{ width: 300 }}
          placeholder="e.g. /auctions or /"
        />
        <Button
          variant="contained"
          onClick={fetchHeatmap}
          disabled={loading}
          sx={{
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          {loading ? 'Loading...' : 'Generate Heatmap'}
        </Button>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={<Switch size="small" checked={showRage} onChange={(e) => setShowRage(e.target.checked)} />}
            label={<Typography variant="body2" color="error">Rage Clicks</Typography>}
          />
          <FormControlLabel
            control={<Switch size="small" checked={showDead} onChange={(e) => setShowDead(e.target.checked)} />}
            label={<Typography variant="body2" color="warning.main">Dead Clicks</Typography>}
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 650, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Interaction Heatmap
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visual representation of user clicks and interactions.
                </Typography>
              </Box>
            </Box>
            
            {data && data.rageClicks.length > 0 && showRage && (
              <Alert severity="error" sx={{ mb: 2, py: 0, '& .MuiAlert-message': { py: 1 } }}>
                <Typography variant="body2" fontWeight={600}>
                  Warning: {data.rageClicks.length} Rage clicks detected! Users might be frustrated by unresponsive elements.
                </Typography>
              </Alert>
            )}

            {data && data.deadClicks.length > 0 && showDead && (
              <Alert severity="warning" sx={{ mb: 2, py: 0, '& .MuiAlert-message': { py: 1 } }}>
                <Typography variant="body2" fontWeight={600}>
                  Notice: {data.deadClicks.length} Dead clicks detected. Users are clicking non-interactive elements.
                </Typography>
              </Alert>
            )}
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
              </Box>
            ) : data && (data.clicks.length > 0 || data.rageClicks.length > 0) ? (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  flexGrow: 1,
                  bgcolor: theme.palette.mode === 'dark' ? '#1e1e2d' : '#f8fafc',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                {/* Standard Clicks */}
                {data.clicks.map((c, i) => (
                  <Tooltip key={`click-${i}`} title={formatElementName(c.elementSelector)}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${c.position.x}%`,
                        top: `${c.position.y}%`,
                        width: 12,
                        height: 12,
                        bgcolor: alpha('#6366f1', 0.6),
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 8px ${alpha('#6366f1', 0.8)}`,
                        cursor: 'pointer'
                      }}
                    />
                  </Tooltip>
                ))}

                {/* Rage Clicks */}
                {showRage && data.rageClicks.map((c, i) => (
                  <Tooltip key={`rage-${i}`} title={`Rage Click: ${formatElementName(c.elementSelector)}`}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${c.position.x}%`,
                        top: `${c.position.y}%`,
                        width: 18,
                        height: 18,
                        bgcolor: alpha('#ef4444', 0.8),
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 12px ${alpha('#ef4444', 0.9)}`,
                        animation: 'pulse 1.5s infinite',
                        cursor: 'pointer',
                        zIndex: 10
                      }}
                    />
                  </Tooltip>
                ))}

                {/* Dead Clicks */}
                {showDead && data.deadClicks.map((c, i) => (
                  <Tooltip key={`dead-${i}`} title={`Dead Click: ${formatElementName(c.elementSelector)}`}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${c.position.x}%`,
                        top: `${c.position.y}%`,
                        width: 14,
                        height: 14,
                        bgcolor: alpha('#f59e0b', 0.8),
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        cursor: 'pointer',
                        zIndex: 5
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, color: 'text.secondary' }}>
                No interaction data available for this path.
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 650, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Scroll Depth
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              How far down the page users typically scroll.
            </Typography>
            
            {!loading && data?.scrollDepthDistribution ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 4, mb: 4 }}>
                {[25, 50, 75, 100].map(depth => {
                  const entry = data.scrollDepthDistribution.find(d => d.depth === depth);
                  const count = entry ? entry.count : 0;
                  const maxCount = Math.max(...data.scrollDepthDistribution.map(d => d.count), 1);
                  const percentage = Math.round((count / maxCount) * 100);
                  
                  return (
                    <Box key={depth}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{depth}% Depth</Typography>
                        <Typography variant="body2" fontWeight={700}>{count} users</Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 12, bgcolor: alpha('#10b981', 0.1), borderRadius: 6, overflow: 'hidden' }}>
                        <Box sx={{ width: `${percentage}%`, height: '100%', bgcolor: '#10b981', borderRadius: 6, transition: 'width 1s ease' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : null}

            {data && data.clicks.length > 0 && (
              <>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 'auto', mb: 2 }}>
                  Top Clicked Elements
                </Typography>
                <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Element</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Clicks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(
                        data.clicks.reduce((acc, c) => {
                          const key = c.elementSelector || 'Unknown';
                          acc[key] = (acc[key] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .slice(0, 5)
                        .map(([el, count]) => {
                          const countNum = count as number;
                          return (
                            <TableRow key={el} hover>
                              <TableCell sx={{ fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {formatElementName(el)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>{countNum}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </Box>
  );
}
