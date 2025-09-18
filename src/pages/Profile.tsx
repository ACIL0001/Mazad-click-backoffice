import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
// material
import { Stack, TextField, IconButton, InputAdornment, Paper, Typography, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// component
import Iconify from '@/components/Iconify';
import { UserAPI } from '@/api/user';
import { useSnackbar } from 'notistack';

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Le mot de passe actuel est requis'),
  newPassword: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le nouveau mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est requise'),
});

function PasswordChangeForm() {
  const { enqueueSnackbar } = useSnackbar();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: PasswordSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await UserAPI.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        
        enqueueSnackbar('Mot de passe modifié avec succès', { variant: 'success' });
        resetForm();
      } catch (error) {
        enqueueSnackbar('Erreur lors de la modification du mot de passe', { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            autoComplete="current-password"
            type={showCurrentPassword ? 'text' : 'password'}
            label="Mot de passe actuel"
            {...getFieldProps('currentPassword')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                    <Iconify icon={showCurrentPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.currentPassword && errors.currentPassword)}
            helperText={touched.currentPassword && errors.currentPassword}
          />

          <TextField
            fullWidth
            type={showNewPassword ? 'text' : 'password'}
            label="Nouveau mot de passe"
            {...getFieldProps('newPassword')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    <Iconify icon={showNewPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.newPassword && errors.newPassword)}
            helperText={touched.newPassword && errors.newPassword}
          />

          <TextField
            fullWidth
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirmer le nouveau mot de passe"
            {...getFieldProps('confirmPassword')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    <Iconify icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.confirmPassword && errors.confirmPassword)}
            helperText={touched.confirmPassword && errors.confirmPassword}
          />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Modifier le mot de passe
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
}

export default function Profile() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <PasswordChangeForm />
      </Paper>
    </Box>
  );
}