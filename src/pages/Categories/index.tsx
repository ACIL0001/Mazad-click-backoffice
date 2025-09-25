"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import {
  Stack,
  Container,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Tooltip,
  Alert,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Avatar,
  alpha,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import useMediaQuery from '@mui/material/useMediaQuery'; // Import useMediaQuery

import Iconify from "@/components/Iconify"
import Page from "../../components/Page"
import { useSnackbar } from "notistack"
import { sentenceCase } from "change-case"
import { CategoryAPI } from "@/api/category"
import MuiTable from "../../components/Tables/MuiTable"
import app from '@/config'

// ----------------------------------------------------------------------
// Interfaces
export interface ICategory {
  _id: string
  name: string
  type: "product" | "service" | string
  description: string
  productsCount?: number
  servicesCount?: number
  thumb?: {
    url: string
    fileName: string
    original?: string
  }
  subcategories?: ICategory[]
  children?: ICategory[] // Support both subcategories and children for API compatibility
  parent?: string | null
  level?: number
  attributes?: string[]
}

// ----------------------------------------------------------------------

const CATEGORY_TABLE_HEAD = [
  { id: "name", label: "Nom", alignRight: false, searchable: true },
  { id: "type", label: "Type", alignRight: false, searchable: true },
  { id: "attributes", label: "Attributs", alignRight: false, searchable: false },
  { id: "actions", label: "Actions", alignRight: true, searchable: false },
]

// ----------------------------------------------------------------------

interface CategoryItemProps {
  category: ICategory
  selected: string[]
  setSelected: (selected: string[]) => void
  handleEditCategory: (category: ICategory) => void
  handleDeleteCategory: (categoryId: string) => void
  goToCategoryDetails: (categoryId: string) => void
  depth: number
  onCategoryDeleted: () => void
}

