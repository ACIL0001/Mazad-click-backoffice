// src/pages/Categories/CategoryDetailsPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Divider,
  Chip,
  Paper,
  Tooltip,
  IconButton,
  Link as MuiLink,
  Breadcrumbs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import useMediaQuery from '@mui/material/useMediaQuery';

import Iconify from "@/components/Iconify";
import Page from "../../components/Page";
import Label from "../../components/Label";
import { CategoryAPI } from "@/api/category";
import type { ICategory } from "@/types/Category";
import app, { getStaticUrl } from '@/config'; // Import the helper function

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

// Keyframe for pulsating glow
const pulseGlow = `
  @keyframes pulseGlow {
    0% { box-shadow: 0 0 0px ${alpha('#6200EE', 0.4)}; }
    50% { box-shadow: 0 0 15px ${alpha('#BB86FC', 0.8)}; }
    100% { box-shadow: 0 0 0px ${alpha('#6200EE', 0.4)}; }
  }
`;

// Keyframe for dynamic gradient background
const animatedGradient = `
  @keyframes animatedGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// Function to get an appropriate icon based on category name
const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
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
  };
  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (name.includes(keyword)) {
      return icon;
    }
  }
  return "material-symbols:category";
};

// Fixed function to get image URL from attachment object
const getImageUrl = (attachment: any): string => {
  if (!attachment) return "";
  
  // Handle string URLs
  if (typeof attachment === "string") {
    // If it's already a full URL, return as-is
    if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
      return attachment;
    }
    // If it's a filename or relative path, use the helper function
    return getStaticUrl(attachment);
  }
  
  // Handle object with url property
  if (typeof attachment === "object" && attachment.url) {
    // If it's already a full URL, return as-is
    if (attachment.url.startsWith('http://') || attachment.url.startsWith('https://')) {
      return attachment.url;
    }
    // If it's a filename or relative path, use the helper function
    return getStaticUrl(attachment.url);
  }
  
  return "";
};


export default function CategoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [categoryDetails, setCategoryDetails] = useState<ICategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || id === 'new') {
      setError("Invalid category ID or navigating to new category creation.");
      setLoading(false);
      return;
    }

    const fetchCategoryDetails = async () => {
      try {
        setLoading(true);
        const response = await CategoryAPI.getCategoryById(id);
        const categoryData = response.data || response;
        setCategoryDetails(categoryData);
      } catch (err: any) {
        console.error("Failed to fetch category details:", err);
        setError(err.response?.data?.message || "Failed to load category details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress color="primary" size={isMobile ? 40 : 60} />
      </Container>
    );
  }

  if (error || !categoryDetails) {
    return (
      <Container sx={{ mt: { xs: 2, sm: 4 } }}>
        <Alert severity="error" sx={{ fontSize: isMobile ? '0.8rem' : 'inherit' }}>{error || "Catégorie non trouvée."}</Alert>
        <Box sx={{ mt: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
          <Button variant="outlined" onClick={() => navigate("/dashboard/categories")} size={isMobile ? 'small' : 'medium'}>
            Retour aux Catégories
          </Button>
        </Box>
      </Container>
    );
  }

  const handleEdit = () => {
    navigate(`/dashboard/categories/edit/${categoryDetails._id}`, { state: { category: categoryDetails } });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
      <style>{floatAnimation}</style>
      <style>{pulseGlow}</style>
      <style>{animatedGradient}</style>

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={{ xs: 2, sm: 3 }} spacing={isMobile ? 1 : 0}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component="button" variant={isMobile ? "body2" : "subtitle2"} onClick={() => navigate('/dashboard/categories')}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                textDecoration: 'underline',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Catégories
          </MuiLink>
          <Typography variant={isMobile ? "body2" : "subtitle2"} color="text.primary" sx={{ fontWeight: 'bold' }}>
            {categoryDetails.name}
          </Typography>
        </Breadcrumbs>
        <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:pencil-outline" />}
            onClick={handleEdit}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              borderRadius: 1.5,
              background: `linear-gradient(45deg, ${theme.palette.secondary.light} 30%, ${theme.palette.secondary.main} 90%)`,
              boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.secondary.main, 0.34)}`,
              px: isMobile ? 2 : 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              "&:hover": {
                boxShadow: (theme) => `0 8px 20px 0 ${alpha(theme.palette.secondary.main, 0.4)}`,
                background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.dark} 90%)`,
                transform: 'translateY(-2px) scale(1.02)',
              },
              width: isMobile ? '100%' : 'auto',
            }}
        >
            Modifier
        </Button>
      </Stack>

      <Card sx={{
        mb: { xs: 3, sm: 5 },
        p: { xs: 2, sm: 4 },
        borderRadius: 3,
        boxShadow: (theme) =>
          `0px 15px 50px ${alpha(theme.palette.primary.main, 0.3)},
           0px 0px 0px 3px ${alpha(theme.palette.primary.dark, 0.2)},
           inset 0px 5px 15px ${alpha(theme.palette.common.white, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.7)} 100%)`,
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        gap: isMobile ? 2 : 4,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
        animation: 'float 7s ease-in-out infinite',
        '&::before': {
            content: '""',
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.light, 0.08),
            zIndex: 0,
            transform: 'rotate(20deg)',
            transition: 'all 0.5s ease-out',
        },
        '&::after': {
            content: '""',
            position: 'absolute',
            top: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.secondary.light, 0.05),
            zIndex: 0,
            transform: 'rotate(-30deg)',
            transition: 'all 0.5s ease-out',
        }
      }}>
        <Box
          sx={{
            width: isMobile ? 80 : 100,
            height: isMobile ? 80 : 100,
            minWidth: isMobile ? 80 : 100,
            minHeight: isMobile ? 80 : 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            boxShadow: theme.shadows[5],
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            zIndex: 1,
            animation: 'pulseGlow 2s infinite ease-in-out alternate',
            '&:hover': {
                transform: 'scale(1.15) rotate(5deg)',
                boxShadow: (theme) => `0 10px 25px ${alpha(theme.palette.primary.main, 0.6)}`,
                animation: 'none',
            }
          }}
        >
          <Iconify width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} icon={getCategoryIcon(categoryDetails.name)} color={theme.palette.common.white} />
        </Box>
        <Box sx={{ zIndex: 1, textAlign: isMobile ? 'center' : 'left' }}>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              mb: 0.5,
              background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light}, ${theme.palette.info.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'animatedGradient 10s linear infinite',
              textShadow: (theme) => `3px 3px 6px ${alpha(theme.palette.text.secondary, 0.4)}`,
            }}
          >
            {categoryDetails.name}
          </Typography>
          <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">
            {categoryDetails.description || "Aucune description détaillée n'est fournie pour cette catégorie."}
          </Typography>
        </Box>
      </Card>

      <Grid container spacing={isMobile ? 2 : 4}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            borderRadius: 2,
            overflow: 'hidden',
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
          }}>
            <Box
              sx={{
                width: '100%',
                height: isMobile ? 200 : 250,
                background: `linear-gradient(45deg, ${alpha(theme.palette.grey[900], 0.8)} 0%, ${alpha(theme.palette.grey[700], 0.8)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {categoryDetails.thumb ? (
                <img
                  src={getImageUrl(categoryDetails.thumb)}
                  alt={categoryDetails.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e: any) => {
                    console.error('Image failed to load:', getImageUrl(categoryDetails.thumb));
                    // Hide the img element and show the fallback icon
                    e.target.style.display = 'none';
                    const fallbackIcon = e.target.nextElementSibling;
                    if (fallbackIcon) {
                      fallbackIcon.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <Box
                sx={{
                  display: categoryDetails.thumb ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}
              >
                <Iconify icon="mdi:image-off" width={isMobile ? 60 : 80} height={isMobile ? 60 : 80} color="text.disabled" />
              </Box>
            </Box>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant={isMobile ? "h6" : "h6"} sx={{ mb: { xs: 1.5, sm: 2 }, fontWeight: 700, color: 'text.primary' }}>
                Aperçu Général
              </Typography>
              <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />
              <List disablePadding>
                <ListItem disableGutters sx={{ py: { xs: 0.2, sm: 0.5 } }}>
                  <ListItemIcon sx={{ minWidth: isMobile ? 30 : 35 }}>
                    <Iconify icon="mdi:shape-outline" width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} color={theme.palette.info.main} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">Type:</Typography>
                        <Label color={categoryDetails.type.toLowerCase() === 'product' ? 'primary' : 'info'}>
                          {categoryDetails.type.toLowerCase() === 'product' ? 'Produit' : 'Service'}
                        </Label>
                      </Stack>
                    }
                  />
                </ListItem>
                {categoryDetails.productsCount !== undefined && (
                  <ListItem disableGutters sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: { xs: 30, sm: 35 } }}>
                      <Iconify icon="mdi:package-variant-closed" width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} color={theme.palette.success.main} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">
                          Produits Associés: <Typography component="span" variant="subtitle1" color="text.primary" sx={{ fontWeight: 600, fontSize: isMobile ? "0.8rem" : "0.9rem" }}>{categoryDetails.productsCount}</Typography>
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
                {categoryDetails.servicesCount !== undefined && (
                  <ListItem disableGutters sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: { xs: 30, sm: 35 } }}>
                      <Iconify icon="mdi:briefcase-outline" width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} color={theme.palette.warning.main} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">
                          Services Associés: <Typography component="span" variant="subtitle1" color="text.primary" sx={{ fontWeight: 600, fontSize: isMobile ? "0.8rem" : "0.9rem" }}>{categoryDetails.servicesCount}</Typography>
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
                <ListItem disableGutters sx={{ py: { xs: 0.2, sm: 0.5 } }}>
                  <ListItemIcon sx={{ minWidth: isMobile ? 30 : 35 }}>
                    <Iconify icon="solar:document-text-bold" width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} color={theme.palette.warning.main} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant={isMobile ? "body2" : "body2"} color="text.secondary">
                        Description: <Typography component="span" variant={isMobile ? "body2" : "subtitle1"} color="text.primary" sx={{ fontWeight: 600 }}>{categoryDetails.description || "Aucune description fournie."}</Typography>
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={isMobile ? 2 : 4}>
            <Paper sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) =>
                `0px 8px 25px ${alpha(theme.palette.info.main, 0.2)},
                 0px 0px 0px 1px ${alpha(theme.palette.info.dark, 0.1)}`,
              background: (theme) => alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: (theme) =>
                    `0px 12px 35px ${alpha(theme.palette.info.main, 0.3)},
                     0px 0px 0px 2px ${alpha(theme.palette.info.dark, 0.15)}`,
              }
            }}>
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 700, color: 'text.primary' }}>Attributs Spécifiques</Typography>
              {categoryDetails.attributes && categoryDetails.attributes.length > 0 ? (
                <Grid container spacing={isMobile ? 1 : 2}>
                  {categoryDetails.attributes.map((attr: string, index: number) => (
                    <Grid item key={index}>
                      <Chip
                        label={attr}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          background: `linear-gradient(45deg, ${theme.palette.success.light} 30%, ${theme.palette.success.main} 90%)`,
                          color: theme.palette.common.white,
                          borderRadius: 1.5,
                          fontWeight: 500,
                          px: isMobile ? 1 : 1.5,
                          py: isMobile ? 0.2 : 0.5,
                          boxShadow: (theme) => `0 4px 10px ${alpha(theme.palette.success.main, 0.4)}`,
                          transition: 'all 0.3s ease-in-out',
                          "&:hover": {
                            bgcolor: alpha(theme.palette.success.main, 0.25),
                            transform: 'translateY(-3px) scale(1.05)',
                            boxShadow: (theme) => `0 6px 15px ${alpha(theme.palette.success.main, 0.6)}`,
                            background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                          },
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                        }}
                        icon={<Iconify icon="mdi:tag-outline" width={isMobile ? 16 : 18} height={isMobile ? 16 : 18} color="inherit" />}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 }, mt: { xs: 1.5, sm: 2 }, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.7),
                    border: "1px dashed", borderColor: theme.palette.grey[400], textAlign: "center",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 2, sm: 4 },
                    boxShadow: theme.shadows[1],
                  }}
                >
                  <Iconify icon="mdi:information-outline" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} color="text.disabled" sx={{ mr: { xs: 0.5, sm: 1 } }} />
                  <Typography variant={isMobile ? "body2" : "body1"} color="text.disabled">
                    Aucun attribut spécifique défini pour cette catégorie.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}