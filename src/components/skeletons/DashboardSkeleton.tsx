import { Box, Grid, Card, CardContent, Container, Skeleton, Stack, Paper } from "@mui/material"

export default function DashboardSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header Skeleton */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box>
            <Skeleton variant="text" width={250} height={40} />
            <Skeleton variant="text" width={350} height={24} />
          </Box>
        </Box>
      </Box>

      {/* Key Metrics Row 1 Skeleton */}
      <Grid container spacing={3} mb={4}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={12} sm={6} md={2} key={i}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Skeleton variant="text" width={60} height={40} />
                    <Skeleton variant="text" width={80} height={20} />
                  </Box>
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Key Metrics Row 2 Skeleton */}
      <Grid container spacing={3} mb={4}>
        {[...Array(3)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Skeleton variant="text" width={80} height={40} />
                    <Skeleton variant="text" width={100} height={20} />
                  </Box>
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sector Stats Skeleton */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Skeleton variant="text" width={200} height={32} />
                <Skeleton variant="rounded" width={250} height={40} />
              </Box>
              {[...Array(5)].map((_, i) => (
                <Box key={i} display="flex" justifyContent="space-between" mb={2}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="10%" height={24} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Skeleton */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', px: 2, gap: 2 }}>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} variant="text" width={100} height={48} sx={{ my: 1 }} />
          ))}
        </Box>
      </Paper>

      {/* Charts Skeleton */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width={250} height={32} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="center">
                <Skeleton variant="circular" width={200} height={200} />
              </Box>
              <Box mt={2}>
                 <Skeleton variant="text" width="100%" height={20} />
                 <Skeleton variant="text" width="100%" height={20} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
