import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Card, Container, Grid, Tab, Tabs, Typography } from '@mui/material';
import { AccountProfile } from '../components/account/account-profile';
import { Device } from '../components/account/device';
import { AccountProfileDetails } from '../components/account/account-profile-details';
import { useState, useEffect } from 'react';
import { StatsAPI } from '@/api/stats';
import { useSnackbar } from 'notistack';
import app from '@/config';
import Page from '@/components/Page';

interface IStatsInfo {
  totalFeeAmount?: number;
}

export default function Account() {
  const location = useLocation();
  const [user, setUser] = useState<any>(location.state);
  const [unpayedFee, setUnpayedFee] = useState<IStatsInfo>();
  const [value, setValue] = useState(0);
  const [data, setData] = useState<{ title: String }[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/404');

    return () => {};
  }, [user]);

  // Removed retrieveUnpayedFees function since BillAPI was deleted

  const handleTabChange = (newValue: number) => {
    setValue(newValue);
  };

  const renderTabContent = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Account details will appear here</Typography>
      </Box>
    );
  };

  return (
    user && (
      <>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth="lg">
            <Typography sx={{ mb: 3 }} variant="h4">
              Profile
            </Typography>
            <Grid container spacing={3}>
              <Grid item lg={12} md={12} xs={16} sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <AccountProfile user={user} />
                {/* {user.device.manufacturer && <Device device={user.device} />} */}

              </Grid>

              <Grid item lg={12} md={12} xs={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* {user.device.manufacturer && <Device device={user.device} />} */}
              </Grid>

              <Grid item lg={12} md={12} xs={12}>
                <AccountProfileDetails user={user} />
              </Grid>
            </Grid>

          </Container>
        </Box>
      </>
    )
  );
}