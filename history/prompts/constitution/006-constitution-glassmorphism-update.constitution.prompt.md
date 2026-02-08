---
id: 006-constitution-glassmorphism-update
title: Constitution Phase 5 Design System Update
stage: constitution
date_iso: "2026-02-08"
surface: agent
model: opencode/minimix-m2.1-free
feature: none
branch: main
command: Update constitution for Phase 5 glassmorphism UI redesign
labels:
  - constitution
  - design-system
  - ui-redesign
  - phase-5
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_created: []
files_modified:
  - .specify/memory/constitution.md
files_deleted: []
tests_run: []
tests_added: []
prompt_text: |
  update the existing contitution for phase 5 Load and use the following skills:
  /frontend-design
  /ui-ux-pro-max
  /frontend-design-pro
  /tailwindcss-advanced-design-systems
  /frontend-design-system

  Project Context:
  I already have a full-stack Task Management SaaS app built with Next.js + TypeScript + Tailwind + shadcn/ui.

  IMPORTANT:

  * DO NOT create new pages
  * DO NOT create new files
  * DO NOT change routing
  * ONLY update the existing UI code and styling
  * Treat this as a brownfield UI redesign
  * Focus on global theme + component-level upgrades

  Design Direction:
  Convert the entire application into a **Glassmorphism Luxury UI system**.

  Design keywords (strict):
  frosted glass, translucent layers, blur depth, luxury, premium, bold typography, modern SaaS, clean but expressive

  Color & Visual System:
  Use CSS variables everywhere.

  Palette:
  --smart-blue: #0466c8ff;
  --sapphire: #0353a4ff;
  --regal-navy: #023e7dff;
  --prussian-blue: #002855ff;
  --prussian-blue-2: #001845ff;
  --prussian-blue-3: #001233ff;
  --twilight-indigo: #33415cff;
  --blue-slate: #5c677dff;
  --slate-grey: #7d8597ff;
  --lavender-grey: #979dacff;

  Visual Rules:

  * Semi-transparent glass panels
  * Backdrop blur layers
  * Soft glowing borders
  * Refined highlights
  * One dominant accent color
  * Strong contrast for accessibility
  * Depth through layering + elevation
  * Premium feel similar to a $50k SaaS product

  Typography (Non-Negotiable):

  * DO NOT use Inter
  * DO NOT use Roboto
  * DO NOT use Arial
  * DO NOT use system-ui
  * Use premium fonts:

    * Clash Display
    * Neue Machina
    * Satoshi

  Layout Philosophy:

  * Break boring centered-card layouts
  * Use asymmetry and layered depth
  * Overlapping glass panels
  * Confident visual hierarchy
  * Consistent spacing rhythm
  * Clear CTA emphasis

  Signature Detail (Required):
  Add ONE identity element across the app:
  Example:

  * Subtle animated glass glow
  * Light reflection sweep
  * Soft gradient motion on hover

  Theme System (Very Important):
  Implement a full **Dark + Light theme system**:

  Light Theme:

  * Soft white glass layers
  * Blue-tinted blur panels
  * Elegant shadows

  Dark Theme:

  * Deep navy glass panels
  * Strong glow edges
  * Premium contrast

  Requirements:

  * Theme switcher support
  * CSS variables for both themes
  * Smooth transition between themes
  * prefers-reduced-motion support

  Accessibility:

  * WCAG AA contrast
  * Proper focus states
  * Keyboard navigation visible
  * Motion-safe animations

  Component-Level Styling Scope:
  Apply the new visual system consistently to existing:

  * Login UI
  * Signup UI
  * Dashboard layout
  * Sidebar
  * Topbar
  * Task cards
  * Stats panels
  * Forms
  * Inputs
  * Buttons
  * Modals

  Do NOT redesign structure.
  Only upgrade visual identity and depth.

  Tech Constraints:

  * Next.js + TypeScript
  * Tailwind CSS
  * shadcn/ui where appropriate
  * Production-grade class structure
  * Fully responsive

  Execution Goal:
  Refactor the CURRENT UI code into a cohesive luxury glassmorphism design system without introducing new pages, routes, or files.
response_text: |
  Updated constitution from v1.0.0 to v1.1.0 with Phase 5 Glassmorphism Design System principles. Added Principle VII (Design System Excellence) covering premium typography rules, glassmorphism depth requirements, CSS variable architecture, theme system requirements, component styling standards, and accessibility requirements. Updated performance standards with UI Performance subsection, code review requirements with visual regression testing, frontend technology stack, and added comprehensive Project Phases section documenting all 5 phases. Templates validated for alignment.
outcome: |
  Constitution updated successfully at .specify/memory/constitution.md. Version bumped 1.0.0 → 1.1.0 (MINOR - added new principles section and Phase 5 documentation). All templates validated for alignment.
evaluation:
  completeness: Complete with all Phase 5 requirements integrated
  clarity: Clear design principles with specific rules and examples
  compliance: Follows constitution template structure and versioning policy
  quality: Comprehensive coverage of glassmorphism UI requirements
---
