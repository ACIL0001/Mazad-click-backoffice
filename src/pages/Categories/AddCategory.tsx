"use client"

import {
  Box,
  Card,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  useTheme,
  alpha,
  Divider,
  Fade,
  Collapse,
  Alert,
  useMediaQuery,
  Paper,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Zoom,
  Slide,
  FormHelperText,
} from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { useState, useEffect } from "react"
import * as Yup from "yup"
import { Form, useFormik, FormikProvider } from "formik"
import { useLocation } from "react-router-dom"
import Breadcrumb from "@/components/Breadcrumbs"
import Iconify from "@/components/Iconify"
import Page from "@/components/Page"
import { CategoryAPI } from "@/api/category"
import { useSnackbar } from "notistack"
import { useNavigate } from "react-router-dom"
import { UploadMultiFile } from "@/components/upload/UploadMultiFile"
import { CATEGORY_TYPE } from "@/types/Category"

interface ICategory {
  _id: string
  name: string
  type: string
  description?: string
  attributes?: string[]
  parent?: string | null
  children?: ICategory[]
  level?: number
  path?: string[]
  fullPath?: string
}

// Enhanced animations
const animations = {
  float: `
    @keyframes float {
      0% { transform: translateY(0px) rotate(0deg); }
      25% { transform: translateY(-8px) rotate(1deg); }
      50% { transform: translateY(0px) rotate(0deg); }
      75% { transform: translateY(8px) rotate(-1deg); }
      100% { transform: translateY(0px) rotate(0deg); }
    }
  `,
  gradientShift: `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
  pulse: `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(54, 102, 255, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(54, 102, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(54, 102, 255, 0); }
    }
  `,
}

// Function to get an appropriate icon based on category name
const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase()
  const iconMap: Record<string, string> = {
    vêtement: "mdi:tshirt-crew",
    vetement: "mdi:tshirt-crew",
    clothing: "mdi:tshirt-crew",
    mode: "mdi:hanger",
    fashion: "mdi:hanger",
    chaussure: "mdi:shoe-heel",
    shoe: "mdi:shoe-heel",
    accessoire: "mdi:glasses",
    bijou: "mdi:diamond-stone",
    jewelry: "mdi:diamond-stone",
    montre: "mdi:watch",
    watch: "mdi:watch",
    électronique: "mdi:television",
    electronique: "mdi:television",
    electronic: "mdi:television",
    ordinateur: "mdi:laptop",
    computer: "mdi:laptop",
    téléphone: "mdi:cellphone",
    telephone: "mdi:cellphone",
    phone: "mdi:cellphone",
    mobile: "mdi:cellphone",
    tablette: "mdi:tablet",
    tablet: "mdi:tablet",
    appareil: "mdi:camera",
    camera: "mdi:camera",
    maison: "mdi:home",
    home: "mdi:home",
    meuble: "mdi:sofa",
    furniture: "mdi:sofa",
    cuisine: "mdi:silverware-fork-knife",
    kitchen: "mdi:silverware-fork-knife",
    "salle de bain": "mdi:shower",
    bathroom: "mdi:shower",
    jardin: "mdi:flower",
    garden: "mdi:flower",
    décoration: "mdi:lamp",
    decoration: "mdi:lamp",
    décor: "mdi:lamp",
    decor: "mdi:lamp",
    service: "mdi:account-wrench",
    réparation: "mdi:tools",
    reparation: "mdi:tools",
    repair: "mdi:tools",
  }

  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (name.includes(keyword)) {
      return icon
    }
  }

  return "material-symbols:category"
}

export default function AddCategory() {
  const [categoryImage, setCategoryImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [categoryIcon, setCategoryIcon] = useState<string>("material-symbols:category")
  const [activeStep, setActiveStep] = useState(0)
  const [availableParents, setAvailableParents] = useState<ICategory[]>([])
  const [parentCategory, setParentCategory] = useState<ICategory | null>(null)

  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  // Check if parentId is provided in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const parentId = urlParams.get('parentId')
    
    if (parentId) {
      // Pre-select parent category
      formik.setFieldValue('parent', parentId)
    }
  }, [location.search])

  // Fetch available parent categories
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const categories = await CategoryAPI.getCategories()
        setAvailableParents(categories)
        
        // If parent is pre-selected, find and set parent category info
        const urlParams = new URLSearchParams(location.search)
        const parentId = urlParams.get('parentId')
        if (parentId) {
          const parent = categories.find((cat: ICategory) => cat._id === parentId)
          if (parent) {
            setParentCategory(parent)
          }
        }
      } catch (error) {
        console.error('Error fetching parent categories:', error)
      }
    }
    
    fetchParentCategories()
  }, [location.search])

  const steps = ['Informations de base', 'Image de catégorie', 'Révision & création']

  const CategorySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "Le nom doit contenir au moins 2 caractères !")
      .max(50, "Le nom est trop long !")
      .required("Le nom est requis !"),
    type: Yup.string()
      .oneOf([CATEGORY_TYPE.PRODUCT, CATEGORY_TYPE.SERVICE], "Le type doit être produit ou service")
      .required("Le type est requis !"),
    description: Yup.string()
      .max(250, "La description est trop longue ! (max 250 caractères)")
      .optional(),
    attributes: Yup.string()
      .optional(),
    parent: Yup.string()
      .optional(),
  })

  const formik = useFormik({
    initialValues: {
      name: "",
      type: CATEGORY_TYPE.PRODUCT,
      description: "",
      attributes: "",
      parent: "",
    },
    validationSchema: CategorySchema,
    onSubmit: async (values, { setSubmitting }) => {
      setIsSubmitting(true)
      setError(null)
      try {
        // Process attributes - convert comma-separated string to array
        const attributesArray = values.attributes 
          ? values.attributes.split(',').map(attr => attr.trim()).filter(attr => attr.length > 0)
          : []
        
        const categoryData = {
          name: values.name,
          type: values.type,
          description: values.description || undefined,
          attributes: attributesArray.length > 0 ? attributesArray : undefined,
          parent: values.parent || null,
        }

        // If there's an image, use FormData, otherwise send JSON
        if (categoryImage) {
          const formData = new FormData()
          formData.append("data", JSON.stringify(categoryData))
          formData.append("image", categoryImage)
          await CategoryAPI.create(formData)
        } else {
          await CategoryAPI.create(categoryData)
        }

        enqueueSnackbar("Catégorie créée avec succès !", {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        })
        setTimeout(() => navigate("/dashboard/categories"), 1000)
      } catch (error: any) {
        console.error("Error creating category:", error)
        let userErrorMessage = "Échec de la création de la catégorie"
        if (error.response?.data?.message) {
          const backendMessage = error.response.data.message
          if (Array.isArray(backendMessage)) {
            userErrorMessage = `Échec de la création de la catégorie: ${backendMessage.join(", ")}`
          } else if (typeof backendMessage === "string") {
            userErrorMessage = `Échec de la création de la catégorie: ${backendMessage}`
          }
        } else if (error.message) {
          userErrorMessage = `Échec de la création de la catégorie: ${error.message}`
        }
        setError(userErrorMessage)
        setShowAlert(true)
        enqueueSnackbar(userErrorMessage, {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        })
      } finally {
        setSubmitting(false)
        setIsSubmitting(false)
      }
    },
  })

  const { errors, touched, handleSubmit, getFieldProps, values } = formik

  // Update icon when name changes
  useEffect(() => {
    if (values.name) {
      setCategoryIcon(getCategoryIcon(values.name))
    } else {
      setCategoryIcon("material-symbols:category")
    }
  }, [values.name])

  const handleNext = () => {
    if (activeStep === 0 && (!values.name || !values.type)) {
      enqueueSnackbar("Veuillez remplir tous les champs obligatoires", { variant: "warning" })
      return
    }
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }

  const canProceedToNext = () => {
    if (activeStep === 0) return values.name && values.type
    if (activeStep === 1) return true
    return true
  }

  return (
    <Page title="Créer une Catégorie">
      {/* Inject animations */}
      <style>{Object.values(animations).join('')}</style>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 50%,
            ${alpha(theme.palette.info.main, 0.1)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, position: 'relative', zIndex: 1 }}>
          <Slide direction="right" in={true} timeout={800}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  sx={{
                    width: { xs: 56, sm: 72 },
                    height: { xs: 56, sm: 72 },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                    animation: 'float 6s ease-in-out infinite',
                  }}
                >
                  <Iconify width={isMobile ? 28 : 36} height={isMobile ? 28 : 36} icon={categoryIcon} />
                </Avatar>
                <Box>
                  <Typography
                    variant={isMobile ? "h4" : "h3"}
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '200% auto',
                      animation: 'gradientShift 4s ease-in-out infinite',
                      mb: 0.5,
                    }}
                  >
                    {parentCategory ? `Ajouter sous-catégorie` : 'Créer une catégorie'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                    {parentCategory 
                      ? `Créer une sous-catégorie pour "${parentCategory.name}"`
                      : 'Organisez vos produits et services avec une nouvelle catégorie personnalisée'
                    }
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={() => navigate("/dashboard/categories")}
                size={isMobile ? "medium" : "large"}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Retour
              </Button>
            </Stack>
          </Slide>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <Breadcrumb />

        {/* Parent Category Info */}
        {parentCategory && (
          <Fade in={true} timeout={600}>
            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Typography variant="body2">
                <strong>Catégorie parent sélectionnée:</strong> {parentCategory.fullPath || parentCategory.name}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Progress Stepper */}
        <Fade in={true} timeout={600}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 4,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 3,
            }}
          >
            <Stepper activeStep={activeStep} alternativeLabel={!isMobile}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-active': {
                          color: theme.palette.primary.main,
                          animation: 'pulse 2s infinite',
                        },
                        '&.Mui-completed': {
                          color: theme.palette.success.main,
                        },
                      },
                    }}
                  >
                    <Typography variant={isMobile ? "caption" : "body2"} fontWeight={600}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Fade>

        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 4}>
              {/* Main Content */}
              <Grid item xs={12} lg={8}>
                {/* Step 1: Basic Information */}
                {activeStep === 0 && (
                  <Zoom in={true} timeout={800}>
                    <Card
                      sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        background: `linear-gradient(145deg, 
                          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                          ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: `
                          0 8px 32px ${alpha(theme.palette.primary.main, 0.08)},
                          0 0 0 1px ${alpha(theme.palette.primary.main, 0.05)}
                        `,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `
                            0 20px 40px ${alpha(theme.palette.primary.main, 0.12)},
                            0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}
                          `,
                        }
                      }}
                    >
                      <Stack spacing={4}>
                        <Box>
                          <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                            Informations de base
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Définissez les caractéristiques principales de votre catégorie
                          </Typography>
                          <Divider sx={{ mt: 2, mb: 3 }} />
                        </Box>

                        {/* Parent Category Selection */}
                        <FormControl fullWidth>
                          <InputLabel>Catégorie parent (optionnel)</InputLabel>
                          <Select
                            label="Catégorie parent (optionnel)"
                            {...getFieldProps("parent")}
                            sx={{
                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                              borderRadius: 2,
                            }}
                          >
                            <MenuItem value="">
                              <em>Aucun parent (catégorie racine)</em>
                            </MenuItem>
                            {availableParents.map((category) => (
                              <MenuItem key={category._id} value={category._id}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: theme.palette.primary.main,
                                      ml: category.level ? category.level * 2 : 0,
                                    }}
                                  />
                                  <Typography>
                                    {category.fullPath || category.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    (Niveau {category.level || 0})
                                  </Typography>
                                </Stack>
                              </MenuItem>
                            ))}
                          </Select>
                          {touched.parent && errors.parent && (
                            <FormHelperText error>{errors.parent}</FormHelperText>
                          )}
                        </FormControl>

                        <TextField
                          fullWidth
                          label="Nom de la catégorie"
                          placeholder="Ex: Électronique, Mode, Maison..."
                          {...getFieldProps("name")}
                          error={Boolean(touched.name && errors.name)}
                          helperText={touched.name && errors.name}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                              borderRadius: 2,
                              '& fieldset': {
                                borderColor: alpha(theme.palette.divider, 0.3),
                                borderWidth: 1,
                              },
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: 2,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: 2,
                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 500,
                            },
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Description de la catégorie (optionnel)"
                          placeholder="Une courte description de ce que les clients trouveront dans cette catégorie."
                          multiline
                          rows={3}
                          {...getFieldProps("description")}
                          error={Boolean(touched.description && errors.description)}
                          helperText={touched.description && errors.description}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                              borderRadius: 2,
                            },
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Attributs de la catégorie (optionnel)"
                          placeholder="Ex: Taille, Couleur, Marque (séparés par des virgules)"
                          {...getFieldProps("attributes")}
                          error={Boolean(touched.attributes && errors.attributes)}
                          helperText={touched.attributes && errors.attributes}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                              borderRadius: 2,
                            },
                          }}
                        />

                        <FormControl fullWidth error={Boolean(touched.type && errors.type)}>
                          <InputLabel sx={{ fontWeight: 500 }}>Type de catégorie</InputLabel>
                          <Select
                            label="Type de catégorie"
                            {...getFieldProps("type")}
                            sx={{
                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                              borderRadius: 2,
                            }}
                          >
                            <MenuItem value={CATEGORY_TYPE.PRODUCT}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Iconify icon="mdi:package-variant" />
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>Produit</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Articles physiques vendus
                                  </Typography>
                                </Box>
                              </Stack>
                            </MenuItem>
                            <MenuItem value={CATEGORY_TYPE.SERVICE}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Iconify icon="mdi:account-wrench" />
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>Service</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Prestations et services
                                  </Typography>
                                </Box>
                              </Stack>
                            </MenuItem>
                          </Select>
                          {touched.type && errors.type && (
                            <FormHelperText>{errors.type}</FormHelperText>
                          )}
                        </FormControl>
                      </Stack>
                    </Card>
                  </Zoom>
                )}

                {/* Step 2: Image Upload */}
                {activeStep === 1 && (
                  <Zoom in={true} timeout={800}>
                    <Card
                      sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        background: `linear-gradient(145deg, 
                          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                          ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: `
                          0 8px 32px ${alpha(theme.palette.secondary.main, 0.08)},
                          0 0 0 1px ${alpha(theme.palette.secondary.main, 0.05)}
                        `,
                        textAlign: "center",
                      }}
                    >
                      <Stack spacing={4} alignItems="center">
                        <Box>
                          <Typography variant="h5" fontWeight={700} color="secondary.main" gutterBottom>
                            Image de la catégorie
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Ajoutez une image pour rendre votre catégorie plus attrayante (optionnel)
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                            borderRadius: 3,
                            p: 4,
                            width: "100%",
                            maxWidth: 400,
                            height: 300,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                            background: `linear-gradient(135deg, 
                              ${alpha(theme.palette.grey[100], 0.3)} 0%, 
                              ${alpha(theme.palette.grey[200], 0.2)} 100%)`,
                            "&:hover": {
                              borderColor: theme.palette.primary.main,
                              backgroundColor: alpha(theme.palette.primary.main, 0.02),
                            },
                          }}
                        >
                          <UploadMultiFile
                            accept={{ "image/*": [] }}
                            files={categoryImage ? [categoryImage] : []}
                            onDrop={(acceptedFiles) => {
                              if (acceptedFiles.length > 0) {
                                setCategoryImage(acceptedFiles[0])
                              }
                            }}
                            onRemove={() => setCategoryImage(null)}
                            onRemoveAll={() => setCategoryImage(null)}
                          />
                        </Box>
                      </Stack>
                    </Card>
                  </Zoom>
                )}

                {/* Step 3: Review */}
                {activeStep === 2 && (
                  <Zoom in={true} timeout={800}>
                    <Card
                      sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        background: `linear-gradient(145deg, 
                          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                          ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    >
                      <Stack spacing={4}>
                        <Box>
                          <Typography variant="h5" fontWeight={700} color="success.main" gutterBottom>
                            Révision et création
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Vérifiez les informations avant de créer votre catégorie
                          </Typography>
                        </Box>

                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={categoryImage ? 6 : 12}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                borderRadius: 2,
                              }}
                            >
                              <Stack spacing={2}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Avatar
                                    sx={{
                                      bgcolor: theme.palette.primary.main,
                                      width: 40,
                                      height: 40,
                                    }}
                                  >
                                    <Iconify icon={categoryIcon} width={20} height={20} />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                      {values.name || "Nom de la catégorie"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {values.type === CATEGORY_TYPE.PRODUCT ? "Produit" : "Service"}
                                    </Typography>
                                  </Box>
                                </Stack>
                                
                                {values.parent && (
                                  <Box>
                                    <Typography variant="subtitle2" color="text.primary">
                                      Catégorie parent:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {parentCategory?.fullPath || parentCategory?.name || values.parent}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {values.description && (
                                  <Box>
                                    <Typography variant="subtitle2" color="text.primary">
                                      Description:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {values.description}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {values.attributes && (
                                  <Box>
                                    <Typography variant="subtitle2" color="text.primary">
                                      Attributs:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {values.attributes}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </Paper>
                          </Grid>
                          {categoryImage && (
                            <Grid item xs={12} sm={6}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 1,
                                  bgcolor: alpha(theme.palette.grey[100], 0.5),
                                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                  borderRadius: 2,
                                  height: 140,
                                }}
                              >
                                <Box
                                  component="img"
                                  src={URL.createObjectURL(categoryImage)}
                                  alt="Aperçu"
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: 1,
                                  }}
                                />
                              </Paper>
                            </Grid>
                          )}
                        </Grid>
                      </Stack>
                    </Card>
                  </Zoom>
                )}
              </Grid>

              {/* Sidebar */}
              <Grid item xs={12} lg={4}>
                <Fade in={true} timeout={1000}>
                  <Stack spacing={3}>
                    {/* Preview Card */}
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(145deg, 
                          ${alpha(theme.palette.info.main, 0.05)} 0%, 
                          ${alpha(theme.palette.info.light, 0.02)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="h6" fontWeight={700} color="info.main" gutterBottom>
                        Aperçu en temps réel
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          margin: "0 auto",
                          mb: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          animation: 'float 4s ease-in-out infinite',
                        }}
                      >
                        <Iconify icon={categoryIcon} width={40} height={40} />
                      </Avatar>
                      
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {values.name || "Nom de la catégorie"}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {values.type === CATEGORY_TYPE.PRODUCT ? "Catégorie de produits" : "Catégorie de services"}
                      </Typography>
                      
                      {values.parent && parentCategory && (
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Sous-catégorie de: {parentCategory.name}
                        </Typography>
                      )}
                      
                      {values.description && (
                        <Typography variant="body2" color="text.primary" sx={{ my: 1, px: 2, fontStyle: 'italic' }}>
                          "{values.description}"
                        </Typography>
                      )}
                      
                      {values.attributes && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Attributs: {values.attributes}
                        </Typography>
                      )}
                      
                      {categoryImage && (
                        <Box
                          component="img"
                          src={URL.createObjectURL(categoryImage)}
                          alt="Aperçu"
                          sx={{
                            width: "100%",
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 2,
                            mt: 2,
                          }}
                        />
                      )}
                    </Card>

                    {/* Tips Card */}
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(145deg, 
                          ${alpha(theme.palette.warning.main, 0.05)} 0%, 
                          ${alpha(theme.palette.warning.light, 0.02)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.warning.main,
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Iconify icon="mdi:lightbulb" width={20} height={20} />
                        </Avatar>
                        <Typography variant="h6" fontWeight={700} color="warning.main">
                          Conseils
                        </Typography>
                      </Stack>
                      
                      <Stack spacing={1.5}>
                        <Typography variant="body2" color="text.secondary">
                          • Choisissez un nom descriptif et facile à comprendre
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Une image de qualité améliore l'expérience utilisateur
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Les sous-catégories facilitent l'organisation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Vous pouvez toujours modifier ces informations plus tard
                        </Typography>
                      </Stack>
                    </Card>
                  </Stack>
                </Fade>
              </Grid>
            </Grid>

            {/* Error Alert */}
            {showAlert && error && (
              <Collapse in={showAlert} sx={{ mt: 3 }}>
                <Alert 
                  severity="error" 
                  onClose={() => setShowAlert(false)}
                  sx={{ 
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  }}
                >
                  {error}
                </Alert>
              </Collapse>
            )}

            {/* Action Buttons */}
            <Fade in={true} timeout={1200}>
              <Card 
                sx={{ 
                  mt: 4, 
                  p: 3, 
                  borderRadius: 3,
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Stack 
                  direction={{ xs: "column", sm: "row" }} 
                  spacing={2} 
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Button
                    variant="outlined"
                    onClick={activeStep === 0 ? () => navigate("/dashboard/categories") : handleBack}
                    startIcon={<Iconify icon={activeStep === 0 ? "eva:arrow-back-fill" : "eva:arrow-left-fill"} />}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      borderColor: alpha(theme.palette.text.secondary, 0.3),
                      "&:hover": {
                        borderColor: theme.palette.text.primary,
                        bgcolor: alpha(theme.palette.text.primary, 0.04),
                      },
                      order: { xs: 2, sm: 1 },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {activeStep === 0 ? "Annuler" : "Précédent"}
                  </Button>

                  {activeStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!canProceedToNext()}
                      endIcon={<Iconify icon="eva:arrow-right-fill" />}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                        "&:hover": {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          transform: 'translateY(-2px)',
                        },
                        order: { xs: 1, sm: 2 },
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      loading={isSubmitting}
                      loadingPosition="start"
                      startIcon={<Iconify icon="mdi:check-circle-outline" />}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                        boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.3)}`,
                        "&:hover": {
                          background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                          transform: 'translateY(-2px)',
                        },
                        order: { xs: 1, sm: 2 },
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      {parentCategory ? 'Créer la Sous-catégorie' : 'Créer la Catégorie'}
                    </LoadingButton>
                  )}
                </Stack>
              </Card>
            </Fade>
          </Form>
        </FormikProvider>
      </Container>
    </Page>
  )
}