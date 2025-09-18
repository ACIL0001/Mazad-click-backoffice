"use client"
import type React from "react"
import DeleteIcon from "@mui/icons-material/Delete"
import {
  Card,
  Table,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  TextField,
  Box,
  InputAdornment,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Button,
  Checkbox,
  TableHead,
  TableSortLabel,
  Skeleton,
  TableBody,
  Chip,
  Fade,
  Zoom,
  Divider,
  Fab,
  Badge,
  Tooltip,
  Slide,
  Portal,
  Collapse,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { alpha, useTheme, styled } from "@mui/material/styles"
import { filter } from "lodash"
import { useState, useEffect, useRef, useCallback } from "react"
import { visuallyHidden } from "@mui/utils"
import useMediaQuery from '@mui/material/useMediaQuery';

// components
import Scrollbar from "../Scrollbar"
import SearchNotFound from "../SearchNotFound"
import Iconify from "@/components/Iconify"

const FloatingDeleteButton = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: 24,
  right: 24,
  zIndex: 1300,
  backgroundColor: theme.palette.error.main,
  color: 'white',
  boxShadow: theme.shadows[12],
  width: 64,
  height: 64,
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[16],
  },
  "&:active": {
    transform: "translateY(0)",
  },
}))

const InlineActionBar = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 100,
  backgroundColor: alpha(theme.palette.error.main, 0.08),
  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
  borderRadius: theme.spacing(2),
  margin: theme.spacing(2),
  padding: theme.spacing(2, 3),
  boxShadow: theme.shadows[2],
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
  },
}))

const RowActionButtons = ({
  isSelected,
  onDelete,
  rowId,
}: {
  isSelected: boolean
  onDelete: (id: string) => void
  rowId: string
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Collapse in={isSelected} orientation="horizontal">
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-end' : 'center',
          ml: isMobile ? 0 : 2,
          mt: isMobile ? 1 : 0,
        }}
      >
        <Tooltip title="Supprimer cet élément" placement="top">
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(rowId)
            }}
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "none",
              boxShadow: theme.shadows[2],
              transition: theme.transitions.create(['transform', 'box-shadow'], {
                duration: theme.transitions.duration.short,
              }),
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: theme.shadows[4],
              },
              ...(isMobile && {
                width: '100%',
                fontSize: '0.85rem',
                py: 1.2,
              }),
            }}
          >
            Supprimer
          </Button>
        </Tooltip>
      </Box>
    </Collapse>
  )
}

const ModernCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  boxShadow: theme.shadows[4],
  overflow: "hidden",
  transition: theme.transitions.create(['box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    boxShadow: theme.shadows[8],
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
  },
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    boxShadow: theme.shadows[1],
    transition: theme.transitions.create(['border-color', 'box-shadow'], {
      duration: theme.transitions.duration.short,
    }),
    "&:hover": {
      borderColor: alpha(theme.palette.primary.main, 0.3),
      boxShadow: theme.shadows[2],
    },
    "&.Mui-focused": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    "&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      border: 'none',
    },
  },
  [theme.breakpoints.down('sm')]: {
    "& .MuiOutlinedInput-root": {
      borderRadius: theme.spacing(1.5),
    },
  },
}));

const ModernButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  textTransform: "none",
  padding: theme.spacing(1.5, 3),
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[4],
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 2),
    fontSize: "0.9rem",
    borderRadius: theme.spacing(1.5),
  },
}));

export function descendingComparator(a: any, b: any, orderBy: string) {
  if (b[orderBy] == null && a[orderBy] == null) return 0
  if (b[orderBy] == null) return -1
  if (a[orderBy] == null) return 1

  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

export function getComparator(order: "asc" | "desc", orderBy: string) {
  return order === "desc"
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy)
}

