// SubCategories.tsx
"use client"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom" 

import {
  Stack,
  Container,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  alpha,
  useTheme,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import useMediaQuery from '@mui/material/useMediaQuery';

import Iconify from "@/components/Iconify"
import Page from "../../components/Page"
import { useSnackbar } from "notistack"
// REMOVED: import type ICategory from "@/types/Category"
import { CategoryAPI } from "@/api/category"
import { SubCategoryAPI } from "@/api/subcategory"
import MuiTable from "../../components/Tables/MuiTable"

// Add the missing type definitions here
interface Attachment {
  url: string;
}

interface ICategory {
  _id: string;
  name: string;
  description?: string;
  thumb?: Attachment;
  // Add other properties if needed
}

// Define ISubCategory interface
interface ISubCategory extends ICategory {
  Namecategory: string
  category: string 
  attributes: string[]
}

const TABLE_HEAD = [
  { id: "name", label: "Nom", alignRight: false, searchable: true },
  { id: "Namecategory", label: "Catégorie Parent", alignRight: false, searchable: true },
  { id: "attributes", label: "Attributs", alignRight: false, searchable: false },
  { id: "actions", label: "Actions", alignRight: true, searchable: false },
]

interface SubCategoryItemProps {
  subCategory: ISubCategory
  selected: string[]
  setSelected: (selected: string[]) => void
  onMore: (subCategory: ISubCategory) => void 
  handleEdit: (subCategory: ISubCategory) => void
  handleDelete: (subCategory: ISubCategory) => void
  index: number
}

function SubCategoryItem({
  subCategory,
  selected,
  setSelected,
  onMore, 
  handleEdit,
  handleDelete,
  index,
}: SubCategoryItemProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

  const isItemSelected = selected.indexOf(subCategory._id) !== -1
  const subCategoryThumbUrl = subCategory.thumb?.url || ""

  return (
    <TableRow
      hover
      key={subCategory._id}
      tabIndex={-1}
      role="checkbox"
      selected={isItemSelected}
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
        '& .MuiTableCell-root': {
          fontSize: isMobile ? '0.75rem' : '0.875rem', 
          padding: isMobile ? '8px' : '16px', 
        },
      }}
    >
      <TableCell padding="checkbox" sx={{ pl: isMobile ? 1.5 : 3 }}> 
        <Checkbox
          checked={isItemSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => handleCheckboxClick(subCategory._id)}
          size={isMobile ? 'small' : 'medium'} 
          sx={{
            color: theme.palette.primary.main,
            "&.Mui-checked": {
              color: theme.palette.primary.main,
            },
          }}
        />
      </TableCell>
      <TableCell component="th" scope="row" padding="none">
        <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2} sx={{ pl: isMobile ? 1 : 2, py: isMobile ? 1 : 2 }}> 
          {subCategoryThumbUrl ? (
            <Avatar
              src={subCategoryThumbUrl}
              alt={subCategory.name}
              sx={{
                width: isMobile ? 40 : 48,
                height: isMobile ? 40 : 48, 
                borderRadius: 2.5,
                boxShadow: `0 4px 12px 0 ${alpha(theme.palette.grey[900], 0.15)}`,
                border: `2px solid ${theme.palette.background.paper}`,
              }}
              imgProps={{
                onError: (e: any) => {
                  e.target.src = "/assets/images/placeholder.png"
                },
              }}
            />
          ) : (
            <Box
              sx={{
                width: isMobile ? 40 : 48, 
                height: isMobile ? 40 : 48, 
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.2)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                border: `2px solid ${alpha(theme.palette.info.main, 0.1)}`,
                boxShadow: `0 4px 12px 0 ${alpha(theme.palette.info.main, 0.15)}`,
              }}
            >
              <Iconify icon="solar:layers-bold" width={isMobile ? 24 : 32} height={isMobile ? 24 : 32} color="white" /> 
            </Box>
          )}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: isMobile ? "0.85rem" : "0.95rem", 
                lineHeight: 1.4,
                mb: 0.5,
              }}
            >
              {subCategory.name}
            </Typography>
            {subCategory.description && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: isMobile ? "0.7rem" : "0.8rem", 
                  maxWidth: isMobile ? 150 : 300, 
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {subCategory.description}
              </Typography>
            )}
          </Box>
        </Stack>
      </TableCell>
      <TableCell align="left" sx={{ py: isMobile ? 1 : 2, display: isTablet ? 'none' : 'table-cell' }}> 
        <Chip
          label={subCategory.Namecategory || "N/A"}
          size={isMobile ? "small" : "medium"} 
          sx={{
            height: isMobile ? 24 : 28, 
            borderRadius: 2,
            fontWeight: 600,
            fontSize: isMobile ? "0.7rem" : "0.75rem", 
            minWidth: isMobile ? 80 : 100, 
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.dark,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        />
      </TableCell>
      <TableCell align="left" sx={{ py: isMobile ? 1 : 2, display: isMobile ? 'none' : 'table-cell' }}> {/* Responsive padding, hide on mobile */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 0.5 : 1 }}> {/* Responsive gap */}
          {subCategory.attributes && subCategory.attributes.length > 0 ? (
            subCategory.attributes.slice(0, 2).map((attr, idx) => (
              <Chip
                key={idx}
                label={attr}
                size={isMobile ? "small" : "medium"} 
                sx={{
                  height: isMobile ? 20 : 24, 
                  borderRadius: 1.5,
                  fontWeight: 500,
                  fontSize: isMobile ? "0.65rem" : "0.7rem", 
                  backgroundColor: alpha(theme.palette.success.main, 0.12),
                  color: theme.palette.success.dark,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic" fontSize={isMobile ? "0.7rem" : "0.8rem"}> 
              Aucun attribut
            </Typography>
          )}
          {subCategory.attributes && subCategory.attributes.length > 2 && (
            <Typography variant="body2" color="text.secondary" fontSize={isMobile ? "0.65rem" : "0.75rem"} sx={{ alignSelf: "center", ml: 0.5 }}>
              +{subCategory.attributes.length - 2} autres
            </Typography>
          )}
        </Box>
      </TableCell>
      <TableCell align="right" sx={{ py: isMobile ? 1 : 2, pr: isMobile ? 1.5 : 3 }}> 
        <Stack direction="row" spacing={isMobile ? 0.5 : 1} justifyContent="flex-end">
          <Tooltip title="Détails" placement="top">
            <IconButton
              size={isMobile ? "small" : "medium"} 
              sx={{
                width: isMobile ? 32 : 36, 
                height: isMobile ? 32 : 36, 
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.08),
                color: theme.palette.info.main,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.info.main, 0.16),
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 12px 0 ${alpha(theme.palette.info.main, 0.3)}`,
                },
              }}
              onClick={(e) => {
                e.stopPropagation()
                onMore(subCategory) 
              }}
            >
              <Iconify icon="solar:eye-bold" width={isMobile ? 16 : 18} height={isMobile ? 16 : 18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier" placement="top">
            <IconButton
              size={isMobile ? "small" : "medium"}
              sx={{
                width: isMobile ? 32 : 36, 
                height: isMobile ? 32 : 36, 
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
                handleEdit(subCategory)
              }}
            >
              <Iconify icon="solar:pen-bold" width={isMobile ? 16 : 18} height={isMobile ? 16 : 18} /> 
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer" placement="top">
            <IconButton
              size={isMobile ? "small" : "medium"} 
              sx={{
                width: isMobile ? 32 : 36, 
                height: isMobile ? 32 : 36, 
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
                handleDelete(subCategory)
              }}
            >
              <Iconify icon="solar:trash-bin-minimalistic-bold" width={isMobile ? 16 : 18} height={isMobile ? 16 : 18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  )
}

interface SubCategoriesTableBodyProps {
  data: ISubCategory[]
  selected: string[]
  setSelected: (selected: string[]) => void
  onMore: (subCategory: ISubCategory) => void 
  handleEdit: (subCategory: ISubCategory) => void
  handleDelete: (subCategory: ISubCategory) => void
}

function SubCategoriesTableBody({
  data,
  selected,
  setSelected,
  onMore, 
  handleEdit,
  handleDelete,
}: SubCategoriesTableBodyProps) {
  return (
    <TableBody>
      {data.map((row, index) => (
        <SubCategoryItem
          key={row._id}
          subCategory={row}
          selected={selected}
          setSelected={setSelected}
          onMore={onMore} 
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          index={index}
        />
      ))}
    </TableBody>
  )
}

export default function SouCategories() {
  const theme = useTheme()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [subCategories, setSubCategories] = useState<ISubCategory[]>([])
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [selected, setSelected] = useState<string[]>([])
  const [orderBy, setOrderBy] = useState("name")
  const [filterName, setFilterName] = useState("")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allCategories, setAllCategories] = useState<ICategory[]>([])

  const getSouCat = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [subCategoriesRes, categoriesRes] = await Promise.all([SubCategoryAPI.get(), CategoryAPI.getCategories()])

      const categoryMap = new Map<string, string>()
      categoriesRes.forEach((cat: ICategory) => {
        categoryMap.set(cat._id, cat.name)
      })
      setAllCategories(categoriesRes)

      const populatedSubCategories: ISubCategory[] = subCategoriesRes.map((subCat: any) => ({
        ...subCat,
        Namecategory: categoryMap.get(subCat.category) || "N/A",
      }))

      setSubCategories(populatedSubCategories)
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError("Failed to load sub-categories or categories. Please try again.")
      enqueueSnackbar("Failed to load data", { variant: "error" })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar])

  useEffect(() => {
    getSouCat()
  }, [getSouCat])

  const handleDeleteSelectedSubCategories = useCallback(async () => {
    if (selected.length === 0) return

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer les ${selected.length} sous-catégories sélectionnées ?`)) {
      try {
        await Promise.all(selected.map((subCategoryId) => SubCategoryAPI.delete(subCategoryId)))
        enqueueSnackbar(`${selected.length} sous-catégories supprimées avec succès !`, { variant: "success" })
        getSouCat()
        setSelected([])
      } catch (error: any) {
        console.error("Error deleting selected sub-categories:", error)
        enqueueSnackbar(`Erreur lors de la suppression des sous-catégories: ${error.message || "Erreur inconnue"}`, {
          variant: "error",
        })
      }
    }
  }, [selected, enqueueSnackbar, getSouCat])

  
  const onMore = useCallback((subCategory: ISubCategory) => {
    navigate(`/dashboard/sous-categories/${subCategory._id}`); 
  }, [navigate])

  const handleEdit = useCallback(
    (subCategory: ISubCategory) => {
      navigate(`/dashboard/sous-categories/edit/${subCategory._id}`, { state: { subCategory } });
    },
    [navigate],
  )

  const handleDelete = useCallback(
    async (subCategory: ISubCategory) => {
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${subCategory.name}" ?`)) {
        try {
          await SubCategoryAPI.delete(subCategory._id)
          enqueueSnackbar("Sous-catégorie supprimée avec succès !", { variant: "success" })
          getSouCat()
          setSelected((prev) => prev.filter((id) => id !== subCategory._id))
        } catch (error: any) {
          console.error("Error deleting sub-category:", error)
          enqueueSnackbar(`Erreur lors de la suppression: ${error.message || "Erreur inconnue"}`, { variant: "error" })
        }
      }
    },
    [enqueueSnackbar, getSouCat, setSelected],
  )

  return (
    <Page title="Sub-Categories">
      <Container
        maxWidth="xl"
        sx={{
          pt: { xs: 2, sm: 4 }, 
          pb: { xs: 3, sm: 6 }, 
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.8)} 0%, ${alpha(theme.palette.grey[100], 0.4)} 100%)`,
        }}
      >
        <Box sx={{ mb: { xs: 3, sm: 5 } }}> 
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: { xs: 1, sm: 1 } }} spacing={isMobile ? 2 : 0}> {/* Responsive direction, alignment, margin, and spacing */}
            <Stack direction="row" alignItems="center" spacing={isMobile ? 1.5 : 3}>
              <Box
                sx={{
                  width: isMobile ? 50 : 64, 
                  height: isMobile ? 50 : 64, 
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.info.main, 0.3)}`,
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: 3,
                    padding: "2px",
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.8)}, ${alpha(theme.palette.info.main, 0.2)})`,
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  },
                }}
              >
                <Iconify icon="solar:layers-bold" width={isMobile ? 28 : 32} height={isMobile ? 28 : 32} color="white" /> 
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
                  Sous-Catégories
                </Typography>
                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontWeight: 500 }}>
                  Gérez vos sous-catégories et leurs attributs
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"} 
              startIcon={<AddIcon />}
              onClick={() => navigate("/dashboard/sous-categories/add")}
              sx={{
                borderRadius: 3,
                px: isMobile ? 2 : 4, 
                py: isMobile ? 1 : 1.5, 
                fontWeight: 700,
                fontSize: isMobile ? "0.85rem" : "1rem", 
                textTransform: "none",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 24px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 32px 0 ${alpha(theme.palette.primary.main, 0.5)}`, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                },
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Nouvelle Sous-Catégorie
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: { xs: 2, sm: 3 }, 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              fontSize: isMobile ? '0.8rem' : 'inherit', 
            }}
          >
            {error}
          </Alert>
        )}

        <MuiTable
          data={subCategories}
          columns={TABLE_HEAD}
          TableBodyComponent={(props) => (
            <SubCategoriesTableBody
              {...props}
              onMore={onMore} 
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
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
          searchFields={["name", "Namecategory"]}
          numSelected={selected.length}
          onDeleteSelected={handleDeleteSelectedSubCategories}
          loading={loading}
        />
      </Container>
    </Page>
  )
}