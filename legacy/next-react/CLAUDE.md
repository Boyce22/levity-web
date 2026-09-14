# CLAUDE.md — Levity SaaS: Architecture & Component Standards

> [!WARNING]
> Estas regras continuam válidas somente para manutenção do frontend Next.js
> durante a transição. Elas não definem a arquitetura-alvo em SvelteKit. Para a
> migração, consulte [docs/frontend-migration/README.md](docs/frontend-migration/README.md),
> em especial o plano e a auditoria da documentação legada.

This file instructs Claude (and any AI assistant) on the coding conventions, architectural rules, and component standards used in this project. Follow these rules **without exception** on every code generation, refactor, or review task.

---

## 1. Project Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State:** React hooks only (no Redux, no Zustand)
- **Validation:** Zod as the single source of truth for data contracts
- **Package manager:** npm

---

## 2. Architecture — 5-Layer System

The project follows a strict 5-layer architecture. **Layer boundaries are inviolable.**

```
UI (app/ + features/*/components)
  ↓ calls only
Actions (features/*/server/actions/)
  ↓ calls only
Use Cases (features/*/server/use-cases/)
  ↓ calls only
Repositories (features/*/server/repositories/)
  ↓ calls only
API Client (infra/http/)
```

### Layer Rules

| Layer | Can call | Cannot call |
|---|---|---|
| UI / Components | Actions, ui/ | Use Cases, Repositories directly |
| Actions | Use Cases | Repositories, API Client directly |
| Use Cases | Repositories | Actions, UI |
| Repositories | API Client | Anything above |

### Forbidden patterns

- ❌ Actions with business logic (sorting, transformations, guards)
- ❌ Actions with `try/catch` — errors propagate up to UI
- ❌ Actions returning `{ success: boolean }` envelopes
- ❌ Use Cases without `requireSession()` (except auth initializers)
- ❌ Repositories calling other repositories
- ❌ UI components importing from use-cases or repositories directly

---

## 3. Folder Structure

```
src/
├── app/                          # Next.js App Router pages
├── contracts/                    # Zod schemas + inferred TypeScript types (API contracts)
│   ├── Board.ts
│   ├── User.ts
│   └── ...
├── features/
│   ├── <domain>/
│   │   ├── components/           # Domain UI components
│   │   ├── hooks/                # Client-side hooks (no fetch, no business logic)
│   │   └── server/
│   │       ├── actions/
│   │       │   ├── <subdomain>.actions.ts
│   │       │   └── index.ts      # Barrel re-export
│   │       ├── repositories/
│   │       │   └── <entity>-repository.ts
│   │       └── use-cases/
│   │           └── <subdomain>.use-cases.ts
├── infra/                        # Technical infrastructure (HTTP, auth, storage)
│   ├── http/                     # API client (serverApiClient, browserApiClient, errors)
│   ├── auth/session.ts           # requireSession() + createSession() + clearSession()
│   ├── observability/logger.ts
│   ├── rate-limit/
│   └── storage/
└── ui/                           # Internal UI layer
    ├── primitives/               # Generic DOM-wrapping components (Button, Input, Card)
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   └── Input.tsx
    ├── components/               # Shared UI components without business logic
    └── utils/
        ├── cn.ts                 # Tailwind class merger (clsx + tailwind-merge)
        ├── date.ts
        └── attachments.ts
```

---

## 4. Component Standards

### 4.1 Gold Standard Example — `Button.tsx`

Every UI component in `ui/` **must** follow this exact structural pattern:

```tsx
import React from 'react';
import { cn } from '@/ui/utils/cn';

// ① Explicit interface extending native HTML element props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// ② forwardRef for any component that renders a DOM element directly
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {

    // ③ Separate named class groups — never one giant string
    const baseClass = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1c1c1e] disabled:opacity-50 disabled:pointer-events-none';

    // ④ Variant map — lookup by key, never if/else chains
    const variantClass = {
      primary:   'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      secondary: 'bg-white/10 text-white hover:bg-white/20 focus:ring-white',
      danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost:     'bg-transparent text-white hover:bg-white/10 focus:ring-white',
    }[variant];

    // ⑤ Size map
    const sizeClass = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseClass, sizeClass, variantClass, className)}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : null}
        {children}
      </button>
    );
  }
);

// ⑥ displayName is mandatory
Button.displayName = 'Button';
```

