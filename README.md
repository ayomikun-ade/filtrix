# Filtrix

A visual query builder for constructing complex, deeply nested database queries
through a graphical interface — no raw query syntax required. Build AND/OR logic
to any depth, preview it as **SQL**, **MongoDB**, and **GraphQL** in real time,
and run it against sample datasets in the browser.

- **Live demo:** _to be added once the production deployment is configured._
- **Status:** in active development (see [Roadmap](#roadmap)).

---

## Features

- **Recursive rule builder** — field / operator / value rules grouped with
  AND/OR to unlimited depth; collapsible, reorderable, drag-and-drop.
- **Schema-driven** — operators and input controls adapt to each field's type
  (date pickers for dates, dropdowns for enums, number inputs for numbers).
- **Live query preview** — SQL, MongoDB, and GraphQL output, updated in real time.
- **Execution simulator** — run queries over mock datasets with result counts,
  sorting, pagination, virtualization, and loading/empty states.
- **Validation engine** — incompatible operators, empty groups, and malformed
  values are caught and surfaced inline.
- **Advanced interactions** — keyboard shortcuts, command palette, query history
  (undo/redo), saved presets, JSON import/export, dark/light mode, animations.

## Tech stack

| Concern     | Choice                            |
| ----------- | --------------------------------- |
| Framework   | Next.js (App Router) + TypeScript |
| Styling     | TailwindCSS v4 + shadcn/ui        |
| Icons       | Hugeicons                         |
| State       | Zustand (+ immer)                 |
| Drag & drop | DnD Kit                           |
| Forms       | React Hook Form                   |
| Validation  | Zod                               |
| Testing     | Vitest + React Testing Library    |
| CI / CD     | GitHub Actions + Vercel CLI       |

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page lives at
`/` and the builder at `/builder`.

### Scripts

| Script               | Description                |
| -------------------- | -------------------------- |
| `pnpm dev`           | Start the dev server       |
| `pnpm build`         | Production build           |
| `pnpm start`         | Serve the production build |
| `pnpm lint`          | ESLint                     |
| `pnpm typecheck`     | TypeScript, no emit        |
| `pnpm test`          | Run the test suite once    |
| `pnpm test:watch`    | Watch mode                 |
| `pnpm test:coverage` | Coverage report            |
| `pnpm format`        | Format with Prettier       |

## Project structure

```
src/
  app/
    layout.tsx · globals.css     # shared shell + theme provider
    page.tsx                     # landing page (/)
    builder/page.tsx             # query builder app (/builder)
  components/
    landing/                     # hero, feature grid
    ui/                          # shadcn primitives
    theme-provider · theme-toggle · brand
  lib/                           # query engine, schema, store, utils (incoming)
  test/                          # test setup
```

## Architecture

> Expanded as the engine lands. Full design rationale lives in the planning doc.

- **Normalized query tree** — the query is stored as a flat `id → node` map with
  a root id, not a nested object. This gives O(1) node updates and lets each UI
  node subscribe to only its own slice, so editing one rule never re-renders its
  siblings.
- **Recursive rendering** — a `QueryGroup` renders its children as either nested
  `QueryGroup`s or `QueryCondition`s, memoized and keyed by stable node ids.
- **State management** — a single Zustand store with immer for immutable,
  recursion-aware updates; companion stores for history and saved presets.
- **Query engine** — pure, recursive `tree → output` builders for SQL, MongoDB,
  and GraphQL, plus a `tree → predicate` evaluator powering the simulator.
- **Validation** — derived, memoized `tree → errors`; execution is blocked while
  any error exists.
- **Performance** — normalized state, per-node memoized selectors, derived state,
  stable keys, and result virtualization.

## Testing

```bash
pnpm test
```

Vitest + React Testing Library cover query generation, the validation engine,
state operations, recursive rendering, and critical UI interactions.

## CI / CD

- **CI** (`.github/workflows/ci.yml`) runs typecheck, lint, tests, and build on
  every pull request and push to `main`.
- **CD** (`.github/workflows/deploy.yml`) deploys via the **Vercel CLI** —
  preview deployments for pull requests, production on merge to `main`. It stays
  inert until configured:
  1. Add repo secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
  2. Add repo variable `VERCEL_DEPLOY_ENABLED = "true"`.
  3. Disable Vercel's dashboard Git auto-deploy so the CLI is the only path.

## Git workflow

Work happens on feature branches merged into `main` via pull requests — no direct
pushes to `main`, descriptive PR titles, and meaningful commit history.

## Roadmap

1. Project scaffold, tooling, CI/CD — **done**
2. Query model & schema system
3. Zustand store & recursive state ops
4. Recursive builder UI
5. Query engine & live preview (SQL / Mongo / GraphQL)
6. Validation engine
7. Execution simulator & results
8. Advanced interactions (DnD, shortcuts, history, presets, import/export)
9. Polish, performance, docs & demo
