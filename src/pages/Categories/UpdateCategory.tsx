// src/pages/Categories/UpdateCategory.tsx
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
  Chip, // Import Chip for displaying attributes
  IconButton, // Import IconButton for the add attribute button
  InputAdornment, // Import InputAdornment for the add attribute button
} from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { useFormik, FormikProvider, Form } from "formik"
import * as Yup from "yup"
import Breadcrumb from "@/components/Breadcrumbs"
import Iconify from "@/components/Iconify"
import ImageInput from "@/components/ImageInput" // Your custom ImageInput component
import Page from "@/components/Page"
import { CategoryAPI } from "@/api/category"
import { useSnackbar } from "notistack"
import { useLocation, useNavigate } from "react-router-dom"
import { CATEGORY_TYPE } from "@/types/Category" // Assuming CATEGORY_TYPE is available
import useMediaQuery from '@mui/material/useMediaQuery'; // Import useMediaQuery for responsiveness
import { FormikErrors } from "formik" // Import FormikErrors type for better typing
import app from "@/config"

// Keyframe for subtle floating animation
const floatAnimation = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-5px) rotate(0.5deg); }
    50% { transform: translateY(0px) rotate(0deg); }
    75% { transform: translateY(5px) rotate(-0.5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
`;

// Keyframe for subtle gradient shift
const gradientShift = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// Define the props for the Breadcrumb component to fix the TypeScript error
interface BreadcrumbProps {
  links: { name: string; href: string }[];
  sx?: object;
}

// Assume the Breadcrumb component is typed as follows, to resolve the error.
const TypedBreadcrumb = Breadcrumb as React.FC<BreadcrumbProps>;

export default function UpdateCategory() {
  const [thumb, setThumb] = useState<File | null | undefined>(undefined)
  const [defaultImage, setDefaultImage] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false) // Not currently used, but kept
  const [isSaving, setIsSaving] = useState(false)
  const [attributeInput, setAttributeInput] = useState<string>(""); // State for the new attribute input field

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const location = useLocation()

  // Get category data from location state. This is how the data is passed from the list page.
  const [category, setCategory] = useState<any>(location.state?.category)

  // FIXED: Add the missing handleFile function
  const handleFile = (file: File | null) => {
    setThumb(file);
    // Update formik values as well
    formik.setFieldValue('thumb', file);
  };

  // Yup validation schema for the form fields
  const CategorySchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Le nom doit contenir au moins 3 caractères !")
      .max(50, "Le nom est trop long !")
      .required("Le nom de la catégorie est requis !"),
    type: Yup.string()
      .oneOf([CATEGORY_TYPE.PRODUCT, CATEGORY_TYPE.SERVICE], "Le type doit être produit ou service")
      .required("Le type est requis !"),
    description: Yup.string()
      .max(500, "La description est trop longue !")
      .optional(),
    attributes: Yup.array().of(Yup.string()).optional(), // Added validation for attributes
    thumb: Yup.mixed().nullable().optional(),
  })

  const formik = useFormik({
    initialValues: {
      name: category?.name || "",
      type: category?.type || CATEGORY_TYPE.PRODUCT,
      description: category?.description || "",
      attributes: category?.attributes || [], // Initialize attributes from category data
      thumb: category?.thumb || null,
    },
    validationSchema: CategorySchema,
    onSubmit: async (values, { setSubmitting }) => {
      setIsSaving(true)

      const formData = new FormData()

      const updateDto = {
        name: values.name,
        type: values.type,
        description: values.description || "",
        attributes: values.attributes, // Include attributes in the DTO
      };

      formData.append("data", JSON.stringify(updateDto));

      if (thumb instanceof File) {
        formData.append("image", thumb);
      } else if (thumb === null) {
        formData.append("image", "null");
      }

      try {
        await CategoryAPI.update(category._id, formData)
        enqueueSnackbar(`Catégorie "${values.name}" a été modifiée avec succès`, {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        })
        setTimeout(() => navigate("/dashboard/categories"), 1000)
      } catch (e: any) {
        console.error("Error updating category:", e);
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

  // Initialize Formik values and defaultImage when `category` state is available
  useEffect(() => {
    if (category) {
      formik.setValues({
        name: category.name || "",
        type: category.type || CATEGORY_TYPE.PRODUCT,
        description: category.description || "",
        attributes: category.attributes || [], // Ensure attributes are initialized
        thumb: category.thumb ? undefined : null, // Set thumb state for ImageInput appropriately
      })
      setDefaultImage(category?.thumb?.url ? `${app.baseURL.replace(/\/$/, '')}${category.thumb.url}` : undefined)
    } else {
      navigate("/dashboard/categories")
      enqueueSnackbar("Catégorie non trouvée", { variant: "error" })
    }
  }, [category, navigate, enqueueSnackbar])

  // Handlers for attributes
  const handleAddAttribute = () => {
    const trimmedAttribute = attributeInput.trim();
    if (trimmedAttribute !== "") {
      if (!values.attributes.includes(trimmedAttribute)) {
        setFieldValue("attributes", [...values.attributes, trimmedAttribute]);
        setAttributeInput(""); // Clear the temporary input state
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

  if (!category) return null

  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase()
    const iconMap: Record<string, string> = {
      vêtement: "mdi:tshirt-crew", vetement: "mdi:tshirt-crew", clothing: "mdi:tshirt-crew", mode: "mdi:hanger", fashion: "mdi:hanger", chaussure: "mdi:shoe-heel", shoe: "mdi:shoe-heel", accessoire: "mdi:glasses", bijou: "mdi:diamond-stone", jewelry: "mdi:diamond-stone", montre: "mdi:watch", watch: "mdi:watch",
      électronique: "mdi:television", electronique: "mdi:television", electronic: "mdi:television", ordinateur: "mdi:laptop", computer: "mdi:laptop", téléphone: "mdi:cellphone", telephone: "mdi:cellphone", phone: "mdi:cellphone", mobile: "mdi:cellphone", tablette: "mdi:tablet", tablet: "mdi:tablet", appareil: "mdi:camera", camera: "mdi:camera",
      maison: "mdi:home", home: "mdi:home", meuble: "mdi:sofa", furniture: "mdi:sofa", cuisine: "mdi:silverware-fork-knife", kitchen: "mdi:silverware-fork-knife", "salle de bain": "mdi:shower", bathroom: "mdi:shower", jardin: "mdi:flower", garden: "mdi:flower", décoration: "mdi:lamp", decoration: "mdi:lamp", décor: "mdi:lamp", decor: "mdi:lamp",
      alimentaire: "mdi:food-apple", food: "mdi:food-apple", nourriture: "mdi:food", boisson: "mdi:cup", beverage: "mdi:cup", drink: "mdi:cup", vin: "mdi:glass-wine", wine: "mdi:glass-wine", alcool: "mdi:beer", alcohol: "mdi:beer",
      beauté: "mdi:lipstick", beaute: "mdi:lipstick", beauty: "mdi:lipstick", santé: "mdi:heart-pulse", sante: "mdi:heart-pulse", health: "mdi:heart-pulse", cosmétique: "mdi:spray", cosmetique: "mdi:spray", cosmetic: "mdi:spray", parfum: "mdi:bottle-tonic", perfume: "mdi:bottle-tonic",
      sport: "mdi:basketball", fitness: "mdi:dumbbell", loisir: "mdi:gamepad-variant", leisure: "mdi:gamepad-variant", jeu: "mdi:cards", game: "mdi:cards", jouet: "mdi:teddy-bear", toy: "mdi:teddy-bear",
      service: "mdi:account-wrench", réparation: "mdi:tools", reparation: "mdi:tools", repair: "mdi:tools", maintenance: "mdi:tools", nettoyage: "mdi:broom", cleaning: "mdi:broom", formation: "mdi:school", education: "mdi:school", consultation: "mdi:account-tie", consulting: "mdi:account-tie",
      auto: "mdi:car", automobile: "mdi:car", voiture: "mdi:car", car: "mdi:car", moto: "mdi:motorbike", motorcycle: "mdi:motorbike", vélo: "mdi:bike", velo: "mdi:bike", bicycle: "mdi:bike",
      tech: "mdi:chip", technologie: "mdi:chip", technology: "mdi:chip", logiciel: "mdi:application", software: "mdi:application", application: "mdi:cellphone-link", app: "mdi:cellphone-link", digital: "mdi:web", numérique: "mdi:web", numerique: "mdi:web",
      livre: "mdi:book-open-page-variant", book: "mdi:book-open-page-variant", média: "mdi:television-classic", media: "mdi:television-classic", musique: "mdi:music", music: "mdi:music", film: "mdi:movie", movie: "mdi:movie",
      divers: "mdi:dots-horizontal-circle", misc: "mdi:dots-horizontal-circle", autre: "mdi:dots-horizontal-circle", other: "mdi:dots-horizontal-circle",
    }
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (name.includes(keyword)) {
        return icon
      }
    }
    return "material-symbols:category"
  }

  return (
    <Page title="Update Category">
      {/* Inject global keyframe styles */}
      <style>{floatAnimation}</style>
      <style>{gradientShift}</style>

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}> {/* Responsive padding */}
        <Stack
          direction={{ xs: "column", sm: "row" }} // Stack vertically on small screens
          justifyContent={"space-between"}
          alignItems={{ xs: "flex-start", sm: "center" }} // Align items to start on small screens
          mb={{ xs: 2, sm: 3 }} // Responsive margin bottom
          spacing={{ xs: 2, sm: 0 }} // Add spacing between elements on small screens
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: { xs: 36, sm: 42 }, // Responsive size
                height: { xs: 36, sm: 42 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1.5,
                background: (theme) =>
                  `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(
                    theme.palette.primary.dark,
                    0.3,
                  )} 100%)`,
                boxShadow: (theme) => `0px 4px 10px ${alpha(theme.palette.primary.main, 0.4)}`, // Subtle shadow
                animation: 'float 4s ease-in-out infinite', // Floating animation
              }}
            >
              <Iconify width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} icon={getCategoryIcon(values.name)} color={theme.palette.primary.main} /> {/* Responsive icon size */}
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"} // Responsive font variant
              sx={{
                fontWeight: 600,
                color: "text.primary",
                textShadow: (theme) => `2px 2px 4px ${alpha(theme.palette.text.secondary, 0.3)}`, // Text shadow
                background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto', // Prepare for animation
                animation: 'gradientShift 5s linear infinite', // Animated gradient text
              }}
            >
              Mettre à jour la catégorie
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate("/dashboard/categories")}
            size={isMobile ? "small" : "medium"} // Responsive button size
            sx={{
              borderRadius: 1.5,
              borderColor: "divider",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "background.paper",
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`, // Hover shadow
                transform: 'translateY(-2px) scale(1.02)', // Lift and scale
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth transition
              boxShadow: theme.shadows[1], // Initial subtle shadow
              width: { xs: '100%', sm: 'auto' }, // Full width on mobile
              mt: { xs: 1, sm: 0 }, // Margin top on mobile
            }}
          >
            Retour
          </Button>
        </Stack>

        <TypedBreadcrumb
          links={[
            { name: "Dashboard", href: "/dashboard" },
            { name: "Catégories", href: "/dashboard/categories" },
            { name: `Modifier ${category?.name}`, href: `/dashboard/categories/edit/${category?._id}` },
          ]}
          sx={{ mb: { xs: 2, sm: 3 } }} // Responsive margin bottom
        />

        <Grid container spacing={isMobile ? 2 : 3} mt={0}> {/* Responsive spacing, reset margin top */}
          <Grid item xs={12} md={8}>
            <Fade in={true} timeout={500}>
              <Card
                sx={{
                  p: { xs: 2, sm: 3 }, // Responsive padding
                  borderRadius: 2,
                  background: (theme) => alpha(theme.palette.background.paper, 0.8), // Glassmorphism background
                  backdropFilter: 'blur(10px)', // Glassmorphism blur
                  WebkitBackdropFilter: 'blur(10px)',
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.3)}`, // Subtle border
                  boxShadow: (theme) =>
                    `0px 8px 30px ${alpha(theme.palette.primary.main, 0.2)},
                     0px 0px 0px 2px ${alpha(theme.palette.primary.dark, 0.1)},
                     inset 0px 2px 5px ${alpha(theme.palette.common.white, 0.1)}`, // Multi-layer shadows + inset
                  transform: 'perspective(1000px) rotateX(2deg)', // 3D card perspective
                  transition: 'all 0.5s ease-in-out',
                  animation: 'float 6s ease-in-out infinite', // Floating animation
                  '&:hover': {
                    transform: 'perspective(1000px) rotateX(0deg) scale(1.01)', // Straighten on hover
                    boxShadow: (theme) =>
                      `0px 12px 40px ${alpha(theme.palette.primary.main, 0.3)},
                       0px 0px 0px 3px ${alpha(theme.palette.primary.dark, 0.2)},
                       inset 0px 2px 8px ${alpha(theme.palette.common.white, 0.2)}`,
                  }
                }}
              >
                <CardHeader title="Information de la catégorie" sx={{ p: 0, mb: { xs: 1, sm: 2 } }} /> {/* Responsive margin bottom */}
                <Divider sx={{ mb: { xs: 2, sm: 3 } }} /> {/* Responsive margin bottom */}
                <FormikProvider value={formik}>
                  <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                    <Stack spacing={isMobile ? 2 : 3}> {/* Responsive spacing */}
                      <TextField
                        fullWidth
                        label="Nom de la catégorie"
                        {...getFieldProps("name")}
                        error={Boolean(touched.name && errors.name)}
                        helperText={touched.name && errors.name ? String(errors.name) : ''}
                        size={isMobile ? "small" : "medium"} // Responsive size
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: alpha(theme.palette.background.default, 0.6), // Slightly more opaque
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
                            fontSize: isMobile ? "0.85rem" : "1rem", // Responsive font size
                          },
                        }}
                      />

                      <FormControl fullWidth error={Boolean(touched.type && errors.type)}
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
                            fontSize: isMobile ? "0.85rem" : "1rem", // Responsive font size
                          },
                        }}
                      >
                        <InputLabel>Type de catégorie</InputLabel>
                        <Select
                          label="Type de catégorie"
                          {...getFieldProps("type")}
                          displayEmpty
                          inputProps={{ "aria-label": "Select category type" }}
                          size={isMobile ? "small" : "medium"} // Responsive size
                        >
                          <MenuItem value={CATEGORY_TYPE.PRODUCT}>Produit</MenuItem>
                          <MenuItem value={CATEGORY_TYPE.SERVICE}>Service</MenuItem>
                        </Select>
                        {touched.type && errors.type && (
                          <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5, fontSize: isMobile ? "0.7rem" : "0.75rem" }}> {/* Responsive font size */}
                            {String(errors.type)}
                          </Typography>
                        )}
                      </FormControl>

                      <TextField
                        fullWidth
                        label="Description de la catégorie"
                        multiline
                        rows={isMobile ? 3 : 4} // Responsive rows
                        {...getFieldProps("description")}
                        error={Boolean(touched.description && errors.description)}
                        helperText={touched.description && errors.description ? String(errors.description) : ''}
                        size={isMobile ? "small" : "medium"} // Responsive size
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
                            fontSize: isMobile ? "0.85rem" : "1rem", // Responsive font size
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
                        size={isMobile ? "small" : "medium"} // Responsive size
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                color="primary"
                                onClick={handleAddAttribute}
                                edge="end"
                                sx={{
                                  '&:hover': {
                                    transform: 'scale(1.2)',
                                    color: theme.palette.secondary.main,
                                  },
                                  transition: 'transform 0.2s ease-in-out',
                                }}
                              >
                                <Iconify icon="mdi:plus-circle" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} /> {/* Responsive icon size */}
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
                        sx={{ mt: { xs: 1, sm: 2 } }} // Responsive margin top
                      />
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 0.5, sm: 1 }, mt: { xs: 0.5, sm: 1 } }}> {/* Responsive gap and margin */}
                        {values.attributes.map((attribute, index) => (
                          <Chip
                            key={index} // Using index as key is generally okay for static lists, but unique IDs are better if attributes can be reordered/filtered
                            label={attribute}
                            onDelete={handleDeleteAttribute(attribute)}
                            color="primary"
                            variant="outlined"
                            size={isMobile ? "small" : "medium"} // Responsive size
                            sx={{
                              background: `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.primary.main} 90%)`,
                              color: theme.palette.common.white,
                              boxShadow: (theme) => `0 4px 10px ${alpha(theme.palette.primary.main, 0.4)}`,
                              transition: 'all 0.3s ease-in-out',
                              fontSize: isMobile ? "0.7rem" : "0.8rem", // Responsive font size
                              '& .MuiChip-deleteIcon': {
                                color: alpha(theme.palette.common.white, 0.8),
                                '&:hover': {
                                  color: theme.palette.error.light,
                                },
                              },
                              '&:hover': {
                                transform: 'translateY(-2px) scale(1.05)',
                                boxShadow: (theme) => `0 6px 15px ${alpha(theme.palette.primary.main, 0.6)}`,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                              }
                            }}
                          />
                        ))}
                      </Box>
                      {Boolean(touched.attributes && errors.attributes) && (
                        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5, fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                          {String(errors.attributes)}
                        </Typography>
                      )}


                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: isMobile ? 1 : 2, mt: { xs: 2, sm: 3 } }}> {/* Responsive gap and margin */}
                        <Button
                          variant="outlined"
                          onClick={() => navigate("/dashboard/categories")}
                          size={isMobile ? "small" : "medium"} // Responsive size
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
                            fontSize: isMobile ? "0.8rem" : "0.875rem", // Responsive font size
                            px: isMobile ? 1.5 : 2, // Responsive padding
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
                          size={isMobile ? "small" : "medium"} // Responsive size
                          sx={{
                            borderRadius: 1.5,
                            background: `linear-gradient(45deg, ${theme.palette.success.light} 30%, ${theme.palette.success.main} 90%)`,
                            boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.success.main, 0.34)}`,
                            px: isMobile ? 1.5 : 3, // Responsive padding
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            "&:hover": {
                              boxShadow: (theme) => `0 8px 20px 0 ${alpha(theme.palette.success.main, 0.4)}`,
                              background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                              transform: 'translateY(-2px) scale(1.02)',
                            },
                            fontSize: isMobile ? "0.8rem" : "0.875rem", // Responsive font size
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

          <Grid item xs={12} md={4}>
            <Fade in={true} timeout={900}>
              <Card
                sx={{
                  p: { xs: 2, sm: 3 }, // Responsive padding
                  borderRadius: 2,
                  textAlign: "center",
                  background: (theme) => alpha(theme.palette.background.paper, 0.8), // Glassmorphism background
                  backdropFilter: 'blur(10px)', // Glassmorphism blur
                  WebkitBackdropFilter: 'blur(10px)',
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.3)}`, // Subtle border
                  boxShadow: (theme) =>
                    `0px 8px 30px ${alpha(theme.palette.secondary.main, 0.2)},
                     0px 0px 0px 2px ${alpha(theme.palette.secondary.dark, 0.1)},
                     inset 0px 2px 5px ${alpha(theme.palette.common.white, 0.1)}`, // Multi-layer shadows + inset
                  transform: 'perspective(1000px) rotateX(2deg)', // 3D card perspective
                  transition: 'all 0.5s ease-in-out',
                  animation: 'float 5s ease-in-out infinite 0.5s', // Floating animation with delay
                  '&:hover': {
                    transform: 'perspective(1000px) rotateX(0deg) scale(1.01)', // Straighten on hover
                    boxShadow: (theme) =>
                      `0px 12px 40px ${alpha(theme.palette.secondary.main, 0.3)},
                       0px 0px 0px 3px ${alpha(theme.palette.secondary.dark, 0.2)},
                       inset 0px 2px 8px ${alpha(theme.palette.common.white, 0.2)}`,
                  }
                }}
              >
                <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: { xs: 1, sm: 2 } }}> {/* Responsive font variant and margin */}
                  Image de la catégorie
                </Typography>
                <Box
                  sx={{
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: { xs: 1, sm: 2 }, // Responsive padding
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: { xs: 150, sm: 200 }, // Responsive minHeight
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.grey[100], 0.1)} 0%, ${alpha(theme.palette.grey[300], 0.1)} 100%)`, // Subtle gradient background
                    transition: 'all 0.3s ease-in-out',
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`, // Glow on hover
                      '& .hover-overlay': {
                        opacity: 1, // Show overlay on hover
                      }
                    },
                  }}
                >
                  <ImageInput
                    file={thumb as File}
                    handleFile={handleFile}
                    defaultImage={defaultImage}
                    sx={{
                      position: "relative",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      zIndex: 3, // Increased z-index
                    }}
                  />

                  {/* Hover overlay with text */}
                  <Box
                    className="hover-overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (theme) => alpha(theme.palette.common.black, 0.6),
                      color: "common.white",
                      opacity: 0,
                      transition: 'opacity 0.3s ease-in-out',
                      zIndex: 1, // Ensure this is lower than ImageInput's zIndex
                    }}
                  >
                    <Stack alignItems="center" spacing={1}>
                      <Iconify icon="mdi:camera-plus" width={isMobile ? 36 : 48} height={isMobile ? 36 : 48} /> {/* Responsive icon size */}
                      <Typography variant={isMobile ? "body2" : "subtitle1"}> {/* Responsive font variant */}
                        Cliquez ou glissez pour modifier
                      </Typography>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: { xs: 0.5, sm: 1 }, // Responsive padding
                      bgcolor: (theme) => alpha(theme.palette.common.black, 0.5),
                      color: "common.white",
                      fontSize: { xs: "0.65rem", sm: "0.75rem" }, // Responsive font size
                      textAlign: "center",
                      zIndex: 2, // Ensure this is lower than ImageInput's zIndex
                    }}
                  >
                    Cliquez pour modifier l'image
                  </Box>
                </Box>

                <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", mt: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 }, display: 'block', fontSize: isMobile ? "0.65rem" : "0.75rem" }}> {/* Responsive font size and margin */}
                  Formats acceptés: JPG, PNG, GIF. Taille maximale: 5MB
                </Typography>

                <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", fontSize: isMobile ? "0.75rem" : "0.875rem" }}> {/* Responsive font size */}
                  Une image de bonne qualité améliore l'expérience utilisateur et aide les clients à identifier
                  rapidement vos catégories.
                </Typography>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
}