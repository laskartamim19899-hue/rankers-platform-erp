---
name: Academic Authority
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#3e2400'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c3800'
  on-tertiary-container: '#ef9900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  table-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin: 24px
---

## Brand & Style
This design system is built on a **Corporate/Modern** aesthetic tailored for high-stakes educational management. The visual language balances institutional authority with the streamlined efficiency of modern SaaS. It utilizes a minimalist foundation to prioritize data density and legibility without overwhelming the user. Key characteristics include high-contrast information displays, purposeful whitespace to separate administrative modules, and a "ShadCN-inspired" structural discipline that relies on thin borders rather than heavy shadows to define interface boundaries. The goal is to evoke a sense of reliability and academic excellence for administrators, teachers, and students alike.

## Colors
The palette is dominated by a deep "Institutional Blue" (#1E3A8A) to anchor the brand in professionalism. Success Green (#10B981) is utilized specifically for academic achievement metrics, grade improvements, and financial clearance indicators. The Warm Amber (#F59E0B) is reserved for high-priority notifications and attendance alerts. 

For the **Light Mode**, surfaces use a mix of pure white (#FFFFFF) and a very subtle slate-tinted background (#F8FAFC) to reduce eye strain. In **Dark Mode**, the system shifts to a deep charcoal base (#020617) with primary blue used more sparingly as an accent to maintain high contrast for data-heavy tables.

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-dense environments. The type scale is strictly hierarchical to help users navigate complex ERP dashboards. 

Headlines use a tighter letter-spacing and heavier weights to command attention. Body text is optimized for long-form reading of reports. A specific `table-data` style is defined at 13px to maximize information density in student registries and financial ledgers without sacrificing clarity. For metadata and non-interactive labels, use the `label-caps` style in uppercase to differentiate from actionable body text.

## Layout & Spacing
The layout employs a **Fluid Grid** system based on a 12-column structure for desktop, collapsing to 1 column for mobile devices. It utilizes an 8px rhythmic scale for all spacing decisions.

For dashboards, content is housed in cards that span 3, 4, 6, or 12 columns. Data tables should allow for horizontal scrolling on mobile devices while maintaining fixed "Sticky" columns for student names/IDs. Use `md` (16px) for standard gutters and internal card padding, and `lg` (24px) for page margins to provide a breathing room that counteracts the density of academic data.

## Elevation & Depth
This design system follows a **Tonal Layering** and **Low-Contrast Outline** approach. Depth is created primarily through surface color shifts and 1px borders rather than heavy shadows.

- **Level 0 (Background):** The lowest layer, using the default background color.
- **Level 1 (Cards/Sections):** Uses a white (or dark gray) background with a 1px border (#E2E8F0 in light mode).
- **Level 2 (Popovers/Dropdowns):** Elevated using a very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) to suggest interactivity and temporary focus.
- **Level 3 (Modals):** Centered with a semi-transparent backdrop blur (8px) to isolate the academic task from the background data.

## Shapes
The shape language is **Soft**, utilizing a consistent 0.25rem (4px) base radius for standard UI elements like input fields and buttons. Larger containers like dashboard cards and modals use the `rounded-lg` (8px) setting to provide a modern, approachable feel. This subtle rounding maintains a professional, systematic appearance while avoiding the starkness of sharp corners or the casual nature of overly rounded "pill" shapes.

## Components
- **Buttons:** Use the Primary Blue for main actions (e.g., "Submit Grades"). Secondary buttons use a ghost style with a subtle border. Success and Danger buttons are reserved for finality (e.g., "Approve Payment" or "Delete Record").
- **Data Tables:** Headers must be sticky with a subtle background tint. Row hovering should trigger a slight tonal shift to guide the eye.
- **Input Fields:** Use a standard height of 40px. Focus states must use a 2px Primary Blue ring. Labels should always be visible above the input, never hidden as placeholders.
- **Chips/Badges:** Use for status indicators (e.g., "Paid", "Enrolled", "Late"). These use a low-opacity background of the semantic color with a high-contrast text version of the same color.
- **Progress Bars:** Utilized for curriculum completion and attendance targets, using the Success Green for positive progress.
- **Academic Cards:** Specialized containers for student profiles including an avatar, ID number, and quick-action icons for messaging or grade entry.