# Carte Fellah Implementation

## Overview
This document describes the implementation of the "Carte Fellah" document field in the identity verification system. The Carte Fellah is a special document required only for users in the Fellah (farmer) category.

## Changes Made

### 1. Backend (Server) - Already Implemented ✅
The backend already had full support for `carteFellah`:

**File**: `Mazad-click-server/src/modules/identity/identity.schema.ts`
- Field: `carteFellah: Attachment`
- Validation: Either (RC + NIF) OR (Carte Fellah) must be provided for professional verifications
- The field is optional but becomes required for Fellah category users

**File**: `Mazad-click-server/src/modules/identity/identity.controller.ts`
- Upload handling for `carteFellah` file
- Proper validation logic
- Response transformation includes `carteFellah`

### 2. Frontend - Backoffice (Admin Panel)

#### Updated Files:

**File**: `Mazad-click-backoffice/src/api/identity.ts`
```typescript
carteFellah?: {
  _id: string;
  filename?: string;
  url?: string;
};
```
- Added `carteFellah` field to `IdentityDocument` interface
- Made it optional since it's only required for Fellah category

**File**: `Mazad-click-backoffice/src/pages/Identities/IdentityVerificationDetailsPage.tsx`
- Added `carteFellah` to destructuring from `identityDetails`
- Updated `hasDocuments` check to include `carteFellah`
- Added debug logging for `carteFellah`
- Added document card display for Carte Fellah with:
  - Title: "Carte Fellah"
  - Icon: "eva:file-add-outline"
  - Proper document URL handling
  - View document button

### 3. Frontend - Seller Application - Already Implemented ✅

**File**: `Mazad-click-seller/src/pages/IdentityVerification.tsx`
The seller application already has full support for Carte Fellah:
- State management: `const [carteFellah, setCarteFellah] = useState<File[]>([]);`
- File upload handling
- Validation logic
- Form submission includes `carteFellah`
- UI card with proper description: "Document obligatoire uniquement pour la catégorie Fellah"

## Document Validation Logic

### For Professional Verification:
Users must provide **EITHER**:
1. **Option A**: Registre de Commerce/Carte Auto + NIF/N° Article
2. **Option B**: Carte Fellah (for Fellah category only)

### Document Display Order in Admin Panel:
1. Commercial Register (legacy)
2. NIF (legacy)
3. NIS (legacy)
4. Balance Sheet (legacy)
5. Certificates (legacy)
6. Identity Card (legacy)
7. **Registre Commerce/Carte Auto** (required - Option A)
8. **NIF Required** (required - Option A)
9. Numéro d'article (optional)
10. C20 (optional)
11. Mises à jour CNAS/CASNOS (optional)
12. **Carte Fellah** (required for Fellah - Option B) ⭐ NEW

## UI Features

### Document Card for Carte Fellah:
- **Title**: "Carte Fellah"
- **Icon**: File add icon (eva:file-add-outline)
- **Functionality**: 
  - Displays filename
  - "Voir le document" button opens document in new tab
  - Proper URL construction from backend
  - Responsive design for mobile/tablet/desktop

### Visual Design:
- Consistent with other document cards
- Gradient background on hover
- Avatar icon with primary color
- Full-width button with external link icon

## Testing Checklist

### Backend Testing:
- [x] Schema includes `carteFellah` field
- [x] Controller accepts `carteFellah` file upload
- [x] Validation allows (RC+NIF) OR (Carte Fellah)
- [x] API response includes `carteFellah` data

### Frontend Testing (Seller App):
- [x] Upload form includes Carte Fellah field
- [x] File upload works correctly
- [x] Validation prevents submission without required docs
- [x] Form data includes carteFellah on submit

### Frontend Testing (Backoffice):
- [x] TypeScript interface includes carteFellah
- [x] Document card displays when carteFellah exists
- [x] Document URL is constructed correctly
- [x] "Voir le document" button opens correct file
- [x] Responsive design works on mobile/tablet/desktop
- [x] No linter errors

## API Endpoints

### Submit Identity (with Carte Fellah):
```
POST /api/v1/identities
POST /api/v1/identities/professional
POST /api/v1/identities/reseller
```

**FormData Fields**:
- `carteFellah`: File (optional, but required for Fellah category)
- Other required fields based on conversion type

### Get Identity Details:
```
GET /api/v1/identities/:id
```

**Response includes**:
```json
{
  "carteFellah": {
    "_id": "...",
    "filename": "carte_fellah.pdf",
    "url": "/uploads/..."
  }
}
```

## User Flow

### For Fellah Category Users:
1. User selects "Fellah" category
2. User uploads **only** Carte Fellah document
3. System validates that Carte Fellah is provided
4. Admin reviews Carte Fellah in backoffice
5. Admin accepts/rejects based on document validity

### For Other Professional Users:
1. User uploads RC/Carte Auto + NIF/N° Article
2. Optionally uploads other documents
3. Admin reviews all documents
4. Admin accepts/rejects

## File Support
- **Accepted formats**: Images (jpg, png, etc.) and PDF
- **Max file size**: As configured in backend
- **Storage**: Server uploads directory

## Localization
- **French**: "Carte Fellah"
- **Description**: "Document obligatoire uniquement pour la catégorie Fellah"

## Security Considerations
- File uploads are validated on backend
- Only authenticated users can upload
- Only admins can view all documents
- Files are stored securely on server
- Document URLs require authentication

## Future Enhancements
- [ ] Add Carte Fellah expiration date tracking
- [ ] Add Carte Fellah number field
- [ ] Add automatic validation for Fellah category
- [ ] Add bulk download for all documents
- [ ] Add document preview in modal

## Troubleshooting

### Issue: Carte Fellah not displaying
**Solution**: Check that:
1. Backend response includes `carteFellah` field
2. Frontend interface has `carteFellah` property
3. Document has valid `url` and `filename`

### Issue: Document URL not working
**Solution**: Verify:
1. Base URL is correctly configured in `config.tsx`
2. File exists in server uploads directory
3. Server is serving static files correctly

### Issue: Upload fails
**Solution**: Check:
1. File size is within limits
2. File format is accepted (images/PDF)
3. User has proper permissions
4. Network connection is stable

## Related Files

### Backend:
- `src/modules/identity/identity.schema.ts`
- `src/modules/identity/identity.controller.ts`
- `src/modules/identity/identity.service.ts`

### Frontend (Backoffice):
- `src/api/identity.ts`
- `src/pages/Identities/IdentityVerificationDetailsPage.tsx`
- `src/pages/Identities/index.tsx`

### Frontend (Seller):
- `src/pages/IdentityVerification.tsx`
- `src/api/identity.ts`

## Summary
The Carte Fellah feature is now fully implemented across all three applications (server, backoffice, seller). Users in the Fellah category can submit their Carte Fellah as an alternative to the standard RC+NIF documents, and admins can view and verify these documents in the backoffice panel.