### 4.2 Rules — All Components

| Rule | Design-System | Feature Components |
|---|---|---|
| `forwardRef` on DOM-wrapping components | ✅ Required | When applicable |
| `displayName` | ✅ Required | ✅ Required |
| `cn()` for class composition | ✅ Required | ✅ Required |
| `baseClass` / `variantClass` / `sizeClass` separation | ✅ Required | If has variants |
| Business logic | ❌ Forbidden | ⚠️ Domain logic only |
| Feature hook imports | ❌ Forbidden | ✅ Allowed |
| `any` type | ❌ Forbidden | ❌ Forbidden |
| Relative path imports (`../../`) | ❌ Forbidden | ❌ Forbidden |

### 4.3 Naming Conventions

```
Component file:    ComponentName.tsx           (PascalCase)
Props interface:   ComponentNameProps
displayName:       'ComponentName'
Actions:           verbNounAction              (camelCase: createCardAction)
Use Cases:         verbNounUseCase             (camelCase: createCardUseCase)
Repositories:      entity-repository.ts        (kebab-case)
Use-case files:    subdomain.use-cases.ts
Action files:      subdomain.actions.ts
```

### 4.4 Import Rules

```ts
// ✅ Always use path alias
import { cn } from '@/ui/utils/cn';
import { Button } from '@/ui/primitives/Button';
import { createCardAction } from '@/features/board/server/actions/card.actions';

// ❌ Never use relative paths across feature boundaries
import { cn } from '../../utils/cn';
import { createCardAction } from '../../../server/actions';
```

### 4.5 `forwardRef` Decision

```
Component renders a DOM element directly (<button>, <input>, <div>)  → use forwardRef
Component is a layout container or purely composed                    → do NOT use forwardRef
```

---

## 5. Server Actions Rules

```ts
// ✅ Correct action pattern
'use server';

import { revalidatePath } from 'next/cache';
import { createCardUseCase } from '../use-cases/card.use-cases';

export async function createCardAction(
  listId: string,
  content: string,
  position: number,
  workspaceId: string,
) {
  const card = await createCardUseCase(listId, content, position, workspaceId);
  revalidatePath('/');
  return card;
}
```

**Mandatory:**
- `'use server'` at top
- Receives raw/unknown input, delegates parsing to use-case
- Calls exactly one use-case per action
- `revalidatePath('/')` on every mutation
- No `try/catch`
- No transformation logic
- No guards (`if (!x) return []`)

---

## 6. Use Case Rules

```ts
// ✅ Correct use-case pattern
import { requireSession } from '@/infra/auth/session';
import { cardRepository } from '../repositories/board-repository';
import { CardSchema } from '@/contracts/Board';

export async function createCardUseCase(
  listId: string,
  content: string,
  position: number,
  workspaceId: string,
) {
  await requireSession();                        // ① Always first (except auth flows)
  const validated = CardSchema.parse({ ... });  // ② Zod validation
  return cardRepository.createCard(...);         // ③ Repository call last
}
```

**Mandatory:**
- `requireSession()` as first statement (all domains except `auth`)
- Zod parsing for any external input (`payload: unknown`)
- No `try/catch`
- No `return { success: false }` envelopes
- Errors propagate: `ZodError`, `ApiError`, `DomainError` go up to UI

---

## 7. Entity / Zod Contract Rules

Contracts live in `src/contracts/`. They are the **single source of truth** for types.

```ts
// ✅ contracts/Board.ts
import { z } from 'zod';

export const CardSchema = z.object({
  id: z.string(),
  content: z.string(),
  // ...
});

export type Card = z.infer<typeof CardSchema>;
```

- All types are inferred from Zod schemas — **never define type manually if a schema exists**
- Repositories parse API responses with Zod (`Schema.parse(data)`) — Anti-Corruption Layer
- Never import raw API shapes into UI components

---

## 8. Error Handling Strategy

| Layer | Error type | Action |
|---|---|---|
| Repositories | `ApiError` (from `infra/http/errors`) | Throw, never swallow |
| Use Cases | `DomainError`, `ZodError` | Throw, never swallow |
| Actions | — | No catch — errors propagate |
| UI / Page | `try/catch` | Handle and display to user |

```ts
// ✅ infra/http/errors.ts types in use
throw new DomainError('INVALID_INPUT', 'cardId is required.');
throw new ApiError(404, 'Card not found.');
```

