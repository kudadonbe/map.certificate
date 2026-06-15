# Repository Guidelines

## Project Structure & Module Organization
This repository is the MAP Certificate module for the AQD Family Court platform. Application code lives in `src/`: shared UI in `src/components/`, route pages in `src/views/`, layouts in `src/layouts/`, Pinia stores in `src/stores/`, route guards in `src/middleware/`, Firebase/auth logic in `src/services/`, typed contracts in `src/types/`, and helpers in `src/utils/`. Static assets belong in `public/`; Firebase and developer setup scripts belong in `scripts/`; project documentation is under `docs/` plus root guides such as `DEPLOY.md` and `TROUBLESHOOTING.md`.

## Build, Test, and Development Commands
Use `pnpm` only; the project declares `pnpm@8.15.0`.

```bash
pnpm dev              # Start Vite dev server at http://localhost:5173
pnpm build            # Run vue-tsc, then create a production Vite build
pnpm preview          # Preview the production build locally
pnpm init             # Initialize Firebase data from scripts/initializeFirebase.js
pnpm deploy:firebase  # Build and deploy to Firebase Hosting
```

There is no test script configured yet. Before handing off changes, run `pnpm build` as the minimum validation.

## Coding Style & Naming Conventions
Write Vue 3 + TypeScript using existing composition patterns and strict typing. Keep components and views in `PascalCase.vue`, stores as `*.store.ts`, type files as `*.types.ts`, and helpers as `*.helpers.ts`. Use the `@/` alias for imports from `src/`. Styling is Tailwind CSS; prefer existing utility patterns over adding custom CSS. Icons must come from `@heroicons/vue`; do not introduce custom SVG icons unless the design system changes.

## Testing Guidelines
Automated tests are not currently present. When adding tests, place them beside the relevant feature or in a future `tests/` directory, name suites after the feature under test, and cover route guards, store behavior, and Firebase service edge cases. Until a test runner is added, document manual validation in PRs and keep `pnpm build` passing.

## Commit & Pull Request Guidelines
Git history uses concise conventional prefixes such as `docs:` and `fix:`. Keep commits scoped to one logical change, for example `fix: resolve certificate route guard`. Pull requests should describe the user-facing change, list validation commands, link related issues or docs, and include screenshots for visible UI changes. Note any Firebase collection, security-rule, or environment variable changes explicitly.

## Security & Configuration Tips
Never commit secrets from `.env.local` or Firebase credentials. Required client configuration uses `VITE_FIREBASE_*` variables; update `.env.example` when adding new keys. Staff access is domain-based for `@familycourt.gov.mv`, with permissions managed through Firestore user groups, so avoid hard-coded user allowlists.
