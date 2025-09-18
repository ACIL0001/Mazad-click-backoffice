import * as PropTypes from 'prop-types';
import { useState } from 'react';

// material
import { styled } from '@mui/material/styles';
import {
    Toolbar,
    Tooltip,
    IconButton,
    Typography,
    OutlinedInput,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Avatar
} from '@mui/material';

// component
import Iconify from '../../../components/Iconify';

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
    height: 96,
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1, 0, 3),
}));

const SearchStyle = styled(OutlinedInput)(({ theme }: any) => ({
    width: 240,
    transition: theme.transitions.create(['box-shadow', 'width'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
    }),
    '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
    '& fieldset': {
        borderWidth: `1px !important`,
        borderColor: `${theme.palette.grey[500_32]} !important`,
    },
}));

// ----------------------------------------------------------------------

UserListToolbar.propTypes = {
    numSelected: PropTypes.number,
    filterName: PropTypes.string,
    onFilterName: PropTypes.func,
    onDeleteSelected: PropTypes.func,
};

export default function UserListToolbar({ numSelected, filterName, onFilterName, onDeleteSelected }) {
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const handleOpenConfirmDialog = () => {
        setOpenConfirmDialog(true);
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
    };

    const handleDeleteAndConfirm = () => {
        onDeleteSelected();
        handleCloseConfirmDialog();
    };

    return (
        <RootStyle
            sx={{
                ...(numSelected > 0 && {
                    color: '#ef5350',
                    bgcolor: '#fff3f3',
                    border: '2px solid',
                    borderColor: '#ef5350',
                    borderRadius: '12px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2)',
                        transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                }),
            }}
            className='hide-to-pdf'
        >
            {numSelected > 0 ? (
                <>
                    {/* Left Side: Icon and Text */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#f44336', color: 'white', mr: 2, width: 36, height: 36 }}>
                            <Iconify 
                                icon="mdi:trash-can" // Simple trash can icon to match the image
                                sx={{ width: 24, height: 24 }}
                            />
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 'bold' }}>
                                {numSelected} élément sélectionné{numSelected > 1 ? 's' : ''}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ef5350' }}>
                                Action de suppression disponible
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right Side: Delete Button */}
                    <Tooltip title="Supprimer">
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleOpenConfirmDialog}
                            startIcon={
                                <Iconify 
                                    icon="mdi:trash-can" // Consistent simple icon
                                    sx={{ width: 20, height: 20 }}
                                />
                            }
                        >
                            Supprimer ({numSelected})
                        </Button>
                    </Tooltip>
                </>
            ) : (
                <>
                    {/* Search Input (when nothing is selected) */}
                    <SearchStyle
                        value={filterName}
                        onChange={onFilterName}
                        placeholder="Rechercher..."
                        startAdornment={
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                            </InputAdornment>
                        }
                    />
                    
                    {/* Filter Button (when nothing is selected) */}
                    <Tooltip title="Filtrer la liste">
                        <IconButton>
                            <Iconify icon="ic:round-filter-list" />
                        </IconButton>
                    </Tooltip>
                </>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={openConfirmDialog}
                onClose={handleCloseConfirmDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmer la suppression ?"}
                </DialogTitle>
                <DialogContent>
                    <Typography id="alert-dialog-description">
                        Êtes-vous sûr de vouloir supprimer le(s) {numSelected} élément(s) sélectionné(s) ? Cette action est irréversible.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog}>Annuler</Button>
                    <Button onClick={handleDeleteAndConfirm} autoFocus color="error">
                        <Iconify 
                            icon="mdi:trash-can" // Consistent simple icon in dialog
                            sx={{ mr: 1, width: 20, height: 20 }}
                        />
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </RootStyle>
    );
}