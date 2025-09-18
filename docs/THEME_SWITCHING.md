# Theme Switching Feature

## Overview
The MazadClick backoffice now supports dynamic theme switching between light and dark modes with persistent storage across browser sessions.

## Implementation Details

### Files Added/Modified:

1. **`src/contexts/ThemeContext.tsx`** - New context for managing theme state
2. **`src/components/ThemeSwitch.tsx`** - New theme toggle component
3. **`src/theme/index.tsx`** - Updated to support dynamic themes
4. **`src/App.tsx`** - Added ThemeContextProvider wrapper
5. **`src/layouts/dashboard/DashboardNavbar.tsx`** - Added ThemeSwitch component
6. **`src/hooks/useTheme.ts`** - Convenience hook export

### Features:

- **Default Light Mode**: The application starts in light mode by default
- **Persistent Storage**: Theme preference is saved to localStorage and persists across sessions
- **Smooth Transitions**: Theme changes are smooth with proper transitions
- **Responsive Design**: Theme switch works across all screen sizes
- **Comprehensive Coverage**: All components automatically adapt to the selected theme

### Usage:

The theme switch appears in the top navigation bar as two toggle buttons:
- ☀️ **Light Mode Button**: Switches to light theme
- 🌙 **Dark Mode Button**: Switches to dark theme

### Technical Details:

#### Context Provider Setup:
```typescript
// ThemeContextProvider manages theme state and persistence
<ThemeContextProvider>
  <App />
</ThemeContextProvider>
```

#### Using the Theme Hook:
```typescript
import { useThemeMode } from '@/contexts/ThemeContext';

const { mode, toggleTheme, setTheme } = useThemeMode();
```

#### Theme Configuration:
- Light mode uses the existing palette configuration
- Dark mode overrides background, text, and grey color values
- Primary, secondary, success, warning, and error colors remain consistent across themes

### Persistence:
Theme preference is automatically saved to `localStorage` under the key `'themeMode'` and restored on application load.

### Browser Support:
Works in all modern browsers that support CSS custom properties and localStorage.
