# Design System Strategy: The Lucid Flow
 
## 1. Overview & Creative North Star
**Creative North Star: "The Lucid Flow"**
 
This design system is engineered to transform the traditional "chat box" into a high-end editorial experience. We are moving away from the industrial, "boxy" nature of standard AI interfaces toward a layout that feels like a breathing, digital sanctuary. 
 
By leveraging **intentional asymmetry**, we break the rigid grid. We favor wide gutters and varying column widths to guide the eye through the conversation. This isn't just a tool; it’s a premium workspace where the UI recedes to prioritize the clarity of thought and the fluidity of the AI's response. The experience should feel like looking through a series of precision-cut glass panes layered over a soft, morning mist.
 
---
 
## 2. Colors
Our palette is a sophisticated gradient of aqueous tones. We prioritize tonal depth over structural lines to maintain a "refreshing" and "airy" atmosphere.
 
*   **Primary & Accent Roles:** Use `primary` (#28676d) for high-importance actions and `primary-container` (#a6e3e9) for subtle highlight areas.
*   **The "No-Line" Rule:** We explicitly prohibit the use of 1px solid borders to define sections. Boundaries must be defined solely by background shifts. For example, a sidebar should be defined by `surface-container-low` (#dff9f9) sitting flush against the main `surface` (#e4fefe) background. 
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers. 
    *   Base Layer: `surface` (#e4fefe)
    *   Secondary Areas: `surface-container-low` (#dff9f9)
    *   Interactive Elements: `surface-container-lowest` (#ffffff)
*   **The "Glass & Gradient" Rule:** Floating panels (like settings or tooltips) must utilize Glassmorphism. Use `surface` at 70% opacity with a 20px `backdrop-blur`.
*   **Signature Textures:** Apply a subtle linear gradient to the `primary` CTA buttons, transitioning from `primary` (#28676d) to `secondary` (#416468) at a 135-degree angle. This adds a "jewel-like" depth that distinguishes the interface from flat, generic clones.
 
---
 
## 3. Typography
We utilize a triple-font system to create an authoritative, editorial hierarchy.
 
*   **The Hero (Pacifico):** Used for `display` and `headline` scales. This font brings a modern, geometric clarity. Set `display-lg` with a tight `-0.02em` letter spacing to feel like a high-fashion masthead.
*   **The Narrative (Pacifico):** Used for `title` and `body` scales. Its semi-condensed nature makes long-form AI responses highly readable and professional. 
*   **The Utility (lato):** Reserved strictly for `label-md` and `label-sm`. These are for functional data, timestamps, and micro-copy, providing a "technical" contrast to the more fluid Manrope.
 
**Editorial Rule:** Never center-align body text. Use left-alignment with generous line heights (1.6x) to ensure the interface feels like an open book rather than a dense data terminal.
 
---
 
## 4. Elevation & Depth
Depth in this design system is achieved through **Tonal Layering**, not heavy shadows.
 
*   **The Layering Principle:** To lift a card, do not add a shadow immediately. Instead, place a `surface-container-lowest` (#ffffff) element on top of a `surface-container-low` (#dff9f9) background. This creates a "soft lift."
*   **Ambient Shadows:** If a component must float (e.g., a modal), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(7, 31, 32, 0.06)`. The tint is derived from `on-surface` (#071f20), ensuring it feels like a natural obstruction of light rather than a "dirty" grey blur.
*   **The "Ghost Border":** For essential accessibility on white backgrounds, use a `outline-variant` (#bfc8c9) at 15% opacity. It should be felt, not seen.
*   **Glassmorphism:** Use `surface-variant` (#cee7e8) with 60% opacity for navigation bars to allow the "flow" of chat content to be visible as it scrolls beneath, maintaining the "Airy" design pillar.
 
---
 
## 5. Components
 
### Buttons
*   **Primary:** `rounded-full`, background `primary`, text `on-primary`. Use the signature gradient.
*   **Secondary:** No background. Use `on-surface` text with a `primary-fixed` (#b0edf3) underline that expands on hover.
*   **Tertiary:** `surface-container-high` background with `on-surface-variant` text for low-priority actions.
 
### Input Fields (The "Composer")
Forgo the standard rectangular box. The AI input should be a `surface-container-highest` pill-shaped container with a subtle `backdrop-blur`. Use `title-md` for the input text to make the user's prompt feel significant.
 
### Chat Bubbles & Lists
*   **Forbid Dividers:** Never use a line to separate chat messages or list items.
*   **AI Responses:** Use a `surface-container-low` background with a wide left margin to create an asymmetrical "editorial" look.
*   **User Prompts:** Use `primary-container` with `on-primary-container` text. Align these slightly off-center (not fully right-aligned) to maintain the "asymmetric flow."
 
### Chips
Use `secondary-container` (#c1e7eb) with `on-secondary-container` (#45686c). Radius should be `md` (0.75rem) to contrast with the `full` roundness of buttons.
 
---
 
## 6. Do's and Don'ts
 
### Do
*   **Do** use extreme white space. If you think there’s enough space, add 16px more.
*   **Do** use `surface-container` shifts to highlight active states instead of bold colors.
*   **Do** lean into the "Lucid" theme by using 1.5rem (xl) corner radiuses on major containers to soften the professional tone.
 
### Don't
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#071f20).
*   **Don't** use 1px borders for layout. It shatters the "glass and mist" aesthetic.
*   **Don't** use standard "Material" blue or "AI" purple. Stick strictly to the aqueous teal/cyan palette provided to maintain the signature identity.
*   **Don't** cram icons into every button. Let the typography speak for itself.