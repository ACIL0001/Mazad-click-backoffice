// AcceptedSellers.tsx - Updated to use IdentityDocument from API
"use client"
import { sentenceCase } from "change-case"
import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import {
  Stack,
  Avatar,
  Typography,
  Chip,
  Box,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Tooltip,
  Checkbox,
  alpha,
  useTheme,
} from "@mui/material"

import Iconify from "@/components/Iconify"
import { useSnackbar } from "notistack"
import MuiTable from "../../components/Tables/MuiTable"
import { IdentityDocument } from "@/api/identity" // Import from API

interface AcceptedSellersProps {
  acceptedSellers: IdentityDocument[]
  onOpenVerificationModal: (identity: IdentityDocument) => void
  onDeleteSellers: (ids: string[]) => void; 
}

const TABLE_HEAD = [
  { id: "user", label: "Utilisateur", alignRight: false, searchable: true },
  { id: "email", label: "Email", alignRight: false, searchable: true },
  { id: "type", label: "Type", alignRight: false, searchable: false },
  { id: "status", label: "Statut", alignRight: false, searchable: false },
  { id: "createdAt", label: "Créé le", alignRight: false, searchable: false },
  { id: "actions", label: "Actions", alignRight: true, searchable: false },
]

interface SellerItemProps {
  seller: IdentityDocument
  selected: string[]
  setSelected: (selected: string[]) => void
  onOpenVerificationModal: (identity: IdentityDocument) => void
  onNavigateToDetails: (id: string) => void
}

function SellerItem({ seller, selected, setSelected, onOpenVerificationModal, onNavigateToDetails }: SellerItemProps) {
  const theme = useTheme()

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

  const isItemSelected = selected.indexOf(seller._id) !== -1
  const user = seller.user
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim()

  const getStatusColor = () => {
    if (seller.status === 'REJECTED') return "error"
    if (seller.status === 'DONE') return "success"
    if (seller.status === 'WAITING') return "warning"
    return "default"
  }

  const getStatusText = () => {
    switch (seller.status) {
      case 'DONE': return "Accepté"
      case 'WAITING': return "En attente"
      case 'REJECTED': return "Rejeté"
      default: return "Non défini"
    }
  }

  const getUserType = () => {
    if (user?.type) return sentenceCase(user.type)
    return "Utilisateur"
  }

  const formatDate = (date?: Date | string) => {
    if (!date) return "N/A"
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <TableRow
      hover
      key={seller._id}
      tabIndex={-1}
      role="checkbox"
      selected={isItemSelected}
      onClick={() => onNavigateToDetails(seller._id)}
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
      <TableCell padding="checkbox" sx={{ pl: 3 }}>
        <Checkbox
          checked={isItemSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => handleCheckboxClick(seller._id)}
          sx={{
            color: theme.palette.primary.main,
            "&.Mui-checked": {
              color: theme.palette.primary.main,
            },
          }}
        />
      </TableCell>
      <TableCell component="th" scope="row" padding="none">
        <Stack direction="row" alignItems="center" spacing={2} sx={{ pl: 2, py: 2 }}>
          <Avatar
            src={user?.avatarUrl}
            alt={fullName}
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              boxShadow: `0 4px 12px 0 ${alpha(theme.palette.grey[900], 0.15)}`,
              border: `2px solid ${theme.palette.background.paper}`,
            }}
          >
            {fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: "0.95rem",
                lineHeight: 1.4,
                mb: 0.5,
              }}
            >
              {fullName || "Nom non disponible"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.8rem",
              }}
            >
              ID: {user?._id || "N/A"}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell align="left" sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.primary,
            fontSize: "0.875rem",
          }}
        >
          {user?.email || "Email non disponible"}
        </Typography>
      </TableCell>
      <TableCell align="left" sx={{ py: 2 }}>
        <Chip
          label={getUserType()}
          size="small"
          sx={{
            height: 28,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: "0.75rem",
            minWidth: 80,
            backgroundColor: alpha(theme.palette.info.main, 0.12),
            color: theme.palette.info.dark,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        />
      </TableCell>
      <TableCell align="left" sx={{ py: 2 }}>
        <Chip
          label={getStatusText()}
          size="small"
          color={getStatusColor() as any}
          sx={{
            height: 28,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: "0.75rem",
            minWidth: 80,
          }}
        />
      </TableCell>
      <TableCell align="left" sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "0.875rem",
          }}
        >
          {formatDate(seller.createdAt)}
        </Typography>
      </TableCell>
      <TableCell align="right" sx={{ py: 2, pr: 3 }}>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="Aller aux détails" placement="top">
            <IconButton
              size="small"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.16),
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
                },
              }}
              onClick={(e) => {
                e.stopPropagation()
                onNavigateToDetails(seller._id)
              }}
            >
              <Iconify icon="solar:arrow-right-bold" width={18} height={18} />
            </IconButton>
          </Tooltip>
          {user?.isVerified && (
            <Tooltip title="Utilisateur vérifié" placement="top">
              <IconButton
                size="small"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.success.main, 0.08),
                  color: theme.palette.success.main,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                <Iconify icon="solar:check-circle-bold" width={18} height={18} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  )
}

