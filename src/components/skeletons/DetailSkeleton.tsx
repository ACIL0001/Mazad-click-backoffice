import React from 'react';
import { Skeleton, Grid, Paper } from '@mui/material';

const DetailSkeleton: React.FC = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
            {Array.from(new Array(6)).map((_, index) => (
                <Grid item xs={12} md={6} key={index}>
                    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Grid>
            ))}
        </Grid>
        <Skeleton variant="rectangular" width={120} height={40} sx={{ mt: 4, borderRadius: 1 }} />
    </Paper>
  );
};

export default DetailSkeleton;
