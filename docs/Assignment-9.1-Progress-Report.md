# Assignment 9.1 Progress Report — FirstPass Usability Audit

**Course:** MMC6950  
**Project:** FirstPass

## Method

For Assignment 9.1 I audited every FirstPass application page with Chrome Lighthouse, checking Performance, Accessibility, Best Practices, and SEO. I ran each page on the live GitHub Pages deployment so results match what a grader would see. Device choice followed how the screens are used: Mobile for Sign In, Profile, Inbox, and Invitation Detail; Desktop for Create Account, Find Candidates, Candidate Preview, Send Invitation, Sent Invitations, and Roles. I captured a screenshot of each report’s category scores. After the automated audits, I manually walked both primary user flows and tried to break the prototype with empty fields, invalid salary ranges, double-clicks, and mid-flow navigation.

## Score overview

Accessibility, Best Practices, and SEO were generally strong across the app. Most pages scored in the mid-90s to 100 for accessibility, and SEO stayed around 90–92. Performance was the weakest and most variable category. Create Account scored 100 for performance on desktop, while Inbox scored 54 on mobile and Sign In scored 70. Find Candidates (75) and Send Invitation (78) also sat in the orange range. Several reports warned that Chrome extensions can lower lab performance, so some numbers likely understate a clean Incognito run. Even with that caveat, performance and a few SEO and accessibility flags remain real product findings.

## Findings by category

**Performance.** Recurring opportunities included render-blocking resources, unused JavaScript and CSS, and occasional layout-shift notes. Send Invitation showed a high Cumulative Layout Shift in one run, which matches the modal-style invite panel loading over a dimmed page. Inbox’s low mobile score stood out and likely reflects throttled lab conditions plus rendering invitation cards after sign-in. I have not fixed these performance items yet. I plan to fix the highest-impact, low-risk items next: explicit width and height on the auth hero image, reducing layout shift on the invite page, and trimming obvious unused CSS where safe. I will not chase a perfect performance score on every page in this prototype cycle. FirstPass is a multi-page static MVP on GitHub Pages; lab noise from extensions, fonts, and hosting latency is expected, and a deep bundler rewrite is outside current scope.

**Accessibility.** Most candidate and employer screens reached 100. Sign In and Create Account were slightly lower (94), and Find Candidates scored 88. Flags included heading-order concerns and form-label associations on at least one view. I plan to fix clear label and heading issues because they improve keyboard and screen-reader usability and are localized HTML changes. I have not already fixed them in this audit pass; the screenshots document the baseline before remediation.

**Best Practices.** Scores stayed high (typically 92–100). Common notes were console errors and occasional image aspect-ratio warnings. I plan to fix console errors I can reproduce during normal flows. I will not treat every Best Practices advisory as a blocker if it is environmental or does not affect the hiring loop.

**SEO.** Nearly every page landed near 90 with the same themes: missing or thin meta descriptions, and links without descriptive text. I plan to add a concise meta description on key entry pages (Sign In, Search, Inbox) and replace vague link text where it appears. I will not pursue advanced structured data for a class prototype that is not a public marketing site.

## Manual testing

Manual testing covered the candidate loop (profile → inbox → invitation → accept, save, or decline) and the employer loop (search → candidate preview → invite → sent). Validation still blocked incomplete invite fields and invalid salary ranges. Double-submits and unusual navigation did not corrupt stored demo data in ways that broke the MVP rules. I did not find a new critical functional bug that blocked the assignment loop. Remaining polish items are the Lighthouse issues above, not broken core flows.

## Closing

FirstPass is in good shape for accessibility and best practices, acceptable for SEO with a few content fixes, and uneven on performance—especially Inbox and Sign In on mobile. Nothing in this audit suggests the application is unusable. My next work is a short remediation pass on labels, headings, meta descriptions, descriptive links, and layout-shift sources, while accepting performance limits that fit this prototype stage.
