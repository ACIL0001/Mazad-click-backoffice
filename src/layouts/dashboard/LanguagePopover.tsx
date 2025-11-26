import { useRef, useState, useEffect } from 'react';
// material
import { alpha } from '@mui/material/styles';
import { Box, MenuItem, Stack, IconButton } from '@mui/material';
// components
import MenuPopover from '../../components/MenuPopover';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

// ----------------------------------------------------------------------

const LANGS = [
  {
    value: 'fr',
    label: 'FR',
    fullLabel: 'Français',
  },
  {
    value: 'en',
    label: 'ENG',
    fullLabel: 'English',
  },
  {
    value: 'ar',
    label: 'AR',
    fullLabel: 'العربية',
  },
];

// ----------------------------------------------------------------------

export default function LanguagePopover() {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
    handleClose();
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.focusOpacity),
          }),
        }}
      >
        <Box
          sx={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {LANGS.find(lang => lang.value === currentLanguage)?.label || LANGS[0].label}
        </Box>
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{
          mt: 1.5,
          ml: 0.75,
          width: 180,
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', borderRadius: 0.75 },
        }}
      >
        <Stack spacing={0.75}>
          {LANGS.map((option) => (
            <MenuItem 
              key={option.value} 
              selected={option.value === currentLanguage} 
              onClick={() => handleLanguageChange(option.value)}
            >
              <Box
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  minWidth: '40px',
                  mr: 2,
                }}
              >
                {option.label}
              </Box>
              {option.fullLabel}
            </MenuItem>
          ))}
        </Stack>
      </MenuPopover>
    </>
  );
}