interface SellersTableBodyProps {
  data: IdentityDocument[]
  selected: string[]
  setSelected: (selected: string[]) => void
  onOpenVerificationModal: (identity: IdentityDocument) => void
  onNavigateToDetails: (id: string) => void
}

function SellersTableBody({
  data,
  selected,
  setSelected,
  onOpenVerificationModal,
  onNavigateToDetails,
}: SellersTableBodyProps) {
  return (
    <TableBody>
      {data.map((seller) => (
        <SellerItem
          key={seller._id}
          seller={seller}
          selected={selected}
          setSelected={setSelected}
          onOpenVerificationModal={onOpenVerificationModal}
          onNavigateToDetails={onNavigateToDetails}
        />
      ))}
    </TableBody>
  )
}

export default function AcceptedSellers({ acceptedSellers, onOpenVerificationModal, onDeleteSellers }: AcceptedSellersProps) {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const theme = useTheme()

  // MuiTable state
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [selected, setSelected] = useState<string[]>([])
  const [orderBy, setOrderBy] = useState("user"); 
  const [filterName, setFilterName] = useState("")
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const goToIdentityDetails = useCallback(
    (id: string) => {
      navigate(`/dashboard/identities/${id}`)
    },
    [navigate],
  )

  const handleDeleteSelected = useCallback(async () => {
    if (selected.length === 0) return

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer les ${selected.length} vendeurs sélectionnés ?`)) {
      try {
        
        await new Promise((resolve) => setTimeout(resolve, 500)); 
        enqueueSnackbar(`${selected.length} vendeurs supprimés avec succès !`, { variant: "success" })
        onDeleteSellers(selected); 
        setSelected([])
      } catch (error: any) {
        console.error("Error deleting selected sellers:", error)
        enqueueSnackbar(`Erreur lors de la suppression: ${error.message || "Erreur inconnue"}`, { variant: "error" })
      }
    }
  }, [selected, enqueueSnackbar, onDeleteSellers]) 

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 20px 0 ${alpha(theme.palette.success.main, 0.3)}`,
            }}
          >
            <Iconify icon="solar:check-circle-bold" width={24} height={24} color="white" />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              Vendeurs Acceptés
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {acceptedSellers.length} vendeur{acceptedSellers.length !== 1 ? "s" : ""} vérifié
              {acceptedSellers.length !== 1 ? "s" : ""} et accepté{acceptedSellers.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* MUI Table */}
      <MuiTable
        data={acceptedSellers}
        columns={TABLE_HEAD}
        TableBodyComponent={(props) => (
          <SellersTableBody
            {...props}
            onOpenVerificationModal={onOpenVerificationModal}
            onNavigateToDetails={goToIdentityDetails}
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
        searchFields={["user.firstName", "user.lastName", "user.email"]}
        numSelected={selected.length}
        onDeleteSelected={handleDeleteSelected}
        loading={false}
      />
    </Box>
  )
}