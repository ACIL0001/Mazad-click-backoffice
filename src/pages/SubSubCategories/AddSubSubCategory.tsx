import { Box, Card, CardHeader, Container, Grid, Stack, TextField, Typography, Chip, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Form, useFormik, FormikProvider } from 'formik';
import Breadcrumb from '@/components/Breadcrumbs';
import Iconify from '@/components/Iconify';
import Page from '@/components/Page';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { UploadMultiFile } from '@/components/upload/UploadMultiFile';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SubCategoryAPI } from '@/api/subcategory';
import { SubSubCategoryAPI } from '@/api/SubSubCategory';

export default function AddSubSubCategory() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [subSubCategoryImage, setSubSubCategoryImage] = useState<File | null>(null);
    const { enqueueSnackbar } = useSnackbar();
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getSubCategories();
    }, []);

    const getSubCategories = async () => {
        try {
            console.log('Fetching sub-categories...');
            const result = await SubCategoryAPI.get();
            console.log('Sub-categories API response:', result);

            if (result && Array.isArray(result)) {
                console.log('Sub-categories array structure:', JSON.stringify(result, null, 2));
                setSubCategories(result);
            } else if (result && result.data && Array.isArray(result.data)) {
                console.log('Sub-categories data structure:', JSON.stringify(result.data, null, 2));
                setSubCategories(result.data);
            } else {
                console.error('Unexpected API response format:', result);
                enqueueSnackbar('Invalid data format received', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching sub-categories:', error);
            enqueueSnackbar('Failed to load sub-categories', { variant: 'error' });
        }
    };

    const SubSubCategorySchema = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Le nom doit contenir au moins 2 caractères !')
            .max(50, 'Le nom est trop long !')
            .required('Le nom est requis !'),
        subcategory: Yup.string().required('La sous-catégorie parente est requise !'),
        attributes: Yup.array().of(Yup.string()),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            subcategory: '', // Stores the _id of the parent subcategory
            attributes: [],
        },
        validationSchema: SubSubCategorySchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                console.log('Sub-sub-category values:', values);

                // Create form data to include the image
                const formData = new FormData();

                const dataPayload = {
                    name: values.name,
                    subcategory: values.subcategory, // This is the ID of the parent subcategory
                    attributes: values.attributes || [],
                };
                formData.append('data', JSON.stringify(dataPayload));

                // Only append image if it exists and is a File object
                if (subSubCategoryImage) {
                    formData.append('image', subSubCategoryImage);
                }

                console.log('Sending sub-sub-category data with image');
                const response = await SubSubCategoryAPI.create(formData);

                console.log('SubSubCategory creation response:', response);

                enqueueSnackbar('Sous-Sous-Catégorie créée avec succès !', { variant: 'success' });
                navigate(-1);
            } catch (error: any) {
                console.error('Error creating sub-sub-category:', error);
                if (error.response?.data?.message) {
                    const errorMessage = Array.isArray(error.response.data.message)
                        ? error.response.data.message.join(', ')
                        : error.response.data.message;
                    enqueueSnackbar(errorMessage, { variant: 'error' });
                } else {
                    enqueueSnackbar('Échec de la création de la sous-sous-catégorie', { variant: 'error' });
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    const { errors, touched, isSubmitting, handleSubmit, getFieldProps, setFieldValue, values } = formik;

    const handleDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSubSubCategoryImage(acceptedFiles[0]);
        }
    };

    const handleRemove = () => {
        setSubSubCategoryImage(null);
    };

    const handleRemoveAll = () => {
        setSubSubCategoryImage(null);
    };

    return (
        <Page title="Créer une sous-sous-catégorie">
            <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" mb={{ xs: 2, sm: 3 }} spacing={isMobile ? 2 : 0}>
                    <Typography variant={isMobile ? "h5" : "h4"} gutterBottom={isMobile} sx={{ fontWeight: 'bold' }}>
                        Créer une Nouvelle Sous-Sous-Catégorie
                    </Typography>
                </Stack>
                <Stack mb={{ xs: 2, sm: 3 }}>
                    <Breadcrumb />
                </Stack>

                <Card sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
                    <CardHeader
                        title={
                            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
                                Détails de la Nouvelle Sous-Sous-Catégorie
                            </Typography>
                        }
                        subheader={
                            <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">
                                Créez une nouvelle sous-sous-catégorie pour organiser vos produits
                            </Typography>
                        }
                        action={<Iconify width={isMobile ? 32 : 40} height={isMobile ? 32 : 40} icon="mdi:layers-triple" />}
                        sx={{ p: 0, mb: { xs: 2, sm: 3 } }}
                    />
                    <Box sx={{ p: 0 }}>
                        <FormikProvider value={formik}>
                            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                                <Grid container spacing={isMobile ? 2 : 3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Nom de la sous-sous-catégorie"
                                            {...getFieldProps('name')}
                                            error={Boolean(touched.name && errors.name)}
                                            helperText={touched.name && errors.name}
                                            size={isMobile ? 'small' : 'medium'}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth error={Boolean(touched.subcategory && errors.subcategory)} size={isMobile ? 'small' : 'medium'}>
                                            <InputLabel id="parent-subcategory-label">Sous-Catégorie Parente</InputLabel>
                                            <Select
                                                labelId="parent-subcategory-label"
                                                label="Sous-Catégorie Parente"
                                                {...getFieldProps('subcategory')}
                                                onChange={(e) => {
                                                    const selectedSubCategoryId = e.target.value as string;
                                                    setFieldValue('subcategory', selectedSubCategoryId);
                                                }}
                                                value={values.subcategory || ''}
                                            >
                                                {subCategories.map((subCat: any) => (
                                                    <MenuItem key={subCat._id} value={subCat._id}>
                                                        {subCat.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {touched.subcategory && errors.subcategory && (
                                                <Typography variant="caption" color="error">
                                                    {errors.subcategory}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Attributs"
                                            placeholder="Ajouter un attribut et appuyer sur Entrée"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.target as HTMLInputElement;
                                                    const value = input.value.trim();

                                                    if (value && !values.attributes.includes(value)) {
                                                        const newAttributes = [...values.attributes, value];
                                                        setFieldValue('attributes', newAttributes);
                                                        input.value = '';
                                                    }
                                                }
                                            }}
                                            error={Boolean(touched.attributes && errors.attributes)}
                                            helperText={touched.attributes && errors.attributes ?
                                                (typeof errors.attributes === 'string' ? errors.attributes : 'Format invalide') :
                                                'Ajoutez des attributs et appuyez sur Entrée'}
                                            size={isMobile ? 'small' : 'medium'}
                                        />

                                        {values.attributes.length > 0 && (
                                            <Box sx={{ mt: { xs: 1, sm: 2 }, display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}>
                                                {values.attributes.map((attribute, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={attribute}
                                                        onDelete={() => {
                                                            const newAttributes = values.attributes.filter((_, i) => i !== index);
                                                            setFieldValue('attributes', newAttributes);
                                                        }}
                                                        color="primary"
                                                        variant="outlined"
                                                        size={isMobile ? 'small' : 'medium'}
                                                        sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ mt: { xs: 1, sm: 2 } }}>
                                            <Typography variant={isMobile ? "subtitle2" : "subtitle1"} gutterBottom sx={{ mb: { xs: 1, sm: 2 } }}>
                                                Image de la Sous-Sous-Catégorie
                                            </Typography>
                                            <UploadMultiFile
                                                showPreview
                                                files={subSubCategoryImage ? [subSubCategoryImage] : []}
                                                onDrop={handleDrop}
                                                onRemove={handleRemove}
                                                onRemoveAll={handleRemoveAll}
                                                accept={{
                                                    'image/*': ['.jpeg', '.jpg', '.png', '.gif']
                                                }}
                                            />
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <LoadingButton
                                            fullWidth
                                            size={isMobile ? "medium" : "large"}
                                            type="submit"
                                            variant="contained"
                                            loading={isSubmitting}
                                            sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
                                        >
                                            Créer la Sous-Sous-Catégorie
                                        </LoadingButton>
                                    </Grid>
                                </Grid>
                            </Form>
                        </FormikProvider>
                    </Box>
                </Card>
            </Container>
        </Page>
    );
}