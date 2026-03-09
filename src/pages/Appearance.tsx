import { useState, useEffect } from 'react';
import {
  Stack,
  Container,
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requests } from '../api/utils';
import Page from '../components/Page';
import Iconify from '../components/Iconify';
import app from '../config';

const fetchSettings = async () => {
    return await requests.get(`settings`);
};

export default function Appearance() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [themeColors, setThemeColors] = useState({
    tenderColor: '#27F5CC',
    auctionColor: '#2453D4',
    directSaleColor: '#D8762D'
  });

  useEffect(() => {
     if (settings) {
         setLogoPreview(settings.logoUrl ? `${app.baseURL.replace(/\/$/, '')}${settings.logoUrl}` : null);
         setThemeColors({
             tenderColor: settings.tenderColor || '#27F5CC',
             auctionColor: settings.auctionColor || '#2453D4',
             directSaleColor: settings.directSaleColor || '#D8762D'
         });
     }
  }, [settings]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadLogoMutation = useMutation({
      mutationFn: async (file: File) => {
          const formData = new FormData();
          formData.append('file', file);
          return await requests.put(`settings/logo`, formData);
      },
      onSuccess: () => {
          enqueueSnackbar('Logo updated successfully', { variant: 'success' });
          queryClient.invalidateQueries({ queryKey: ['settings'] });
      },
      onError: (error) => {
          enqueueSnackbar('Failed to update logo', { variant: 'error' });
          console.error(error);
      }
  });

  const updateThemeMutation = useMutation({
     mutationFn: async (colors: typeof themeColors) => {
         return await requests.put(`settings/theme`, colors);
     },
     onSuccess: () => {
         enqueueSnackbar('Theme colors updated successfully', { variant: 'success' });
         queryClient.invalidateQueries({ queryKey: ['settings'] });
     },
     onError: (error) => {
         enqueueSnackbar('Failed to update theme colors', { variant: 'error' });
         console.error(error);
     }
  });

  const handleSaveLogo = () => {
      if (logoFile) {
          uploadLogoMutation.mutate(logoFile);
      }
  };

  const handleSaveTheme = () => {
      updateThemeMutation.mutate(themeColors);
  };

  return (
    <Page title="Site Appearance">
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Site Appearance
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Customize the logo and primary colors for the application.
        </Typography>

        {isLoading ? (
            <CircularProgress />
        ) : (
            <Stack spacing={4}>
                <Card>
                    <CardHeader title="Site Logo" subheader="Update the logo displayed on the website" />
                    <Divider />
                    <CardContent>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
                            <Box sx={{ width: 250, height: 150, border: '1px dashed #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', bgcolor: 'background.neutral' }}>
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <Typography color="text.secondary">No logo set</Typography>
                                )}
                            </Box>
                            <Stack spacing={2}>
                                <Button variant="outlined" component="label" startIcon={<Iconify icon="eva:cloud-upload-fill" />}>
                                    Choose File
                                    <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={handleSaveLogo}
                                    disabled={!logoFile || uploadLogoMutation.isPending}
                                >
                                    {uploadLogoMutation.isPending ? 'Uploading...' : 'Save Logo'}
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader title="Theme Colors" subheader="Customize the colors used for different sections" />
                    <Divider />
                    <CardContent>
                        <Stack spacing={3} maxWidth={500}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle1" fontWeight="bold">Tenders Color:</Typography>
                                <input 
                                    type="color" 
                                    value={themeColors.tenderColor} 
                                    onChange={(e) => setThemeColors({ ...themeColors, tenderColor: e.target.value })}
                                    style={{ width: '100px', height: '40px', cursor: 'pointer', border: 'none', padding: 0 }}
                                />
                            </Box>
                             <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle1" fontWeight="bold">Auctions Color:</Typography>
                                <input 
                                    type="color" 
                                    value={themeColors.auctionColor} 
                                    onChange={(e) => setThemeColors({ ...themeColors, auctionColor: e.target.value })}
                                    style={{ width: '100px', height: '40px', cursor: 'pointer', border: 'none', padding: 0 }}
                                />
                            </Box>
                             <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle1" fontWeight="bold">Direct Sales Color:</Typography>
                                <input 
                                    type="color" 
                                    value={themeColors.directSaleColor} 
                                    onChange={(e) => setThemeColors({ ...themeColors, directSaleColor: e.target.value })}
                                    style={{ width: '100px', height: '40px', cursor: 'pointer', border: 'none', padding: 0 }}
                                />
                            </Box>
                            
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleSaveTheme}
                                disabled={updateThemeMutation.isPending}
                                sx={{ alignSelf: 'flex-start', mt: 2 }}
                            >
                                {updateThemeMutation.isPending ? 'Saving...' : 'Save Theme'}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        )}
      </Container>
    </Page>
  );
}
