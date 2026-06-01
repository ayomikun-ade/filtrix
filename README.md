# Filtrix

A visual query builder for constructing complex, deeply nested database queries
through a graphical interface — no raw query syntax required. Build AND/OR logic to
any depth, preview it as **SQL**, **MongoDB**, and **GraphQL** in real time, validate
it, and run it against sample datasets in the browser.

- **Live demo:** [Filtrix Live](https://filtrixx.vercel.app/)

---

## Features

- **Recursive rule builder** — field / operator / value rules grouped with AND/OR to
  **unlimited** depth; collapsible groups, add/remove, and **drag-and-drop** reordering
  within and across groups.
- **Schema-driven** — operators and input controls adapt to each field's type: date
  pickers for dates, dropdowns for enums, number/range inputs for numbers, chips for
  `in`, a boolean toggle, etc. Invalid operators are never offered (no `contains` on a
  number).
- **Live preview** — the query renders to **SQL**, a **MongoDB** filter object, and a
  **GraphQL** filter in real time, with a plain-English summary and copy-per-format.
- **Execution simulator** — run the query over a generated dataset with result counts,
  loading/empty states, column **sorting**, **pagination**, and row **virtualization**;
  export the matching rows to CSV.
- **Validation engine** — incompatible operators, malformed values, out-of-order ranges,
  invalid regex/dates, and empty nested groups are caught and surfaced inline; Run is
  gated while the query is invalid.
- **Operators** — `equals`, `not equals`, `contains`, `starts with`, `greater/less than`,
  `in`, `between`, plus `regex`, `is null` / `is not null`, and `before` / `after`.
- **Advanced interactions** — ⌘K **command palette**, **keyboard shortcuts**, **undo/redo**
  (with edit coalescing), **saved presets** (localStorage), **run history**, **JSON
  import/export**, dark/light mode, and animated reordering.

### Keyboard shortcuts

| Action          | Shortcut                            |
| --------------- | ----------------------------------- |
| Command palette | `Ctrl/⌘ + K`                        |
| Run query       | `Ctrl/⌘ + Enter`                    |
| Undo / Redo     | `Ctrl/⌘ + Z` / `Ctrl/⌘ + Shift + Z` |
| Clear all       | `Ctrl/⌘ + Shift + C`                |
| Import / Export | `Ctrl/⌘ + I` / `Ctrl/⌘ + E`         |

## Tech stack

| Concern            | Choice                               |
| ------------------ | ------------------------------------ |
| Framework          | Next.js 16 (App Router) + TypeScript |
| Styling            | TailwindCSS v4 + shadcn/ui (base-ui) |
| Icons              | Hugeicons                            |
| State              | Zustand + immer                      |
| Drag & drop        | DnD Kit                              |
| Forms / validation | React Hook Form + Zod                |
| Virtualization     | TanStack Virtual                     |
| Testing            | Vitest + React Testing Library       |
| CI / CD            | GitHub Actions + Vercel CLI          |

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — landing page at `/`, builder at
`/builder`.

### Scripts

| Script                                       | Description            |
| -------------------------------------------- | ---------------------- |
| `pnpm dev`                                   | Start the dev server   |
| `pnpm build`                                 | Production build       |
| `pnpm typecheck`                             | TypeScript, no emit    |
| `pnpm lint`                                  | ESLint                 |
| `pnpm format` / `format:check`               | Prettier write / check |
| `pnpm test` / `test:watch` / `test:coverage` | Vitest                 |

## Project structure

```
src/
  app/                       landing (/) + builder (/builder) + shared layout
  components/
    builder/                 QueryGroup, QueryCondition, ValueControl, results, palette, dialogs, rail…
    landing/                 hero, feature grid
    ui/                      input, native-select, dialog, sheet, button
  hooks/                     useCommands, useKeyboardShortcuts
  lib/
    query/                   types, operators, tree, builders (sql/mongo/graphql/nl), evaluate, serialize
    schema/                  data sources (movies/books/songs), resolve, dataset generator
    store/                   queryStore, history, presets, runHistory, source, run, ui, dnd
    validation/              validate, useQueryValidity
  tests/                     unit + integration tests mirroring src/
```

---

## Architecture

The app is one **normalized query tree** that every other system derives from — the UI
renders it, the engine serializes it, the validator checks it, and the simulator
evaluates it. Keeping a single source of truth (and keeping every derivation a _pure
function_ of it) is the central design decision.

```
            ┌──────────────── derived, pure ────────────────┐
 user edits │  generators (SQL/Mongo/GraphQL/NL)             │
   ──────▶  queryStore (normalized tree)  ──▶  validation     ──▶  UI
            │  evaluator (tree → predicate) → results        │
            └───────────────────────────────────────────────┘
```

### The normalized tree

The query is a recursive tree of **groups** (a combinator + ordered children) and
**conditions** (field / operator / value). Instead of a nested object, it is stored
**normalized** as a flat `id → node` map plus a `rootId`:

```ts
interface GroupNode {
  id;
  type: "group";
  parentId;
  combinator: "AND" | "OR";
  children: NodeId[];
  collapsed;
}
interface ConditionNode {
  id;
  type: "condition";
  parentId;
  field;
  operator;
  value;
}
interface QueryTree {
  rootId: NodeId;
  nodes: Record<NodeId, QueryNode>;
}
```

This shape is what makes everything else fast and simple:

- **O(1) updates** — editing a node is a single map write, not a deep clone of the tree.
- **Render isolation** — each UI node subscribes to _only its own_ entry, so editing one
  rule never re-renders its siblings.
- **Cheap structural ops** — reorder/move is an array-of-ids splice; remove is a subtree
  id-collection plus deletes.

### Recursive rendering strategy

Rendering mirrors the recursion of the data:

- `QueryGroup` renders a combinator toggle + its children, mapping each child id through a
  `BuilderNode` dispatcher that picks `QueryGroup` (nested) or `QueryCondition` (leaf).
  This recurses to unlimited depth.
- **Render isolation in practice:** `QueryGroup` and `QueryCondition` are wrapped in
  `React.memo` and each reads its slice via an isolated selector — `useNode(id)` and
  `useChildren(id)`. Because the store uses immer's structural sharing, an unedited node
  keeps the _same object reference_, so its selector returns an identical value and React
  skips it. A group only re-renders when _its own_ `children` array changes.
- Nesting is shown with a thin vertical **guide line** per level (indent, not heavy nested
  cards), and a depth-capped indent so deep trees stay readable.

### State management

A single Zustand store (`queryStore`) holds `{ rootId, nodes }` with the **immer**
middleware, so recursion-aware mutations read like direct edits while staying immutable:
`addCondition`, `addGroup`, `removeNode` (recursively prunes a subtree), `updateCondition`,
`setCombinator`, `toggleCollapsed`, `moveNode` (with a cycle guard), `reorderWithinGroup`,
`loadTree`, `reset`. The store is deliberately **schema-agnostic** — field→operator→value
_cascade_ logic lives in the UI layer, which has the data-source context.

Companion stores keep concerns separate and the core store small:

- `historyStore` — subscribes to `queryStore` and records the pre-edit tree for **undo/redo**,
  coalescing rapid edits (e.g. typing a value) into one step.
- `presetsStore` — `localStorage`-persisted **saved presets**.
- `runHistoryStore` — session **run history**.
- `sourceStore`, `runStore`, `uiStore` — active data source, the "run" signal, and dialog state.

Inputs are **store-bound** (controlled values that call store actions) rather than wrapped
in React Hook Form: the query is live state many systems read continuously, so one source
of truth beats syncing two. RHF + Zod are used for the genuine _forms_ — the Import-JSON and
Save-preset dialogs.

### Query engine

The engine is a set of **pure, recursive `tree → output` functions** (`lib/query/builders`),
each sharing the same skip-incomplete-nodes behaviour so a partial query never breaks:

- `toSql` — `SELECT * FROM <source> WHERE …`, with single-quote escaping (sanitization).
- `toMongo` — a `{ $and / $or }` filter object.
- `toGraphql` — a Hasura-style `_and/_or` filter serialized to GraphQL syntax.
- `toNaturalLanguage` — a plain-English summary.

A separate **evaluator** compiles the tree into `(row) => boolean` (`buildPredicate`),
reusing the operator semantics, and the simulator runs it over a deterministically
**generated dataset** (real seed rows expanded for volume). Import/export round-trips the
tree through `serialize.ts`, which validates with a Zod schema **and** an integrity pass
(single valid root, consistent parent/child links, no cycles, no orphans, bounded depth).

### Validation

`validate.ts` is a pure `tree → errors` function surfaced inline on the offending rows and
summarized by an "N issues" badge. It is **gentle** by design — an incomplete row you're
still editing is not an error (the generators already skip it); only genuine mistakes are
flagged: incompatible operator/type, malformed values, out-of-order ranges, invalid
regex/dates, and empty nested groups. The simulator's **Run is gated** on validity.

### Performance

- **Normalized state + per-node memoized selectors** → editing one node touches one map
  entry and re-renders one component (see _render isolation_ above).
- **Immer structural sharing** → unchanged subtrees keep their references, which is what
  makes the memoization actually fire.
- **Derived, memoized output** — preview/validation/evaluation recompute only when the
  `nodes` map changes, via `useMemo`.
- **Stable keys** — every list is keyed by stable node ids.
- **Virtualized results** — TanStack Virtual renders only the visible rows, so large result
  sets scroll smoothly; results are also paginated.

### Trade-offs

- **Normalized flat map vs. nested tree** — chose normalized for O(1) updates and render
  isolation; the cost is rebuilding nested shape during generation, which is cheap and
  memoized.
- **Zustand + immer vs. Redux** — minimal ceremony and ergonomic per-node selectors; gave
  up Redux's built-in time-travel, re-implemented as a lightweight history store.
- **Store-bound inputs vs. RHF everywhere** — one source of truth for live query state;
  RHF/Zod reserved for the submit-style dialogs.
- **Generated dataset** — real seed rows are expanded for volume, so a rare category can show
  repeated rows; dataset size is tuned (150) to keep result counts sensible while still
  exercising pagination/virtualization.
- **Client-side simulation** — no backend; keeps the project frontend-focused and the deploy
  simple.

## Testing

```bash
pnpm test
```

Vitest + React Testing Library cover the high-risk surfaces: query generation across all
formats (flat, nested, edge cases), the evaluator, the validation engine, serialization +
import validation, store actions (immutability, recursive prune, cross-group move, cycle
guard, render isolation), history, presets, drag planning, and key UI interactions
(builder rendering, preview, results run/sort/paginate, palette, shortcuts).

## CI / CD

A single workflow (`.github/workflows/ci-cd.yml`) runs both:

- **verify** — typecheck, format check, lint, tests, build, on every PR and push to `main`.
- **deploy** (`needs: verify`) — Vercel-CLI **preview** deploy on PRs, **production** on merge
  to `main`. Inert until configured: add repo secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`,
  `VERCEL_PROJECT_ID` and variable `VERCEL_DEPLOY_ENABLED = "true"`, and disable Vercel's
  dashboard Git auto-deploy so the CLI is the only path.

## Git workflow

Feature branches → pull requests into `main` (no direct pushes), with passing CI required and
descriptive PR titles / multi-commit history.
