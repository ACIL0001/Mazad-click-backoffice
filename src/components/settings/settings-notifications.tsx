import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { UserAPI } from '@/api/user';


export function SettingsNotifications({ user }) {
  const { enqueueSnackbar } = useSnackbar();

  /* Get user params */
  const { _id, verified, enabled } = user;

  const [isVerified, setVerified] = useState(verified)
  const [isEnabled, setEnabled] = useState(enabled)


  const updateState = () => {
    /*
    UserAPI.stateUpdate({ _id, verified: isVerified, enabled: isEnabled })
      .then(res => enqueueSnackbar('Etat de compte état de compte mis à jour.', { variant: 'success' }))
      .catch((err) => enqueueSnackbar(err.response.data.message, { variant: 'error' }));
      */
  }



  return <form /*{...props}*/>
    <Card>
      <CardHeader
        subheader="Gestion de compte"
        title="Etat de compte"
      />
      <Divider />
      <CardContent>
        <Grid
          container
          spacing={6}
          wrap="wrap"
        >
          {/* <Grid
            item
            md={4}
            sm={6}
            sx={{
              display: 'flex',
              flexDirection: 'column'
            }}
            xs={12}
          >
            <Typography
              color="textPrimary"
              gutterBottom
              variant="h6"
            >
              Appareil
            </Typography>
            <FormControlLabel
              disabled
              control={(
                <Checkbox
                  color="primary"
                  defaultChecked
                />
              )}
              label="Push Notifications"
            />
          </Grid> */}
          <Grid
            item
            md={4}
            sm={6}
            sx={{
              display: 'flex',
              flexDirection: 'column'
            }}
            xs={12}
          >
            <Typography
              color="textPrimary"
              gutterBottom
              variant="h6"
            >
              Compte
            </Typography>
            <FormControlLabel
              control={<Checkbox checked={isVerified} onClick={(e: any) => setVerified(e.target.checked)} />}
              label="Verifié"
            />
            <FormControlLabel
              control={<Checkbox checked={isEnabled} onClick={(e: any) => setEnabled(e.target.checked)} />}
              label="Activé"
            />
          </Grid>
        </Grid>
      </CardContent>

      <Divider />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 2
        }}
      >
        <Button
          onClick={updateState}
          color="primary"
          variant="contained"
        >
          Mettre à jour
        </Button>
      </Box>
    </Card>
  </form >
};
