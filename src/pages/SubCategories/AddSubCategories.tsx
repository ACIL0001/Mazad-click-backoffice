import { Box, Card, CardHeader, Container, Grid, Stack, TextField, Typography, Chip, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Form, useFormik, FormikProvider } from 'formik';
import Breadcrumb from '@/components/Breadcrumbs';
import Iconify from '@/components/Iconify';
import Page from '@/components/Page';
import { CategoryAPI } from '@/api/category';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { UploadMultiFile } from '@/components/upload/UploadMultiFile';
import { CATEGORY_TYPE } from '@/types/Category'; // Assuming this is still used somewhere, though commented out in schema
import { SubCategoryAPI } from '@/api/subcategory';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import useMediaQuery from '@mui/material/useMediaQuery'; // Import useMediaQuery


export default function AddSubCategory() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [categoryImage, setCategoryImage] = useState<File | null>(null);
    const { enqueueSnackbar } = useSnackbar();
    const [categories,setCategories] = useState<any[]>([]); // Added type for clarity
    const navigate = useNavigate();

    useEffect(() => {
        getCategories();
    }, []);


    const getCategories = async () => {
        try {
            console.log('Fetching categories...');
            const result = await CategoryAPI.getCategories();
            console.log('Full API response: sou ) ', result);

            if (result && result.data) {
                console.log('Categories data structure:', JSON.stringify(result.data, null, 2));
                setCategories(result.data);
            } else if (Array.isArray(result)) {
                console.log('Categories array structure:', JSON.stringify(result, null, 2));
                setCategories(result);
            } else {
                console.error('Unexpected API response format:', result);
                enqueueSnackbar('Invalid data format received', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            enqueueSnackbar('Failed to load categories', { variant: 'error' });
        }
    };

    const CategorySchema = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Le nom doit contenir au moins 2 caractères !')
            .max(50, 'Le nom est trop long !')
            .required('Le nom est requis !'),
        category: Yup.string().required('La catégorie parente est requise !'),
        attributes: Yup.array().of(Yup.string()),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            category: '', // Stores the _id of the parent category
            attributes: [],
        },
        validationSchema: CategorySchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                console.log('Vl ) ', values);

                // Create form data to include the image
                const formData = new FormData();

                const dataPayload = {
                    name: values.name,
                    category: values.category, // This is the ID of the parent category
                    attributes: values.attributes || [],
                };
                formData.append('data', JSON.stringify(dataPayload)); // All structured data

                // Only append image if it exists and is a File object
                if (categoryImage) {
                    formData.append('image', categoryImage); // The file
                }

                console.log('Sending subcategory data with image');
                const response = await SubCategoryAPI.create(formData);


                console.log('SubCategory creation response:', response);

                enqueueSnackbar('Sous-Catégorie créée avec succès !', { variant: 'success' });
                navigate(-1);
            } catch (error: any) { // Explicitly type error for better handling
                console.error('Error creating subcategory:', error);
                if (error.response?.data?.message) {
                    const errorMessage = Array.isArray(error.response.data.message)
                        ? error.response.data.message.join(', ')
                        : error.response.data.message;
                    enqueueSnackbar(errorMessage, { variant: 'error' });
                } else {
                    enqueueSnackbar('Échec de la création de la sous-catégorie', { variant: 'error' });
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    const { errors, touched, isSubmitting, handleSubmit, getFieldProps, setFieldValue, values } = formik;

    const handleDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setCategoryImage(acceptedFiles[0]);
        }
    };

    const handleRemove = () => {
        setCategoryImage(null);
    };

    const handleRemoveAll = () => {
        setCategoryImage(null);
    };

    return (
        <Page title="Créer une sous Catégorie">
            <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}> {/* Responsive padding */}
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" mb={{ xs: 2, sm: 3 }} spacing={isMobile ? 2 : 0}> {/* Responsive direction and spacing */}
                    <Typography variant={isMobile ? "h5" : "h4"} gutterBottom={isMobile} sx={{ fontWeight: 'bold' }}> {/* Responsive font size */}
                        Créer une Nouvelle Sous-Catégorie
                    </Typography>
                </Stack>
                <Stack mb={{ xs: 2, sm: 3 }}> {/* Responsive margin bottom */}
                    <Breadcrumb />
                </Stack>

                <Card sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}> {/* Responsive padding */}
                    <CardHeader
                        title={
                            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600 }}> {/* Responsive font size */}
                                Détails de la Nouvelle Sous-Catégorie
                            </Typography>
                        }
                        subheader={
                            <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary"> {/* Responsive font size */}
                                Créez une nouvelle sous-catégorie pour vos produits ou services
                            </Typography>
                        }
                        action={<Iconify width={isMobile ? 32 : 40} height={isMobile ? 32 : 40} icon="mdi:shape-outline" />} 
                        sx={{ p: 0, mb: { xs: 2, sm: 3 } }} 
                    />
                    <Box sx={{ p: 0 }}> {/* Removed extra padding here as Card handles it */}
                        <FormikProvider value={formik}>
                            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                                <Grid container spacing={isMobile ? 2 : 3}> {/* Responsive spacing */}
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Nom de la sous-Catégorie"
                                            {...getFieldProps('name')}
                                            error={Boolean(touched.name && errors.name)}
                                            helperText={touched.name && errors.name}
                                            size={isMobile ? 'small' : 'medium'} 
                                        />
                                    </Grid>

                                    <Grid item xs={12} >
                                        <FormControl fullWidth error={Boolean(touched.category && errors.category)} size={isMobile ? 'small' : 'medium'}> {/* Responsive size */}
                                            <InputLabel id="parent-category-label">Catégorie</InputLabel>
                                            <Select
                                                labelId="parent-category-label"
                                                label="Catégorie"
                                                {...getFieldProps('category')}
                                                onChange={(e) => {
                                                    const selectedCategoryId = e.target.value as string;
                                                    setFieldValue('category', selectedCategoryId);

                                                    // Find the name of the selected category and set it to Namecategory
                                                    const selectedCategory = categories.find((cat: any) => cat._id === selectedCategoryId);
                                                    if (selectedCategory) {
                                                        setFieldValue('Namecategory', selectedCategory.name);
                                                    } else {
                                                        setFieldValue('Namecategory', ''); // Clear if no category selected
                                                    }
                                                }}
                                                value={values.category || ''} // Ensure value is a string or empty
                                            >
                                                {categories.map((ti: any) => ( // Assuming ti has _id and name
                                                    <MenuItem key={ti._id} value={ti._id}>
                                                        {ti.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {touched.category && errors.category && (
                                                <Typography variant="caption" color="error">
                                                    {errors.category}
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
                                            <Box sx={{ mt: { xs: 1, sm: 2 }, display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}> {/* Responsive margin top and gap */}
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
                                        <Box sx={{ mt: { xs: 1, sm: 2 } }}> {/* Responsive margin top */}
                                            <Typography variant={isMobile ? "subtitle2" : "subtitle1"} gutterBottom sx={{ mb: { xs: 1, sm: 2 } }}> {/* Responsive font size and margin */}
                                                Image de la Sous-Catégorie
                                            </Typography>
                                            <UploadMultiFile
                                                showPreview
                                                files={categoryImage ? [categoryImage] : []}
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
                                            Créer la Sous-Catégorie
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
