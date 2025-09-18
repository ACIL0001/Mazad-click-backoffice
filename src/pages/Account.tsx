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
  title?: string;
  startDate?: string;
  endDate?: string;
  orderCount?: number;
  totalSaleAmount?: number;
  restaurantFee?: number;
  clientFee?: number;
  totalFeeAmount?: number;
  // Removed Order[] reference since Order type was deleted
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

    // Removed BillAPI call since it was deleted
    // if (user!.role == 'Restaurant') retrieveUnpayedFees();
    
    // Simplified data for tabs (removed references to deleted components)
    if (user?.role === 'Restaurant') {
      setData([{ title: 'Information' }]);
    }
    return () => {};
  }, [user]);

  // Removed retrieveUnpayedFees function since BillAPI was deleted

  const handleTabChange = (newValue: number) => {
    setValue(newValue);
  };

  const renderTabContent = () => {
    // Removed all references to deleted components (Products, Orders, RestaurantsBills)
    switch (value) {
      case 0:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Restaurant Information</Typography>
            <Typography variant="body1">
              This section would show restaurant information.
            </Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Default Content</Typography>
          </Box>
        );
    }
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
                {user.role == 'Restaurant' && (
                  <>
                    <Card sx={{ width: '100%', position: 'relative' }}>
                      <Box sx={{ py: 1.5, width: '100%', borderBottom: 1, borderColor: 'divider' }}>
                        <Typography fontWeight="bold" sx={{ textAlign: 'left', px: 2 }}>
                          Détails du restaurant
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          px: 2,
                        }}
                      >
                        <Box
                          style={{ borderRadius: '100%' }}
                          component="img"
                          src={
                            user.picture
                              ? app.route + user.picture.filename
                              : '/static/illustrations/default-restaurant-cover.jpg'
                          }
                          sx={{
                            height: 150,
                            my: 2,
                            aspectRatio: 1,
                          }}
                        />

                        <Box sx={{ mb: 1, px: 3 }}>
                          <Typography variant="body2" sx={{ textAlign: 'left' }}>
                            <span style={{ fontWeight: 'bold' }}>Nom du restaurants:</span> {user.details?.name}
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: 'left' }}>
                            <span style={{ fontWeight: 'bold' }}>Adresse:</span> {user.details?.address}
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: 'left' }}>
                            <span style={{ fontWeight: 'bold' }}>Numéro du Téléphone :</span> {user.details?.mobile}
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: 'left' }}>
                            <span style={{ fontWeight: 'bold' }}>Ouvre à :</span> {user.details?.opensAt} h
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: 'left' }}>
                            <span style={{ fontWeight: 'bold' }}>Ferme à :</span> {user.details?.closeAt} h
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: 'left' }}>
                            <span style={{ fontWeight: 'bold' }}>description :</span> {user.details?.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </>
                )}
              </Grid>

              <Grid item lg={12} md={12} xs={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* {user.device.manufacturer && <Device device={user.device} />} */}
              </Grid>

              <Grid item lg={12} md={12} xs={12}>
                <AccountProfileDetails user={user} />
              </Grid>
            </Grid>
            {user.role == 'Restaurant' && (
              <>
                <Box mb={3} sx={{ borderBottom: 1, borderColor: 'divider', m: 2 }}>
                  <Tabs value={value} aria-label="basic tabs example">
                    {data.map((tab, index) => (
                      <Tab
                        key={index}
                        label={tab.title}
                        id={`simple-tab-${index}`}
                        {...{ 'aria-controls': `simple-tabpanel-${index}` }}
                        onClick={() => handleTabChange(index)}
                      />
                    ))}
                  </Tabs>
                </Box>
                {renderTabContent()}
              </>
            )}
            {/* Removed Deliveries component reference since it was deleted */}
            {user.role == 'Rider' && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6">Rider Information</Typography>
                <Typography variant="body1">
                  Rider delivery information would be displayed here.
                </Typography>
              </Box>
            )}
          </Container>
        </Box>
      </>
    )
  );
}