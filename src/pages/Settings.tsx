//------------------------------------------------------------------------------
// <copyright file="Settings.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>                                                                
//------------------------------------------------------------------------------


import { Box, Container, Typography } from '@mui/material';
import { SettingsNotifications } from '../components/settings/settings-notifications';
import { SettingsPassword } from '../components/settings/settings-password';

const Settings = ({ user }) => (
  <>
    <Box
      component="main"
      sx={{ flexGrow: 1, py: 8 }}
    >
      <Container maxWidth="lg">
        <Typography
          sx={{ mb: 3 }}
          variant="h4"
        >
          Réglages
        </Typography>
        <SettingsNotifications user={user} />
        {/*  
        <Box sx={{ pt: 3 }}>
          <SettingsPassword user={user} />
        </Box>
        */}
      </Container>
    </Box>
  </>
);


export default Settings;
