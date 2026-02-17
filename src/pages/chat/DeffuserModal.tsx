import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  TextField,
  Autocomplete,
  Chip,
  CircularProgress,
  Typography,
  Fade,
  useTheme,
  IconButton,
  Avatar,
  Paper,
  InputAdornment,
  Checkbox,
  ListItemText
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Send as SendIcon, 
  Group as GroupIcon, 
  Category as CategoryIcon, 
  Map as MapIcon,
  Search as SearchIcon,
  Campaign as CampaignIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  CheckBoxOutlineBlank,
  CheckBox
} from '@mui/icons-material';
import { UserAPI } from '../../api/user';
import { CategoryAPI } from '../../api/category';
import { ChatAPI, BroadcastData } from '../../api/Chat';
import { useSnackbar } from 'notistack';

// Hardcoded Wilayas list
const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
  "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès",
  "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

interface DeffuserModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: any;
  onSuccess?: () => void;
}

export default function DeffuserModal({ open, onClose, currentUser, onSuccess }: DeffuserModalProps) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Selection states
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<any[]>([]);
  const [selectedWilayas, setSelectedWilayas] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, categoriesResponse] = await Promise.all([
        UserAPI.getAll(),
        CategoryAPI.getCategories()
      ]);
      // Filter out ADMIN and SOUS_ADMIN users
      const appUsers = (usersResponse || []).filter((user: any) => 
        user.type !== 'ADMIN' && user.type !== 'SOUS_ADMIN'
      );
      setUsers(appUsers);
      setCategories(categoriesResponse || []);
    } catch (error) {
      console.error('Error fetching broadcast data:', error);
      enqueueSnackbar('Erreur lors du chargement des données', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      enqueueSnackbar('Veuillez saisir un message', { variant: 'warning' });
      return;
    }

    let filterType: BroadcastData['filterType'] = 'ALL';
    let filterValue: string[] = [];

    if (tabValue === 0) { // All / Users
        if (selectedUsers.length > 0) {
            filterType = 'USERS';
            filterValue = selectedUsers.map(u => u._id);
        } else {
            filterType = 'ALL';
        }
    } else if (tabValue === 1) { // Secteur
        if (selectedSectors.length === 0) {
            enqueueSnackbar('Veuillez sélectionner au moins un secteur', { variant: 'warning' });
            return;
        }
        filterType = 'SECTEUR';
        filterValue = selectedSectors.map(s => s.name);
    } else if (tabValue === 2) { // Wilaya
        if (selectedWilayas.length === 0) {
            enqueueSnackbar('Veuillez sélectionner au moins une wilaya', { variant: 'warning' });
            return;
        }
        filterType = 'WILAYA';
        filterValue = selectedWilayas;
    }

    setBroadcasting(true);
    try {
      await ChatAPI.broadcast({
        message,
        sender: currentUser._id,
        filterType,
        filterValue
      });
      enqueueSnackbar('Message diffusé avec succès', { variant: 'success' });
      if (onSuccess) onSuccess();
      onClose();
      // Reset states
      setMessage('');
      setSelectedUsers([]);
      setSelectedSectors([]);
      setSelectedWilayas([]);
    } catch (error) {
      console.error('Broadcast error:', error);
      enqueueSnackbar('Erreur lors de la diffusion', { variant: 'error' });
    } finally {
      setBroadcasting(false);
    }
  };

  // Custom Tab Panel with Animation
  const TabPanel = (props: { children?: React.ReactNode; index: number; value: number }) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Fade in={value === index}>
            <Box sx={{ pt: 2 }}>{children}</Box>
          </Fade>
        )}
      </div>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          backdropFilter: 'blur(4px)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <CampaignIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Diffusion de Message
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Envoyez des annonces à vos utilisateurs
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="broadcast tabs"
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<GroupIcon />} iconPosition="start" label="Utilisateurs" />
            <Tab icon={<CategoryIcon />} iconPosition="start" label="Secteurs" />
            <Tab icon={<MapIcon />} iconPosition="start" label="Wilayas" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3, minHeight: 300 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 2 }}>
              <CircularProgress />
              <Typography color="textSecondary">Chargement des données...</Typography>
            </Box>
          ) : (
            <>
              {/* Users Tab */}
              <TabPanel value={tabValue} index={0}>
                  <Autocomplete
                      multiple
                      id="users-select"
                      options={users}
                      disableCloseOnSelect
                      getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                      value={selectedUsers}
                      onChange={(event, newValue) => setSelectedUsers(newValue)}
                      filterSelectedOptions={false} // Important to show selected items in list
                      renderInput={(params) => (
                          <TextField
                              {...params}
                              variant="outlined"
                              label="Sélectionner des utilisateurs"
                              placeholder="Rechercher..."
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    <InputAdornment position="start">
                                      <SearchIcon color="action" />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                  </>
                                )
                              }}
                          />
                      )}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar 
                                    sx={{ width: 24, height: 24, fontSize: '0.8rem' }}
                                    src={option.avatar?.url} // ensuring optional chaining for avatar
                                    alt={option.firstName}
                                >
                                    {option.firstName.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2">{option.firstName} {option.lastName}</Typography>
                                    <Typography variant="caption" color="textSecondary">{option.type}</Typography>
                                </Box>
                            </Box>
                        </li>
                      )}
                      renderTags={(value, getTagProps) =>
                          value.map((option, index) => {
                              const { key, ...tagProps } = getTagProps({ index });
                              return (
                                  <Chip 
                                    key={key}
                                    avatar={<Avatar src={option.avatar?.url}>{option.firstName.charAt(0)}</Avatar>}
                                    variant="filled" 
                                    label={`${option.firstName} ${option.lastName}`} 
                                    color="primary"
                                    size="small"
                                    {...tagProps} 
                                  />
                              );
                          })
                      }
                  />
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                        mt: 2, 
                        p: 2, 
                        bgcolor: 'background.default', 
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                  >
                        <PersonIcon color="action" />
                        <Typography variant="body2" color="textSecondary">
                            {selectedUsers.length > 0 
                                ? `${selectedUsers.length} utilisateur(s) sélectionné(s).` 
                                : "Si aucun utilisateur n'est sélectionné, le message sera envoyé à TOUS les utilisateurs."}
                        </Typography>
                  </Paper>
              </TabPanel>

              {/* Sectors Tab */}
              <TabPanel value={tabValue} index={1}>
                   <Autocomplete
                      multiple
                      id="sectors-select"
                      options={categories}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option.name}
                      value={selectedSectors}
                      onChange={(event, newValue) => setSelectedSectors(newValue)}
                      filterSelectedOptions={false}
                      renderInput={(params) => (
                          <TextField
                              {...params}
                              variant="outlined"
                              label="Sélectionner des secteurs"
                              placeholder="Rechercher des secteurs..."
                          />
                      )}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                             <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BusinessIcon color="action" fontSize="small" />
                                <Typography>{option.name}</Typography>
                             </Box>
                        </li>
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                                <Chip 
                                  key={key}
                                  icon={<BusinessIcon fontSize="small" />}
                                  variant="filled" 
                                  label={option.name} 
                                  color="secondary"
                                  size="small"
                                  {...tagProps} 
                                />
                            );
                        })
                    }
                  />
              </TabPanel>

              {/* Wilaya Tab */}
              <TabPanel value={tabValue} index={2}>
                  <Autocomplete
                      multiple
                      id="wilayas-select"
                      options={WILAYAS}
                      disableCloseOnSelect
                      value={selectedWilayas}
                      onChange={(event, newValue) => setSelectedWilayas(newValue)}
                      filterSelectedOptions={false}
                      renderInput={(params) => (
                          <TextField
                              {...params}
                              variant="outlined"
                              label="Sélectionner des wilayas"
                              placeholder="Rechercher des wilayas..."
                          />
                      )}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                             <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon color="error" fontSize="small" />
                                <Typography>{option}</Typography>
                             </Box>
                        </li>
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                                <Chip 
                                  key={key}
                                  icon={<LocationOnIcon fontSize="small" />}
                                  variant="filled" 
                                  label={option} 
                                  color="error"
                                  size="small"
                                  {...tagProps} 
                                />
                            );
                        })
                    }
                  />
              </TabPanel>

              {/* Message Input - Always visible but styled better */}
              <Box sx={{ mt: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  label="Contenu du Message"
                  placeholder="Écrivez votre message ici... Soyez clair et concis."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.default'
                    }
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
        <Button 
            onClick={onClose} 
            color="inherit" 
            sx={{ borderRadius: 2 }}
        >
            Annuler
        </Button>
        <Button 
            onClick={handleSendBroadcast} 
            color="primary" 
            variant="contained" 
            disabled={broadcasting || loading}
            startIcon={broadcasting ? <CircularProgress size={20} color="inherit"/> : <SendIcon />}
            sx={{ 
                borderRadius: 2,
                px: 4,
                boxShadow: 2
            }}
        >
          {broadcasting ? 'Envoi...' : 'Envoyer la diffusion'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
