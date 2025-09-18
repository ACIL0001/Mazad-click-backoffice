import { Box, Typography, Grid } from '@mui/material';
import Breadcrumb from '../Breadcrumbs';


export const UserListToolbar = ({  }) => 
(
  <Box sx={{ mb: 2 }}>
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      <Typography sx={{ m: 1 }} variant="h4">
        Utilisateurs
      </Typography>
    </Box>

    {/* Breadcrumbs */}
    <Box sx={{ my: 3 }}>
      <Grid
        item
        lg={8}
        md={6}
        xs={12}
      >
        <Breadcrumb />
      </Grid>
    </Box>
  </Box>
);
