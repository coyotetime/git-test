# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

People with spare time (often 30–90 minutes) who want a short scenic drive near their current location without planning a route. Primary situation: “I have some time — where should I go?” on Vancouver Island and similar coastal/rural regions.

## Product Purpose

Scenic finds a nearby scenic drive that fits the user’s available time and mood. Success means returning at least one usable out-and-back drive when technically possible, with clear duration and destination.

## Positioning

Time-first scenic routing: duration is the hard constraint; vibe ranks candidates. Unlike generic maps or trip planners, Scenic starts from “how long do you have?” and returns a ready loop.

## Operating Context

Mobile-first (Expo / React Native, Expo Go for prototype). Uses device location, curated waypoints when available, then nearby OpenStreetMap places + OSRM driving routes. Public Overpass/OSRM are prototype-only.

## Capabilities and Constraints

- Home: pick duration (30/60/90) + optional vibe → find a drive
- Route result: map, details, stops, Start drive / Save (actions stubbed in prototype)
- Nearby discovery when curated waypoints are out of range
- Foreground location only
- Do not invent destinations, ratings, or Tesla/FSD features until explicitly requested

## Brand Commitments

- Name: **Scenic**
- Voice: terse, utilitarian, uppercase telemetry labels; industrial print personality
- Binding visual world (user-selected): Swiss Industrial Print brutalism — newsprint substrate, carbon ink, hazard-red accent, Archivo Black + JetBrains Mono, zero radius, hard borders, ASCII framing (`>>>`, `[ ]`, `///`)

## Evidence on Hand

- Working Expo app under `/workspace` (`app/index.tsx` home, `app/route.tsx` result)
- Theme tokens in `constants/theme.ts`
- No customer testimonials or press assets

## Product Principles

1. Duration fit beats vibe perfection.
2. Always prefer a usable nearby drive over a polished empty state.
3. Brand stays mechanical and high-contrast — never soft SaaS defaults.
4. Prototype APIs may fail; degrade with honest errors and temporary fallbacks.
5. Ship clarity over feature breadth.

## Accessibility & Inclusion

Target readable contrast on newsprint/ink palette; hit targets ≥44pt for primary controls. No product-specific WCAG certification yet.
