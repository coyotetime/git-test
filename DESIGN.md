---
name: Scenic
description: Swiss Industrial Print — newsprint, carbon ink, hazard red
colors:
  background: "#F4F4F0"
  surface: "#EAE8E3"
  primary: "#111111"
  accent: "#E61919"
  text: "#111111"
  text-secondary: "#4A4A46"
  text-on-primary: "#F4F4F0"
  border: "#111111"
typography:
  brand:
    fontFamily: "Archivo Black, ArchivoBlack_400Regular, sans-serif"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 0.93
    letterSpacing: "-0.04em"
  heading:
    fontFamily: "Archivo Black, ArchivoBlack_400Regular, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.07
    letterSpacing: "-0.03em"
  section:
    fontFamily: "JetBrains Mono, JetBrainsMono_500Medium, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.1em"
  body:
    fontFamily: "JetBrains Mono, JetBrainsMono_400Regular, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.05em"
  button:
    fontFamily: "Archivo Black, ArchivoBlack_400Regular, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.05em"
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-on-primary}"
    rounded: "{rounded.none}"
    padding: "16px 24px"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
---

## Overview

Scenic’s visual system is **Swiss Industrial Print**: documentation-paper substrate, carbon ink structure, and a single hazard-red accent. Typography is the architecture. Surfaces are flat, corners are square, borders are hard 2px rules. ASCII framing (`>>>`, `[ ]`, `///`, `LOC //`) acts as industrial decoration, not novelty stickers.

This is an **Operate** product UI with brand-forward home composition — brand name must remain a hero-level signal.

## Colors

- **Background / newsprint:** `#F4F4F0`
- **Surface panel:** `#EAE8E3`
- **Ink / primary:** `#111111`
- **Secondary text:** `#4A4A46`
- **Hazard accent (only accent):** `#E61919` — rules, selected duration, prefixes, vital labels
- No gradients, glows, purple themes, or soft translucency

## Typography

- **Display / brand / buttons:** Archivo Black, uppercase, tight tracking, compressed leading
- **Telemetry / meta / chips:** JetBrains Mono, uppercase, open tracking
- Extreme scale contrast: brand ~56px vs meta ~11–12px

## Layout

- Visible compartmentalization via 2px borders and full-width rules
- Home first viewport: brand, one headline, duration, vibe, one CTA — no stats strips or card grids
- Mobile-first vertical stack with generous section gaps (`24–32px`)
- Zero floaty cards; interactive controls may use bordered blocks

## Elevation & Depth

None. No shadows. Hierarchy from type scale, ink weight, and red structural marks only.

## Shapes

All radii `0`. Square markers, square chips, square buttons. Dashed border reserved for Surprise vibe only.

## Components

- **Primary button:** solid ink fill, `>>>` prefix in red, pressed state fills accent red
- **Secondary button:** bordered empty fill, `///` prefix
- **Duration selector:** contiguous ink-bordered grid; selected cell fills accent
- **Vibe chips:** bordered surface tiles with `[ label ]` brackets
- **Section labels:** mono uppercase, often `[ SECTION ]` or red meta

## Do's and Don'ts

**Do**
- Keep brand “Scenic” dominant on the home first screen
- Use hazard red sparingly for structure and selection
- Preserve ASCII industrial framing
- Prefer hard edges and newsprint atmosphere

**Don't**
- Introduce Inter/Roboto/system UI fonts
- Soften into cream+serif terracotta or purple SaaS gradients
- Add card chrome, pills, multi-layer shadows, or glow
- Overload the first viewport with secondary marketing blocks
