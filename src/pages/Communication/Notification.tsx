import {
  Stack,
  Container,
  Typography,
  Box,
  Grid,
  CardHeader,
  Divider,
  Card,
  CardContent,
  FormControl,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';

// components
import Page from '../../components/Page';
import IComminucation from '../../types/Communication';
import { useSnackbar } from 'notistack';
import Breadcrumb from '@/components/Breadcrumbs';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { NotificationAPI } from '@/api/notification';
import { ChatAPI } from '@/api/Chat';

const initialValues: IComminucation = {
  title: '',
  description: '',
  client: false,
  rider: false,
};

const CommunicationSchema = Yup.object().shape({
  title: Yup.string().required(),
  description: Yup.string().required(),
  client: Yup.boolean().required(),
  rider: Yup.boolean().required(),
});

export default function Communication() {
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues,
    validationSchema: CommunicationSchema,
    onSubmit: (values: any, actions) => {
      var proceed = confirm('Êtes-vous sur de vouloir appliquer les changements?');
      if (!proceed) {
        actions.setSubmitting(false);
        return;
      }

      NotificationAPI.SubmitPushNotification(values)
        .then(({ data }) => {
          enqueueSnackbar(`Envoyer a ${data.counts | 0} utilisateurr`, { variant: 'success' });
        })
        .catch((e) => {
          enqueueSnackbar('Erreur', { variant: 'error' });
          console.error(e);
        })
        .finally(() => {
          actions.setSubmitting(false);
        });
    },
  });

  const { errors, touched, handleSubmit, getFieldProps, setFieldValue, values }: any = formik;

  const handleCheckboxChange = (type: 'client' | 'rider') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(type, event.target.checked);
  };

  // State for chats
  const [professionalChats, setProfessionalChats] = useState([]);
  const [resellerChats, setResellerChats] = useState([]);
  const [otherChats, setOtherChats] = useState([]);

  useEffect(() => {
    // Fetch admin chats on mount
    ChatAPI.getAdminChats()
      .then((chats) => {
        console.log('Fetched admin chats:', chats); // Debug log
        enqueueSnackbar(`Données reçues: ${chats.length} chats`, { variant: 'info' });
        // Group chats by user2.type
        const professional = [];
        const reseller = [];
        const other = [];
        chats.forEach((chat) => {
          // Find the non-admin user
          const user2 = chat.users.find((u) => u._id !== 'admin');
          if (!user2) return;
          if (user2.type === 'PROFESSIONAL') professional.push(chat);
          else if (user2.type === 'RESELLER') reseller.push(chat);
          else other.push(chat);
        });
        console.log('Grouped chats:', { professional, reseller, other }); // Debug log
        setProfessionalChats(professional);
        setResellerChats(reseller);
        setOtherChats(other);
      })
      .catch((e) => {
        enqueueSnackbar('Erreur lors du chargement des chats', { variant: 'error' });
        console.error(e);
      });
  }, []);

  return (
    <Page title="Communication">
      <Container>
        {/* Toolbar */}

        <Stack direction="row" alignItems="center" justifyContent="space-between" ml={2} mb={1}>
          <Typography variant="h4" gutterBottom>
            Communication
          </Typography>
        </Stack>

        {/* Breadcrumbs */}

        <Box sx={{ mb: 2, mx: 2 }}>
          <Grid item lg={8} md={6} xs={12}>
            <Breadcrumb />
          </Grid>
        </Box>

        {/* Delivery fees */}

        {/* <CardHeader
                      title="Gestion des frais de trajets"
                      subheader="Valeurs par default"
                      action={<Iconify width={40} height={40} icon="ion:car-sport-sharp" />}
                  /> */}
        <Divider />

        {/* Admin Chats Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Professionnels</Typography>
          {professionalChats.length === 0 && <Typography color="text.secondary">Aucun chat professionnel</Typography>}
          {professionalChats.map((chat) => {
            const user2 = chat.users.find((u) => u._id !== 'admin');
            return (
              <Card key={chat._id} sx={{ mb: 1 }}>
                <CardContent>
                  <Typography><b>{user2?.firstName} {user2?.lastName}</b> ({user2?.type})</Typography>
                  <Typography variant="body2">Chat ID: {chat._id}</Typography>
                </CardContent>
              </Card>
            );
          })}
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Revendeurs</Typography>
          {resellerChats.length === 0 && <Typography color="text.secondary">Aucun chat revendeur</Typography>}
          {resellerChats.map((chat) => {
            const user2 = chat.users.find((u) => u._id !== 'admin');
            return (
              <Card key={chat._id} sx={{ mb: 1 }}>
                <CardContent>
                  <Typography><b>{user2?.firstName} {user2?.lastName}</b> ({user2?.type})</Typography>
                  <Typography variant="body2">Chat ID: {chat._id}</Typography>
                </CardContent>
              </Card>
            );
          })}
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Autres</Typography>
          {otherChats.length === 0 && <Typography color="text.secondary">Aucun autre chat</Typography>}
          {otherChats.map((chat) => {
            const user2 = chat.users.find((u) => u._id !== 'admin');
            return (
              <Card key={chat._id} sx={{ mb: 1 }}>
                <CardContent>
                  <Typography><b>{user2?.firstName} {user2?.lastName}</b> ({user2?.type})</Typography>
                  <Typography variant="body2">Chat ID: {chat._id}</Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
        <Divider />

        {/* Delivery fees */}

        {/* <CardHeader
                      title="Gestion des frais de trajets"
                      subheader="Valeurs par default"
                      action={<Iconify width={40} height={40} icon="ion:car-sport-sharp" />}
                  /> */}
        <Divider />

        <Box sx={{ mb: 8 }}>
          <Grid item lg={8} md={6} xs={12}>
            <Card sx={{ my: 2 }}>
              <Divider />
              <CardContent sx={{ mx: 2 }}>
                <CardHeader
                  title="Notification"
                  subheader="Envoyer des messages au client et au conducteur sous forme de notification"
                />
                <Divider />
                <Grid container m={1} spacing={2}>
                  <Grid item md={12} xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        fullWidth
                        label="Titre"
                        aria-describedby="standard-weight-helper-text"
                        error={Boolean(touched.title && errors.title)}
                        helperText={touched.title && errors.title}
                        type="text"
                        {...getFieldProps('title')}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <FormControl fullWidth variant="standard">
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Description"
                        aria-describedby="standard-weight-helper-text"
                        error={Boolean(touched.description && errors.description)}
                        helperText={touched.description && errors.description}
                        type="text"
                        {...getFieldProps('description')}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormControl component="fieldset">
                      <FormGroup row>
                        <FormControlLabel
                          control={
                            <Checkbox checked={values.rider} onChange={handleCheckboxChange('rider')} name="rider" />
                          }
                          label="Chauffeur"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox checked={values.client} onChange={handleCheckboxChange('client')} name="client" />
                          }
                          label="Client"
                        />
                      </FormGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                <Button color="primary" variant="contained" onClick={handleSubmit}>
                  Appliquer
                </Button>
              </Box>
            </Card>
          </Grid>
        </Box>
      </Container>
    </Page>
  );
}
