---
type: review-lens
lens_name: accessibility
category: specialized
applies_to: [code, production]
version: 4.0
updated: 2026-03-01
status: stable
---

# Accessibility Lens

## Lens Purpose

This lens intensifies review for accessibility, inclusive interaction, and structural usability in:
- websites
- apps
- dashboards
- internal tools
- onboarding flows
- content-heavy pages
- generated documents and exports
- AI-native interfaces with dynamic or streaming behavior

It exists to ensure that products are not merely functional for idealized mouse-and-screen users, but usable by people relying on:
- keyboard navigation
- screen readers
- zoom and larger text
- reduced motion preferences
- high contrast needs
- clear error messaging and predictable interaction patterns

This is not a pasted WCAG checklist.
It is a practical review overlay adapted to **vibe-coded interfaces, AI-generated content, and mixed product/content work**.

---

## Why This Lens Exists

Accessibility is a major blind spot in vibe-coded systems.

AI-generated interfaces often:
- look polished while using non-semantic structure
- implement interaction with `div`/`span` click handlers instead of real controls
- generate modals, drawers, dropdowns, and forms without correct focus handling
- overuse ARIA without understanding it
- create decorative but inaccessible visual patterns
- produce plausible-looking content structures that are semantically broken

AI-generated content pipelines also create accessibility risk at scale by producing:
- inaccurate alt text
- broken heading hierarchies
- inaccessible tables
- noisy decorative descriptions
- dynamic content that screen readers cannot follow cleanly

Without a dedicated lens, products can pass normal review while still being inaccessible in critical ways.

---

## Lens Objective

When this lens is applied, the reviewer must determine, with evidence:

1. Whether key user flows are structurally accessible
2. Whether semantics, focus, keyboard use, and assistive-tech expectations are respected
3. Whether visual and interaction design rely on inaccessible assumptions
4. Whether AI-generated content or interfaces create accessibility failures at scale
5. Whether the product’s accessibility posture is honest enough for its intended release scope

If the reviewer cannot explain how a keyboard user or screen-reader user would complete key flows, this lens should produce strong caution or blocking findings.

---

## Applies To

This lens is most useful for:
- web apps
- websites and landing pages
- dashboards
- forms and onboarding flows
- design-system/component libraries
- content systems and generated pages
- chat/assistant interfaces
- exported PDFs/emails/HTML content

It is especially important when a project includes:
- custom UI components
- heavy client-side rendering
- streaming AI responses
- AI-generated content structure or alt text
- rich form/error handling

It may be applied primarily to:
- **Code review** for UI structure, semantic markup, generated interface patterns, and accessibility-sensitive implementation
- **Production review** for real user flows, interaction behavior, and runtime accessibility truth

---

## Core Review Rule

Do not confuse visual polish with accessibility.

A product does **not** get accessibility credit because:
- it looks modern
- it uses a component library
- it passes basic HTML rendering
- ARIA attributes are present somewhere
- there is a consent banner, modal, or form that appears to work visually
- the original builder can complete the flow with a mouse

The reviewer must evaluate whether the structure and interaction model are accessible in practice.

---

## What This Lens Should Emphasize

### 1. Semantic Structure & Document Hierarchy
Reviewer should intensify attention on:
- heading hierarchy
- landmark regions (`main`, `nav`, `header`, `footer`, etc.)
- real list/table semantics
- meaningful page/document outline
- whether structure is semantic rather than purely visual

### Example failure patterns
- multiple decorative H1s with no real page hierarchy
- table-like layouts built from generic divs
- important navigation or main content lacking landmarks

---

### 2. Keyboard Navigation & Focus Management
Reviewer should intensify attention on:
- complete tab reachability for interactive elements
- logical focus order
- focus trapping and return behavior in modals/drawers
- skip links where appropriate
- keyboard support for custom widgets

### Example failure patterns
- clickable spans/divs with no keyboard interaction
- modal opens but focus remains behind it
- closing a dialog drops focus unpredictably
- keyboard trap with no clear exit

---

### 3. ARIA Correctness, Not Just Presence
Reviewer should intensify attention on:
- whether ARIA is necessary and used correctly
- live region usage for dynamic updates
- state attribute correctness (`aria-expanded`, `aria-selected`, etc.)
- whether ARIA is compensating for bad structure rather than supporting good structure

### Example failure patterns
- redundant or meaningless ARIA labels
- static `aria-expanded` values that never update
- live announcements missing for important dynamic state changes
- ARIA cargo-culting that creates more confusion than clarity

---

### 4. Forms, Errors & Input Clarity
Reviewer should intensify attention on:
- labels associated with inputs
- placeholder-only inputs
- accessible error messaging
- required-field clarity beyond color alone
- programmatic association between field and error/help text

### Example failure patterns
- red border indicates failure, but assistive users get no useful error context
- inputs have placeholders but no labels
- validation feedback is visible only, not announced or connected

---

### 5. Color, Contrast & Non-Visual Meaning
Reviewer should intensify attention on:
- contrast for text and interactive UI
- color-only communication of state or meaning
- dark mode/high-contrast behavior
- generated themes or token combinations that look stylish but fail readability

### Example failure patterns
- error and success differentiated only by red vs green
- low-contrast secondary text used for important instructions
- AI-generated theme introduces inaccessible contrast pairs

---

### 6. Motion, Animation & Sensory Safety
Reviewer should intensify attention on:
- respect for reduced-motion preferences
- excessive animation in navigation or state change
- auto-playing or flashing content
- whether motion is required to understand state changes

### Example failure patterns
- animations continue despite `prefers-reduced-motion`
- flashy loading patterns create distraction or risk
- critical transitions rely on motion alone to communicate what changed

