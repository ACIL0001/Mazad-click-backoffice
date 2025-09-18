# Sous Admin Navigation Restrictions

## Overview

This document explains the navigation restrictions implemented for `SOUS_ADMIN` users in the MazadClick backoffice application. Unlike hiding navigation items completely, we've implemented an "inactive" state where restricted items are visible but cannot be clicked or accessed.

## Implementation Summary

### 1. Permission System Enhancement (`src/utils/permissions.ts`)

#### New Function: `isNavItemInactive()`
```typescript
export const isNavItemInactive = (userRole?: RoleCode, route?: string): boolean => {
  if (!userRole || !route) return false;
  
  // Items that should be inactive for SOUS_ADMIN
  if (userRole === RoleCode.SOUS_ADMIN) {
    switch (true) {
      case route.includes('/admin') && route !== '/dashboard/admin/profile' && route !== '/dashboard/admin/permissions':
        return true; // Administration section (except profile and permissions)
      case route.includes('/subscription'):
        return true; // Abonnements
      case route.includes('/terms'):
        return true; // Conditions Générales
      case route.includes('/configuration'):
        return true; // Configuration (system settings)
      default:
        return false;
    }
  }
  
  return false;
};
```

#### Enhanced `filterNavItemsByPermissions()`
- Now adds `inactive: true` property to navigation items that should be disabled for SOUS_ADMIN
- Preserves visibility while preventing interaction
- Handles both parent items and children recursively

### 2. Navigation Component Updates (`src/components/NavSection.tsx`)

#### New Inactive Styling
```typescript
const inactiveStyle = {
  color: 'text.disabled',
  opacity: 0.5,
  cursor: 'default',
  '&:hover': {
    backgroundColor: 'transparent',
  },
};
```

#### Navigation Behavior Changes
- **Active Navigation**: Uses `RouterLink` component and proper `to` prop
- **Inactive Navigation**: Uses `div` component with no navigation capability
- **Visual Feedback**: Inactive items appear grayed out with reduced opacity
- **Interaction Prevention**: No hover effects or click handlers for inactive items

## Navigation Access Matrix

### ✅ **ADMIN** (Full Access)
| Navigation Item | Status | Description |
|----------------|--------|-------------|
| Tableau De Bord | ✅ Active | Dashboard access |
| Administration | ✅ Active | Full admin management |
| └── Gestion des Admins | ✅ Active | Manage admin users |
| └── Profil Admin | ✅ Active | Admin profile |
| └── Permissions | ✅ Active | View permissions |
| Abonnements | ✅ Active | Subscription management |
| Conditions Générales | ✅ Active | Terms management |
| Configuration | ✅ Active | System configuration |
| All Other Items | ✅ Active | Full access |

### 👨‍💻 **SOUS_ADMIN** (Limited Access)
| Navigation Item | Status | Description |
|----------------|--------|-------------|
| Tableau De Bord | ✅ Active | Dashboard access |
| Administration | ❌ Inactive | Visible but not clickable |
| └── Gestion des Admins | ❌ Inactive | Cannot manage admins |
| └── Profil Admin | ✅ Active | Can view own profile |
| └── Permissions | ✅ Active | Can view permissions |
| Abonnements | ❌ Inactive | Cannot manage subscriptions |
| Conditions Générales | ❌ Inactive | Cannot manage terms |
| Configuration | ❌ Inactive | Cannot access system config |
| Enchères | ✅ Active | Can manage auctions |
| Categories | ✅ Active | Can manage categories |
| Centre de Communication | ✅ Active | Can access communication |
| Other Content Items | ✅ Active | Standard access |

## User Experience

### For SOUS_ADMIN Users:
1. **Login**: Can successfully log in with SOUS_ADMIN credentials
2. **Dashboard**: Full access to main dashboard
3. **Navigation**: 
   - Can see all navigation items in the sidebar
   - Restricted items appear grayed out (50% opacity)
   - Clicking on inactive items does nothing
   - No hover effects on inactive items
4. **Accessible Areas**:
   - Content management (auctions, categories)
   - Communication center
   - Own profile settings
   - Permission viewing

### Visual Indicators:
- **Active Items**: Normal color and hover effects
- **Inactive Items**: 
  - Gray text color (`text.disabled`)
  - 50% opacity
  - Default cursor (no pointer)
  - No hover background change

## Technical Implementation Details

### NavItem Component Changes:
```typescript
// Extract inactive state from item
const { title, path, icon, info, children, disabled, inactive } = item;

// Apply conditional rendering
<ListItemStyle
  component={inactive ? 'div' : RouterLink}
  to={inactive ? undefined : path}
  onClick={inactive ? undefined : handleClick}
  disabled={disabled || inactive}
  sx={{
    ...(isActive && !inactive && activeStyle),
    ...(inactive && inactiveStyle),
  }}
>
```

### Permission Checking Flow:
1. User logs in with role detection
2. Navigation config is generated with `requiresAdmin` flags
3. `filterNavItemsByPermissions()` processes each item:
   - Checks if user has basic access (`requiresAdmin`)
   - Checks if item should be inactive (`isNavItemInactive()`)
   - Adds `inactive: true` property for restricted items
4. NavSection renders items with appropriate styling and behavior

## Testing

### Test Cases:
1. **ADMIN Login**: Should see all items as active/clickable
2. **SOUS_ADMIN Login**: Should see restricted items as inactive
3. **Navigation Attempts**: Clicking inactive items should not navigate
4. **Visual Verification**: Inactive items should appear grayed out
5. **Accessible Items**: SOUS_ADMIN should be able to access allowed sections

### Manual Testing Steps:
1. Log in as SOUS_ADMIN user
2. Verify sidebar shows all navigation items
3. Check that Administration, Abonnements, and Conditions appear grayed out
4. Try clicking inactive items - should not navigate
5. Verify access to Profil Admin and Permissions still works
6. Test other sections like Enchères and Categories are accessible

## Configuration

### Environment Variables (`.env`):
```env
# Sous Admin Account
SOUS_ADMIN_FIRSTNAME=Sous
SOUS_ADMIN_LASTNAME=Admin
SOUS_ADMIN_EMAIL=sousadmin@mazadclick.com
SOUS_ADMIN_PASSWORD=securepassword123
SOUS_ADMIN_GENDER=MALE
SOUS_ADMIN_PHONE=+213XXXXXXXXX
```

### Backend Support:
- SOUS_ADMIN role exists in backend
- Authentication endpoints support SOUS_ADMIN
- API endpoints respect role-based permissions
- Database contains SOUS_ADMIN user account

## Benefits

1. **Transparency**: Users can see the full application structure
2. **User Experience**: Clear visual indication of access levels
3. **Reduced Confusion**: Items don't disappear, just become unavailable
4. **Administrative Clarity**: Admins can see what sous admins can/cannot access
5. **Easy Management**: Simple role-based restrictions without complex UI changes

## Future Enhancements

1. **Tooltip Messages**: Add tooltips explaining why items are inactive
2. **Role Indicators**: Show user's current role level in sidebar
3. **Custom Messages**: Display custom messages for different restriction types
4. **Granular Permissions**: More fine-grained permission controls
5. **Audit Logging**: Track attempts to access restricted areas
