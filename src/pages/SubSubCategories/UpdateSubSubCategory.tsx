// src/pages/SubSubCategories/UpdateSubSubCategory.tsx
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
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { useFormik, FormikProvider, Form } from "formik"
import * as Yup from "yup"
import Breadcrumb from "@/components/Breadcrumbs"
import Iconify from "@/components/Iconify"
import ImageInput from "@/components/ImageInput"
import Page from "@/components/Page"
import { SubSubCategoryAPI } from "../../api/SubSubCategory"
import { SubCategoryAPI } from "@/api/subcategory"
import { useSnackbar } from "notistack"
import { useLocation, useNavigate } from "react-router-dom"
import type ISubCategory from "@/types/SubCategory"
import type Attachment from "@/types/Attachment"
import useMediaQuery from '@mui/material/useMediaQuery';

interface ISubSubCategory extends ISubCategory {
  Namesubcategory: string;
  subcategory: string;
  attributes: string[];
  thumb?: Attachment | null;
}

const floatAnimation = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-5px) rotate(0.5deg); }
    50% { transform: translateY(0px) rotate(0deg); }
    75% { transform: translateY(5px) rotate(-0.5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
`;

const gradientShift = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const getSubSubCategoryIcon = (subSubCategoryName: string): string => {
  const name = subSubCategoryName.toLowerCase();
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

interface BreadcrumbProps {
  links: { name: string; href: string }[];
  sx?: object;
}

const TypedBreadcrumb = Breadcrumb as React.FC<BreadcrumbProps>;

export default function UpdateSubSubCategory() {
  const [thumb, setThumb] = useState<File | null | undefined>(undefined)
  const [defaultImage, setDefaultImage] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [attributeInput, setAttributeInput] = useState<string>("");
  const [allSubCategories, setAllSubCategories] = useState<ISubCategory[]>([]);
  const [initialSubSubCategoryLoaded, setInitialSubSubCategoryLoaded] = useState(false);

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const location = useLocation()

  const [subSubCategory, setSubSubCategory] = useState<ISubSubCategory | null>(location.state?.subSubCategory || null)

  const SubSubCategorySchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Le nom doit contenir au moins 3 caractères !")
      .max(50, "Le nom est trop long !")
      .required("Le nom de la sous-sous-catégorie est requis !"),
    subcategory: Yup.string().required("La sous-catégorie parente est requise !"),
    description: Yup.string()
      .max(500, "La description est trop longue !")
      .optional(),
    attributes: Yup.array().of(Yup.string()).optional(),
    thumb: Yup.mixed().nullable().optional(),
  })

  const formik = useFormik({
    initialValues: {
      name: subSubCategory?.name || "",
      subcategory: subSubCategory?.subcategory || "",
      description: subSubCategory?.description || "",
      attributes: subSubCategory?.attributes || [],
      thumb: subSubCategory?.thumb || null,
    },
    validationSchema: SubSubCategorySchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setIsSaving(true)

      const formData = new FormData()

      const updateDto = {
        name: values.name,
        subcategory: values.subcategory,
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
        if (subSubCategory?._id) {
          await SubSubCategoryAPI.update(subSubCategory._id, formData)
          enqueueSnackbar(`Sous-sous-catégorie "${values.name}" a été modifiée avec succès`, {
            variant: "success",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          })
          setTimeout(() => navigate("/dashboard/sous-sous-categories"), 1000)
        } else {
          enqueueSnackbar("ID de sous-sous-catégorie manquant pour la mise à jour.", { variant: "error" });
        }
      } catch (e: any) {
        console.error("Error updating sub-sub-category:", e);
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

  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        setIsLoading(true);
        const subCategories = await SubCategoryAPI.get();
        setAllSubCategories(subCategories);

        if (subSubCategory) {
          formik.setValues({
            name: subSubCategory.name || "",
            subcategory: subSubCategory.subcategory || "",
            description: subSubCategory.description || "",
            attributes: subSubCategory.attributes || [],
            thumb: subSubCategory.thumb || null,
          });
          setDefaultImage(subSubCategory?.thumb?.path || undefined);
          setThumb(subSubCategory?.thumb ? undefined : null);
          setInitialSubSubCategoryLoaded(true);
        } else {
          navigate("/dashboard/sous-sous-categories");
          enqueueSnackbar("Sous-sous-catégorie non trouvée", { variant: "error" });
        }
      } catch (error) {
        console.error("Error fetching sub-categories or setting sub-sub-category:", error);
        enqueueSnackbar("Impossible de charger les sous-catégories parentes ou la sous-sous-catégorie.", { variant: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetData();
  }, [enqueueSnackbar, navigate, subSubCategory]);

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

  // Show loading state
  if (isLoading || !subSubCategory || !initialSubSubCategoryLoaded) {
    return (
      <Page title="Update Sub-Sub-Category">
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress color="primary" size={isMobile ? 40 : 60} />
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Update Sub-Sub-Category">
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
              <Iconify width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} icon={getSubSubCategoryIcon(values.name)} color={theme.palette.info.main} />
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
              Mettre à jour la Sous-Sous-Catégorie
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate("/dashboard/sous-sous-categories")}
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
              px: isMobile ? 2 : 3,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            Retour
          </Button>
        </Stack>

        {/* REMOVED FADE COMPONENT - it was causing the null reference error */}
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 4}>
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    p: { xs: 2, sm: 4 },
                    borderRadius: 2,
                    boxShadow: (theme) =>
                      `0px 10px 30px ${alpha(theme.palette.grey[800], 0.2)},
                       0px 0px 0px 1px ${alpha(theme.palette.grey[700], 0.1)}`,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-5px) scale(1.02)',
                        boxShadow: (theme) =>
                          `0px 15px 45px ${alpha(theme.palette.grey[800], 0.3)},
                           0px 0px 0px 2px ${alpha(theme.palette.grey[700], 0.2)}`,
                    }
                  }}
                >
                  <CardHeader
                    title="Informations de Base"
                    titleTypographyProps={{
                      variant: isMobile ? "h6" : "h5",
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                    sx={{ p: 0, mb: { xs: 2, sm: 3 } }}
                  />
                  <Stack spacing={isMobile ? 2 : 3}>
                    <TextField
                      fullWidth
                      label="Nom de la Sous-Sous-Catégorie"
                      {...getFieldProps("name")}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="mdi:tag-outline" color="text.secondary" />
                          </InputAdornment>
                        ),
                      }}
                      size={isMobile ? "small" : "medium"}
                    />

                    <FormControl fullWidth error={Boolean(touched.subcategory && errors.subcategory)} size={isMobile ? "small" : "medium"}>
                      <InputLabel id="subcategory-select-label">Sous-Catégorie Parente</InputLabel>
                      <Select
                        labelId="subcategory-select-label"
                        id="subcategory"
                        label="Sous-Catégorie Parente"
                        {...getFieldProps("subcategory")}
                        startAdornment={
                          <InputAdornment position="start">
                            <Iconify icon="mdi:folder-outline" color="text.secondary" sx={{ ml: 1 }} />
                          </InputAdornment>
                        }
                      >
                        {allSubCategories.map((subCat) => (
                          <MenuItem key={subCat._id} value={subCat._id}>
                            {subCat.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.subcategory && errors.subcategory && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {errors.subcategory}
                        </Typography>
                      )}
                    </FormControl>

                    <TextField
                      fullWidth
                      multiline
                      rows={isMobile ? 3 : 4}
                      label="Description"
                      {...getFieldProps("description")}
                      error={Boolean(touched.description && errors.description)}
                      helperText={touched.description && errors.description}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="mdi:text-box-outline" color="text.secondary" />
                          </InputAdornment>
                        ),
                      }}
                      size={isMobile ? "small" : "medium"}
                    />

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Attributs Spécifiques
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <TextField
                          fullWidth
                          value={attributeInput}
                          onChange={(e) => setAttributeInput(e.target.value)}
                          placeholder="Ajouter un attribut (ex: Couleur, Taille)"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddAttribute();
                            }
                          }}
                          size={isMobile ? "small" : "medium"}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleAddAttribute}
                                  edge="end"
                                  size={isMobile ? "small" : "medium"}
                                  sx={{
                                    bgcolor: "primary.main",
                                    color: "white",
                                    "&:hover": { bgcolor: "primary.dark" },
                                  }}
                                >
                                  <Iconify icon="mdi:plus" />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Stack>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {values.attributes.map((attr, index) => (
                          <Chip
                            key={index}
                            label={attr}
                            onDelete={handleDeleteAttribute(attr)}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                              bgcolor: "success.light",
                              color: "white",
                              "& .MuiChip-deleteIcon": { color: "white" },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack spacing={isMobile ? 2 : 4}>
                  <Card
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 2,
                      boxShadow: (theme) =>
                        `0px 10px 30px ${alpha(theme.palette.grey[800], 0.2)},
                         0px 0px 0px 1px ${alpha(theme.palette.grey[700], 0.1)}`,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                          transform: 'translateY(-5px) scale(1.02)',
                          boxShadow: (theme) =>
                            `0px 15px 45px ${alpha(theme.palette.grey[800], 0.3)},
                             0px 0px 0px 2px ${alpha(theme.palette.grey[700], 0.2)}`,
                      }
                    }}
                  >
                    <CardHeader
                      title="Image Principale"
                      titleTypographyProps={{
                        variant: isMobile ? "h6" : "h6",
                        fontWeight: 700,
                        color: "text.primary",
                      }}
                      sx={{ p: 0, mb: { xs: 2, sm: 3 } }}
                    />
                    <ImageInput
                      defaultImage={defaultImage}
                      onImageChange={(file) => setThumb(file)}
                      onImageRemove={() => setThumb(null)}
                      ratio="1/1"
                      sx={{
                        width: "100%",
                        height: isMobile ? 200 : 250,
                      }}
                    />
                  </Card>

                  <LoadingButton
                    fullWidth
                    type="submit"
                    variant="contained"
                    loading={isSaving}
                    disabled={isSubmitting}
                    size={isMobile ? "medium" : "large"}
                    sx={{
                      borderRadius: 2,
                      py: isMobile ? 1 : 1.5,
                      background: (theme) =>
                        `linear-gradient(45deg, ${theme.palette.success.light} 30%, ${theme.palette.success.main} 90%)`,
                      boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.success.main, 0.34)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      "&:hover": {
                        boxShadow: (theme) => `0 8px 20px 0 ${alpha(theme.palette.success.main, 0.4)}`,
                        background: (theme) =>
                          `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                        transform: 'translateY(-2px) scale(1.02)',
                      },
                      fontSize: isMobile ? '0.9rem' : '1rem',
                    }}
                    startIcon={<Iconify icon="mdi:content-save-check-outline" />}
                  >
                    Mettre à jour
                  </LoadingButton>
                </Stack>
              </Grid>
            </Grid>
          </Form>
        </FormikProvider>
      </Container>
    </Page>
  )
}