---

### 7. Responsive, Zoom & Text Scaling Behavior
Reviewer should intensify attention on:
- 200% zoom usability
- large-text and reflow behavior
- touch target sizing
- whether layout breaks under user scaling preferences

### Example failure patterns
- horizontal scroll required for ordinary reading at zoom
- tiny tap targets in critical flows
- increased text size causes overlap or hidden actions

---

### 8. AI-Generated Content Accessibility
Reviewer should intensify attention on:
- alt text accuracy and concision
- heading hierarchy in generated pages/articles
- accessible lists/tables in generated content
- whether AI content generation creates decorative noise for screen-reader users
- whether generated summaries preserve structure and comprehension

### Example failure patterns
- hallucinated alt text that confidently describes the wrong image
- every decorative image receives noisy alt text
- generated article structure is visually fine but semantically chaotic

---

### 9. Dynamic / Streaming Interface Accessibility
Reviewer should intensify attention on:
- live-region strategy for streaming AI/chat interfaces
- status/loading announcements
- readable message history and focus transitions
- dynamic route/state changes that need screen-reader awareness
- whether streaming content becomes auditory chaos for assistive users

### Example failure patterns
- screen reader announces streaming response word-by-word in unusable fragments
- SPA route changes without title/focus updates
- toast/status messages appear visually but not semantically

---

### 10. Exported / Generated Document Accessibility
Reviewer should intensify attention on:
- semantic HTML output from content pipelines
- accessible email structure
- meaningful table headers in exports
- whether PDFs or generated docs preserve readable structure where applicable

### Example failure patterns
- generated email templates with image-only content and weak alt text
- exported tables with no meaningful headers
- markdown-to-HTML conversion flattening hierarchy into styling only

---

## What This Lens Should Not Duplicate

This lens should not become a generic front-end review dump.

Avoid using it to re-run:
- general HTML validation and linting → Code 3
- security/XSS review → Security 4
- generic privacy/compliance review → Code 8 / Security 1
- performance-only concerns → Production 4
- SEO review as a separate objective
- general content quality/tone except where comprehension/access parity is affected

Instead, the lens should ask:
- can a wider range of users actually perceive, navigate, understand, and complete the flow?

---

## Recommended Reviewer Output Structure

When this lens is active, the reviewer should include the following block in the stage report.

### Accessibility Lens Summary
- Overall accessibility posture:
- Critical user flows reviewed:
- Highest-risk access barrier:
- Static vs runtime confidence:

### Concern Area Findings
| Concern Area | Status | Key Notes |
|---|---|---|
| Semantic structure & hierarchy | PASS / NEEDS_WORK / BLOCK | ... |
| Keyboard navigation & focus | PASS / NEEDS_WORK / BLOCK | ... |
| ARIA correctness | PASS / NEEDS_WORK / BLOCK | ... |
| Forms & errors | PASS / NEEDS_WORK / BLOCK | ... |
| Color/contrast/non-visual meaning | PASS / NEEDS_WORK / BLOCK | ... |
| Motion & sensory safety | PASS / NEEDS_WORK / BLOCK | ... |
| Responsive/zoom/text scaling | PASS / NEEDS_WORK / BLOCK | ... |
| AI-generated content accessibility | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Dynamic/streaming accessibility | PASS / NEEDS_WORK / BLOCK / N/A | ... |
| Exported/generated documents | PASS / NEEDS_WORK / BLOCK / N/A | ... |

### High-Signal Findings
For each significant finding:
- Finding:
- User impact:
- Evidence:
- Fix direction:
- Runtime test needed?:

### Accessibility Lens Blockers
- Blocking accessibility issues:
- Release-scope limitations:
- Confidence limitations:

---

## Severity Guidance

### BLOCK-level lens findings
Use when:
- primary content/action is inaccessible to keyboard or assistive-tech users
- focus traps or severe navigation barriers exist
- critical forms/errors are not usable accessibly
- dynamic/streaming behavior makes core product use inaccessible
- the intended release scope would be irresponsible with the current barrier level

### NEEDS_WORK-level lens findings
Use when:
- the product is partly accessible but has meaningful friction or structural gaps
- accessibility is uneven across key flows
- generated UI/content patterns are trending inaccessible even if not catastrophic yet

### PASS-level lens findings
Use when:
- key flows are structurally accessible
- semantic, focus, and feedback behavior are credible
- reviewer can explain how users with common accessibility needs would complete critical tasks with reasonable confidence

---

## Known Failure Modes This Lens Should Catch

Examples of issues this lens should surface aggressively:
- div/span click targets masquerading as buttons
- modals/drawers without proper focus movement and return
- placeholder-only forms
- red-only error indicators
- decorative but misleading ARIA additions
- AI-generated alt text that is inaccurate or noisy
- broken heading hierarchies across generated pages
- streaming chat responses without usable live-region strategy
- SPA route changes with no title/focus announcement
- responsive layouts that collapse under zoom or larger text

---

## Lens Interaction Guidance

This lens pairs especially well with:
- **UX & Interaction Clarity** for broader usability beyond strict accessibility structure
- **AI Systems** when the interface or content is generated dynamically by models
- **Content Quality & Information Integrity** when generated copy and structure are both in scope
- platform lenses when accessibility varies materially by environment or OS

---

## Final Standard

When this lens is applied successfully, the reviewer should be able to say:

> I can explain how users relying on keyboard navigation, assistive technologies, clearer structure, reduced motion, and scalable text would experience the product’s important flows, and the system is not relying on visual polish to hide structural accessibility failure.

If that statement cannot be made honestly, this lens should produce serious findings.
