# Design System Specification: Al-Haq Initiative

## 1. Overview & Identity
**Creative North Star: The Dignified Archive**

The Al-Haq Initiative is the educational, historical, and community-focused arm of Al-Haq. The design system rejects modern "tech startup" roundness and bubbles, adopting a structured, academic layout reminiscent of a library or research archive. We achieve this through **Subtle Borders**, **Structured Spacing**, and **Flat Rectangular Shapes**. The primary goal is to present historical documents, community guides, and Islamic digital tools with readability, sobriety, and authority.

## 2. Color Palette & Tonal Depth

The palette relies on Imperial Pine Green and warm gold accents, structured over clean light backgrounds in light mode, and dark pine/navy in dark mode.

### Tonal Hierarchy (Tailwind Config)
*   **Primary:** `#0B532E` (Imperial Pine Green) — Used for headers, primary actions, and hero sections.
*   **Secondary:** `#D4AF37` (Gold) — Used for accents, badges, highlight borders, and active nav links.
*   **Background Base:** `#f8faf9` (Clean Mint/Off-White) — The main page background.
*   **Surface Lowest:** `#ffffff` (White) — Used for cards and primary reading panes to lift them against the base.
*   **Surface Low:** `#f2f7f4` — Alternate section background.
*   **Surface High:** `#d4e4da` — Highlight containers.
*   **On-Surface:** `#111827` (Charcoal) — Primary text color.
*   **On-Surface-Variant:** `#4b5563` (Muted Gray) — Secondary text/metadata.
*   **Outline-Variant:** `#d1d5db` — Thin structural dividers.

### Dark Mode Mapping
When the `.dark` class is applied to the root element, the tokens map as follows:
*   **Background Base:** `#071422` / `#051f12` (Deep Dark Base)
*   **Surface Lowest:** `#0d2238` / `#082b1a` (Dark Surface)
*   **Surface Low:** `#0f172a` (Slate Deep)
*   **Surface High:** `#334155` (Slate Muted)
*   **Text Primary (`text-on-surface`):** `#f8fafc` (Off-white)
*   **Text Secondary (`text-on-surface-variant`):** `#94a3b8` (Muted Slate)
*   **Accent Swap:** In dark mode, `.bg-primary` and `.text-primary` map to Gold (`#D4AF37`) for readability and high contrast, using `#05361D` as the matching text color.

## 3. Typography
The typography system focuses on academic readability, utilizing a classic editorial serif for titles and a crisp sans-serif for reading structure.

*   **Display & Headlines (`Source Serif 4`):** Used for main headings (`h1`, `h2`, `h3`, `.font-headline`). Sets a traditional, authoritative tone.
*   **Body & Labels (`Inter`):** Used for body paragraphs, lists, button text, and metadata.
*   **Arabic Text (`Amiri`):** Specifically loaded for Islamic scripture and Arabic quotes to ensure proper rendering and classic proportions.

## 4. Spacing & Structure
The layout uses flat, structured boundaries rather than rounded pills:
*   **Border Radius:** Explicitly restricted to very sharp parameters:
    *   Default Radius: `0.125rem` (`2px`) for base boxes, cards, and input fields.
    *   Large Radius (`lg`): `0.25rem` (`4px`) for feature blocks.
    *   Extra Large (`xl`): `0.5rem` (`8px`) for modals.
    *   Full Radius (`full`): `0.75rem` (`12px`) used only for small badges or toggle pills.
*   **Spacing Rules:**
    *   `section-gap`: `80px` of vertical padding between content blocks.
    *   `content-gap`: `32px` spacing between text and media/columns.
    *   `gutter`: `24px` horizontal column spacing.

## 5. Key Components

### Research Library Cards
*   Flat white containers with thin `#d1d5db` outlines (15% opacity in dark mode).
*   Bold serif headings, muted sans-serif publication metadata, and a gold arrow indicator.

### Quran Reader & Interactive Panels
*   Flexible grids with sticky sidebar tables of contents.
*   Font sizes customizable for readability, defaulting to large Amiri types for scripture.

### Donation Flow
*   Flat button selections with secondary gold highlights when active.

## 6. Motion & Transitions
Transitions are subtle, designed to avoid distracting the reader.
*   **Timing:** Standard interactive transitions (hovers, clicks) use a uniform duration of `300ms` with `transition-colors` or `transition-opacity`.
*   **Active Link States:** Navigation elements transition text color from `primary` to `secondary` (Gold) on hover, with a subtle underline fade-in.