**Forbidden globally:**
- `throw new Error('something')` — use typed errors
- `return { success: false, error: '...' }` envelopes
- Silent catch: `catch (e) {}` or `catch (e) { return null; }`

---

## 9. Tailwind CSS Rules

- **Order:** layout → spacing → typography → color → state (`hover:`, `focus:`, `disabled:`)
- **Class composition:** always via `cn()` — never string concatenation
- **No arbitrary values** unless there is no Tailwind equivalent
- **No conflicting classes** on the same element (e.g., `px-4 px-6`)
- **No duplicate classes**
- `dark:` variants only if the component explicitly supports dark mode

---

## 10. Zero-Warning Policy

Every file must be clean. No exceptions.

| Category | Rule |
|---|---|
| TypeScript | No `any`, no implicit `any`, no unused vars |
| React | No missing `key` props, no invalid hook usage |
| Accessibility | All buttons have `type`, all inputs have `aria-label` or `<label>` |
| Next.js | No server/client boundary violations, no hydration mismatches |
| Tailwind | No invalid or deprecated classes |

---

## 11. Anti-Patterns — Globally Forbidden

```ts
// ❌ Business logic in action
export async function getAllUsersAction(workspaceId: string) {
  if (!workspaceId) return [];                     // guard in action
  const users = await getAllUsersUseCase(workspaceId);
  return users.sort((a, b) => a.name.localeCompare(b.name)); // sorting in action
}

// ❌ Dynamic import in use-case body
const { Schema } = await import('@/contracts/Workspace'); // breaks tree-shaking

// ❌ Monolithic actions.ts
// features/workspaces/server/actions.ts with 16 functions — use per-subdomain files

// ❌ Relative cross-feature imports
import { Button } from '../../ui/primitives/Button';

// ❌ any
const data: any = await fetch(...);

// ❌ Silent empty returns on auth failure
if (!session.id) return { items: [] }; // use requireSession() which throws


```
---

## 12. Dependency & Version Compliance (NO DEPRECATED CODE)

All code MUST strictly follow the versions defined in `package.json`.

### Absolute Rule

- ❌ NEVER use deprecated APIs, methods, or patterns
- ❌ NEVER use outdated Tailwind classes or syntax
- ❌ NEVER rely on legacy React / Next.js patterns
- ❌ NEVER copy patterns from outdated tutorials or old codebases

- ✅ ALWAYS follow the CURRENT version of:
  - Next.js
  - React
  - Tailwind CSS
  - TypeScript
  - Zod

---

### 12.1 Version Awareness (MANDATORY)

Before generating or refactoring code:

- Verify compatibility with the installed versions in `package.json`
- Ensure APIs used are **current and supported**
- Prefer official documentation behavior over assumptions

---

### 12.2 Tailwind CSS (STRICT)

- ❌ Do NOT use deprecated utilities
- ❌ Do NOT use outdated config patterns
- ❌ Do NOT use removed color names or old opacity syntax

- ✅ Use current utility conventions
- ✅ Use valid class names only
- ✅ Respect Tailwind version-specific behavior

---

### 12.3 React / Next.js (STRICT)

- ❌ No legacy patterns:
  - No class components
  - No deprecated lifecycle methods
  - No outdated hooks usage
  - No legacy routing patterns

- ❌ No invalid Server/Client mixing
- ❌ No deprecated Next.js APIs

- ✅ Follow App Router patterns strictly
- ✅ Use modern React patterns only

---

### 12.4 TypeScript (STRICT)

- ❌ No deprecated TS utility patterns
- ❌ No unsafe type assertions

- ✅ Prefer:
  - `satisfies`
  - strict typing
  - inferred types from Zod

---

### 12.5 Zod (STRICT)

- ❌ No outdated schema patterns
- ❌ No manual type duplication

- ✅ Always use current Zod APIs
- ✅ Always infer types via `z.infer`

---

### 12.6 Enforcement Rule

If any code introduces:

- Deprecated API usage
- Version mismatch
- Legacy patterns

→ It MUST be refactored immediately.

No backward compatibility hacks allowed.

---

### 12.7 Goal

Ensure the codebase:

- Remains future-proof
- Has zero technical debt from outdated APIs
- Aligns 100% with the current ecosystem
- Avoids breaking changes during dependency upgrades
