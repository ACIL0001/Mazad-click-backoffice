# Carte Fellah - Troubleshooting Guide

## Issue: Documents Not Displaying

If you see "Aucun document disponible" (No documents available) even though documents were submitted, follow these debugging steps:

## Quick Fixes Applied

### 1. Fixed Filename Property Mismatch ✅
**Problem**: Backend returns `filename` (lowercase) but frontend was looking for `fileName` (camelCase)

**Solution**: Updated DocumentCard component to check both:
```typescript
{document.filename || document.fileName || 'Document'}
```

**File**: `src/pages/Identities/IdentityVerificationDetailsPage.tsx` (line 388)

### 2. Made Required Fields Optional in TypeScript ✅
**Problem**: TypeScript interface had some fields as required, but validation allows either (RC+NIF) OR (Carte Fellah)

**Solution**: Made all new document fields optional in the interface:
```typescript
registreCommerceCarteAuto?: { ... }
nifRequired?: { ... }
carteFellah?: { ... }
```

**File**: `src/api/identity.ts`

### 3. Enhanced Debug Logging ✅
**Added**: More detailed console logging to help identify issues

**File**: `src/pages/Identities/IdentityVerificationDetailsPage.tsx` (lines 422-444)

## How to Debug

### Step 1: Check Browser Console
Open the browser console (F12) and look for the debug output:

```javascript
🔍 Identity details debug: {
  identityDetails: { ... },
  allDocumentFields: {
    carteFellah: true/false,
    registreCommerceCarteAuto: true/false,
    // ... other fields
  },
  documentDetails: {
    carteFellah: { _id, filename, url },
    // ... actual document objects
  },
  hasDocuments: true/false
}
```

### Step 2: Verify Backend Response
Check the network tab for the API call to `/identities/:id`:

**Expected Response**:
```json
{
  "_id": "...",
  "user": { ... },
  "carteFellah": {
    "_id": "...",
    "filename": "carte_fellah.pdf",
    "url": "/uploads/identities/..."
  },
  "status": "WAITING",
  "conversionType": "CLIENT_TO_PROFESSIONAL"
}
```

### Step 3: Check Document URL Construction
The DocumentCard component constructs URLs like this:

```typescript
const baseUrl = app.baseURL.replace('/v1/', '').replace(/\/$/, '');
return `${baseUrl}${document.url}`;
```

**Example**:
- `app.baseURL`: `https://api.example.com/v1/`
- `document.url`: `/uploads/identities/123/carte_fellah.pdf`
- **Result**: `https://api.example.com/uploads/identities/123/carte_fellah.pdf`

## Common Issues

### Issue 1: "Aucun document disponible" displayed

**Possible Causes**:
1. ❌ All document fields are `null` or `undefined`
2. ❌ `hasDocuments` evaluates to `false`
3. ❌ Documents exist but are not being destructured properly

**Debug Steps**:
```javascript
// Check console output
console.log('hasDocuments:', hasDocuments);
console.log('carteFellah:', carteFellah);
console.log('identityDetails:', identityDetails);
```

**Solution**:
- If `identityDetails` is populated but fields are `null`, check backend transformation
- If `hasDocuments` is `false`, verify the document fields are being checked correctly

### Issue 2: Document card shows but "Voir le document" doesn't work

**Possible Causes**:
1. ❌ Invalid URL construction
2. ❌ Missing `document.url` property
3. ❌ CORS or authentication issues

**Debug Steps**:
```javascript
// Check the constructed URL
console.log('Document URL:', getDocumentUrl());
console.log('Document object:', document);
```

**Solution**:
- Verify `app.baseURL` is correctly configured in `config.tsx`
- Check that the file exists on the server
- Verify authentication headers are being sent

### Issue 3: Filename shows as "Document" instead of actual filename

**Possible Causes**:
1. ❌ Backend not returning `filename` property
2. ❌ Property name mismatch

**Debug Steps**:
```javascript
console.log('Document filename:', document.filename);
console.log('Document fileName:', document.fileName);
```

**Solution**:
- Already fixed: Component now checks both `filename` and `fileName`
- If still showing "Document", check backend `transformAttachment` function

### Issue 4: Only Carte Fellah not showing (other documents work)

**Possible Causes**:
1. ❌ `carteFellah` not being destructured from `identityDetails`
2. ❌ `carteFellah` not included in `hasDocuments` check
3. ❌ Backend not returning `carteFellah` in response

**Debug Steps**:
```javascript
// Check if carteFellah is in the response
console.log('Raw identity response:', identityDetails);
console.log('Destructured carteFellah:', carteFellah);
```

