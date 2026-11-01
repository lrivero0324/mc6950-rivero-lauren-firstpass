# Assignment 8.1 Progress Report — FirstPass Styling

**Course:** MMC6950  
**Project:** FirstPass

## Progress and approach

Assignment 8.1 asked me to apply the Assignment 7.1 visual mockups in code so FirstPass feels like a finished product experience across desktop, tablet, and mobile. The prototype already had a working HTML/CSS/JS MVP covering authentication, candidate profile and inbox, employer search, interview invitations, and sent invitations. My work for this assignment was therefore not a rewrite. It was a deliberate styling pass: organize the stylesheet clearly, close gaps between the live interface and the mockups, and keep every existing flow functional.

I organized CSS as a single shared stylesheet (`css/app.css`) rather than CSS Modules or a heavy BEM build. That choice fits this prototype: static pages, no bundler, and one brand system shared by every screen. Design tokens live in `:root` (ink, paper, teal, Fraunces and Figtree, page width). Rules are grouped by product surface—app chrome, auth, shared controls, search and profile, invite, inbox and detail—then responsive overrides. Class names stay readable and lightly structured (`listing-card`, `days-remaining`, `invite-page`) without renaming the whole codebase in a way that would risk regressions. The stylesheet header documents that strategy so the organization choice is explicit.

## Matching the mockups

The Assignment 7.1 Figma frames, exported as desktop, tablet, and mobile PDFs, were my visual source of truth. Auth already followed a LinkedIn-inspired split layout with Fraunces headlines, Figtree UI type, and the teal brand from Module 5. This pass tightened tablet and phone behavior—stacked hero, left-aligned copy, and a compact legal footer—so smaller breakpoints read like the mockups instead of a simply shrunk desktop.

In-app screens received denser card and action treatment. Inbox cards now call out remaining response time with a teal days-remaining chip and keep View invitation as the primary action, matching the mockup emphasis on the response window. Invitation detail actions stay Accept, Save for later, and Decline, with Accept as the primary control and a three-column layout that stacks on tablet and phone. Employer search and candidate profile keep the same navigation and call-to-action hierarchy, with button labels aligned to the mockup wording.

The invite experience was the clearest structural divergence. In Figma, sending an invitation appears as a modal over the candidate profile. In the prototype, invite remains its own route (`invite.html`) so validation, role prefills, and cancel behavior stay simple and testable. To honor the mockup without breaking that flow, the page is styled as a modal presentation: dimmed backdrop, centered panel, full-width primary send action, and candidate recap beneath the form. Functionally it is still a page; visually it reads as the invite overlay. That tradeoff is intentional. The transparency fields and success path stay the same, with less risk than rewriting invite into an overlay component mid-prototype.

## Responsive strategy

Breakpoints follow the mockup device set. Around 980px, layouts stack for auth, filters, profile, and invite. Around 800px, phone density increases: full-width primary actions, compact inbox tabs, tighter page gutters, and a wrapped auth legal strip. Page-width tokens adjust so content does not feel stranded on tablet or cramped on mobile. I re-ran the existing store tests after the CSS and HTML updates to confirm the MVP logic still passes.

## Stumbling blocks and concerns

The main tension was fidelity versus stability. Matching every absolute Figma measurement would have meant large HTML rewrites and fragile JavaScript. Preferring sectioned CSS and small markup hooks kept the application working while still showing brand, hierarchy, and responsive intent. A second concern was invite-as-modal: true overlay behavior would sit closer to the PDF, but a styled dedicated page was safer for delivering a completely styled and functional application. Cache-busting query strings on CSS and JavaScript were updated so browsers pick up the new styles immediately during local review.

## Closing

After this pass, FirstPass presents a cohesive Module 5 and Assignment 7.1 brand across auth and the core candidate and employer flows. CSS is organized for clarity, responsive rules align to the mockups, and functionality is preserved. Any remaining polish after deployment is visual quality assurance on the live URL at true tablet and phone widths, not structural redesign.
