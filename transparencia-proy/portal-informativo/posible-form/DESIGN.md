---
name: Municipal Civic Board
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#43474d'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#74777e'
  outline-variant: '#c3c6ce'
  surface-tint: '#49607c'
  primary: '#001428'
  on-primary: '#ffffff'
  primary-container: '#0f2942'
  on-primary-container: '#7991af'
  inverse-primary: '#b0c9e8'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#310001'
  on-tertiary: '#ffffff'
  tertiary-container: '#580004'
  on-tertiary-container: '#ff4f46'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#b0c9e8'
  on-primary-fixed: '#011d35'
  on-primary-fixed-variant: '#314863'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Public Sans
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: -0.025em
  display-mobile:
    fontFamily: Public Sans
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Public Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Public Sans
    fontSize: 1.625rem
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Public Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Public Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: '1.35'
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Public Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.55'
  body-sm:
    fontFamily: Public Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: Public Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.025em
  label-md:
    fontFamily: Public Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.035em
  label-sm:
    fontFamily: Public Sans
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  container-sm: 640px
  container-md: 768px
  container-lg: 1024px
  container-xl: 1280px
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
---

## Brand & Style

The design system establishes an authoritative, accessible, and community-centered civic interface for municipal announcements, mayoral decrees, public consultations, and urgent alerts. The interface projects governmental legitimacy without bureaucratic opacity: it balances statutory weight with civic warmth, clarity, and uncompromising public accessibility.

### Design Movement
The system operates on an **Institutional Modern** style—synthesizing Swiss modernist clarity, rigorous public-sector accessibility standards (WCAG 2.2 AAA target for text, AA for UI controls), and contemporary municipal UI patterns. Information hierarchy is stark, predictable, and functional: critical civic notices must be comprehended within seconds regardless of device, age, or visual acuity.

### Emotional Demeanor
- **Authoritative & Trustworthy:** Direct visual connection to municipal authority via deep navy structural anchoring, precise typographic cadence, and deliberate official seal placements.
- **Welcoming & Empathetic:** Softened via warm civic teal accents, generous line heights, humanized spacing, and non-intimidating container radiuses.
- **Urgent without Alarmism:** Emergency notices deploy high-contrast amber/red alert states that command immediate prioritization without degrading readability or inducing panic.

## Colors

The palette is tuned specifically for daylight clarity, high-glare mobile outdoor reading, and rigorous contrast compliance.

### Palette Architecture
- **Primary (`#0F2942` — Deep Municipal Navy):** Anchors headers, primary actions, official seals, and statutory document titles. Delivers a contrast ratio of >13:1 against white surfaces.
- **Secondary / Accent (`#0D9488` — Warm Civic Teal):** Applied to active navigation states, public participation badges, interactive affordances, and non-punitive focus outlines.
- **Tertiary / Emergency Alert (`#DC2626` — Crimson Alert):** Reserved strictly for emergency decrees, road closures, health advisories, and critical public safety notices. Accompanied by **Warning Amber (`#D97706` / `#F59E0B`)** for informational notices and service maintenance advisories.
- **Neutral Core (`#0F172A` Text Primary, `#334155` Text Secondary):** Deep slate values replace pure black to prevent optical vibration while exceeding AAA contrast thresholds on light grounds.
- **Surface Scale:** Base viewport operates on `#F8FAFC` (Slate 50), elevated cards and panels rest on `#FFFFFF`, with micro-dividers and structural card borders set to `#E2E8F0` (Slate 200).

```
Surface Base:        #F8FAFC
Surface Elevated:    #FFFFFF
Surface Accent/Tint: #F0FDFA (Teal 50)
Border Subtle:       #E2E8F0
Border Emphasized:   #94A3B8
Text Primary:        #0F172A (14.2:1 against #FFF)
Text Secondary:      #334155 (9.6:1 against #FFF)
Alert Background:    #FEF2F2
Alert Text/Icon:     #991B1B
Warning Background:  #FFFBEB
Warning Text/Icon:   #92400E
```

## Typography

The design system standardizes on **Public Sans** across all roles. Designed explicitly for civic institutions and digital government services, Public Sans provides robust rendering, wide open apertures, distinct numeral forms (critical for official ordinance numbering and dates), and optimal legibility at compact mobile scale.

### Typographic Rules
- **Numerical Regularity:** Official docket numbers, gazette references, and publication timestamps must utilize tabular numbers (`font-feature-settings: "tnum"`) to maintain optical alignment in metadata tables.
- **Hierarchy Stacking:** Civic announcements pair a `label-md` category indicator directly over a `headline-md` or `headline-sm` title, followed by `body-sm` date and department provenance.
- **Caps Discipline:** Full uppercase is restricted exclusively to `label-sm` status chips (e.g., `URGENTE`, `PUBLICADO`, `EN PLAZO`) with expanded letter-spacing (`0.05em`) to guarantee readability.

## Layout & Spacing

A mobile-first fluid grid with strict container constraints governs the layout. The civic announcement board is structured around a single-column default flow on mobile devices, expanding to a 12-column asymmetric grid on desktop screens to support contextual filtering, calendar timelines, and emergency sidebars.

