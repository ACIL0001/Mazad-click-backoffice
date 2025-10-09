import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';
import { Stack, TextField, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Iconify from '../../../components/Iconify';
import { AuthAPI } from '@/api/auth';
import { useSnackbar } from 'notistack';
import useAuth from '@/hooks/useAuth';
import { hasAdminPrivileges, RoleCode } from '@/types/Role';

export default function LoginForm() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const { set, isLogged, auth, isReady } = useAuth();

  // Check if already logged in and redirect
  useEffect(() => {
    console.log('LoginForm - Auth state check:', { isReady, isLogged, hasAuth: !!auth?.user });
    
    if (isReady && isLogged && auth?.user) {
      // Check if user has admin privileges for this portal
      const currentPort = window.location.port;
      const isAdminPortal = currentPort === '3002' || currentPort === '3003';
      
      if (isAdminPortal) {
        const userType = auth.user.type as RoleCode;
        const accountType = auth.user.accountType as RoleCode;
        const userHasAdminAccess = hasAdminPrivileges(userType) || hasAdminPrivileges(accountType);
        
        if (userHasAdminAccess) {
          console.log('User already logged in with admin access, redirecting to dashboard');
          navigate('/dashboard/app', { replace: true });
        }
      }
    }
  }, [isReady, isLogged, auth?.user, navigate]);

  const LoginSchema = Yup.object().shape({
    login: Yup.string()
      .required('Email ou téléphone est requis')
      .test('email-or-phone', 'Email ou numéro de téléphone invalide', function(value) {
        if (!value) return false;
        // Check if it's a valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Check if it's a valid Algerian phone number
        const phoneRegex = /^(\+213|0)(5|6|7)[0-9]{8}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      }),
    password: Yup.string().required('Mot de passe est requis'),
  });

  const formik = useFormik({
    initialValues: {
      login: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log('Login form submitted with values:', values);
        
        // Send request with 'login' field (not 'email')
        const data = await AuthAPI.login({
          login: values.login.toLowerCase(), // Backend transforms to lowercase
          password: values.password
        });

        console.log('Login API response received:', data);
        console.log('Response structure:', {
          hasSession: !!data.session,
          hasUser: !!data.user,
          sessionKeys: data.session ? Object.keys(data.session) : [],
          userKeys: data.user ? Object.keys(data.user) : []
        });
        
        // Backend returns: { session: { accessToken, refreshToken }, user: {...} }
        if (!data || !data.user || !data.session) {
          throw new Error('Réponse invalide du serveur');
        }

        // Check if phone is verified (backend prevents login if not - but just in case)
        if (!data.user.isPhoneVerified) {
          throw new Error('Votre numéro de téléphone n\'est pas vérifié. Veuillez vérifier votre téléphone avec le code OTP qui vous a été envoyé.');
        }

        // Check if user has admin privileges for this portal
        const currentPort = window.location.port;
        const isAdminPortal = currentPort === '3002' || currentPort === '3003';
        
        if (isAdminPortal) {
          const userType = data.user.type as RoleCode;
          const accountType = data.user.accountType as RoleCode;
          const userHasAdminAccess = hasAdminPrivileges(userType) || hasAdminPrivileges(accountType);
          
          if (!userHasAdminAccess) {
            throw new Error('Vous n\'avez pas les privilèges nécessaires pour accéder à ce portail administrateur');
          }
        }

        // Verify tokens exist in session
        if (!data.session?.accessToken || !data.session?.refreshToken) {
          console.error('Missing tokens in session:', data.session);
          throw new Error('Tokens manquants dans la réponse');
        }

        console.log('Setting auth data via auth store (raw backend format)');
        
        // Pass the raw backend response directly to the store
        // authStore will handle the transformation
        set(data);
        
        enqueueSnackbar('Connexion réussie!', { variant: 'success' });
        
        console.log('Navigating to dashboard...');
        navigate('/dashboard/app', { replace: true });
        
      } catch (error: any) {
        console.error('Login error:', error);
        console.error('Error response:', error.response?.data);
        
        // Handle specific error messages from backend
        let errorMessage = 'Erreur de connexion';
        
        if (error.response?.data?.message) {
          const backendMessage = error.response.data.message;
          // If it's an array of validation errors
          if (Array.isArray(backendMessage)) {
            errorMessage = backendMessage.join(', ');
          } else if (typeof backendMessage === 'string') {
            errorMessage = backendMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            type="text"
            label="Email ou Téléphone"
            placeholder="admin@example.com ou 0555123456"
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
          Se connecter
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}