import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../../../api/auth';
// material
import { Stack, TextField, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// component
import Iconify from '../../../components/Iconify';
// ----------------------------------------------------------------------

export default function RegisterForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  
  const RegisterSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Trop court!').max(50, 'Trop Long!').required('Buisness est requis'),
    email: Yup.string().email("L'e-mail doit être une adresse e-mail valide").required('Email est requis'),
    password: Yup.string().required('Password est requis'),
  });


  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      isBuisness: true,
    },
    validationSchema: RegisterSchema,
    onSubmit: (values, actions) => {
    },
  });



  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/*
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Nom"
              {...getFieldProps('firstname')}
              error={Boolean(touched.firstname && errors.firstname)}
              helperText={touched.firstname && errors.firstname}
            />

            <TextField
              fullWidth
              label="Prénom"
              {...getFieldProps('lastname')}
              error={Boolean(touched.lastname && errors.lastname)}
              helperText={touched.lastname && errors.lastname}
            />
          </Stack>
          */}
          <TextField
            fullWidth
            autoComplete="name"
            type="text"
            label="Buisness"
            {...getFieldProps('name')}
            error={Boolean(touched.name && errors.name)}
            helperText={touched.name && errors.name}
          />

          <TextField
            fullWidth
            autoComplete="username"
            type="text"
            label="Email"
            {...getFieldProps('email')}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />

          <TextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            label="Mot de passe"
            {...getFieldProps('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}>
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />

          <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
            S'inscrire
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
