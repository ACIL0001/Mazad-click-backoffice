// PendingAndRejectedSellers.tsx - Updated to use IdentityDocument from API
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
  Button,
} from "@mui/material"

import Iconify from "@/components/Iconify"
import { useSnackbar } from "notistack"
import MuiTable from "../../components/Tables/MuiTable"
import { IdentityDocument, IdentityAPI } from "../../api/identity"

interface PendingAndRejectedSellersProps {
  pendingAndRejectedSellers: IdentityDocument[]
  onOpenVerificationModal: (identity: IdentityDocument) => void
  onDeleteSellers: (ids: string[]) => void
  onVerifyIdentity: (identity: IdentityDocument, action: 'accept' | 'reject') => void
  title?: string
  subtitle?: string
}

const TABLE_HEAD = [
  { id: "user", label: "Utilisateur", alignRight: false, searchable: true },
  { id: "email", label: "Email", alignRight: false, searchable: true },
  { id: "conversion", label: "Conversion", alignRight: false, searchable: false },
  { id: "documents", label: "Documents", alignRight: false, searchable: false },
  { id: "createdAt", label: "Créé le", alignRight: false, searchable: false },
  { id: "actions", label: "Actions", alignRight: true, searchable: false },
]

interface SellersTableBodyProps {
  data: IdentityDocument[]
  selected: string[]
  setSelected: (selected: string[]) => void
  onOpenVerificationModal: (identity: IdentityDocument) => void
  onNavigateToDetails: (id: string) => void
  onVerifyIdentity: (identity: IdentityDocument, action: 'accept' | 'reject') => void
}

