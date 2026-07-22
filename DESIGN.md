---
name: ROSE Robotics
description: A cold-luxury product system for an articulated robotic arm.
---

# Design System: ROSE Robotics

**Branch expression:** Cinematic Material. This version turns the product into a sequence of form, light, and surface studies inside one controlled full-viewport material stage.

## Overview

**Creative North Star: "The Kinematic Gallery"**

ROSE presents industrial robotics with the calm, object-first confidence of a major product launch. The robotic arm is treated as a precise moving sculpture: large in frame, physically lit, and explained through its joints, reach, and modular form rather than surrounded by interface decoration.

The visual world combines cool gallery surfaces, soft chrome, graphite type, and a single controlled rose accent. Layouts remain quiet enough to read immediately, while WebGL depth and authored scroll sequences carry the ambition. The signature is a continuous camera path that moves from complete object to joint architecture to exploded assembly without breaking spatial continuity, followed by a horizontal system study that makes the product architecture tangible.

**Key Characteristics:**

- Cool pearl surfaces and quiet chrome materiality
- Monumental product scale with restrained typography
- One rose accent used for actions and active articulation
- Continuous, reversible spatial motion
- Sparse kinematic instrumentation that responds to the current story phase
- Contrasting editorial peaks separated by calm reading passages
- Honest concept labeling for all unconfirmed material

## Colors

The palette is cold, precise, and predominantly neutral. The rose accent is rare enough to remain directional.

### Primary