function CategoryItem({
  category,
  selected,
  setSelected,
  handleEditCategory,
  handleDeleteCategory,
  goToCategoryDetails,
  depth,
  onCategoryDeleted,
}: CategoryItemProps) {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCheckboxClick = useCallback(
    (id: string) => {
      const selectedIndex = selected.indexOf(id)
      let newSelected: string[] = []
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id)
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1))
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1))
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
      }
      setSelected(newSelected)
    },
    [selected, setSelected],
  )

  // Helper function to construct proper image URLs
  const getImageUrl = (attachment: any): string => {
    if (!attachment) return "";
    if (typeof attachment === "string") {
      return attachment;
    }
    if (typeof attachment === "object" && attachment.url) {
      // Check if the URL already contains the full path (starts with http/https)
      if (attachment.url.startsWith('http://') || attachment.url.startsWith('https://')) {
        return attachment.url;
      }
      // If it's a relative path, check if it already starts with /static/
      if (attachment.url.startsWith('/static/')) {
        return app.route + attachment.url;
      }
      // If it's just a filename, prepend /static/
      return app.route + '/static/' + attachment.url;
    }
    return "";
  };

  const categoryThumbUrl = getImageUrl(category.thumb)
  const isItemSelected = selected.indexOf(category._id) !== -1
  const subcategories = category.subcategories || category.children || []
  const hasSubcategories = subcategories && subcategories.length > 0
  const hasAttributes = category.attributes && category.attributes.length > 0

  return (
    <>
      <TableRow
        hover
        key={category._id}
        tabIndex={-1}
        role="checkbox"
        selected={isItemSelected}
        onClick={() => goToCategoryDetails(category._id)}
        sx={{
          cursor: "pointer",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            transform: "translateY(-1px)",
            boxShadow: `0 4px 20px 0 ${alpha(theme.palette.primary.main, 0.12)}`,
            "& .MuiTableCell-root": {
              borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            },
          },
          "&.Mui-selected": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
          },
        }}
      >
        <TableCell padding="checkbox" sx={{ pl: { xs: 1, sm: 3 } }}>
          <Checkbox
            checked={isItemSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={() => handleCheckboxClick(category._id)}
            sx={{
              color: theme.palette.primary.main,
              "&.Mui-checked": {
                color: theme.palette.primary.main,
              },
            }}
          />
        </TableCell>
        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ pl: depth * 3, py: { xs: 1, sm: 2 } }}>
            {hasSubcategories && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(!open)
                }}
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  borderRadius: 1.5,
                  backgroundColor: alpha(theme.palette.grey[500], 0.08),
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    transform: "scale(1.1)",
                  },
                }}
              >
                {open ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </IconButton>
            )}
            {!hasSubcategories && depth > 0 && <Box sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }} />}
            {categoryThumbUrl ? (
              <Avatar
                src={categoryThumbUrl}
                alt={category.name}
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2.5,
                  boxShadow: `0 4px 12px 0 ${alpha(theme.palette.grey[900], 0.15)}`,
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
                imgProps={{
                  onError: (e: any) => {
                    e.target.src = "/assets/images/default_category_thumb.png"
                  },
                }}
              />
            ) : (
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.15)}`,
                }}
              >
                <Iconify
                  icon={category.type.toLowerCase() === "product" ? "solar:tag-bold" : "solar:case-minimalistic-bold"}
                  width={isMobile ? 20 : 24}
                  height={isMobile ? 20 : 24}
                  sx={{ 
                    color: theme.palette.primary.main 
                  }}
                />
              </Box>
            )}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  lineHeight: 1.4,
                  mb: 0.5,
                }}
              >
                {category.name}
              </Typography>
              {category.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                    maxWidth: { xs: 150, sm: 300 },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {category.description}
                </Typography>
              )}
            </Box>
          </Stack>
        </TableCell>
        <TableCell align="left" sx={{ py: { xs: 1, sm: 2 }, display: isMobile ? 'none' : 'table-cell' }}>
          <Chip
            label={sentenceCase(category.type)}
            size="small"
            sx={{
              height: 28,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "0.75rem",
              minWidth: 80,
              ...(category.type.toLowerCase() === "product" && {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }),
              ...(category.type.toLowerCase() === "service" && {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }),
              ...(!["product", "service"].includes(category.type.toLowerCase()) && {
                backgroundColor: alpha(theme.palette.grey[500], 0.12),
                color: theme.palette.text.secondary,
                border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
              }),
            }}
          />
        </TableCell>
        <TableCell align="left" sx={{ py: { xs: 1, sm: 2 }, display: isMobile ? 'none' : 'table-cell' }}>
          {hasAttributes ? (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
              }}
            >
              {category.attributes?.map((attribute, index) => (
                <Chip
                  key={index}
                  label={attribute}
                  size="small"
                  sx={{
                    borderRadius: 1,
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: theme.palette.text.disabled, fontStyle: 'italic' }}>
              N/A
            </Typography>
          )}
        </TableCell>
        <TableCell align="right" sx={{ py: { xs: 1, sm: 2 }, pr: { xs: 1, sm: 3 } }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title="Modifier" placement="top">
              <IconButton
                size="small"
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.warning.main, 0.08),
                  color: theme.palette.warning.main,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.warning.main, 0.16),
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px 0 ${alpha(theme.palette.warning.main, 0.3)}`,
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditCategory(category)
                }}
              >
                <Iconify icon="solar:pen-bold" width={isMobile ? 16 : 18} height={isMobile ? 16 : 18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer" placement="top">
              <IconButton
                size="small"
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                  color: theme.palette.error.main,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.16),
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px 0 ${alpha(theme.palette.error.main, 0.3)}`,
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteCategory(category._id)
                }}
              >
                <Iconify icon="solar:trash-bin-minimalistic-bold" width={isMobile ? 16 : 18} height={isMobile ? 16 : 18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
      {hasSubcategories && open && (
        <>
          {subcategories.map((subCategory) => (
            <CategoryItem
              key={subCategory._id}
              category={subCategory}
              selected={selected}
              setSelected={setSelected}
              handleEditCategory={handleEditCategory}
              handleDeleteCategory={handleDeleteCategory}
              goToCategoryDetails={goToCategoryDetails}
              depth={depth + 1}
              onCategoryDeleted={onCategoryDeleted}
            />
          ))}
        </>
      )}
    </>
  )
}

interface CategoriesTableBodyProps {
  data: ICategory[]
  selected: string[]
  setSelected: (selected: string[]) => void
  onCategoryDeleted: () => void
}

function CategoriesTableBody({ data, selected, setSelected, onCategoryDeleted }: CategoriesTableBodyProps) {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const handleEditCategory = useCallback(
    (category: ICategory) => {
      navigate(`/dashboard/categories/edit/${category._id}`, { state: { category } })
    },
    [navigate],
  )

  const handleDeleteCategory = useCallback(
    async (categoryId: string) => {
      // Get category details to check for descendants
      try {
        const categoryWithDescendants = await CategoryAPI.getCategoryWithDescendants(categoryId)
        const hasDescendants = categoryWithDescendants.children && categoryWithDescendants.children.length > 0
        
        let confirmMessage = "Êtes-vous sûr de vouloir supprimer cette catégorie ?"
        if (hasDescendants) {
          confirmMessage = "Cette catégorie a des sous-catégories. Voulez-vous supprimer la catégorie et toutes ses sous-catégories ?"
        }

        if (window.confirm(confirmMessage)) {
          // Use deleteWithDescendants if category has descendants, otherwise use regular delete
          if (hasDescendants) {
            await CategoryAPI.deleteWithDescendants(categoryId)
            enqueueSnackbar("Catégorie et ses sous-catégories supprimées avec succès !", { variant: "success" })
          } else {
            await CategoryAPI.delete(categoryId)
            enqueueSnackbar("Catégorie supprimée avec succès !", { variant: "success" })
          }
          onCategoryDeleted()
        }
      } catch (error: any) {
        console.error("Error deleting category:", error)
        enqueueSnackbar(`Erreur lors de la suppression: ${error.message || "Erreur inconnue"}`, { variant: "error" })
      }
    },
    [enqueueSnackbar, onCategoryDeleted],
  )

  const goToCategoryDetails = useCallback(
    (categoryId: string) => {
      navigate(`/dashboard/categories/${categoryId}`)
    },
    [navigate],
  )

  return (
    <TableBody>
      {data.map((category) => (
        <CategoryItem
          key={category._id}
          category={category}
          selected={selected}
          setSelected={setSelected}
          handleEditCategory={handleEditCategory}
          handleDeleteCategory={handleDeleteCategory}
          goToCategoryDetails={goToCategoryDetails}
          depth={0}
          onCategoryDeleted={onCategoryDeleted}
        />
      ))}
    </TableBody>
  )
}

// Helper function to flatten category tree for search functionality
function flattenCategoryTree(categories: ICategory[]): ICategory[] {
  const flattened: ICategory[] = []
  
  function traverse(cats: ICategory[]) {
    for (const cat of cats) {
      flattened.push(cat)
      const subcategories = cat.subcategories || cat.children || []
      if (subcategories.length > 0) {
        traverse(subcategories)
      }
    }
  }
  
  traverse(categories)
  return flattened
}

// ----------------------------------------------------------------------

export default function DashboardCategoriesPage() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [page, setPage] = useState(0)
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [selected, setSelected] = useState<string[]>([])
  const [orderBy, setOrderBy] = useState("name")
  const [filterName, setFilterName] = useState("")
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [viewMode, setViewMode] = useState<"product" | "service" | "all">("all")

  const [categoryTree, setCategoryTree] = useState<ICategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      // Use the new tree API to get hierarchical data
      const treeData = await CategoryAPI.getCategoryTree()
      setCategoryTree(treeData)
    } catch (error: any) {
      console.error("Error fetching categories:", error)
      setError("Failed to load categories. Please try again.")
      enqueueSnackbar("Failed to load categories.", { variant: "error" })
    }
  }, [enqueueSnackbar])

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      setError(null)
      await fetchCategories()
      setLoading(false)
    }
    loadAllData()
  }, [fetchCategories])

  const handleAddCategory = () => {
    navigate("/dashboard/categories/new")
  }

  const handleDeleteSelectedCategories = useCallback(async () => {
    if (selected.length === 0) return

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer les ${selected.length} catégories sélectionnées ? Cette action supprimera aussi toutes leurs sous-catégories.`)) {
      try {
        // Use deleteWithDescendants for each selected category to ensure all descendants are removed
        await Promise.all(selected.map((categoryId) => CategoryAPI.deleteWithDescendants(categoryId)))
        enqueueSnackbar(`${selected.length} catégories supprimées avec succès !`, { variant: "success" })
        fetchCategories()
        setSelected([])
      } catch (error: any) {
        console.error("Error deleting selected categories:", error)
        enqueueSnackbar(`Erreur lors de la suppression des catégories: ${error.message || "Erreur inconnue"}`, {
          variant: "error",
        })
      }
    }
  }, [selected, enqueueSnackbar, fetchCategories])

  const filteredData = useMemo(() => {
    let currentData = [...categoryTree]

    if (viewMode !== "all") {
      // Filter the tree to only show categories of the selected type
      const filterByType = (categories: ICategory[]): ICategory[] => {
        return categories.filter(category => {
          const matchesType = category.type.toLowerCase() === viewMode
          const subcategories = category.subcategories || category.children || []
          const filteredSubcategories = filterByType(subcategories)
          
          // Include category if it matches type OR has matching subcategories
          if (matchesType) {
            // Update subcategories to filtered ones
            if (category.subcategories) {
              category.subcategories = filteredSubcategories
            } else if (category.children) {
              category.children = filteredSubcategories
            }
            return true
          } else if (filteredSubcategories.length > 0) {
            // Category doesn't match but has matching subcategories
            if (category.subcategories) {
              category.subcategories = filteredSubcategories
            } else if (category.children) {
              category.children = filteredSubcategories
            }
            return true
          }
          return false
        })
      }
      
      currentData = filterByType(currentData)
    }

    return currentData
  }, [categoryTree, viewMode])

  const onCategoryDeleted = useCallback(() => {
    fetchCategories()
    setSelected([])
  }, [fetchCategories])

  return (
    <Page title="Categories & Services">
      <Container
        maxWidth="xl"
        sx={{
          pt: { xs: 2, sm: 4 },
          pb: { xs: 4, sm: 6 },
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.8)} 0%, ${alpha(theme.palette.grey[100], 0.4)} 100%)`,
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: { xs: 3, sm: 5 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={{ xs: 2, sm: 0 }}
          >
            <Stack direction="row" alignItems="center" spacing={3}>
              <Box
                sx={{
                  width: { xs: 50, sm: 64 },
                  height: { xs: 50, sm: 64 },
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: 3,
                    padding: "2px",
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.8)}, ${alpha(theme.palette.primary.main, 0.2)})`,
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  },
                }}
              >
                <Iconify icon="solar:folder-bold" width={isMobile ? 24 : 32} height={isMobile ? 24 : 32} color="white" />
              </Box>
              <Box>
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.secondary} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    mb: 0.5,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Catégories & Services
                </Typography>
                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                  Gérez vos catégories de produits et services
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              startIcon={<AddIcon />}
              onClick={handleAddCategory}
              sx={{
                borderRadius: 3,
                px: { xs: 2, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontWeight: 700,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                textTransform: "none",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 24px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 32px 0 ${alpha(theme.palette.primary.main, 0.5)}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                },
                width: { xs: '100%', sm: 'auto' },
                mt: { xs: 2, sm: 0 },
              }}
            >
              Nouvelle Catégorie
            </Button>
          </Stack>

          {/* View Mode Toggle */}
          <Box sx={{ mt: { xs: 2, sm: 3 } }}>
            <Paper
              sx={{
                p: 0.5,
                borderRadius: 2.5,
                backgroundColor: alpha(theme.palette.grey[500], 0.04),
                border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                display: "inline-block",
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(event, newMode) => {
                  if (newMode !== null) {
                    setViewMode(newMode)
                    setPage(0)
                    setFilterName("")
                    setSelected([])
                  }
                }}
                sx={{
                  width: '100%',
                  "& .MuiToggleButtonGroup-grouped": {
                    border: "none",
                    borderRadius: "2rem !important",
                    mx: 0.25,
                    "&:not(:first-of-type)": {
                      marginLeft: 0,
                    },
                    flexGrow: { xs: 1, sm: 0 },
                  },
                }}
              >
                <ToggleButton
                  value="all"
                  sx={{
                    px: { xs: 1, sm: 3 },
                    py: { xs: 0.8, sm: 1 },
                    fontWeight: 600,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    textTransform: "none",
                    minWidth: { xs: 'auto', sm: 80 },
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      boxShadow: `0 2px 8px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    },
                    "&:not(.Mui-selected)": {
                      color: theme.palette.text.secondary,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  Tout
                </ToggleButton>
                <ToggleButton
                  value="product"
                  sx={{
                    px: { xs: 1, sm: 3 },
                    py: { xs: 0.8, sm: 1 },
                    fontWeight: 600,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    textTransform: "none",
                    minWidth: { xs: 'auto', sm: 80 },
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      boxShadow: `0 2px 8px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    },
                    "&:not(.Mui-selected)": {
                      color: theme.palette.text.secondary,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  Produits
                </ToggleButton>
                <ToggleButton
                  value="service"
                  sx={{
                    px: { xs: 1, sm: 3 },
                    py: { xs: 0.8, sm: 1 },
                    fontWeight: 600,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    textTransform: "none",
                    minWidth: { xs: 'auto', sm: 80 },
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      boxShadow: `0 2px 8px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    },
                    "&:not(.Mui-selected)": {
                      color: theme.palette.text.secondary,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  Services
                </ToggleButton>
              </ToggleButtonGroup>
            </Paper>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              p: { xs: 1.5, sm: 2 },
            }}
          >
            {error}
          </Alert>
        )}

        {/* MUI Table */}
        <MuiTable
          data={filteredData}
          columns={CATEGORY_TABLE_HEAD}
          TableBodyComponent={(props) => (
            <CategoriesTableBody {...props} onCategoryDeleted={onCategoryDeleted} />
          )}
          page={page}
          setPage={setPage}
          order={order}
          setOrder={setOrder}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          selected={selected}
          setSelected={setSelected}
          filterName={filterName}
          setFilterName={setFilterName}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          searchFields={["name", "description"]}
          numSelected={selected.length}
          onDeleteSelected={handleDeleteSelectedCategories}
          loading={loading}
        />
      </Container>
    </Page>
  )
}