function SellersTableBody({
  data,
  selected,
  setSelected,
  onOpenVerificationModal,
  onNavigateToDetails,
  onVerifyIdentity,
}: SellersTableBodyProps) {
  const theme = useTheme()
  const { enqueueSnackbar } = useSnackbar()

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

  // Get conversion type display using API helper
  const getConversionTypeDisplay = (identity: IdentityDocument) => {
    const conversionType = identity.conversionType || IdentityAPI.getConversionTypeFromIdentity(identity)
    return IdentityAPI.getConversionDisplayInfo(conversionType)
  }

  // Count available documents
  const getDocumentCount = (identity: IdentityDocument) => {
    let count = 0
    if (identity.commercialRegister) count++
    if (identity.nif) count++
    if (identity.nis) count++
    if (identity.last3YearsBalanceSheet) count++
    if (identity.certificates) count++
    if (identity.identityCard) count++
    if (identity.registreCommerceCarteAuto) count++
    if (identity.nifRequired) count++
    if (identity.numeroArticle) count++
    if (identity.c20) count++
    if (identity.misesAJourCnas) count++
    return count
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

  const handleAccept = useCallback((identity: IdentityDocument, event: React.MouseEvent) => {
    event.stopPropagation()
    const conversionInfo = getConversionTypeDisplay(identity)
    if (window.confirm(`Êtes-vous sûr de vouloir accepter ${identity.user?.firstName} ${identity.user?.lastName} pour: ${conversionInfo.label} ?`)) {
      onVerifyIdentity(identity, 'accept')
    }
  }, [onVerifyIdentity])

  const handleReject = useCallback((identity: IdentityDocument, event: React.MouseEvent) => {
    event.stopPropagation()
    const conversionInfo = getConversionTypeDisplay(identity)
    if (window.confirm(`Êtes-vous sûr de vouloir rejeter ${identity.user?.firstName} ${identity.user?.lastName} pour: ${conversionInfo.label} ?`)) {
      onVerifyIdentity(identity, 'reject')
    }
  }, [onVerifyIdentity])

  return (
    <TableBody>
      {data.map((seller) => {
        const isItemSelected = selected.indexOf(seller._id) !== -1
        const user = seller.user
        const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
        const documentCount = getDocumentCount(seller)
        const conversionInfo = getConversionTypeDisplay(seller)

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
            
            {/* User Cell */}
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
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.disabled, 
                      fontSize: "0.75rem",
                    }}
                  >
                    Actuellement: {user?.type || 'N/A'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.disabled, 
                      fontSize: "0.75rem",
                      display: 'block'
                    }}
                  >
                    → {seller.targetUserType || 'Non défini'}
                  </Typography>
                </Box>
              </Stack>
            </TableCell>
            
            {/* Email Cell */}
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
            
            {/* Conversion Type Cell */}
            <TableCell align="left" sx={{ py: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify 
                  icon={conversionInfo.icon} 
                  width={16} 
                  height={16} 
                  color={theme.palette[conversionInfo.color].main}
                />
                <Chip
                  label={conversionInfo.label}
                  size="small"
                  color={conversionInfo.color}
                  sx={{
                    height: 28,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    minWidth: 120,
                  }}
                />
              </Stack>
            </TableCell>
            
            {/* Documents Cell */}
            <TableCell align="left" sx={{ py: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify 
                  icon="eva:file-text-outline" 
                  width={16} 
                  height={16} 
                  color={documentCount > 0 ? theme.palette.success.main : theme.palette.text.disabled}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: documentCount > 0 ? theme.palette.text.primary : theme.palette.text.disabled,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {documentCount} document{documentCount !== 1 ? 's' : ''}
                </Typography>
              </Stack>
            </TableCell>
            
            {/* Created At Cell */}
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
            
            {/* Enhanced Actions Cell */}
            <TableCell align="right" sx={{ py: 2, pr: 3 }}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                {/* Accept Button */}
                <Tooltip title={`Accepter: ${conversionInfo.label}`} placement="top">
                  <IconButton
                    size="small"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.success.main, 0.08),
                      color: theme.palette.success.main,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.success.main, 0.16),
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 12px 0 ${alpha(theme.palette.success.main, 0.3)}`,
                      },
                    }}
                    onClick={(e) => handleAccept(seller, e)}
                  >
                    <Iconify icon="solar:check-circle-bold" width={18} height={18} />
                  </IconButton>
                </Tooltip>

                {/* Reject Button */}
                <Tooltip title={`Rejeter: ${conversionInfo.label}`} placement="top">
                  <IconButton
                    size="small"
                    sx={{
                      width: 36,
                      height: 36,
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
                    onClick={(e) => handleReject(seller, e)}
                  >
                    <Iconify icon="solar:close-circle-bold" width={18} height={18} />
                  </IconButton>
                </Tooltip>

                {/* Details Button */}
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
              </Stack>
            </TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  )
}

export default function PendingAndRejectedSellers({
  pendingAndRejectedSellers,
  onOpenVerificationModal,
  onDeleteSellers,
  onVerifyIdentity,
  title = "Demandes en Attente",
  subtitle,
}: PendingAndRejectedSellersProps) {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const theme = useTheme()

  const [page, setPage] = useState(0)
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [orderBy, setOrderBy] = useState('user')
  const [selected, setSelected] = useState<string[]>([])
  const [filterName, setFilterName] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const goToIdentityDetails = useCallback((id: string) => {
    navigate(`/dashboard/identities/${id}`)
  }, [navigate])

  const handleDeleteSelected = useCallback(async () => {
    if (selected.length === 0) return

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer les ${selected.length} éléments sélectionnés ?`)) {
      try {
        await IdentityAPI.deleteIdentities(selected)
        enqueueSnackbar(`${selected.length} éléments supprimés avec succès !`, { variant: "success" })
        onDeleteSellers(selected)
        setSelected([])
      } catch (error: any) {
        console.error("Error deleting selected items:", error)
        enqueueSnackbar(`Erreur lors de la suppression: ${error.message || "Erreur inconnue"}`, { variant: "error" })
      }
    }
  }, [selected, enqueueSnackbar, onDeleteSellers])

  const handleBulkAccept = useCallback(async () => {
    if (selected.length === 0) return

    if (window.confirm(`Êtes-vous sûr de vouloir accepter les ${selected.length} demandes sélectionnées ?`)) {
      try {
        for (const id of selected) {
          const identity = pendingAndRejectedSellers.find(seller => seller._id === id)
          if (identity) {
            await IdentityAPI.verifyIdentity(identity._id, { action: 'accept' })
          }
        }
        enqueueSnackbar(`${selected.length} demandes acceptées avec succès !`, { variant: "success" })
        setSelected([])
      } catch (error: any) {
        console.error("Error accepting selected users:", error)
        enqueueSnackbar(`Erreur lors de l'acceptation: ${error.message || "Erreur inconnue"}`, { variant: "error" })
      }
    }
  }, [selected, pendingAndRejectedSellers, enqueueSnackbar])

  const handleBulkReject = useCallback(async () => {
    if (selected.length === 0) return

    if (window.confirm(`Êtes-vous sûr de vouloir rejeter les ${selected.length} demandes sélectionnées ?`)) {
      try {
        for (const id of selected) {
          const identity = pendingAndRejectedSellers.find(seller => seller._id === id)
          if (identity) {
            await IdentityAPI.verifyIdentity(identity._id, { action: 'reject' })
          }
        }
        enqueueSnackbar(`${selected.length} demandes rejetées avec succès !`, { variant: "success" })
        setSelected([])
      } catch (error: any) {
        console.error("Error rejecting selected users:", error)
        enqueueSnackbar(`Erreur lors du rejet: ${error.message || "Erreur inconnue"}`, { variant: "error" })
      }
    }
  }, [selected, pendingAndRejectedSellers, enqueueSnackbar])

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
              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 20px 0 ${alpha(theme.palette.warning.main, 0.3)}`,
            }}
          >
            <Iconify icon="solar:hourglass-outline" width={24} height={24} color="white" />
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
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {subtitle || `${pendingAndRejectedSellers.length} demande${pendingAndRejectedSellers.length !== 1 ? "s" : ""} en attente de vérification`}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Enhanced bulk action toolbar */}
      {selected.length > 0 && (
        <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {selected.length} élément{selected.length !== 1 ? 's' : ''} sélectionné{selected.length !== 1 ? 's' : ''}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                startIcon={<Iconify icon="solar:check-circle-bold" width={20} height={20} />}
                onClick={handleBulkAccept}
                size="small"
              >
                Accepter tout
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Iconify icon="solar:close-circle-bold" width={20} height={20} />}
                onClick={handleBulkReject}
                size="small"
              >
                Rejeter tout
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="solar:trash-bin-minimalistic-bold" width={20} height={20} />}
                onClick={handleDeleteSelected}
                size="small"
              >
                Supprimer
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      {/* MUI Table */}
      <MuiTable
        data={pendingAndRejectedSellers}
        columns={TABLE_HEAD}
        TableBodyComponent={(props) => (
          <SellersTableBody
            {...props}
            onOpenVerificationModal={onOpenVerificationModal}
            onNavigateToDetails={goToIdentityDetails}
            onVerifyIdentity={onVerifyIdentity}
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

      {/* Empty state */}
      {pendingAndRejectedSellers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Iconify
            icon="solar:inbox-outline"
            width={64}
            height={64}
            color={theme.palette.text.disabled}
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Aucune demande en attente
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Toutes les demandes de vérification ont été traitées.
          </Typography>
        </Box>
      )}
    </Box>
  )
}