export function applyUserSortFilter(
  array: any[] | undefined | null,
  comparator: (a: any, b: any) => number,
  query: string,
  searchFields: string[] = [],
) {
  const safeArray = Array.isArray(array) ? array : []

  const stabilizedThis = safeArray.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })

  if (query && searchFields.length > 0) {
    return filter(safeArray, (obj) => {
      return searchFields.some((field) => {
        let value
        if (field.includes("user.")) {
          const userField = field.replace("user.", "")
          value = obj.user?.[userField]
        } else {
          value = field.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj)
        }

        if (value == null) return false

        const stringValue = String(value).toLowerCase()
        const searchQuery = query.toLowerCase().trim()

        return stringValue.includes(searchQuery)
      })
    })
  }

  return stabilizedThis.map((el) => el[0])
}

export function applySortFilter(
  array: any[] | undefined | null,
  comparator: (a: any, b: any) => number,
  query: string,
  searchFields: string[] = [],
) {
  const safeArray = Array.isArray(array) ? array : []

  const stabilizedThis = safeArray.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })

  if (query && searchFields.length > 0) {
    return filter(safeArray, (obj) => {
      return searchFields.some((field) => {
        const value = field.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj)

        if (value == null) return false

        const stringValue = String(value).toLowerCase()
        const searchQuery = query.toLowerCase().trim()

        return stringValue.includes(searchQuery)
      })
    })
  }

  return stabilizedThis.map((el) => el[0])
}

interface MuiTableProps {
  data: any[] | undefined | null
  columns: { id: string; label?: string; alignRight?: boolean; searchable?: boolean }[]
  TableBodyComponent: React.ComponentType<{
    data: any[]
    selected: string[]
    setSelected: (selected: string[]) => void
    onDeleteSingle?: (id: string) => void
  }>
  page: number
  setPage: (page: number) => void
  order: "asc" | "desc"
  setOrder: (order: "asc" | "desc") => void
  orderBy: string
  setOrderBy: (orderBy: string) => void
  selected: string[]
  setSelected: (selected: string[]) => void
  filterName: string
  setFilterName: (filterName: string) => void
  rowsPerPage: number
  setRowsPerPage: (rowsPerPage: number) => void
  searchFields?: string[]
  numSelected: number
  onDeleteSelected?: () => void
  loading: boolean
  actionButtonPosition?: "floating" | "sticky" | "inline" | "all"
}

