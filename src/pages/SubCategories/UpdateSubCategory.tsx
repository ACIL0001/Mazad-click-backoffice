// src/pages/SubCategories/UpdateSubCategory.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Card,
  CardHeader,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  Button,
  Divider,
  Fade,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputAdornment,
} from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { useFormik, FormikProvider, Form } from "formik"
import * as Yup from "yup"
import Breadcrumb from "@/components/Breadcrumbs"
import Iconify from "@/components/Iconify"
import ImageInput from "@/components/ImageInput"
import Page from "@/components/Page"
import { SubCategoryAPI } from "@/api/subcategory"
import { CategoryAPI } from "@/api/category"
import { useSnackbar } from "notistack"
import { useLocation, useNavigate } from "react-router-dom"
import type ICategory from "@/types/Category"
// Fix: Import the correct Attachment type from the shared file
import type Attachment from "@/types/Attachment"
import useMediaQuery from '@mui/material/useMediaQuery';
import { FormikErrors } from "formik"; // Import FormikErrors type for better typing

// Fix: Define ISubCategory interface correctly, using the imported Attachment type
interface ISubCategory extends ICategory {
  Namecategory: string;
  category: string;
  attributes: string[];
  // Fix: Use the imported Attachment type
  thumb?: Attachment | null;
}

