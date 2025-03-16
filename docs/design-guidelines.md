# Design Guidelines for the METHANE React Application

## 1. Thematic Foundation
**Theme**: Embrace an industrial aesthetic with a minimalist and clean approach. Draw inspiration from factory dashboards or engineering tools, using subtle geometric precision and muted tones.

**Mood**: Professional, efficient, and no-nonsense, with a focus on usability and clarity.

**Minimalism**: Every element should serve a purpose, with ample whitespace to enhance readability and avoid clutter.

## 2. Color Scheme
**Primary Background**: Light gray (#F5F5F5 or similar) to evoke an industrial workspace, with white (#FFFFFF) for content areas.

**Text**: Solid black (#000000) on white backgrounds for all text (headings, copy, labels) to ensure high readability.

**Links**: Classic old internet blue (#0000FF) for hyperlinks, displaying the raw path rather than descriptive text. No hover underlines - maintain clean aesthetic.

**Status Indicators**: Green (#A7D) for success states (e.g., "Connected" or "Endpoint: LOCAL"), orange (#FF4500) for critical indicators (e.g., "REGTEST"), and red (#DC3545) for errors, used sparingly.

**Secondary Elements**: Use muted industrial gray (#4A4A4A) for borders or highlights to denote structure without overwhelming the design.

## 3. Typography
**Font Family**:
- Use Roboto Mono for most interface text to maintain a technical, code-inspired feel
- Preserve original monospace font (--font-mono) for application title for brand consistency

**Font Size Hierarchy**:
- Main Headings (e.g., "Playground", "Explorer"): 24px, bold
- Category Headings (e.g., "Trace Methods"): 16px, bold, muted color
- Links and paths: 14px, bold, blue
- Body text: 14px, regular

**Line Spacing**: 1.5x line height for readability within dense sections.

**Contrast**: Ensure black text on white backgrounds meets accessibility standards (contrast ratio of at least 4.5:1).

## 4. Layout and Space Efficiency
**Container Consistency**: Header and content containers must have the same width (max-width: 1200px) for visual alignment and consistency.

**Front Page Layout**:
- Two Equal-Width Columns: Divide the front page into two equal-width columns:
  - **Left Column (Playground)**: Show API method paths organized by small category headings
  - **Right Column (Explorer)**: Show explorer paths with no descriptions

**Path Naming Conventions**:
- API methods should use `/api-methods/[method-name]` paths
- Explorer pages should use `/explorer/[entity]` paths
- Display the raw paths rather than descriptive text or buttons

**Content Organization**:
- Group API methods by categories (e.g., "Trace Methods", "Alkanes Methods")
- Use small category headings rather than individual method descriptions
- Remove unnecessary descriptions - the paths themselves should be descriptive

**Spacing**:
- Vertical Rhythm: Maintain a consistent 16px vertical rhythm between sections
- Horizontal Spacing: Use 20px gutters between the two main columns

**Responsive Design**:
- Mobile (below 768px): Stack the two columns vertically
- Tablet (768px and above): Maintain the two-column layout with adjusted spacing

## 5. Navigation and Interactivity
**Links**: Show the exact path instead of descriptive text (e.g., "/api-methods/simulate" rather than "Simulate Transaction")

**Header**: Include application title (using original font) with subtitle, endpoint toggle, and block height indicator

**Component Simplicity**: Avoid unnecessary UI elements - each component should serve a clear purpose

## 6. Accessibility and Performance
**Loading**: Use subtle indicators for data loading states

**Accessibility**: Ensure sufficient contrast ratios and support keyboard navigation