export default function MuiTable({
  data,
  columns,
  TableBodyComponent,
  page,
  setPage,
  order,
  setOrder,
  orderBy,
  setOrderBy,
  selected,
  setSelected,
  filterName,
  setFilterName,
  rowsPerPage,
  setRowsPerPage,
  searchFields = [],
  numSelected,
  onDeleteSelected,
  loading,
  actionButtonPosition = "sticky",
}: MuiTableProps) {
  const theme = useTheme()
  const tableRef = useRef<HTMLDivElement>(null)
  const [showFloatingButton, setShowFloatingButton] = useState(false)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery('(max-width:375px)');

  const safeData = Array.isArray(data) ? data : []
  const safeColumns = Array.isArray(columns) ? columns : []

  const allSearchFields = safeColumns.filter((col) => col.searchable !== false && col.id).map((col) => col.id)
  const defaultSearchField = searchFields.length > 0 && searchFields[0] ? searchFields[0] : allSearchFields[0] || ""
  const [searchField, setSearchField] = useState(defaultSearchField)

  const tableMinWidth = isSmallMobile ? 650 : isMobile ? 700 : isTablet ? 900 : 1000;

  // Handle floating button visibility
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFloatingButton(numSelected > 0)
    }, 100)
    return () => clearTimeout(timer)
  }, [numSelected])

  useEffect(() => {
    if (defaultSearchField && defaultSearchField !== searchField) {
      setSearchField(defaultSearchField)
    }
  }, [defaultSearchField, searchField])

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = safeData.map((n: any) => n._id)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value)
    setPage(0)
  }

  const handleDeleteSingle = useCallback(
    (id: string) => {
      setSelected(selected.filter((selectedId) => selectedId !== id))
      console.log("Delete single item:", id)
    },
    [selected, setSelected],
  )

  const filteredData = applySortFilter(safeData, getComparator(order, orderBy), filterName, [searchField])
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const isNotFound = !loading && filteredData.length === 0 && filterName !== ""
  const isTableEmpty = !loading && filteredData.length === 0 && filterName === ""

  return (
    <>
      <ModernCard ref={tableRef}>

        {(actionButtonPosition === "sticky" || actionButtonPosition === "all") && numSelected > 0 && (
          <Slide direction="down" in={numSelected > 0} mountOnEnter unmountOnExit>
            <InlineActionBar>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={{ xs: 2, sm: 0 }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: theme.palette.error.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: { xs: 1, sm: 2 },
                      boxShadow: theme.shadows[2],
                    }}
                  >
                    <Iconify icon="solar:trash-bin-minimalistic-bold" width={24} height={24} color="white" />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.error.main,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        mb: 0.5,
                      }}
                    >
                      {numSelected} élément{numSelected > 1 ? "s" : ""} sélectionné{numSelected > 1 ? "s" : ""}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.error.dark, fontWeight: 500, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                      Action de suppression disponible
                    </Typography>
                  </Box>
                </Stack>
                <ModernButton
                  variant="contained"
                  color="error"
                  size={isMobile ? "small" : "medium"}
                  startIcon={<DeleteIcon />}
                  onClick={onDeleteSelected}
                  sx={{
                    backgroundColor: theme.palette.error.main,
                    "&:hover": {
                      backgroundColor: theme.palette.error.dark,
                    },
                    width: { xs: '100%', sm: 'auto' },
                    mt: { xs: 2, sm: 0 },
                  }}
                >
                  Supprimer ({numSelected})
                </ModernButton>
              </Stack>
            </InlineActionBar>
          </Slide>
        )}

        {/* Search Section */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={{ xs: 3, sm: 4 }}>

            <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2, md: 3 }} alignItems={{ xs: "stretch", md: "center" }}>
              <ModernTextField
                fullWidth
                value={filterName}
                onChange={handleFilterByName}
                placeholder="Rechercher dans le tableau..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          borderRadius: 2,
                          backgroundColor: theme.palette.primary.main,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: { xs: 1, sm: 2 },
                          boxShadow: theme.shadows[1],
                        }}
                      >
                        <SearchIcon sx={{ color: "white", width: { xs: 20, sm: 24 }, height: { xs: 20, sm: 24 } }} />
                      </Box>
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: { md: 500 } }}
              />

              {allSearchFields.length > 1 && (
                <FormControl sx={{ minWidth: { xs: '100%', sm: 250 } }}>
                  <InputLabel
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    Rechercher dans
                  </InputLabel>
                  <Select
                    value={searchField}
                    onChange={(e) => {
                      setSearchField(e.target.value as string)
                      setPage(0)
                    }}
                    label="Rechercher dans"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      boxShadow: theme.shadows[1],
                      "&:hover": {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      },
                      "&.Mui-focused": {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: 'none',
                      },
                    }}
                  >
                    {allSearchFields.map((field) => {
                      const column = safeColumns.find((col) => col.id === field)
                      return (
                        <MenuItem key={field} value={field}>
                          {column?.label || field.split(".").join(" ")}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              )}

              <Chip
                label={`${filteredData.length} résultat${filteredData.length !== 1 ? "s" : ""}`}
                sx={{
                  height: { xs: 48, sm: 56 },
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  backgroundColor: theme.palette.info.main,
                  color: "white",
                  boxShadow: theme.shadows[2],
                  "& .MuiChip-label": {
                    px: { xs: 2, sm: 3 },
                  },
                  width: { xs: '100%', md: 'auto' },
                }}
              />
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ mx: { xs: 2, sm: 3, md: 4 } }} />

        {/* Table */}
        <Scrollbar>
          <TableContainer sx={{ minWidth: tableMinWidth }}>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: alpha(theme.palette.grey[100], 0.8),
                    "& .MuiTableCell-head": {
                      fontWeight: 700,
                      fontSize: { xs: "0.8rem", sm: "0.95rem" },
                      color: theme.palette.text.primary,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: { xs: 2, sm: 3 },
                      borderBottom: `2px solid ${theme.palette.divider}`,
                    },
                  }}
                >
                  <TableCell padding="checkbox" sx={{ pl: { xs: 2, sm: 4 } }}>
                    <Checkbox
                      indeterminate={numSelected > 0 && numSelected < filteredData.length}
                      checked={numSelected === filteredData.length && filteredData.length > 0}
                      onChange={handleSelectAllClick}
                      disabled={safeData.length === 0 && !loading}
                      sx={{
                        color: theme.palette.text.secondary,
                        "&.Mui-checked": {
                          color: theme.palette.primary.main,
                        },
                        "&.MuiCheckbox-indeterminate": {
                          color: theme.palette.primary.main,
                        },
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    />
                  </TableCell>
                  {safeColumns.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.alignRight ? "right" : "left"}
                      sortDirection={orderBy === headCell.id ? order : false}
                      sx={{
                        ...(headCell.alignRight && { pr: { xs: 2, sm: 4 } }),
                        ...(isMobile && (headCell.id === 'type' || headCell.id === 'actions') && { display: 'none' }),
                      }}
                    >
                      <TableSortLabel
                        hideSortIcon
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
                        onClick={(event) => handleRequestSort(event, headCell.id)}
                        sx={{
                          color: `${theme.palette.text.primary} !important`,
                          "&:hover": {
                            color: `${theme.palette.primary.main} !important`,
                          },
                          "&.Mui-active": {
                            color: `${theme.palette.primary.main} !important`,
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              fontSize: { xs: "0.8rem", sm: "0.95rem" },
                              color: "inherit",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {headCell.label}
                          </Typography>
                          {orderBy === headCell.id && (
                            <Box
                              sx={{
                                width: { xs: 20, sm: 24 },
                                height: { xs: 20, sm: 24 },
                                borderRadius: 1,
                                backgroundColor: theme.palette.primary.main,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: theme.shadows[1],
                              }}
                            >
                              <Iconify
                                icon={order === "desc" ? "solar:arrow-down-bold" : "solar:arrow-up-bold"}
                                width={isMobile ? 12 : 14}
                                height={isMobile ? 12 : 14}
                                color="white"
                              />
                            </Box>
                          )}
                        </Stack>
                        {orderBy === headCell.id ? (
                          <Box sx={{ ...visuallyHidden }}>
                            {order === "desc" ? "sorted descending" : "sorted ascending"}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              {loading ? (
                <TableBody>
                  {[...Array(rowsPerPage)].map((_, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:nth-of-type(even)": {
                          backgroundColor: alpha(theme.palette.grey[50], 0.5),
                        },
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: { xs: 2, sm: 4 } }}>
                        <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: 1 }} />
                      </TableCell>
                      {safeColumns.map((col, colIndex) => (
                        <TableCell
                          key={col.id + index}
                          sx={{
                            py: { xs: 2, sm: 3 },
                            ...(isMobile && (col.id === 'type' || col.id === 'actions') && { display: 'none' }),
                          }}
                        >
                          {colIndex === 0 ? (
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Skeleton variant="rectangular" width={isMobile ? 40 : 48} height={isMobile ? 40 : 48} sx={{ borderRadius: 1 }} />
                              <Box>
                                <Skeleton variant="text" width={isMobile ? 120 : 180} height={isMobile ? 20 : 24} sx={{ mb: 0.5 }} />
                                <Skeleton variant="text" width={isMobile ? 80 : 120} height={isMobile ? 16 : 18} />
                              </Box>
                            </Stack>
                          ) : colIndex === safeColumns.length - 1 ? (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Skeleton variant="rectangular" width={isMobile ? 32 : 36} height={isMobile ? 32 : 36} sx={{ borderRadius: 1 }} />
                              <Skeleton variant="rectangular" width={isMobile ? 32 : 36} height={isMobile ? 32 : 36} sx={{ borderRadius: 1 }} />
                            </Stack>
                          ) : (
                            <Skeleton variant="rectangular" width={isMobile ? 80 : 120} height={isMobile ? 28 : 32} sx={{ borderRadius: 1 }} />
                          )}
                        </TableCell>
                      ))}
                      {(actionButtonPosition === "inline" || actionButtonPosition === "all") && (
                        <TableCell align="right" sx={{ pr: { xs: 2, sm: 4 } }}>
                          <Skeleton variant="rectangular" width={isMobile ? 80 : 100} height={isMobile ? 28 : 32} sx={{ borderRadius: 1 }} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              ) : TableBodyComponent ? (
                <TableBodyComponent
                  data={paginatedData}
                  selected={selected}
                  setSelected={setSelected}
                  onDeleteSingle={
                    actionButtonPosition === "inline" || actionButtonPosition === "all" ? handleDeleteSingle : undefined
                  }
                />
              ) : null}

              {!loading && (isNotFound || isTableEmpty) && (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={
                        safeColumns.length +
                        1 +
                        (actionButtonPosition === "inline" || actionButtonPosition === "all" ? 1 : 0)
                      }
                      sx={{ py: { xs: 8, sm: 12 }, textAlign: "center", borderBottom: "none" }}
                    >
                      <Fade in={true}>
                        <Box>
                          <SearchNotFound searchQuery={filterName} />
                        </Box>
                      </Fade>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        {/* Pagination */}
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: alpha(theme.palette.grey[50], 0.5),
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              "& .MuiTablePagination-toolbar": {
                px: 0,
                py: { xs: 1, sm: 2 },
                minHeight: { xs: 52, sm: 64 },
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                gap: { xs: 2, sm: 0 },
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                fontWeight: 600,
                fontSize: { xs: "0.85rem", sm: "1rem" },
                color: theme.palette.text.primary,
                mb: { xs: 0, sm: 0 },
              },
              "& .MuiTablePagination-select": {
                borderRadius: 1.5,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                fontWeight: 600,
                padding: { xs: "8px 12px", sm: "10px 14px" },
                boxShadow: theme.shadows[1],
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                },
                "&:focus": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              },
              "& .MuiTablePagination-actions": {
                mt: { xs: 0, sm: 0 },
                "& button": {
                  borderRadius: 1.5,
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  margin: { xs: "0 2px", sm: "0 4px" },
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: theme.shadows[1],
                  transition: theme.transitions.create(['border-color', 'background-color'], {
                    duration: theme.transitions.duration.short,
                  }),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-disabled": {
                    borderColor: alpha(theme.palette.divider, 0.5),
                    color: theme.palette.text.disabled,
                    backgroundColor: alpha(theme.palette.grey[100], 0.5),
                  },
                },
              },
            }}
          />
        </Box>
      </ModernCard>

      {/* Floating Action Button */}
      {(actionButtonPosition === "floating" || actionButtonPosition === "all") && (
        <Portal>
          <Zoom in={showFloatingButton} timeout={200}>
            <Tooltip title={`Supprimer ${numSelected} élément${numSelected > 1 ? "s" : ""}`} placement="left">
              <Badge
                badgeContent={numSelected}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    fontWeight: 700,
                    minWidth: { xs: 20, sm: 24 },
                    height: { xs: 20, sm: 24 },
                    borderRadius: 1.5,
                    backgroundColor: theme.palette.error.main,
                    color: 'white',
                    border: `2px solid ${theme.palette.background.paper}`,
                  },
                }}
              >
                <FloatingDeleteButton
                  onClick={onDeleteSelected}
                  aria-label={`Supprimer ${numSelected} éléments sélectionnés`}
                  sx={{
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </FloatingDeleteButton>
              </Badge>
            </Tooltip>
          </Zoom>
        </Portal>
      )}
    </>
  )
}