- **Signal Rose** (#D94B68): Primary actions, focus rings, and the active joint or path inside product storytelling.

### Neutral

- **Gallery Pearl** (#F6F7F5): Default light-mode page surface.
- **Raised Pearl** (#FCFCFA): Elevated navigation and form surfaces.
- **Soft Chrome** (#C8CDD2): Secondary product material, dividers, and subtle diagrams.
- **Smoke Copy** (#62656B): Supporting copy on light surfaces.
- **Graphite** (#111215): Primary light-mode text and the dark-mode surface.
- **Dark Chrome** (#303237): Dark-mode raised surfaces and boundaries.
- **Moon White** (#F2F3F1): Primary dark-mode text.

**The Rose Signal Rule.** Signal Rose marks action or articulation. It never becomes a decorative wash or competes with the product.

## Typography

**Display Font:** System Sans (-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
**Body Font:** System Sans (-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
**Label Font:** System Sans with tabular numerals where measurements appear

**Character:** Familiar, optical, and quiet. Hierarchy comes from scale, weight, and spacing rather than mixing type families.

### Hierarchy

- **Display** (600, clamp(3.5rem, 7vw, 6rem), 0.94): Product and chapter statements, limited to two lines.
- **Headline** (600, clamp(2.5rem, 5vw, 4.5rem), 0.98): Section theses.
- **Title** (600, 1.25rem-2rem, 1.1): Component and capability names.
- **Body** (400, 1rem-1.25rem, 1.55): Explanatory copy with a maximum measure of 68ch.
- **Label** (600, 0.72rem-0.78rem, 0.08em): Sparse functional labels and placeholder disclosures.

**The Optical Restraint Rule.** Display tracking never tightens beyond -0.04em, and body copy remains neutral for long-form clarity.

## Layout

Desktop compositions use a twelve-column system inside a 1440px maximum container, with large product media permitted to leave the text grid. The opening is an asymmetric product stage, followed by a pinned continuous-world chapter, an exploded assembly, a varied capability grid, a developer concept, company intent, and a final waitlist section. Quiet passages separate dense visual moments.

Below 900px, all asymmetric compositions collapse to one column. Product scenes keep a defined aspect ratio, text stays in document flow, and scroll-driven pinning reduces to direct sectional storytelling.

## Elevation & Depth

The WebGL object and camera supply primary depth. Interface surfaces are flat by default and separated by tone. Shadows appear only on floating navigation, active controls, and the waitlist surface, with a downward offset and broad neutral blur. Translucency is functional where content moves beneath navigation.

**The Object Owns Depth Rule.** UI chrome never competes with the arm through glow, heavy shadow, or excessive glass.

## Shapes

Product forms combine cylindrical joints, softly chamfered housings, and circular articulation. UI cards and fields use a consistent 14px radius. Small controls and buttons may use full pills. Fine one-pixel lines organize real content but are not used as decorative grids.

## Components

### Floating Navigation

The navigation is a single restrained translucent surface, inset 14px from the viewport on desktop. It uses an 18px radius, a fine semantic border, functional 24px blur, and a quiet neutral shadow. The brand sits left, section links remain centered, and theme plus conversion actions stay right. Below 900px it becomes a compact brand and action row with a separate full-width menu surface.

### Buttons and Links

- **Primary button:** Signal Rose fill, near-white text, full-pill shape, 46px minimum height, 600 weight, and a small directional icon.
- **Header action:** Compact Signal Rose pill with the same semantic role and a tighter footprint.
- **Text link:** Neutral foreground with a directional icon. Hover changes color rather than introducing a container.
- **Icon button:** Circular neutral control with a real `aria-label` and a 44px touch target on compact screens.

Hover motion is a 1 to 2px upward translation over 160 to 180ms using `cubic-bezier(0.23, 1, 0.32, 1)`. Pressed states remove the lift.

### Content Surfaces

Capability, application, specification, code, and waitlist surfaces share the 14px system radius and semantic one-pixel boundaries. Their internal compositions vary deliberately: capability cards use asymmetric spans, application rows read like an editorial index, specifications use grouped definition lists, and the developer surface pairs a dark code field with a light explanatory field.

### Kinematic Readout

The product stage carries one compact instrumentation layer: current spatial chapter, progress line, active articulation labels, and a four-state vertical rail. It is subordinate to the arm and disappears or simplifies on compact screens. The labels describe the object currently in view rather than decorating the hero.

### System Study Rail

Three full-viewport panels explain joint architecture, tool interfaces, and the control loop. Desktop scroll moves the panels horizontally while the section remains pinned. Each panel pairs one large thesis with a distinct explanatory artifact. Mobile and reduced-motion modes use a normal vertical reading order with no pinning.

### Waitlist Form

The form contains a persistent email label, a rounded text field, a primary action, and a live status message. Error, saving, and success language is explicit. The prototype stores an entry only on the current device and discloses that no production email service is connected.

## Motion

- **Spatial story:** A continuous 400dvh scroll chapter drives arm articulation, camera framing, joint emphasis, and exploded separation through GSAP ScrollTrigger.
- **System study:** A reversible horizontal sequence connects joint, tooling, and software concepts without changing the navigation or reading order.
- **Page progress:** A one-pixel rose line inside the navigation shows document progress without adding a separate control.
- **Pointer parallax:** The arm and camera respond subtly to pointer position without moving interface text.
- **Section reveals:** One-time opacity, 28px vertical translation, and 7px blur resolve over 820ms with a strong ease-out.
- **Theme transition:** Page background and foreground colors transition over 220ms.
- **Reduced motion:** Smooth scrolling, scroll reveals, pointer response, articulation changes, and camera travel resolve to a stable static composition.

Motion is reversible when driven by scroll, never autoplaying for decoration, and never moves primary text independently from its section.

## Responsive Behavior

- **Above 1100px:** Twelve-column editorial compositions and the full spatial camera path.
- **900px to 1100px:** Reduced navigation spacing and simplified grid spans while the arm remains pinned.
- **Below 900px:** Single-column reading order, compact arm scale, centered spatial staging, and a mobile navigation surface.
- **Below 620px:** Smaller viewport-safe type, full-width primary actions, tighter surface padding, and a stable arm composition that never blocks copy.

## Do's and Don'ts

### Do:

- **Do** keep the robotic arm as the dominant visual object.
- **Do** use motion to explain articulation, assembly, and viewpoint.
- **Do** label concept renders, planned capabilities, and unconfirmed specifications plainly.
- **Do** preserve equivalent hierarchy and contrast in both themes.

### Don't:

- **Don't** use neon, sci-fi blue, purple mesh gradients, or outer glows.
- **Don't** invent performance figures, customers, certifications, dates, or commercial claims.
- **Don't** repeat equal icon cards as the page's main structure.
- **Don't** use decorative engineering diagrams that do not describe the product.
