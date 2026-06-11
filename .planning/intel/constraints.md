# Constraints (from ingest)

## Tech stack (fixed)

- Next.js 16 (Turbopack), App Router, React Compiler
- UI: `@base-ui/react` (NOT Radix) + Tailwind CSS
- Forms: react-hook-form + Zod
- Auth: Better Auth (Supabase Auth referenced as alternative)
- DB: Drizzle ORM (schema/migrations exist; integration deferred until after MVP validation)
- Deploy: Vercel (prod env vars configured for Better Auth)
- Extra libs: `react-big-calendar` + `date-fns` (appointments calendar), `qrcode.react` (public O.S. tracking)

## Base UI gotchas (must respect)

- `asChild` does NOT exist → use `render={<Component />}` prop
- `SheetTrigger render={<Button />}` instead of `<SheetTrigger asChild><Button>`
- Verify each component's API in `src/_components/ui/*.tsx` before using

## Process constraints

- ESLint import sorting enforced (eslint-plugin-simple-import-sort)
- `npm run lint` + `npx tsc --noEmit` + `npm run build` must all pass before any task is considered done
- Pre-commit: lint-staged + prettier (.lintstagedrc.json)
- Commit messages follow conventional commits (feat/refactor/docs scopes observed in history)

## Data constraint

- Screens use mock data (`src/_lib/mock-data.ts`); do not assume live DB reads/writes until the Drizzle integration phase lands
