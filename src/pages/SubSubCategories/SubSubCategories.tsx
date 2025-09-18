// src/pages/SubSubCategories/SubSubCategoriesPage.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Card,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  alpha,
  useTheme,
  Paper,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  TableHead,
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useSnackbar } from "notistack"
import Iconify from "@/components/Iconify"
import Page from "@/components/Page"
import Scrollbar from "@/components/Scrollbar"

import { SubSubCategoryAPI } from "../../api/SubSubCategory"
import type ISubSubCategory from "@/types/SubSubCategory"
import type { ISubSubCategory as ISubSubCategoryType } from "../../types/SubSubCategory"
import useMediaQuery from '@mui/material/useMediaQuery';

const TABLE_HEAD = [
  { id: "name", label: "Nom", align: "left" },
  { id: "subcategory", label: "Sous-Catégorie Parente", align: "left" },
  { id: "description", label: "Description", align: "left" },
  { id: "attributes", label: "Attributs", align: "left" },
  { id: "actions", label: "Actions", align: "center" },
]

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

export default function SubSubCategoriesPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [subSubCategories, setSubSubCategories] = useState<ISubSubCategoryType[]>([])
  const [filteredSubSubCategories, setFilteredSubSubCategories] = useState<ISubSubCategoryType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [orderBy, setOrderBy] = useState("name")
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subSubCategoryToDelete, setSubSubCategoryToDelete] = useState<ISubSubCategoryType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchSubSubCategories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await SubSubCategoryAPI.get()
      setSubSubCategories(data)
      setFilteredSubSubCategories(data)
    } catch (err: any) {
      console.error("Error fetching sub-sub-categories:", err)
      setError(err.message || "Failed to load sub-sub-categories")
      enqueueSnackbar("Erreur lors du chargement des sous-sous-catégories", { variant: "error" })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar])

  useEffect(() => {
    fetchSubSubCategories()
  }, [fetchSubSubCategories])

  useEffect(() => {
    let result = subSubCategories

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      result = result.filter(
        (subSubCategory) =>
          subSubCategory.name.toLowerCase().includes(lowerCaseQuery) ||
          (subSubCategory.description && subSubCategory.description.toLowerCase().includes(lowerCaseQuery)) ||
          (subSubCategory.attributes && subSubCategory.attributes.some(attr => attr.toLowerCase().includes(lowerCaseQuery)))
      )
    }

    result = result.sort((a, b) => {
      if (order === "asc") {
        return a[orderBy as keyof ISubSubCategoryType] > b[orderBy as keyof ISubSubCategoryType] ? 1 : -1
      } else {
        return a[orderBy as keyof ISubSubCategoryType] < b[orderBy as keyof ISubSubCategoryType] ? 1 : -1
      }
    })

    setFilteredSubSubCategories(result)
  }, [searchQuery, subSubCategories, orderBy, order])

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(0)
  }

  const handleDeleteClick = (subSubCategory: ISubSubCategoryType) => {
    setSubSubCategoryToDelete(subSubCategory)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!subSubCategoryToDelete) return

    setIsDeleting(true)
    try {
      await SubSubCategoryAPI.delete(subSubCategoryToDelete._id)
      enqueueSnackbar(`Sous-sous-catégorie "${subSubCategoryToDelete.name}" supprimée avec succès`, {
        variant: "success",
      })
      setSubSubCategories(subSubCategories.filter((cat) => cat._id !== subSubCategoryToDelete._id))
    } catch (err: any) {
      console.error("Error deleting sub-sub-category:", err)
      enqueueSnackbar(`Erreur lors de la suppression: ${err.message}`, { variant: "error" })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSubSubCategoryToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSubSubCategoryToDelete(null)
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredSubSubCategories.length) : 0

  const getSubSubCategoryIcon = (name: string): string => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("electronique")) return "solar:display-bold"
    if (lowerName.includes("smartphone")) return "solar:smartphone-bold"
    if (lowerName.includes("ordinateur")) return "solar:laptop-bold"
    if (lowerName.includes("vetement")) return "solar:hanger-bold"
    if (lowerName.includes("chaussure")) return "solar:shoes-bold"
    if (lowerName.includes("accessoire")) return "solar:bag-bold"
    if (lowerName.includes("nourriture")) return "solar:bowl-bold"
    if (lowerName.includes("boisson")) return "solar:cup-bold"
    if (lowerName.includes("maison")) return "solar:home-smile-angle-bold"
    if (lowerName.includes("cuisine")) return "solar:chef-hat-bold"
    return "solar:layers-bold"
  }

  // Simple table head component
  function SubSubCategoryListHead({ order, orderBy, headLabel, onRequestSort, rowCount }: any) {
    return (
      <TableHead>
        <TableRow>
          {headLabel.map((headCell: any) => (
            <TableCell
              key={headCell.id}
              align={headCell.align}
              sortDirection={orderBy === headCell.id ? order : false}
              onClick={() => onRequestSort(headCell.id)}
              sx={{ cursor: 'pointer', fontWeight: 'bold' }}
            >
              {headCell.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    )
  }

  // Simple more menu component
  function SubSubCategoryMoreMenu({ onDelete }: any) {
    return (
      <Tooltip title="Supprimer">
        <IconButton
          onClick={onDelete}
          size={isMobile ? "small" : "medium"}
          sx={{
            color: "error.main",
            "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.1) },
          }}
        >
          <Iconify icon="eva:trash-2-fill" width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} />
        </IconButton>
      </Tooltip>
    )
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress color="primary" size={isMobile ? 40 : 60} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container sx={{ mt: { xs: 2, sm: 4 } }}>
        <Alert severity="error" sx={{ fontSize: isMobile ? '0.8rem' : 'inherit' }}>
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Page title="Sous-Sous-Catégories">
      <style>{floatAnimation}</style>
      <style>{gradientShift}</style>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={isMobile ? 2 : 0} mb={{ xs: 2, sm: 3 }}>
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
              <Iconify width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} icon="solar:layers-bold" color={theme.palette.info.main} />
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
              Gestion des Sous-Sous-Catégories
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => navigate("/dashboard/sous-sous-categories/create")}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              borderRadius: 1.5,
              background: (theme) =>
                `linear-gradient(45deg, ${theme.palette.success.light} 30%, ${theme.palette.success.main} 90%)`,
              boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.success.main, 0.34)}`,
              px: isMobile ? 2 : 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              "&:hover": {
                boxShadow: (theme) => `0 8px 20px 0 ${alpha(theme.palette.success.main, 0.4)}`,
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                transform: 'translateY(-2px) scale(1.02)',
              },
              width: isMobile ? '100%' : 'auto',
            }}
          >
            Nouvelle Sous-Sous-Catégorie
          </Button>
        </Stack>

        <Fade in={true} timeout={800}>
          <Card
            sx={{
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
            {/* Simplified search field */}
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <TextField
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher une sous-sous-catégorie..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" />
                    </InputAdornment>
                  ),
                }}
                size={isMobile ? "small" : "medium"}
                sx={{ width: { xs: "100%", sm: 300 } }}
              />
            </Box>

            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <SubSubCategoryListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    onRequestSort={handleRequestSort}
                    rowCount={filteredSubSubCategories.length}
                  />
                  <TableBody>
                    {filteredSubSubCategories
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((subSubCategory) => {
                        const { _id, name, description, attributes, subcategory } = subSubCategory

                        return (
                          <TableRow hover key={_id} tabIndex={-1}>
                            <TableCell sx={{ pl: { xs: 1, sm: 3 } }}>
                              <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2}>
                                <Avatar
                                  sx={{
                                    width: isMobile ? 32 : 40,
                                    height: isMobile ? 32 : 40,
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    color: theme.palette.info.main,
                                  }}
                                >
                                  <Iconify icon={getSubSubCategoryIcon(name)} width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} />
                                </Avatar>
                                <Typography variant={isMobile ? "body2" : "subtitle2"} noWrap>
                                  {name}
                                </Typography>
                              </Stack>
                            </TableCell>

                            <TableCell align="left">
                              <Chip
                                label={typeof subcategory === 'object' ? subcategory.name : subcategory || "N/A"}
                                size={isMobile ? "small" : "medium"}
                                variant="outlined"
                                color="primary"
                                sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                              />
                            </TableCell>

                            <TableCell align="left">
                              <Typography
                                variant={isMobile ? "body2" : "body2"}
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  color: "text.secondary",
                                }}
                              >
                                {description || "Aucune description"}
                              </Typography>
                            </TableCell>

                            <TableCell align="left">
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {attributes && attributes.length > 0 ? (
                                  attributes.slice(0, 2).map((attr, index) => (
                                    <Chip
                                      key={index}
                                      label={attr}
                                      size={isMobile ? "small" : "medium"}
                                      color="secondary"
                                      sx={{ mb: 0.5, fontSize: isMobile ? '0.6rem' : '0.7rem' }}
                                    />
                                  ))
                                ) : (
                                  <Typography variant={isMobile ? "caption" : "body2"} color="text.disabled">
                                    Aucun
                                  </Typography>
                                )}
                                {attributes && attributes.length > 2 && (
                                  <Tooltip title={attributes.slice(2).join(", ")}>
                                    <Chip
                                      label={`+${attributes.length - 2}`}
                                      size={isMobile ? "small" : "medium"}
                                      variant="outlined"
                                      sx={{ fontSize: isMobile ? '0.6rem' : '0.7rem' }}
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>

                            <TableCell align="center" sx={{ pr: { xs: 1, sm: 3 } }}>
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                <Tooltip title="Voir les détails">
                                  <IconButton
                                    onClick={() => navigate(`/dashboard/sous-sous-categories/${_id}`)}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                      color: "info.main",
                                      "&:hover": { bgcolor: alpha(theme.palette.info.main, 0.1) },
                                    }}
                                  >
                                    <Iconify icon="eva:eye-fill" width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Modifier">
                                  <IconButton
                                    onClick={() => navigate(`/dashboard/sous-sous-categories/edit/${_id}`, { state: { subSubCategory } })}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                      color: "warning.main",
                                      "&:hover": { bgcolor: alpha(theme.palette.warning.main, 0.1) },
                                    }}
                                  >
                                    <Iconify icon="eva:edit-fill" width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} />
                                  </IconButton>
                                </Tooltip>
                                <SubSubCategoryMoreMenu
                                  onDelete={() => handleDeleteClick(subSubCategory)}
                                />
                              </Stack>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredSubSubCategories.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                },
              }}
            />
          </Card>
        </Fade>

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="mdi:alert-circle-outline" color="error.main" />
              <Typography variant="h6">Confirmer la suppression</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer la sous-sous-catégorie "{subSubCategoryToDelete?.name}" ? Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={isDeleting}>
              Annuler
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={16} /> : <Iconify icon="mdi:delete-outline" />}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  )
}