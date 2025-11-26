import { useRef, useState, useEffect } from 'react';
// material
import { alpha } from '@mui/material/styles';
import { Box, MenuItem, Stack, IconButton } from '@mui/material';
// components
import MenuPopover from '../../components/MenuPopover';
import { useTranslation } from 'react-i18next';

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
  const [currentLang, setCurrentLang] = useState(i18n.language || 'fr');

  useEffect(() => {
    setCurrentLang(i18n.language || 'fr');
  }, [i18n.language]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setCurrentLang(langCode);
    handleClose();
    // Reload to ensure all components update
    setTimeout(() => {
      window.location.reload();
    }, 100);
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
          {LANGS.find(lang => lang.value === currentLang)?.label || LANGS[0].label}
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
              selected={option.value === currentLang} 
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
