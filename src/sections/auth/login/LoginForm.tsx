import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';

// material
import { Link, Stack, TextField, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';

// component
import Iconify from '../../../components/Iconify';
import { AuthAPI } from '@/api/auth';
import { useSnackbar } from 'notistack';
import useAuth from '@/hooks/useAuth';
import { RoleCode, hasAdminPrivileges } from '@/types/Role';
import axios from 'axios';

export default function LoginForm() {
  const navigate = useNavigate();
  const { set, isLogged, auth } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  
  // Remove the automatic redirect from useEffect - let the form handle it
  useEffect(() => {
    console.log('LoginForm useEffect - isLogged:', isLogged, 'auth:', auth);
    // Only redirect if user is already fully authenticated and verified
    if (isLogged && auth?.user && auth?.session?.accessToken) {
      const userRole = auth.user.type as RoleCode;
      const accountRole = auth.user.accountType as RoleCode;
      
      // Check if user has admin privileges and phone is verified
      if ((hasAdminPrivileges(userRole) || hasAdminPrivileges(accountRole)) && auth.user.isPhoneVerified !== false) {
        console.log('User already authenticated with admin privileges, redirecting to dashboard');
        navigate('/dashboard/app', { replace: true });
      }
    }
  }, [isLogged, auth, navigate]);
  
  const LoginSchema = Yup.object().shape({
    login: Yup.string().email('Email invalide').required('Email est requis'),
    password: Yup.string().required('Password est requis'),
  });

  const formik = useFormik({
    initialValues: {
      login: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log('Attempting login with:', values);
        
        const response = await axios.post('http://localhost:3000/auth/signin', {
          login: values.login,
          password: values.password
        }, {
          headers: {
            'x-access-key': '8f2a61c94d7e3b5f9c0a8d2e6b4f1c7a',
            'Content-Type': 'application/json'
          }
        });
        const data = response.data;

        console.log('Login response:', data);
        
        // Check if response has expected structure
        if (!data || !data.user || !data.session) {
          throw new Error('Invalid response structure from server');
        }

        // Handle phone verification requirement
        if (data.requiresPhoneVerification || (data.user && data.user.isPhoneVerified === false)) {
          enqueueSnackbar('Veuillez vérifier votre numéro de téléphone', { variant: 'warning' });
          // You might want to redirect to phone verification page here
          // navigate('/phone-verification');
          return;
        }

        // Validate tokens
        if (!data.session.accessToken || !data.session.refreshToken) {
          throw new Error('Invalid session tokens received');
        }

        // Validate admin access (ADMIN or SOUS_ADMIN)
        const userRole = data.user.type as RoleCode;
        const accountRole = data.user.accountType as RoleCode;
        
        if (hasAdminPrivileges(userRole) || hasAdminPrivileges(accountRole)) {
          // Set auth data first
          console.log('Setting auth data for user with role:', userRole, 'account type:', accountRole);
          set(data);  // Pass original { session, user } structure
          
          // Show success message
          enqueueSnackbar('Connexion réussie', { variant: 'success' });
          
          // Navigate immediately - don't use setTimeout as it can cause race conditions
          console.log('Navigating to dashboard...');
          navigate('/dashboard/app', { replace: true });
          
        } else {
          enqueueSnackbar('PERMISSION DENIED - Accès administrateur requis', { variant: 'error' });
        }
        
      } catch (error: any) {
        console.error('Login error:', error);
        
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.message;
          if (errorMessage && errorMessage.includes('Phone number not verified')) {
            enqueueSnackbar('Veuillez vérifier votre numéro de téléphone', { variant: 'warning' });
          } else {
            enqueueSnackbar('Email ou mot de passe incorrect', { variant: 'error' });
          }
        } else if (error.response?.status === 403) {
          enqueueSnackbar('Accès refusé', { variant: 'error' });
        } else if (error.message) {
          enqueueSnackbar(error.message, { variant: 'error' });
        } else {
          enqueueSnackbar('Erreur de connexion', { variant: 'error' });
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            type="email"
            label="Email Admin"
            {...getFieldProps('login')}
            error={Boolean(touched.login && errors.login)}
            helperText={touched.login && errors.login}
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
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }} />

        <LoadingButton 
          fullWidth 
          size="large" 
          type="submit" 
          variant="contained" 
          loading={isSubmitting}
        >
          Connecter
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}