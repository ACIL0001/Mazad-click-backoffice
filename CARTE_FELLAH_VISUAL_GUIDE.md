# Carte Fellah - Visual Guide

## 📸 What You'll See

### Before (Without Carte Fellah)
```
Documents soumis
─────────────────────────────────────────

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ RC/Carte     │ │ NIF          │ │ N° Article   │
│ Auto         │ │ (Obligatoire)│ │ (Optionnel)  │
└──────────────┘ └──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ C20          │ │ CNAS/CASNOS  │
│ (Optionnel)  │ │ (Optionnel)  │
└──────────────┘ └──────────────┘
```

### After (With Carte Fellah)
```
Documents soumis
─────────────────────────────────────────

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ RC/Carte     │ │ NIF          │ │ N° Article   │
│ Auto         │ │ (Obligatoire)│ │ (Optionnel)  │
└──────────────┘ └──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ C20          │ │ CNAS/CASNOS  │ │ Carte Fellah │ ⭐
│ (Optionnel)  │ │ (Optionnel)  │ │ (Fellah)     │
└──────────────┘ └──────────────┘ └──────────────┘
```

## 🎨 Document Card Design

### Carte Fellah Card
```
╔═══════════════════════════════════════╗
║  📄  Carte Fellah                     ║
║  ─────────────────────────────────    ║
║                                       ║
║  Nom du fichier:                      ║
║  carte_fellah_2024.pdf                ║
║                                       ║
║  ┌─────────────────────────────────┐  ║
║  │  🔗 Voir le document            │  ║
║  └─────────────────────────────────┘  ║
╚═══════════════════════════════════════╝
```

**Features:**
- 📄 File icon (eva:file-add-outline)
- Document filename displayed
- Blue gradient button
- Opens in new tab when clicked
- Responsive design

## 📱 Responsive Behavior

### Desktop View (1920px+)
```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Document 1 │ │ Document 2 │ │ Document 3 │ │ Document 4 │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

┌────────────┐ ┌────────────┐ ┌────────────┐
│ Document 5 │ │ Document 6 │ │ Carte      │
│            │ │            │ │ Fellah ⭐  │
└────────────┘ └────────────┘ └────────────┘
```

### Tablet View (768px - 1024px)
```
┌────────────┐ ┌────────────┐
│ Document 1 │ │ Document 2 │
└────────────┘ └────────────┘

┌────────────┐ ┌────────────┐
│ Document 3 │ │ Document 4 │
└────────────┘ └────────────┘

┌────────────┐ ┌────────────┐
│ Document 5 │ │ Carte      │
│            │ │ Fellah ⭐  │
└────────────┘ └────────────┘
```

### Mobile View (< 768px)
```
┌──────────────────────┐
│ Document 1           │
└──────────────────────┘

┌──────────────────────┐
│ Document 2           │
└──────────────────────┘

┌──────────────────────┐
│ Carte Fellah ⭐      │
└──────────────────────┘
```

## 🔍 Admin Panel - Identity Details Page

