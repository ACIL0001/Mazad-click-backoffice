import React from 'react';
import { Box, IconButton, Tooltip, alpha, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import Iconify from './Iconify';
import { useThemeMode } from '../contexts/ThemeContext';

// Styled components for the theme switch
const ThemeSwitchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: alpha(theme.palette.grey[500], 0.08),
  borderRadius: theme.shape.borderRadius * 2,
  padding: 2,
  border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
}));

const ThemeButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  width: 36,
  height: 36,
  borderRadius: theme.shape.borderRadius * 1.5,
  margin: 1,
  transition: 'all 0.2s ease-in-out',
  backgroundColor: isActive 
    ? theme.palette.primary.main 
    : 'transparent',
  color: isActive 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: isActive 
      ? theme.palette.primary.dark 
      : alpha(theme.palette.primary.main, 0.08),
    color: isActive 
      ? theme.palette.primary.contrastText 
      : theme.palette.primary.main,
    transform: 'scale(1.05)',
  },
  boxShadow: isActive 
    ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}` 
    : 'none',
}));

const ThemeSwitch: React.FC = () => {
  const { mode, setTheme } = useThemeMode();
  const theme = useTheme();

  const handleThemeChange = (newMode: 'light' | 'dark') => {
    setTheme(newMode);
  };

  return (
    <ThemeSwitchContainer>
      <Tooltip title="Light Mode" arrow>
        <ThemeButton
          isActive={mode === 'light'}
          onClick={() => handleThemeChange('light')}
          size="small"
        >
          <Iconify icon="solar:sun-bold" width={20} height={20} />
        </ThemeButton>
      </Tooltip>
      
      <Tooltip title="Dark Mode" arrow>
        <ThemeButton
          isActive={mode === 'dark'}
          onClick={() => handleThemeChange('dark')}
          size="small"
        >
          <Iconify icon="solar:moon-bold" width={20} height={20} />
        </ThemeButton>
      </Tooltip>
    </ThemeSwitchContainer>
  );
};

export default ThemeSwitch;
