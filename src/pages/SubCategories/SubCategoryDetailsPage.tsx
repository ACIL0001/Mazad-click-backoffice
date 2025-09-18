// src/pages/SubCategories/SubCategoryDetailsPage.tsx
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
import { SubCategoryAPI } from "@/api/subcategory"; 
import { CategoryAPI } from "@/api/category"; 
import type ICategory from "@/types/Category"; 
import app from '@/config'; 

const floatAnimation = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-5px) rotate(0.5deg); }
    50% { transform: translateY(0px) rotate(0deg); }
    75% { transform: translateY(5px) rotate(-0.5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
`;

const pulseGlow = `
  @keyframes pulseGlow {
    0% { box-shadow: 0 0 0px ${alpha('#6200EE', 0.4)}; }
    50% { box-shadow: 0 0 15px ${alpha('#BB86FC', 0.8)}; }
    100% { box-shadow: 0 0 0px ${alpha('#6200EE', 0.4)}; }
  }
`;

const animatedGradient = `
  @keyframes animatedGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

interface ISubCategory extends ICategory {
  Namecategory: string; // The name of the parent category
  category: string; // The ID of the parent category
  attributes: string[];
}

// Function to get an appropriate icon based on subcategory name
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

const getImageUrl = (attachment: any, configApp: typeof app): string => {
  if (!attachment) return "";
  if (typeof attachment === "string") {
    return attachment;
  }
  if (typeof attachment === "object" && attachment.url) {
    return configApp.route + attachment.url;
  }
  return "";
};


export default function SubCategoryDetailsPage() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));


  const [subCategory, setSubCategory] = useState<ISubCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubCategoryDetails = async () => {
      if (!id) {
        setError("SubCategory ID not provided.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const fetchedSubCategory: ISubCategory = await SubCategoryAPI.getById(id);
        
        if (fetchedSubCategory.category && !fetchedSubCategory.Namecategory) {
            try {
                const parentCategory = await CategoryAPI.getCategoryById(fetchedSubCategory.category);
                fetchedSubCategory.Namecategory = parentCategory.name;
            } catch (catError) {
                console.warn("Could not fetch parent category name:", catError);
                fetchedSubCategory.Namecategory = "Catégorie inconnue";
            }
        }
        setSubCategory(fetchedSubCategory);
      } catch (err: any) {
        console.error("Error fetching subcategory details:", err);
        setError("Failed to load subcategory details. " + (err.message || "Please try again."));
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategoryDetails();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress color="primary" size={isMobile ? 40 : 60} /> {/* Responsive size */}
      </Container>
    );
  }

  if (error || !subCategory) {
    return (
      <Container sx={{ mt: { xs: 2, sm: 4 } }}> 
        <Alert severity="error" sx={{ fontSize: isMobile ? '0.8rem' : 'inherit' }}>{error || "Sous-catégorie non trouvée."}</Alert> 
        <Box sx={{ mt: { xs: 1.5, sm: 2 }, textAlign: 'center' }}> 
          <Button variant="outlined" onClick={() => navigate("/dashboard/sous-categories")} size={isMobile ? 'small' : 'medium'}> 
            Retour aux Sous-Catégories
          </Button>
        </Box>
      </Container>
    );
  }

  const handleEdit = () => {
    navigate(`/dashboard/sous-categories/edit/${subCategory._id}`, { state: { subCategory: subCategory } });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}> 
      <style>{floatAnimation}</style>
      <style>{pulseGlow}</style>
      <style>{animatedGradient}</style>

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={{ xs: 2, sm: 3 }} spacing={isMobile ? 1 : 0}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component="button" variant={isMobile ? "body2" : "subtitle2"} onClick={() => navigate('/dashboard/sous-categories')}
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
            Sous-Catégories
          </MuiLink>
          <Typography variant={isMobile ? "body2" : "subtitle2"} color="text.primary" sx={{ fontWeight: 'bold' }}> 
            {subCategory.name}
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
              px: isMobile ? 2 : 3, // Responsive padding
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
          `0px 15px 50px ${alpha(theme.palette.info.main, 0.3)},
           0px 0px 0px 3px ${alpha(theme.palette.info.dark, 0.2)},
           inset 0px 5px 15px ${alpha(theme.palette.common.white, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.7)} 100%)`,
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: 'center',
        gap: isMobile ? 2 : 4, 
        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
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
            bgcolor: alpha(theme.palette.info.light, 0.08),
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
            background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
            boxShadow: theme.shadows[5],
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            zIndex: 1,
            animation: 'pulseGlow 2s infinite ease-in-out alternate',
            '&:hover': {
                transform: 'scale(1.15) rotate(5deg)',
                boxShadow: (theme) => `0 10px 25px ${alpha(theme.palette.info.main, 0.6)}`,
                animation: 'none',
            }
          }}
        >
          <Iconify width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} icon={getSubCategoryIcon(subCategory.name)} color={theme.palette.common.white} /> {/* Responsive icon size */}
        </Box>
        <Box sx={{ zIndex: 1, textAlign: isMobile ? 'center' : 'left' }}> 
          <Typography
            variant={isMobile ? "h3" : "h2"} 
            component="h1"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              mb: 0.5,
              background: `linear-gradient(90deg, ${theme.palette.info.light}, ${theme.palette.secondary.light}, ${theme.palette.primary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'animatedGradient 10s linear infinite',
              textShadow: (theme) => `3px 3px 6px ${alpha(theme.palette.text.secondary, 0.4)}`,
            }}
          >
            {subCategory.name}
          </Typography>
          <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary"> 
            {subCategory.description || "Aucune description détaillée n'est fournie pour cette sous-catégorie."}
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
              {subCategory.thumb ? (
                <img
                  src={getImageUrl(subCategory.thumb, app)}
                  alt={subCategory.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Iconify icon="mdi:image-off" width={isMobile ? 60 : 80} height={isMobile ? 60 : 80} color="text.disabled" /> 
              )}
            </Box>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}> 
              <Typography variant={isMobile ? "h6" : "h6"} sx={{ mb: { xs: 1.5, sm: 2 }, fontWeight: 700, color: 'text.primary' }}> {/* Responsive font size and margin */}
                Aperçu Général
              </Typography>
              <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} /> 
              <List disablePadding>
                <ListItem disableGutters sx={{ py: { xs: 0.2, sm: 0.5 } }}> 
                  <ListItemIcon sx={{ minWidth: isMobile ? 30 : 35 }}> 
                    <Iconify icon="solar:tag-bold" width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} color={theme.palette.info.main} /> 
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={isMobile ? 0.5 : 1}> 
                        <Typography variant={isMobile ? "body2" : "body2"} color="text.secondary">Nom:</Typography> 
                        <Typography component="span" variant={isMobile ? "body2" : "subtitle1"} color="text.primary" sx={{ fontWeight: 600 }}> 
                          {subCategory.name}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: { xs: 0.2, sm: 0.5 } }}> 
                  <ListItemIcon sx={{ minWidth: isMobile ? 30 : 35 }}> 
                    <Iconify icon="solar:folder-bold" width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} color={theme.palette.primary.main} /> 
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant={isMobile ? "body2" : "body2"} color="text.secondary"> 
                        Catégorie Parent: <Typography component="span" variant={isMobile ? "body2" : "subtitle1"} color="text.primary" sx={{ fontWeight: 600 }}>{subCategory.Namecategory || "N/A"}</Typography> 
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: { xs: 0.2, sm: 0.5 } }}> 
                  <ListItemIcon sx={{ minWidth: isMobile ? 30 : 35 }}> 
                    <Iconify icon="solar:document-text-bold" width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} color={theme.palette.warning.main} /> 
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant={isMobile ? "body2" : "body2"} color="text.secondary"> 
                        Description: <Typography component="span" variant={isMobile ? "body2" : "subtitle1"} color="text.primary" sx={{ fontWeight: 600 }}>{subCategory.description || "Aucune description fournie."}</Typography> 
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
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 700, color: 'text.primary' }}>Attributs Spécifiques</Typography> {/* Responsive font size and margin */}
              {subCategory.attributes && subCategory.attributes.length > 0 ? (
                <Grid container spacing={isMobile ? 1 : 2}> {/* Responsive spacing */}
                  {subCategory.attributes.map((attr: string, index: number) => (
                    <Grid item key={index}> 
                      <Chip
                        label={attr}
                        size={isMobile ? "small" : "medium"} 
                        sx={{
                          background: `linear-gradient(45deg, ${theme.palette.success.light} 30%, ${theme.palette.success.main} 90%)`,
                          color: theme.palette.common.white,
                          borderRadius: 1.5,
                          fontWeight: 500,
                          px: isMobile ? 1 : 1.5, // Responsive padding
                          py: isMobile ? 0.2 : 0.5, // Responsive padding
                          boxShadow: (theme) => `0 4px 10px ${alpha(theme.palette.success.main, 0.4)}`,
                          transition: 'all 0.3s ease-in-out',
                          "&:hover": {
                            bgcolor: alpha(theme.palette.success.main, 0.25),
                            transform: 'translateY(-3px) scale(1.05)',
                            boxShadow: (theme) => `0 6px 15px ${alpha(theme.palette.success.main, 0.6)}`,
                            background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                          },
                          fontSize: isMobile ? '0.7rem' : '0.8rem', // Responsive font size
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
                    Aucun attribut spécifique défini pour cette sous-catégorie.
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