### Full Page Layout
```
╔═══════════════════════════════════════════════════════════╗
║  ← Retour          Détails de l'Identité                  ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  👤 User Information        📋 Verification Actions       ║
║  ┌──────────────────┐      ┌──────────────────────┐      ║
║  │ Name: John Doe   │      │ Status: En attente   │      ║
║  │ Email: john@...  │      │                      │      ║
║  │ Type: Client →   │      │ [✓ Accepter]         │      ║
║  │       Profess.   │      │ [✗ Rejeter]          │      ║
║  └──────────────────┘      └──────────────────────┘      ║
║                                                            ║
║  📄 Documents soumis                                       ║
║  ─────────────────────────────────────────────────────    ║
║                                                            ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    ║
║  │ RC/Carte │ │ NIF      │ │ N° Art.  │ │ C20      │    ║
║  │ Auto     │ │ Required │ │          │ │          │    ║
║  │ [Voir]   │ │ [Voir]   │ │ [Voir]   │ │ [Voir]   │    ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────┘    ║
║                                                            ║
║  ┌──────────┐ ┌──────────┐                                ║
║  │ CNAS     │ │ Carte    │ ⭐ NEW                         ║
║  │          │ │ Fellah   │                                ║
║  │ [Voir]   │ │ [Voir]   │                                ║
║  └──────────┘ └──────────┘                                ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

## 📊 Document Count Display

### In List View (Pending Sellers Table)
```
┌─────────────────────────────────────────────────────────┐
│ User          │ Email         │ Documents │ Actions    │
├─────────────────────────────────────────────────────────┤
│ John Doe      │ john@mail.com │ 📄 6 docs │ ✓ ✗ →     │
│ (Client → Pro)│               │           │            │
└─────────────────────────────────────────────────────────┘
```

**Before**: Shows count without Carte Fellah
**After**: Includes Carte Fellah in the count ⭐

## 🎯 Key Visual Indicators

### Document Icons
- 📄 **Carte Fellah**: `eva:file-add-outline` (file with plus)
- 💼 **RC/Carte Auto**: `eva:briefcase-outline`
- 💳 **NIF**: `eva:credit-card-outline`
- 🔢 **N° Article**: `eva:hash-outline`
- 📊 **C20**: `eva:file-text-outline`
- 🔄 **CNAS**: `eva:refresh-outline`

### Color Scheme
- **Primary Blue**: Document cards background
- **Success Green**: Accept button
- **Error Red**: Reject button
- **Warning Orange**: Pending status

## 🖱️ User Interactions

### Click "Voir le document" Button
```
1. User clicks [Voir le document]
   ↓
2. New browser tab opens
   ↓
3. Document displays (PDF viewer or image)
   ↓
4. User can download or print
```

### Document URL Structure
```
Before: /uploads/identities/123456/document.pdf
After:  https://your-api.com/uploads/identities/123456/carte_fellah.pdf
```

## 📝 Empty State

### When No Carte Fellah Submitted
```
╔═══════════════════════════════════════╗
║  Documents soumis                     ║
║  ─────────────────────────────────    ║
║                                       ║
║  ┌──────────┐ ┌──────────┐           ║
║  │ RC/Carte │ │ NIF      │           ║
║  │ Auto     │ │ Required │           ║
║  └──────────┘ └──────────┘           ║
║                                       ║
║  (No Carte Fellah - not required)    ║
╚═══════════════════════════════════════╝
```

### When Carte Fellah Submitted
```
╔═══════════════════════════════════════╗
║  Documents soumis                     ║
║  ─────────────────────────────────    ║
║                                       ║
║  ┌──────────┐                         ║
║  │ Carte    │ ⭐                       ║
║  │ Fellah   │                         ║
║  │ [Voir]   │                         ║
║  └──────────┘                         ║
║                                       ║
║  (Only Carte Fellah - Fellah user)   ║
╚═══════════════════════════════════════╝
```

## 🎉 Success Indicators

### After Accepting Verification
```
╔═══════════════════════════════════════╗
║  ✅ Demande acceptée                  ║
║                                       ║
║  Cette demande a été acceptée.        ║
║  L'utilisateur a été vérifié avec     ║
║  succès.                              ║
╚═══════════════════════════════════════╝
```

## 🔔 Notifications

### When Document Viewed
```
🔔 Document ouvert dans un nouvel onglet
```

### When Verification Completed
```
✅ Demande acceptée avec succès
```

## 📱 Mobile Optimizations

- Larger touch targets (44px minimum)
- Stacked layout for better readability
- Simplified button text
- Responsive font sizes
- Touch-friendly spacing

## 🎨 Theme Support

### Light Mode
- White background
- Blue primary color
- Gray text

### Dark Mode (if implemented)
- Dark background
- Lighter blue accent
- Light gray text

## 🚀 Performance

- Lazy loading for document previews
- Optimized image sizes
- Fast document URL generation
- Cached API responses

---

**Note**: All visual elements are responsive and adapt to different screen sizes automatically!