// Keyframe for subtle floating animation (from UpdateCategory)
const floatAnimation = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-5px) rotate(0.5deg); }
    50% { transform: translateY(0px) rotate(0deg); }
    75% { transform: translateY(5px) rotate(-0.5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
`;

// Keyframe for subtle gradient shift (from UpdateCategory)
const gradientShift = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// Function to get an appropriate icon based on subcategory name (reused from SubCategoryDetailsPage)
const getSubCategoryIcon = (subCategoryName: string): string => {
  const name = subCategoryName.toLowerCase();
  const iconMap: Record<string, string> = {
    electronique: "solar:display-bold",
    smartphones: "solar:smartphone-bold",
    ordinateurs: "solar:laptop-bold",
    vetements: "solar:hanger-bold",
    chaussures: "solar:shoes-bold",
    accessoires: "solar:bag-bold",
    nourriture: "solar:bowl-bold",
    boissons: "solar:cup-bold",
    maison: "solar:home-smile-angle-bold",
    cuisine: "solar:chef-hat-bold",
    default: "solar:layers-bold",
  };
  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (name.includes(keyword)) {
      return icon;
    }
  }
  return iconMap.default;
};

// Fix: Define the props for the Breadcrumb component to fix the TypeScript error
interface BreadcrumbProps {
  links: { name: string; href: string }[];
  sx?: object;
}

// Assume the Breadcrumb component is typed as follows, to resolve the error.
const TypedBreadcrumb = Breadcrumb as React.FC<BreadcrumbProps>;

export default function UpdateSubCategory() {
  const [thumb, setThumb] = useState<File | null | undefined>(undefined)
  const [defaultImage, setDefaultImage] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [attributeInput, setAttributeInput] = useState<string>("");
  const [allCategories, setAllCategories] = useState<ICategory[]>([]);
  const [initialSubCategoryLoaded, setInitialSubCategoryLoaded] = useState(false);

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const location = useLocation()

  // Get subCategory data from location state. This is how the data is passed from the list page.
  const [subCategory, setSubCategory] = useState<ISubCategory | null>(location.state?.subCategory || null)

  // Yup validation schema for the form fields
  const SubCategorySchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Le nom doit contenir au moins 3 caractères !")
      .max(50, "Le nom est trop long !")
      .required("Le nom de la sous-catégorie est requis !"),
    category: Yup.string().required("La catégorie parente est requise !"),
    description: Yup.string()
      .max(500, "La description est trop longue !")
      .optional(),
    attributes: Yup.array().of(Yup.string()).optional(),
    thumb: Yup.mixed().nullable().optional(),
  })

  const formik = useFormik({
    initialValues: {
      name: subCategory?.name || "",
      category: subCategory?.category || "",
      description: subCategory?.description || "",
      attributes: subCategory?.attributes || [],
      thumb: subCategory?.thumb || null,
    },
    validationSchema: SubCategorySchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setIsSaving(true)

      const formData = new FormData()

      const updateDto = {
        name: values.name,
        category: values.category,
        description: values.description || "",
        attributes: values.attributes,
      };

      formData.append("data", JSON.stringify(updateDto));

      if (thumb instanceof File) {
        formData.append("image", thumb);
      } else if (thumb === null) {
        formData.append("image", "null");
      }

      try {
        if (subCategory?._id) {
          await SubCategoryAPI.update(subCategory._id, formData)
          enqueueSnackbar(`Sous-catégorie "${values.name}" a été modifiée avec succès`, {
            variant: "success",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          })
          setTimeout(() => navigate("/dashboard/sous-categories"), 1000)
        } else {
          enqueueSnackbar("ID de sous-catégorie manquant pour la mise à jour.", { variant: "error" });
        }
      } catch (e: any) {
        console.error("Error updating sub-category:", e);
        enqueueSnackbar(`Erreur lors de la modification: ${e.message || "Erreur inconnue"}`, {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        })
      } finally {
        setSubmitting(false)
        setIsSaving(false)
      }
    },
  })

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, setFieldValue } = formik

  // Fetch all categories for the dropdown AND initialize form values
  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        const categories = await CategoryAPI.getCategories();
        setAllCategories(categories);

        if (subCategory) {
          formik.setValues({
            name: subCategory.name || "",
            category: subCategory.category || "",
            description: subCategory.description || "",
            attributes: subCategory.attributes || [],
            thumb: subCategory.thumb || null,
          });
          // Fix: Use path from Attachment since `url` doesn't exist.
          setDefaultImage(subCategory?.thumb?.path || undefined);
          setThumb(subCategory?.thumb ? undefined : null);
          setInitialSubCategoryLoaded(true);
        } else {
          navigate("/dashboard/sous-categories");
          enqueueSnackbar("Sous-catégorie non trouvée", { variant: "error" });
        }
      } catch (error) {
        console.error("Error fetching categories or setting sub-category:", error);
        enqueueSnackbar("Impossible de charger les catégories parentes ou la sous-catégorie.", { variant: "error" });
      }
    };

    fetchAndSetData();
  }, [enqueueSnackbar, navigate, subCategory]);

  // Handlers for attributes
  const handleAddAttribute = () => {
    const trimmedAttribute = attributeInput.trim();
    if (trimmedAttribute !== "") {
      if (!values.attributes.includes(trimmedAttribute)) {
        setFieldValue("attributes", [...values.attributes, trimmedAttribute]);
        setAttributeInput("");
      } else {
        enqueueSnackbar("Cet attribut existe déjà !", { variant: "warning" });
      }
    }
  };

  const handleDeleteAttribute = (attributeToDelete: string) => () => {
    setFieldValue(
      "attributes",
      values.attributes.filter((attr) => attr !== attributeToDelete),
    )
  }

  // Only render the form once initial data is loaded
  if (!subCategory || !initialSubCategoryLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <Page title="Update Sub-Category">
      {/* Inject global keyframe styles */}
      <style>{floatAnimation}</style>
      <style>{gradientShift}</style>

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent={"space-between"} alignItems={{ xs: 'flex-start', sm: 'center' }} mb={{ xs: 2, sm: 3 }} spacing={isMobile ? 2 : 0}>
          <Stack direction="row" spacing={isMobile ? 1 : 2} alignItems="center">
            <Box
              sx={{
                width: isMobile ? 36 : 42,
                height: isMobile ? 36 : 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1.5,
                background: (theme) =>
                  `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.2)} 0%, ${alpha(
                    theme.palette.info.dark,
                    0.3,
                  )} 100%)`,
                boxShadow: (theme) => `0px 4px 10px ${alpha(theme.palette.info.main, 0.4)}`,
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <Iconify width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} icon={getSubCategoryIcon(values.name)} color={theme.palette.info.main} />
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 600,
                color: "text.primary",
                textShadow: (theme) => `2px 2px 4px ${alpha(theme.palette.text.secondary, 0.3)}`,
                background: (theme) => `linear-gradient(90deg, ${theme.palette.info.light}, ${theme.palette.secondary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                animation: 'gradientShift 5s linear infinite',
              }}
            >
              Mettre à jour la Sous-Catégorie
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate("/dashboard/sous-categories")}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              borderRadius: 1.5,
              borderColor: "divider",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "background.paper",
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                transform: 'translateY(-2px) scale(1.02)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: theme.shadows[1],
              width: isMobile ? '100%' : 'auto',
            }}
          >
            Retour
          </Button>
        </Stack>

        <TypedBreadcrumb
          links={[
            { name: "Dashboard", href: "/dashboard" },
            { name: "Sous-Catégories", href: "/dashboard/sous-categories" },
            { name: `Modifier ${subCategory?.name}`, href: `/dashboard/sous-categories/edit/${subCategory?._id}` },
          ]}
          sx={{ mb: { xs: 2, sm: 3 } }}
        />

        <Grid container spacing={isMobile ? 2 : 3} mt={{ xs: 1, sm: 2 }}>
          <Grid item xs={12} md={8}>
            <Fade in={true} timeout={500}>
              <Card
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  background: (theme) => alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  boxShadow: (theme) =>
                    `0px 8px 30px ${alpha(theme.palette.info.main, 0.2)},
                     0px 0px 0px 2px ${alpha(theme.palette.info.dark, 0.1)},
                     inset 0px 2px 5px ${alpha(theme.palette.common.white, 0.1)}`,
                  transform: 'perspective(1000px) rotateX(2deg)',
                  transition: 'all 0.5s ease-in-out',
                  animation: 'float 6s ease-in-out infinite',
                  '&:hover': {
                    transform: 'perspective(1000px) rotateX(0deg) scale(1.01)',
                    boxShadow: (theme) =>
                      `0px 12px 40px ${alpha(theme.palette.info.main, 0.3)},
                       0px 0px 0px 3px ${alpha(theme.palette.info.dark, 0.2)},
                       inset 0px 2px 8px ${alpha(theme.palette.common.white, 0.2)}`,
                  }
                }}
              >
                <CardHeader title={
                    <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
                        Information de la sous-catégorie
                    </Typography>
                } sx={{ p: 0, mb: { xs: 1.5, sm: 2 } }} />
                <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
                <FormikProvider value={formik}>
                  <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                    <Stack spacing={isMobile ? 2 : 3}>
                      <TextField
                        fullWidth
                        label="Nom de la sous-catégorie"
                        {...getFieldProps("name")}
                        error={Boolean(touched.name && errors.name)}
                        helperText={touched.name && errors.name ? String(errors.name) : ''}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: alpha(theme.palette.background.default, 0.6),
                            '& fieldset': {
                              borderColor: alpha(theme.palette.divider, 0.5),
                            },
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.dark,
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: theme.palette.text.secondary,
                          },
                        }}
                      />

                      <FormControl fullWidth error={Boolean(touched.category && errors.category)}
                         size={isMobile ? 'small' : 'medium'}
                         sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: alpha(theme.palette.background.default, 0.6),
                            '& fieldset': {
                              borderColor: alpha(theme.palette.divider, 0.5),
                            },
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.dark,
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: theme.palette.text.secondary,
                          },
                        }}
                      >
                        <InputLabel>Catégorie Parent</InputLabel>
                        <Select
                          label="Catégorie Parent"
                          {...getFieldProps("category")}
                          displayEmpty
                          inputProps={{ "aria-label": "Select parent category" }}
                        >
                          {allCategories.map((cat) => (
                            <MenuItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.category && errors.category && (
                          <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5, fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                            {String(errors.category)}
                          </Typography>
                        )}
                      </FormControl>

                      <TextField
                        fullWidth
                        label="Description de la sous-catégorie"
                        multiline
                        rows={isMobile ? 3 : 4}
                        {...getFieldProps("description")}
                        error={Boolean(touched.description && errors.description)}
                        helperText={touched.description && String(errors.description || '')}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: alpha(theme.palette.background.default, 0.6),
                            '& fieldset': {
                              borderColor: alpha(theme.palette.divider, 0.5),
                            },
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.dark,
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: theme.palette.text.secondary,
                          },
                        }}
                      />

                      {/* Attributes Section */}
                      <TextField
                        fullWidth
                        label="Ajouter un attribut (appuyez sur Entrée pour ajouter)"
                        value={attributeInput}
                        onChange={(e) => setAttributeInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddAttribute();
                          }
                        }}
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                color="primary"
                                onClick={handleAddAttribute}
                                edge="end"
                                size={isMobile ? 'small' : 'medium'}
                                sx={{
                                  '&:hover': {
                                    transform: 'scale(1.2)',
                                    color: theme.palette.secondary.main,
                                  },
                                  transition: 'transform 0.2s ease-in-out',
                                }}
                              >
                                <Iconify icon="mdi:plus-circle" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} />
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: {
                            backgroundColor: alpha(theme.palette.background.default, 0.6),
                            '& fieldset': {
                              borderColor: alpha(theme.palette.divider, 0.5),
                            },
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.dark,
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                            },
                          }
                        }}
                        sx={{ mt: { xs: 1.5, sm: 2 } }}
                      />
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 0.5 : 1, mt: { xs: 0.5, sm: 1 } }}>
                        {values.attributes.map((attribute, index) => (
                          <Chip
                            key={index}
                            label={attribute}
                            onDelete={handleDeleteAttribute(attribute)}
                            color="success"
                            variant="outlined"
                            size={isMobile ? 'small' : 'medium'}
                            sx={{
                              background: `linear-gradient(45deg, ${theme.palette.success.light} 30%, ${theme.palette.success.main} 90%)`,
                              color: theme.palette.common.white,
                              boxShadow: (theme) => `0 4px 10px ${alpha(theme.palette.success.main, 0.4)}`,
                              transition: 'all 0.3s ease-in-out',
                              '& .MuiChip-deleteIcon': {
                                color: alpha(theme.palette.common.white, 0.8),
                                '&:hover': {
                                  color: theme.palette.error.light,
                                },
                              },
                              '&:hover': {
                                transform: 'translateY(-2px) scale(1.05)',
                                boxShadow: (theme) => `0 6px 15px ${alpha(theme.palette.success.main, 0.6)}`,
                                background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                              },
                              fontSize: isMobile ? '0.7rem' : '0.8rem',
                            }}
                          />
                        ))}
                      </Box>
                      {Boolean(touched.attributes && errors.attributes) && (
                        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                          {String(errors.attributes)}
                        </Typography>
                      )}

                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: isMobile ? 1 : 2, mt: { xs: 2, sm: 3 } }}>
                        <Button
                          variant="outlined"
                          onClick={() => navigate("/dashboard/sous-categories")}
                          size={isMobile ? 'small' : 'medium'}
                          sx={{
                            borderRadius: 1.5,
                            borderColor: "divider",
                            "&:hover": {
                              borderColor: "primary.main",
                              bgcolor: "background.paper",
                              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                              transform: 'translateY(-2px) scale(1.02)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: theme.shadows[1],
                            fontSize: isMobile ? '0.8rem' : 'inherit',
                          }}
                        >
                          Annuler
                        </Button>
                        <LoadingButton
                          type="submit"
                          variant="contained"
                          loading={isSubmitting || isSaving}
                          loadingPosition="start"
                          startIcon={<Iconify icon="mdi:check-circle-outline" />}
                          size={isMobile ? 'medium' : 'large'}
                          sx={{
                            borderRadius: 1.5,
                            background: `linear-gradient(45deg, ${theme.palette.success.light} 30%, ${theme.palette.success.main} 90%)`,
                            boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.success.main, 0.34)}`,
                            px: isMobile ? 2 : 3,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            "&:hover": {
                              boxShadow: (theme) => `0 8px 20px 0 ${alpha(theme.palette.success.main, 0.4)}`,
                              background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                              transform: 'translateY(-2px) scale(1.02)',
                            },
                            fontSize: isMobile ? '0.9rem' : '1rem',
                          }}
                        >
                          Enregistrer les modifications
                        </LoadingButton>
                      </Box>
                    </Stack>
                  </Form>
                </FormikProvider>
              </Card>
            </Fade>
          </Grid>

          {/* Image section */}
          <Grid item xs={12} md={4}>
            <Fade in={true} timeout={900}>
              <Card
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  textAlign: "center",
                  background: (theme) => alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  boxShadow: (theme) =>
                    `0px 8px 30px ${alpha(theme.palette.secondary.main, 0.2)},
                     0px 0px 0px 2px ${alpha(theme.palette.secondary.dark, 0.1)},
                     inset 0px 2px 5px ${alpha(theme.palette.common.white, 0.1)}`,
                  transform: 'perspective(1000px) rotateX(2deg)',
                  transition: 'all 0.5s ease-in-out',
                  animation: 'float 5s ease-in-out infinite 0.5s',
                  '&:hover': {
                    transform: 'perspective(1000px) rotateX(0deg) scale(1.01)',
                    boxShadow: (theme) =>
                      `0px 12px 40px ${alpha(theme.palette.secondary.main, 0.3)},
                       0px 0px 0px 3px ${alpha(theme.palette.secondary.dark, 0.2)},
                       inset 0px 2px 8px ${alpha(theme.palette.common.white, 0.2)}`,
                  }
                }}
              >
                <Typography variant={isMobile ? "h6" : "h6"} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                  Image de la sous-catégorie
                </Typography>
                <ImageInput
                  file={thumb}
                  handleFile={(selectedFile: File | null) => {
                    setThumb(selectedFile)
                    setFieldValue("thumb", selectedFile)
                  }}
                  defaultImage={defaultImage}
                  sx={{
                    minHeight: isMobile ? 150 : 200,
                  }}
                />

                <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", mt: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 }, display: 'block', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                  Formats acceptés: JPG, PNG, GIF. Taille maximale: 5MB
                </Typography>

                <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                  Une image de bonne qualité améliore l'expérience utilisateur et aide les clients à identifier
                  rapidement vos sous-catégories.
                </Typography>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
}