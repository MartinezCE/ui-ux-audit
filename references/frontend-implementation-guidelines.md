# Frontend discovery and implementation guidelines

## 1. Discovery checklist
Inspect, never assume a stack.

| Area | Where to look |
|---|---|
| Framework & version | `package.json` (react, next, vue, nuxt, svelte, @sveltejs/kit, @angular/core, solid-js, astro, remix, qwik), `composer.json`/Blade, Django/Jinja templates, Rails views, `pubspec.yaml` (Flutter web) |
| Build tool | vite, webpack, turbopack, angular.json, nuxt.config |
| Routing | `app/` or `pages/` dirs (Next/Nuxt/SvelteKit), router files (`react-router`, `vue-router`, Angular `Routes`), server routes |
| Styling | Tailwind config/`@theme`, CSS Modules, SCSS, styled-components/Emotion, vanilla-extract, UnoCSS, Bootstrap, plain CSS |
| Component library | MUI, shadcn/ui (`components.json`), Radix, Headless UI, Chakra, Mantine, Ant Design, Vuetify, PrimeVue/PrimeNG, Angular Material, Element |
| Tokens & themes | `:root` variables, theme providers, `tailwind.config.*`, `tokens.json`, dark mode strategy (`class`, `media`, `data-theme`) |
| Breakpoints | Tailwind screens, SCSS mixins, media queries (grep `@media`), JS hooks (`useMediaQuery`) |
| Typography | font imports (`next/font`, `@fontsource`, `<link>` to font CDNs, `@font-face`) |
| Icons | lucide, heroicons, react-icons, Material Icons, Font Awesome, custom SVG sprite |
| Assets | `public/`, `assets/`, logo/favicons, illustrations |
| Conventions | lint/prettier configs, component folder structure, naming, Storybook, tests (Vitest/Jest/Playwright/Cypress), CLAUDE.md/AGENTS.md/CONTRIBUTING |
| SDD | `openspec/`, `specs/`, `.specify/`, `docs/specs`, `docs/adr` |

Useful searches (adapt to the shell):
- hardcoded colors: grep for `#[0-9a-fA-F]{3,8}\b`, `rgb(`, `hsl(` in component and style files
- arbitrary Tailwind values: `-\[` (e.g. `p-[13px]`, `text-[#333]`)
- inline styles: `style={{` / `:style=` / `style="`
- duplicated components: several files named Button/Modal/Card, or similar markup repeated

Record:
- Reusable components and where they are used
- Duplicated patterns and divergent implementations (file paths)
- Existing tokens and how many hardcoded values bypass them
- **Do-not-touch list:** components with business logic, third-party embeds, legal text, generated code, anything the user marks as off-limits

## 2. Running the app
- Read scripts in `package.json` (`dev`, `start`, `serve`), README, Docker compose files, `.env.example` (never read or print real `.env` values).
- Check if something already listens on the expected port before starting. Never kill or restart an existing process.
- Ask before starting anything. Prefer the user's already-running instance.
- If seed/test data scripts exist, mention them; do not run migrations or seeds without approval.

## 3. Implementation rules
Presentation only. A visual redesign must not change:
- business logic, data fetching, API calls and contracts
- routes, URLs, query params
- permissions and role checks
- form validation rules and messages' meaning (wording can improve only if approved)
- state management
- analytics events and test ids (`data-testid`, `data-cy`) — keep them
- existing ARIA attributes and semantics, unless improving them

Process per task:
1. Read all affected files. Grep for other usages of the components you will change.
2. State the plan: files, approach, risk, how to verify.
3. Implement tokens first (add semantic tokens mapped to existing values, then switch values), then primitives, then call sites.
4. Prefer modifying the shared component over patching each screen.
5. Keep diffs small and focused; no unrelated refactors or formatting churn.
6. Run the project's existing checks: lint, type-check, unit tests, e2e if present. Do not add new tools without approval.
7. Visually verify the affected screens at the four widths.

Dependencies: do not add fonts, icon sets or libraries without approval. When approved, prefer self-hosted fonts (e.g. `@fontsource/*` or `next/font`) over runtime CDNs for privacy and performance, and note license.

## 4. Visual regression
- If Playwright Test exists, propose (or with approval add) a spec using `expect(page).toHaveScreenshot()` for audited screens, with masks for dynamic content (dates, avatars, charts with live data).
- Otherwise compare `.ui-audit/screenshots/baseline/` vs `after/` manually, side by side, noting every visible difference as intended (matches spec) or regression.
- Check console errors and layout shifts after changes.
