import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Stack,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TableHead,
  CircularProgress,
  Box,
  TextField,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import Page from '@/components/Page';
import Label from '@/components/Label';
import Iconify from '@/components/Iconify';
import Breadcrumb from '@/components/Breadcrumbs';

import { IdentityHistoryAPI, IdentityHistoryDocument } from '@/api/identityHistory';

export default function VerificationHistory() {
  const theme = useTheme();
  
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['identity-history'],
    queryFn: IdentityHistoryAPI.getHistory,
  });

  const filteredHistory = useMemo(() => {
    if (!historyData) return [];
    
    return historyData.filter((item) => {
      // Filter by action
      const matchesAction = filterAction === 'ALL' || item.actionType === filterAction;
      
      // Filter by search
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = 
        item.user?.firstName?.toLowerCase().includes(searchStr) ||
        item.user?.lastName?.toLowerCase().includes(searchStr) ||
        item.user?.email?.toLowerCase().includes(searchStr) ||
        item.user?.entreprise?.toLowerCase().includes(searchStr) ||
        (item.admin && (
           item.admin.firstName?.toLowerCase().includes(searchStr) ||
           item.admin.lastName?.toLowerCase().includes(searchStr)
        ));
        
      return matchesAction && matchesSearch;
    });
  }, [historyData, filterAction, searchQuery]);

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'SUBMITTED':
        return { text: 'Soumis', color: 'warning' as const };
      case 'APPROVED':
        return { text: 'Approuvé', color: 'success' as const };
      case 'REJECTED':
        return { text: 'Rejeté', color: 'error' as const };
      default:
        return { text: action, color: 'default' as const };
    }
  };

  const getConversionLabel = (conversion: string) => {
    switch (conversion) {
      case 'PROFESSIONAL_VERIFICATION':
        return 'Vérification Professionnelle';
      case 'CLIENT_TO_PROFESSIONAL':
        return 'Client → Professionnel';
      case 'CLIENT_TO_RESELLER':
        return 'Client → Revendeur';
      default:
        return conversion;
    }
  };

  return (
    <Page title="Historique des Vérifications">
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Historique des Vérifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Suivi détaillé des soumissions, approbations et rejets des identités.
            </Typography>
          </Box>
        </Stack>

        <Box mb={4}>
          <Breadcrumb />
        </Box>

        <Card>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 3 }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par utilisateur, email..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="ALL">Toutes les actions</MenuItem>
              <MenuItem value="SUBMITTED">Soumis</MenuItem>
              <MenuItem value="APPROVED">Approuvé</MenuItem>
              <MenuItem value="REJECTED">Rejeté</MenuItem>
            </TextField>
          </Stack>

          <TableContainer sx={{ minWidth: 800 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">Erreur lors du chargement de l'historique.</Typography>
              </Box>
            ) : filteredHistory.length === 0 ? (
              <Box sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Aucun historique trouvé.
                </Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Type de Conversion</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Détails / Notes</TableCell>
                    <TableCell>Modifié par</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistory.map((row) => {
                    const actionInfo = getActionLabel(row.actionType);
                    
                    return (
                      <TableRow hover key={row._id}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={row.user?.firstName} src={row.user?.avatarUrl} />
                            <Box>
                              <Typography variant="subtitle2" noWrap>
                                {row.user?.firstName} {row.user?.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {row.user?.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                           <Typography variant="body2">{getConversionLabel(row.conversionType)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Label color={actionInfo.color}>
                            {actionInfo.text}
                          </Label>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 250 }} noWrap>
                            {row.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {row.admin ? (
                            <Typography variant="body2">
                              {row.admin.firstName} {row.admin.lastName}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Système / Utilisateur
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">
                                {format(new Date(row.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                            </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Card>
      </Container>
    </Page>
  );
}
