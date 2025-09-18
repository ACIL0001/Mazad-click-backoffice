//------------------------------------------------------------------------------
// <copyright file="RideFees.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import * as React from 'react';
import {
  TextField,
  Box,
  InputAdornment,
  Button,
  Card,
  Grid,
  FormControl,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { ConfigAPI } from '@/api/config';
import { useState } from 'react';
import IConfig from '@/types/Config';

/// <devdoc>
///    <para> Default values handler. </para>
/// </devdoc>

export default function RideConfig() {
  const { enqueueSnackbar } = useSnackbar();
  const [config, setConfig] = useState({});

  const FeeSchema = Yup.object().shape({
    priceByKM: Yup.number().required(),
    minRidePrice: Yup.number().required(),
    restaurantComission: Yup.number().min(0).max(100).required(),
    clientComission: Yup.number().min(0).max(100).required(),
    contact: Yup.object().shape({
      phone: Yup.string()
        .length(10, 'Le numéro de téléphone doit contenir exactement 10 chiffres')
        .required('numéro de télephone est obligatoire'),
      email: Yup.string().email("format de l'email invalid").required('email obligatoire'),
    }),
  });

  const formik = useFormik({
    initialValues: config,
    validationSchema: FeeSchema,
    onSubmit: (values: any, { setSubmitting }) => {
      setSubmitting(true);
      var proceed = confirm('Êtes-vous sur de vouloir appliquer les changements?');
      if (!proceed) return;
      
      delete values._id;
      delete values.createdAt;
      delete values.updatedAt;
      delete values.__v;

      ConfigAPI.set(values).then(({data}) => {
        setConfig(data);
        enqueueSnackbar('Mis à jour avec succès ', { variant: 'success' });
      }).catch((error) => {
        enqueueSnackbar("Mis à jour avec érreur.",{ variant: "error" });
        console.error("Error:", error);
      })
    },
  });

  /// <summary>
  /// retreive current config.
  /// </summary>

  React.useEffect(() => {
    get();
    return () => {};
  }, []);

  /// <summary>
  /// get config.
  /// </summary>

  const get = () => {
    ConfigAPI.get().then(({ data }) => {
      setConfig(data);
      formik.setValues(data);
    });
  };

  const { errors, touched, values, handleChange, handleSubmit, getFieldProps }: any = formik;

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit}>
      {Object.keys(values).length !== 0 && (
        <Card sx={{ my: 2 }}>
          <CardHeader subheader="Les tarifs de trajet sont les prix que vous rencontrez lorsque vous réserver un trajet. Ils sont déterminés selon les coûts liés au trajet et personalisé par le conducteur. Ces derniers varient en fonction de nombreux paramètres." />
          <Divider />

          <CardContent sx={{ mx: 2 }}>
            <CardHeader title="Tarifs Client" subheader="Les frais de services que le client doit payer" />
            <Divider />

            <Grid container m={1} spacing={2}>
              <Grid item md={4} xs={12}>
                <FormControl fullWidth variant="outlined">
                  <TextField
                    id="clientComission"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    aria-describedby="outlined-weight-helper-text"
                    onChange={handleChange('priceByRide')}
                    error={Boolean(touched.clientComission && errors.clientComission)}
                    helperText={touched.clientComission && errors.clientComission}
                    {...getFieldProps('clientComission')}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>

          <Divider />

          <CardContent sx={{ mx: 2 }}>
            <CardHeader title="Tarifs Restaurant" subheader="Les frais de services que le restaurant doit payer" />
            <Divider />

            <Grid container m={1} spacing={2}>
              <Grid item md={4} xs={12}>
                <FormControl fullWidth variant="outlined">
                  <TextField
                    id="restaurantComission"
                    type="number"
                    placeholder="1"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    aria-describedby="outlined-weight-helper-text"
                    onChange={handleChange('restaurantComission')}
                    error={Boolean(touched.restaurantComission && errors.restaurantComission)}
                    helperText={touched.restaurantComission && errors.restaurantComission}
                    {...getFieldProps('restaurantComission')}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>

          <Divider />

          <CardContent sx={{ mx: 2 }}>
            <CardHeader
              title="Tarifs Livreur Par KM"
              subheader="Le prix de la livraison, la somme que les livreurs reçoivent"
            />

            <Grid container m={1} spacing={2}>
              <Grid item md={4} xs={12}>
                <FormControl fullWidth variant="outlined">
                  <TextField
                    id="priceByKM"
                    type="number"
                    // value={values.priceByKM}
                    // defaultValue={500}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                    }}
                    aria-describedby="outlined-weight-helper-text"
                    onChange={handleChange('priceByKM')}
                    error={Boolean(touched.priceByKM && errors.priceByKM)}
                    helperText={touched.priceByKM && errors.priceByKM}
                    {...getFieldProps('priceByKM')}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>

          <CardContent sx={{ mx: 2 }}>
            <CardHeader
              title="Tarifs Minimum de Livreur"
              subheader="Le prix de la livraison, la somme que les livreurs reçoivent"
            />

            <Grid container m={1} spacing={2}>
              <Grid item md={4} xs={12}>
                <FormControl fullWidth variant="outlined">
                  <TextField
                    id="minRidePrice"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                    }}
                    aria-describedby="outlined-weight-helper-text"
                    onChange={handleChange('minRidePrice')}
                    error={Boolean(touched.minRidePrice && errors.minRidePrice)}
                    helperText={touched.minRidePrice && errors.minRidePrice}
                    {...getFieldProps('minRidePrice')}
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid item mx={-3} my={-2}>
              <CardHeader title="Contact" subheader="Les contacts de support" />
              <Divider />
            </Grid>
            <Grid container m={1} mt={3} spacing={1}>
              <Grid item md={6} xs={12}>
                <FormControl fullWidth>
                  <TextField
                    variant="standard"
                    id="email"
                    type="email"
                    label="E-mail"
                    {...getFieldProps('contact.email')}
                    error={Boolean(touched.contact?.email && errors.contact?.email)}
                    helperText={touched.contact?.email && errors.contact?.email}
                    aria-describedby="standard-weight-helper-text"
                  />
                </FormControl>
              </Grid>

              <Grid item md={6} xs={12}>
                <FormControl fullWidth>
                  <TextField
                    variant="standard"
                    id="phone"
                    type="text"
                    label="Numéro de Téléphone"
                    {...getFieldProps('contact.phone')}
                    error={Boolean(touched.contact?.phone && errors.contact?.phone)}
                    helperText={touched.contact?.phone && errors.contact?.phone}
                    aria-describedby="standard-weight-helper-text"
                  />
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
            }}
          >
            <Button
              color="primary"
              variant="contained"
              type="submit"
            >
              Appliquer
            </Button>
          </Box>
        </Card>
      )}
    </form>
  );
}
