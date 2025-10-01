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
import Credentials from '@/types/Credentials'; // Import Credentials directly

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
    login: Yup.string().required('Identifiant est requis'),
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
        console.log('Login form submitted with values:', values);
        
        // Create credentials object that matches the Credentials interface
        const credentials: Credentials = {
          login: values.login,
          password: values.password
        };

        console.log('Sending credentials:', credentials);
        
        const data = await AuthAPI.login(credentials);

        console.log('Login API response received:', data);
        
        if (!data || !data.user || (!data.tokens && !data.session)) {
          throw new Error('Réponse invalide du serveur');
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

        // Extract tokens and convert to consistent format
        let accessToken, refreshToken;
        
        if (data.tokens) {
          // New structure with tokens
          accessToken = data.tokens.accessToken;
          refreshToken = data.tokens.refreshToken;
        } else if (data.session) {
          // Server returns session with accessToken and refreshToken
          accessToken = data.session.accessToken || data.session.access_token;
          refreshToken = data.session.refreshToken || data.session.refresh_token;
        }

        if (!accessToken || !refreshToken) {
          throw new Error('Tokens manquants dans la réponse');
        }

        // Always use tokens structure for auth store
        const authData = {
          user: {
            _id: data.user._id,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            type: data.user.type,
            accountType: data.user.accountType,
            phone: data.user.phone,
            isPhoneVerified: data.user.isPhoneVerified,
            photoURL: data.user.photoURL
          },
          tokens: {
            accessToken: accessToken,
            refreshToken: refreshToken
          }
        };

        console.log('Setting auth data via auth store:', authData);

        set(authData);
        
        enqueueSnackbar('Connexion réussie!', { variant: 'success' });
        
        console.log('Navigating to dashboard...');
        navigate('/dashboard/app', { replace: true });
        
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Enhanced error handling
        let errorMessage = 'Erreur de connexion';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
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
            label="Identifiant Admin"
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
