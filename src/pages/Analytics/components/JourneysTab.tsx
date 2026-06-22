import { Box, Paper, Typography, CircularProgress, alpha, useTheme } from '@mui/material';
import { ResponsiveSankey } from '@nivo/sankey';
import { JourneysData } from '../../../api/analytics';

export default function JourneysTab({ data }: { data: JourneysData | null }) {
  const theme = useTheme();

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (!data.nodes || data.nodes.length === 0 || !data.links || data.links.length === 0) {
    return (
      <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No journey data available for this period.
        </Typography>
      </Paper>
    );
  }

  const formatNodeId = (id: string) => {
    return id.replace(/\[Step \d+\]\s*/, '');
  };

  return (
    <Paper sx={{
      p: 4, borderRadius: 4, height: 700,
      background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.5)} 100%)`,
      boxShadow: `0 10px 40px -10px ${alpha('#6366f1', 0.1)}`,
      border: `1px solid ${alpha('#6366f1', 0.1)}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Blur */}
      <Box sx={{
        position: 'absolute', top: -100, right: -100, width: 300, height: 300,
        background: `radial-gradient(circle, ${alpha('#6366f1', 0.05)} 0%, transparent 70%)`,
        zIndex: 0, pointerEvents: 'none'
      }} />
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          User Journeys Flow
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Visualize the sequential paths professionals take through the platform. 
          Hover over nodes to see traffic drops, and over links to see transition volume.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#6366f1' }} />
            <Typography variant="caption" fontWeight={600}>Entry Points</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
            <Typography variant="caption" fontWeight={600}>Key Actions</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
            <Typography variant="caption" fontWeight={600}>Exits / Dropoffs</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ height: 550, position: 'relative', zIndex: 1 }}>
        <ResponsiveSankey
          data={data}
          margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
          align="justify"
          colors={['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6']}
          nodeOpacity={1}
          nodeHoverOthersOpacity={0.1}
          nodeThickness={16}
          nodeSpacing={24}
          nodeBorderWidth={0}
          nodeBorderRadius={4}
          linkOpacity={0.25}
          linkHoverOthersOpacity={0.05}
          linkContract={2}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="horizontal"
          labelPadding={12}
          labelTextColor={theme.palette.text.primary}
          valueFormat={(value) => `${value.toLocaleString('fr-FR')} users`}
          nodeTooltip={({ node }) => (
            <Box sx={{
              bgcolor: 'background.paper', p: 2, borderRadius: 3,
              boxShadow: `0 8px 32px ${alpha(node.color, 0.2)}`,
              border: `1px solid ${alpha(node.color, 0.3)}`,
              backdropFilter: 'blur(10px)',
              minWidth: 150
            }}>
              <Typography variant="overline" color="text.secondary" display="block" sx={{ lineHeight: 1, mb: 1, fontWeight: 700, letterSpacing: 1 }}>Step Details</Typography>
              <Typography variant="body1" fontWeight={800} sx={{ color: node.color, mb: 0.5 }}>{node.id}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Traffic:</Typography>
                <Typography variant="body2" fontWeight={700}>{node.value.toLocaleString('fr-FR')} users</Typography>
              </Box>
            </Box>
          )}
          linkTooltip={({ link }) => (
            <Box sx={{
              bgcolor: 'background.paper', p: 2, borderRadius: 3,
              boxShadow: `0 8px 32px ${alpha('#6366f1', 0.15)}`,
              border: `1px solid ${alpha('#6366f1', 0.2)}`,
              minWidth: 200
            }}>
              <Typography variant="overline" color="text.secondary" display="block" sx={{ lineHeight: 1, mb: 1, fontWeight: 700, letterSpacing: 1 }}>Transition</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>{formatNodeId(link.source.id as string)}</Typography>
                <Box sx={{ width: 20, height: 2, bgcolor: 'divider', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', right: -4, top: -4, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `5px solid ${theme.palette.divider}` }} />
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>{formatNodeId(link.target.id as string)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, p: 1, bgcolor: alpha('#6366f1', 0.05), borderRadius: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Volume:</Typography>
                <Typography variant="body2" fontWeight={800} sx={{ color: '#6366f1' }}>
                  {link.value.toLocaleString('fr-FR')} users
                </Typography>
              </Box>
            </Box>
          )}
          theme={{
            labels: { text: { fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif' } }
          }}
        />
      </Box>
    </Paper>
  );
}
