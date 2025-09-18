import * as PropTypes from 'prop-types'
import { ReactElement, useMemo } from 'react';
// material
import { CssBaseline } from '@mui/material';
import { ThemeProvider as MUIThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
//
import palette from './palette';
import typography from './typography';
import componentsOverride from './overrides';
import shadows, { customShadows } from './shadows';
import { useThemeMode } from '../contexts/ThemeContext';

// ----------------------------------------------------------------------

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export default function ThemeProvider({ children }) {
  const { mode } = useThemeMode();

  const themeOptions = useMemo<any>(
    () => ({
      palette: {
        mode,
        ...palette,
        // Override specific colors for dark mode
        ...(mode === 'dark' && {
          background: {
            default: '#121212',
            paper: '#1e1e1e',
            neutral: '#2a2a2a',
          },
          text: {
            primary: '#ffffff',
            secondary: '#b3b3b3',
            disabled: '#666666',
          },
          grey: {
            ...palette.grey,
            100: '#2a2a2a',
            200: '#3a3a3a',
            300: '#4a4a4a',
            400: '#5a5a5a',
            500: '#6a6a6a',
            600: '#8a8a8a',
            700: '#aaaaaa',
            800: '#cccccc',
            900: '#eeeeee',
          },
        }),
      },
      shape: { borderRadius: 8 },
      typography,
      shadows,
      customShadows,
    }),
    [mode]
  );

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}

// FIXED: Added customShadows to theme interface
declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: React.CSSProperties['color'];
    };
    customShadows: {
      z1: string;
      z4: string;
      z8: string;
      z12: string;
      z16: string;
      z20: string;
      z24: string;
    };
  }

  interface Palette {
    neutral: Palette['primary'];
  }
  
  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
  }

  interface PaletteColor {
    darker?: string;
  }
  
  interface SimplePaletteColorOptions {
    darker?: string;
  }
  
  interface ThemeOptions {
    status: {
      danger: React.CSSProperties['color'];
    };
    customShadows?: {
      z1?: string;
      z4?: string;
      z8?: string;
      z12?: string;
      z16?: string;
      z20?: string;
      z24?: string;
    };
  }
}