**Solution**:
- Already fixed: `carteFellah` is now properly destructured and checked
- Verify backend includes `carteFellah` in the response transformation

## Backend Verification

### Check Identity Controller
File: `Mazad-click-server/src/modules/identity/identity.controller.ts`

**Line 750** should include:
```typescript
carteFellah: transformAttachment(identity.carteFellah),
```

### Check transformAttachment Function
File: `Mazad-click-server/src/modules/identity/identity.controller.ts`

**Line 38-41**:
```typescript
function transformAttachment(att) {
  if (!att) return null;
  return att.url ? { url: att.url, _id: att._id, filename: att.filename } : null;
}
```

### Check Database
Verify the document was saved:
```javascript
// MongoDB query
db.identities.findOne({ _id: ObjectId("...") })

// Should have:
{
  carteFellah: ObjectId("..."),
  // ... other fields
}
```

## Testing Checklist

- [ ] User submits Carte Fellah from seller app
- [ ] Backend receives and saves the file
- [ ] Backend returns `carteFellah` in API response
- [ ] Frontend receives `carteFellah` in identity details
- [ ] `carteFellah` is properly destructured
- [ ] `hasDocuments` evaluates to `true`
- [ ] Document card is rendered for Carte Fellah
- [ ] Filename displays correctly
- [ ] "Voir le document" button works
- [ ] Document opens in new tab

## Quick Test Commands

### Test Backend Endpoint
```bash
# Get identity by ID (replace with actual ID)
curl -X GET "http://localhost:3000/api/v1/identities/YOUR_IDENTITY_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test File Upload
```bash
# Upload Carte Fellah
curl -X POST "http://localhost:3000/api/v1/identities" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "carteFellah=@/path/to/carte_fellah.pdf"
```

## Expected Behavior

### When User Submits Only Carte Fellah:
1. ✅ Form validates successfully (Carte Fellah is sufficient)
2. ✅ Document is uploaded to server
3. ✅ Identity record is created with `carteFellah` field
4. ✅ Admin sees Carte Fellah card in backoffice
5. ✅ Admin can click "Voir le document" to view file

### When User Submits RC + NIF:
1. ✅ Form validates successfully
2. ✅ Documents are uploaded
3. ✅ Identity record is created with both fields
4. ✅ Admin sees both document cards
5. ✅ Carte Fellah card is NOT shown (not submitted)

### When User Submits All Documents:
1. ✅ Form validates successfully
2. ✅ All documents are uploaded
3. ✅ Identity record has all fields populated
4. ✅ Admin sees all document cards including Carte Fellah
5. ✅ All "Voir le document" buttons work

## Files Modified

1. ✅ `Mazad-click-backoffice/src/api/identity.ts`
   - Made document fields optional
   - Added `carteFellah` field

2. ✅ `Mazad-click-backoffice/src/pages/Identities/IdentityVerificationDetailsPage.tsx`
   - Fixed filename property (line 388)
   - Added `carteFellah` to destructuring (line 251)
   - Added `carteFellah` to `hasDocuments` check (line 418)
   - Added `carteFellah` to debug logging (line 436)
   - Added Carte Fellah document card (lines 826-834)

3. ✅ `Mazad-click-backoffice/src/pages/Identities/PendingAndRejectedSellers.tsx`
   - Added `carteFellah` to document count (line 105)

## Still Having Issues?

### Enable Verbose Logging

**Frontend** (`IdentityVerificationDetailsPage.tsx`):
```typescript
// Add after line 93
console.log('🔍 Fetched identity:', response);
console.log('🔍 User profile:', userProfile);
console.log('🔍 Updated identity details:', updatedIdentityDetails);
```

**Backend** (`identity.controller.ts`):
```typescript
// Add in getIdentityById method
console.log('🔍 Raw identity from DB:', identity);
console.log('🔍 Carte Fellah raw:', identity.carteFellah);
console.log('🔍 Carte Fellah transformed:', transformAttachment(identity.carteFellah));
```

### Check File Permissions
Ensure the uploads directory is accessible:
```bash
ls -la uploads/identities/
```

### Verify CORS Settings
If documents don't load, check CORS configuration in backend.

## Contact Support

If the issue persists after following this guide:
1. Provide console output from browser
2. Provide network tab screenshot showing API response
3. Provide backend logs
4. Describe the exact steps to reproduce

---

**Last Updated**: After implementing Carte Fellah display fix
**Status**: ✅ All fixes applied, ready for testing