### Breakpoints & Structure
- **Mobile (0 – 767px):** 4-column layout, 16px (`1rem`) outer margins, vertical single-stack cards, sticky bottom action bar for municipal services/search.
- **Tablet (768 – 1023px):** 8-column layout, 24px (`1.5rem`) outer margins, 2-column card display.
- **Desktop (1024px+):** 12-column layout max-width `1280px`, centered. 4 columns allocated to persistent search, municipal department filters, and legal gazette archives; 8 columns allocated to notice streams and active dossiers.

### Spacing Cadence
Density adheres to an 8px base rhythm (`4px` for micro-elements). Notices emphasize scanability: cards maintain a minimum internal padding of `1.25rem` on mobile and `1.5rem` on desktop to prevent visual clutter when displaying statutory text.

## Elevation & Depth

To preserve an official, civic character, the system avoids dramatic, floating skeuomorphic shadows in favor of **structured surface tiers and crisp, low-contrast borders**. Depth is communicated through controlled stacking and clean borders rather than sheer elevation.

### Elevation Levels
- **Tier 0 (Canvas Base):** `#F8FAFC`. Background layer for the civic portal.
- **Tier 1 (Surface Default / Standard Cards):** `#FFFFFF`, bounded by a 1px solid border of `#E2E8F0`. Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Tier 2 (Interactive / Hovered Notices):** `#FFFFFF`, border shifts to `#94A3B8`. Shadow: `0 4px 6px -1px rgba(15, 41, 66, 0.08), 0 2px 4px -2px rgba(15, 41, 66, 0.04)`.
- **Tier 3 (Modals, Overlays, Urgent Banners):** `#FFFFFF`, border-left: 4px solid `#DC2626` (for critical notices) or `#0F2942` (for decrees). Shadow: `0 10px 15px -3px rgba(15, 41, 66, 0.12), 0 4px 6px -4px rgba(15, 41, 66, 0.06)`.

## Shapes

The interface balances statutory firmness with approachable public communication. Base UI containers utilize `roundedness: 2` (8px base radius, 16px for cards and dialogue sheets).

### Radii Hierarchy
- **Pill Shape (`9999px`):** Reserved strictly for taxonomy chips, status indicators, and notification badges (e.g., department tags, gazette status, urgency labels).
- **Cards & Announcement Surfaces (`1rem / 16px`):** Soft modern framing that eliminates severe corners while maintaining rectangular spatial predictability for long-form municipal texts.
- **Controls & Form Inputs (`0.5rem / 8px`):** Buttons, search fields, date pickers, and filter dropdowns conform to the 8px baseline radius.

## Components

### 1. Buttons
- **Primary Civic Action:** Background `#0F2942`, text `#FFFFFF`, border 1px solid transparent, radius `0.5rem`, padding `0.75rem 1.25rem`. Hover: `#1A365D`. Focus: 3px outline in `#0D9488` with 2px offset.
- **Secondary Civic Action:** Background `#FFFFFF`, text `#0F2942`, border 1.5px solid `#0F2942`, radius `0.5rem`. Hover: background `#F1F5F9`.
- **Tertiary / Utility:** Background transparent, text `#0D9488`, underline on hover, zero horizontal padding.

### 2. Category Chips & Pill Badges
- **Form:** Pill shape (`9999px` radius), padding `0.25rem 0.75rem`, typography `label-sm`.
- **Informational / Department:** Background `#F0FDFA`, text `#0F766E`, border 1px solid `#CCFBF1`.
- **Official Decree:** Background `#EFF6FF`, text `#1E40AF`, border 1px solid `#DBEAFE`.
- **Emergency / Urgent Alert:** Background `#FEF2F2`, text `#991B1B`, border 1px solid `#FEE2E2`. Includes a pulsating `6px` solid indicator dot.
- **Expired / Archive:** Background `#F1F5F9`, text `#64748B`, border 1px solid `#E2E8F0`.

### 3. Announcement Cards
- Built using Tier 1 elevation: `#FFFFFF` surface, 1px `#E2E8F0` border, `1rem` radius.
- **Header:** Row layout containing department icon/crest placeholder, department name (`label-md`), and status badge aligned to the end.
- **Body:** Notice headline (`headline-sm`, `#0F172A`), clamp 2 lines, followed by a concise 3-line abstract in `body-sm` (`#334155`).
- **Footer:** Publication metadata (Statutory File No. / Fecha de Publicación / Plazo de Alegaciones) displayed with tabular figures, plus an explicit "Ver Convocatoria Completa" secondary CTA.
- **Urgent Variant:** A 4px vertical accent bar on the left edge in `#DC2626` with a soft tinted header background (`#FEF2F2`).

### 4. Input Fields & Search
- Background `#FFFFFF`, height `48px` (touch-optimized minimum), border 1px solid `#CBD5E1`, radius `0.5rem`.
- Focus state: border color `#0D9488`, shadow `0 0 0 3px rgba(13, 148, 136, 0.2)`.
- Global search includes integrated municipal category selector (e.g., "Hacienda", "Urbanismo", "Empleo Público", "Protección Civil").

### 5. Checkboxes & Radio Controls
- Minimum 24×24px interactive hit area, 18×18px visible box/circle.
- Border 2px solid `#64748B`, active state background `#0F2942`, check/bullet glyph `#FFFFFF`.
- High contrast focus ring matches the `#0D9488` global focus standard.

### 6. Official Notice Metadata Banner (Docket Header)
- Specialized component for single announcement view: pinned full-width or card-level header displaying the municipal crest, official expediente number, signatory title (e.g., "Alcalde-Presidente"), digital signature verification hash, and direct PDF download link.