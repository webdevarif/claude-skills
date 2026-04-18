---
name: neuro-react
description: React 19 expert - Server Components, Server Actions, hooks, state management, performance optimization, Suspense, error boundaries, compound components, custom hooks, and modern React patterns for any project
trigger: auto
globs:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/components/**"
  - "**/hooks/**"
  - "**/providers/**"
  - "**/contexts/**"
  - "**/app/**/page.*"
  - "**/app/**/layout.*"
---

# React 19 Foundation Skill

You are a React 19 expert. You write production-grade, type-safe, accessible, and performant React code. Every component you produce follows the patterns and rules in this document. This skill is the FOUNDATION that all other React-based skills depend on.

---

## 1. React 19 New Features

### ref as Prop (No More forwardRef)

React 19 passes `ref` as a regular prop. You MUST stop using `forwardRef` — it is deprecated.

```tsx
// CORRECT — React 19
function TextInput({ ref, placeholder }: { ref?: React.Ref<HTMLInputElement>; placeholder: string }) {
  return <input ref={ref} placeholder={placeholder} />;
}

// Usage — ref works like any other prop
function Form() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <TextInput ref={inputRef} placeholder="Type here..." />;
}
```

```tsx
// WRONG — deprecated forwardRef pattern
const TextInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

Ref cleanup functions are now supported — return a function from a ref callback:

```tsx
<div ref={(node) => {
  // Setup
  const observer = new ResizeObserver(() => { /* ... */ });
  if (node) observer.observe(node);
  // Cleanup — called on unmount
  return () => observer.disconnect();
}} />
```

### use() Hook for Promises and Context

The `use()` hook reads promises and context. Unlike other hooks, it CAN be called inside conditionals and loops.

```tsx
import { use, Suspense } from 'react';

// Reading a promise — Suspense handles loading
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}

// Reading context — replaces useContext
function ThemeButton() {
  const theme = use(ThemeContext);
  return <button className={theme.buttonClass}>Click</button>;
}

// Conditional context reading (impossible with useContext)
function ConditionalDisplay({ showUser }: { showUser: boolean }) {
  if (showUser) {
    const user = use(UserContext);
    return <span>{user.name}</span>;
  }
  return <span>Anonymous</span>;
}
```

### useActionState — Form State Management

Replaces the old `useFormState`. Manages form action state, pending status, and errors in one hook.

```tsx
'use client';
import { useActionState } from 'react';
import { createUser } from '@/actions/user';

function SignupForm() {
  const [state, formAction, isPending] = useActionState(createUser, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {state.error && <p className="text-red-500">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

### useFormStatus — Child Component Access to Form State

Reads form status from a parent `<form>`. MUST be used in a child of a `<form>`, NOT in the same component that renders the form.

```tsx
'use client';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

function MyForm() {
  return (
    <form action={serverAction}>
      <input name="title" />
      <SubmitButton /> {/* useFormStatus reads the parent <form> */}
    </form>
  );
}
```

### useOptimistic — Instant UI Feedback

Show optimistic state immediately while an async action completes. React reverts automatically on failure.

```tsx
'use client';
import { useOptimistic } from 'react';

function TodoList({ todos, addTodo }: { todos: Todo[]; addTodo: (text: string) => Promise<void> }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (currentTodos, newTodoText: string) => [
      ...currentTodos,
      { id: crypto.randomUUID(), text: newTodoText, pending: true },
    ]
  );

  async function handleSubmit(formData: FormData) {
    const text = formData.get('text') as string;
    addOptimisticTodo(text);
    await addTodo(text);
  }

  return (
    <>
      <form action={handleSubmit}>
        <input name="text" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </>
  );
}
```

### Document Metadata in Components

React 19 hoists `<title>`, `<meta>`, and `<link>` to `<head>` automatically.

```tsx
function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <title>{post.title} | My Blog</title>
      <meta name="description" content={post.excerpt} />
      <meta property="og:title" content={post.title} />
      <link rel="canonical" href={`https://myblog.com/posts/${post.slug}`} />
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

### Async Transitions with useTransition

useTransition now supports async functions, automatically managing `isPending` across the entire async operation.

```tsx
'use client';
import { useTransition } from 'react';

function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await onSave();
      // isPending is automatically false after the promise resolves
    });
  }

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Saving...' : 'Save'}
    </button>
  );
}
```

---

## 2. Server Components vs Client Components

### Decision Tree

Use a **Server Component** (default) when:
- Fetching data from a database or API
- Accessing backend resources directly
- Rendering static or read-only content
- The component has no interactivity, no event handlers, no browser APIs
- You want to keep secrets (API keys, tokens) off the client

Use a **Client Component** (`'use client'`) when:
- Using hooks: useState, useEffect, useRef, useReducer, etc.
- Using event handlers: onClick, onChange, onSubmit, etc.
- Using browser APIs: window, localStorage, IntersectionObserver, etc.
- Using third-party libraries that depend on React state or browser APIs

### Rules

1. Server Components are the DEFAULT in Next.js App Router. You MUST add `'use client'` only when needed.
2. Server Components CANNOT use hooks (useState, useEffect, etc.) or event handlers.
3. Client Components CANNOT import Server Components directly — pass them as `children` instead.
4. Props passed from Server to Client Components MUST be serializable (no functions, no classes, no Dates — use ISO strings).
5. The `'use client'` directive MUST be at the top of the file, before any imports.

### Composing Server and Client Components

```tsx
// ServerWrapper.tsx — Server Component (default)
import ClientInteractive from './ClientInteractive';
import ServerData from './ServerData';

export default async function ServerWrapper() {
  const data = await fetchData(); // Direct server-side data fetching

  return (
    <ClientInteractive initialCount={data.count}>
      {/* Server Component passed as children to Client Component */}
      <ServerData items={data.items} />
    </ClientInteractive>
  );
}
```

```tsx
// ClientInteractive.tsx
'use client';
import { useState, type ReactNode } from 'react';

export default function ClientInteractive({
  initialCount,
  children,
}: {
  initialCount: number;
  children: ReactNode;
}) {
  const [count, setCount] = useState(initialCount);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      {children} {/* Server Component renders here without re-rendering */}
    </div>
  );
}
```

### Data Fetching in Server Components

```tsx
// app/users/page.tsx — Server Component
interface User {
  id: string;
  name: string;
  email: string;
}

export default async function UsersPage() {
  const users: User[] = await fetch('https://api.example.com/users', {
    next: { revalidate: 60 }, // ISR — revalidate every 60 seconds
  }).then((res) => res.json());

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name} — {user.email}</li>
      ))}
    </ul>
  );
}
```

---

## 3. Server Actions

Server Actions are async functions that run on the server, triggered from client-side forms or event handlers.

### Basic Server Action

```tsx
// actions/user.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export async function createUser(prevState: any, formData: FormData) {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
  };

  const result = CreateUserSchema.safeParse(raw);

  if (!result.success) {
    return {
      error: result.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await db.user.create({ data: result.data });
  } catch (e) {
    return { error: { _form: ['Failed to create user.'] }, success: false };
  }

  revalidatePath('/users');
  redirect('/users');
}
```

### Progressive Enhancement

Forms with Server Actions work WITHOUT JavaScript enabled — the form submits as a standard HTTP request. This is progressive enhancement by default.

```tsx
// This form works even if JavaScript fails to load
<form action={createUser}>
  <input name="name" required />
  <input name="email" type="email" required />
  <button type="submit">Create</button>
</form>
```

### Optimistic Updates with Server Actions

```tsx
'use client';
import { useOptimistic, useActionState } from 'react';
import { addComment } from '@/actions/comments';

function CommentSection({ comments }: { comments: Comment[] }) {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: string) => [
      ...state,
      { id: 'temp', text: newComment, author: 'You', pending: true },
    ]
  );

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const text = formData.get('text') as string;
      addOptimisticComment(text);
      return addComment(prevState, formData);
    },
    { error: null }
  );

  return (
    <div>
      <ul>
        {optimisticComments.map((c) => (
          <li key={c.id} style={{ opacity: c.pending ? 0.6 : 1 }}>{c.text}</li>
        ))}
      </ul>
      <form action={formAction}>
        <input name="text" required />
        <button type="submit" disabled={isPending}>Post</button>
      </form>
      {state.error && <p className="text-red-500">{state.error}</p>}
    </div>
  );
}
```

---

## 4. Hooks Mastery

### useState

```tsx
// Lazy initialization — expensive computation runs only on mount
const [data, setData] = useState(() => computeExpensiveDefault());

// Functional update — always use when new state depends on old state
setCount((prev) => prev + 1);

// Object state — ALWAYS spread to avoid losing other properties
const [form, setForm] = useState({ name: '', email: '' });
setForm((prev) => ({ ...prev, name: 'New Name' }));
```

### useReducer — Complex State Logic

```tsx
type State = { items: Item[]; loading: boolean; error: string | null };
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Item[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'REMOVE_ITEM'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, { items: [], loading: false, error: null });
```

### useEffect — Cleanup, Race Conditions, AbortController

```tsx
// AbortController prevents race conditions in async effects
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    try {
      const res = await fetch(`/api/search?q=${query}`, { signal: controller.signal });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return; // Ignore aborted requests
      setError('Failed to fetch results');
    }
  }

  fetchData();
  return () => controller.abort(); // Cleanup — abort in-flight request
}, [query]);
```

```tsx
// Event listener cleanup
useEffect(() => {
  function handleResize() {
    setWidth(window.innerWidth);
  }
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### useRef — DOM Refs, Mutable Values, Callback Refs

```tsx
// DOM ref
const inputRef = useRef<HTMLInputElement>(null);
const focusInput = () => inputRef.current?.focus();

// Mutable value that persists across renders without causing re-renders
const renderCount = useRef(0);
useEffect(() => { renderCount.current += 1; });

// Callback ref — runs when DOM node is attached/detached
const measureRef = useCallback((node: HTMLDivElement | null) => {
  if (node) {
    const { height } = node.getBoundingClientRect();
    setHeight(height);
  }
}, []);
```

### useMemo / useCallback

With React Compiler (React 19), manual memoization is OFTEN unnecessary. The compiler auto-memoizes JSX, objects, and callbacks. You STILL need manual memoization when:
- Passing values to non-React APIs (e.g., third-party libraries)
- Using values in dependency arrays of effects that are NOT compiled
- Computing genuinely expensive values (sorting 10k+ items)

```tsx
// useMemo — expensive computation
const sortedItems = useMemo(
  () => items.toSorted((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// useCallback — stable function reference for non-compiled consumers
const handleSearch = useCallback(
  (query: string) => {
    externalLibrary.search(query, { onResult: setResults });
  },
  [setResults]
);
```

### useTransition — Non-Blocking Updates

```tsx
'use client';
import { useTransition, useState } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value); // Urgent — update input immediately

    startTransition(async () => {
      const data = await searchAPI(value); // Non-blocking
      setResults(data);
    });
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </div>
  );
}
```

### useDeferredValue — Deferred Rendering

```tsx
import { useDeferredValue, memo } from 'react';

function App() {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);
  const isStale = text !== deferredText;

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <HeavyList filter={deferredText} />
      </div>
    </div>
  );
}

const HeavyList = memo(function HeavyList({ filter }: { filter: string }) {
  // Expensive render — only re-renders when deferredText catches up
  const items = generateExpensiveList(filter);
  return <ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>;
});
```

### useId — SSR-Safe Unique IDs

```tsx
function FormField({ label }: { label: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
      <p id={`${id}-error`} role="alert" />
    </div>
  );
}
```

### useSyncExternalStore — External Store Subscription

```tsx
import { useSyncExternalStore } from 'react';

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => window.matchMedia(query).matches,
    () => false // Server snapshot
  );
}
```

### useContext — Typed Context Pattern

```tsx
import { createContext, use, type ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook that enforces provider presence
function useAuth(): AuthContextType {
  const context = use(AuthContext); // React 19 — use() replaces useContext
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: Credentials) => {
    const user = await authAPI.login(credentials);
    setUser(user);
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext value={{ user, login, logout }}>
      {children}
    </AuthContext>
  );
}
```

Note: React 19 uses `<Context value={...}>` directly instead of `<Context.Provider value={...}>`.

### Custom Hooks — Rules and Patterns

```tsx
// Custom hook for debounced values
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Custom hook for local storage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    const valueToStore = value instanceof Function ? value(stored) : value;
    setStored(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [stored, setValue] as const;
}

// Custom hook for async operations
function useAsync<T>(asyncFn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    asyncFn()
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((error) => { if (!cancelled) setState({ data: null, loading: false, error }); });

    return () => { cancelled = true; };
  }, deps);

  return state;
}
```

**Custom hook rules:**
- MUST start with `use` (e.g., `useAuth`, `useDebounce`)
- MUST only call other hooks at the top level (no conditionals/loops — except `use()`)
- MUST be pure — same inputs produce same behavior
- SHOULD return a tuple `[value, setter]` or an object `{ data, loading, error }`

---

## 5. State Management Patterns

### Decision Tree

| Use Case | Solution |
|---|---|
| Form input, toggles, local UI | `useState` |
| Complex local state with actions | `useReducer` |
| Theme, auth, locale (stable values) | Context + `use()` |
| URL-driven state (filters, pagination) | `useSearchParams` / URL state |
| Server data (CRUD, lists, detail) | Server Components, TanStack Query, SWR |
| Shared client state across components | Zustand |
| Large enterprise app with strict patterns | Redux Toolkit |
| Atomic state (fine-grained reactivity) | Jotai |

### Zustand Store Pattern (Recommended for Client State)

```tsx
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIStore {
  sidebarOpen: boolean;
  activeTab: string;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
}

const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        activeTab: 'editor',
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setActiveTab: (tab) => set({ activeTab: tab }),
      }),
      { name: 'ui-store' }
    )
  )
);

// ALWAYS use selectors — prevents unnecessary re-renders
function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  // ...
}
```

### Context — When to Use and When NOT

```tsx
// GOOD — stable, rarely changing values
<ThemeContext value={theme}> {/* Changes maybe once per session */}
  <AuthContext value={auth}> {/* Changes on login/logout */}
    {children}
  </AuthContext>
</ThemeContext>

// BAD — frequently changing values cause entire tree to re-render
// NEVER put rapidly changing state in Context without splitting
<AppContext value={{ theme, user, notifications, searchQuery, cart }}>
  {children} {/* ALL consumers re-render when ANY value changes */}
</AppContext>
```

**Context performance fix — split contexts:**

```tsx
const ThemeContext = createContext<Theme>(defaultTheme);
const AuthContext = createContext<Auth | null>(null);
const NotificationContext = createContext<Notification[]>([]);
// Each context only triggers re-renders in its own consumers
```

### URL State (Filters, Pagination, Tabs)

```tsx
'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function ProductFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = searchParams.get('category') ?? 'all';
  const sort = searchParams.get('sort') ?? 'newest';

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <select value={category} onChange={(e) => updateFilter('category', e.target.value)}>
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
      </select>
    </div>
  );
}
```

---

## 6. Component Patterns

### Compound Components

```tsx
'use client';
import { createContext, use, useState, type ReactNode } from 'react';

// --- Tabs compound component ---
interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabs() {
  const ctx = use(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
}

function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext value={{ activeTab, setActiveTab }}>
      <div role="tablist">{children}</div>
    </TabsContext>
  );
}

function TabTrigger({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabs();
  return (
    <button
      role="tab"
      aria-selected={activeTab === id}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
}

function TabContent({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useTabs();
  if (activeTab !== id) return null;
  return <div role="tabpanel">{children}</div>;
}

// Attach sub-components
Tabs.Trigger = TabTrigger;
Tabs.Content = TabContent;

// Usage
<Tabs defaultTab="code">
  <Tabs.Trigger id="code">Code</Tabs.Trigger>
  <Tabs.Trigger id="preview">Preview</Tabs.Trigger>
  <Tabs.Content id="code"><CodeEditor /></Tabs.Content>
  <Tabs.Content id="preview"><Preview /></Tabs.Content>
</Tabs>
```

### Polymorphic Component (`as` Prop)

```tsx
import { type ElementType, type ComponentPropsWithoutRef } from 'react';

type BoxProps<T extends ElementType = 'div'> = {
  as?: T;
  children?: ReactNode;
} & ComponentPropsWithoutRef<T>;

function Box<T extends ElementType = 'div'>({ as, children, ...props }: BoxProps<T>) {
  const Component = as || 'div';
  return <Component {...props}>{children}</Component>;
}

// Usage
<Box as="section" className="container">{/* renders <section> */}</Box>
<Box as="a" href="/about">{/* renders <a> with href type-checked */}</Box>
<Box>{/* renders <div> by default */}</Box>
```

### Controlled vs Uncontrolled

```tsx
// Controlled — parent owns state
function ControlledInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}

// Uncontrolled with default — component owns state, parent sets initial
function UncontrolledInput({ defaultValue }: { defaultValue?: string }) {
  return <input defaultValue={defaultValue} />;
}

// Hybrid — supports both patterns
function FlexibleInput({
  value,
  defaultValue,
  onChange,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
}) {
  const [internal, setInternal] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internal;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternal(e.target.value);
    onChange?.(e.target.value);
  }

  return <input value={currentValue} onChange={handleChange} />;
}
```

### Headless Component (Logic Only)

```tsx
// useToggle — headless toggle logic
function useToggle(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const toggle = () => setIsOpen((prev) => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, toggle, open, close } as const;
}

// Any UI can consume the logic
function Dropdown() {
  const { isOpen, toggle, close } = useToggle();
  return (
    <div>
      <button onClick={toggle}>Menu</button>
      {isOpen && <DropdownMenu onClose={close} />}
    </div>
  );
}
```

### Portal Pattern

```tsx
'use client';
import { createPortal } from 'react-dom';
import { useEffect, useState, type ReactNode } from 'react';

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}

function Modal({ isOpen, onClose, children }: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative z-10 rounded-lg bg-white p-6" role="dialog" aria-modal="true">
          {children}
        </div>
      </div>
    </Portal>
  );
}
```

### Slot / Children Composition Pattern

```tsx
interface CardProps {
  children: ReactNode;
}

function Card({ children }: CardProps) {
  return <div className="rounded-lg border shadow-sm">{children}</div>;
}

function CardHeader({ children }: { children: ReactNode }) {
  return <div className="border-b px-6 py-4 font-semibold">{children}</div>;
}

function CardBody({ children }: { children: ReactNode }) {
  return <div className="px-6 py-4">{children}</div>;
}

function CardFooter({ children }: { children: ReactNode }) {
  return <div className="border-t px-6 py-3 flex justify-end gap-2">{children}</div>;
}

// Usage — composable, order-independent
<Card>
  <CardHeader>Settings</CardHeader>
  <CardBody><SettingsForm /></CardBody>
  <CardFooter><Button>Save</Button></CardFooter>
</Card>
```

---

## 7. Performance Optimization

### React Compiler (React 19)

The React Compiler (stable since v1.0, October 2025) automatically memoizes:
- JSX output (equivalent of `React.memo`)
- Object/array literals in render
- Callback functions

You MUST still handle these manually:
- **Virtualization** — the compiler cannot render fewer DOM nodes
- **Code splitting** — the compiler cannot split bundles
- **State architecture** — the compiler cannot fix bad state placement
- **External library callbacks** — non-React code is not compiled

### Virtualization for Large Lists

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
              height: `${virtualItem.size}px`,
              width: '100%',
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Code Splitting with lazy() and Suspense

```tsx
import { lazy, Suspense } from 'react';

// Dynamic import — component is loaded only when rendered
const HeavyChart = lazy(() => import('./HeavyChart'));
const MarkdownEditor = lazy(() => import('./MarkdownEditor'));

function Dashboard({ activeTab }: { activeTab: string }) {
  return (
    <Suspense fallback={<Skeleton height={400} />}>
      {activeTab === 'charts' && <HeavyChart />}
      {activeTab === 'editor' && <MarkdownEditor />}
    </Suspense>
  );
}
```

### Avoiding Unnecessary Re-Renders

```tsx
// PATTERN 1: State Colocation — move state to where it's used
// BAD — entire page re-renders on every keystroke
function Page() {
  const [search, setSearch] = useState('');
  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <ExpensiveTree /> {/* Re-renders on every keystroke! */}
    </div>
  );
}

// GOOD — extract the stateful part
function SearchInput() {
  const [search, setSearch] = useState('');
  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
}

function Page() {
  return (
    <div>
      <SearchInput />
      <ExpensiveTree /> {/* Never re-renders from search changes */}
    </div>
  );
}

// PATTERN 2: Children pattern — children don't re-render when parent state changes
function ScrollTracker({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div>
      <header style={{ opacity: Math.max(0, 1 - scrollY / 200) }}>Header</header>
      {children} {/* children is a stable reference — no re-render */}
    </div>
  );
}
```

### Key Prop Best Practices

```tsx
// NEVER use index as key for dynamic lists
// BAD — causes bugs with reordering, deletion, insertion
{items.map((item, index) => <ListItem key={index} item={item} />)}

// GOOD — use a stable, unique identifier
{items.map((item) => <ListItem key={item.id} item={item} />)}

// OK — index is fine for STATIC lists that never reorder
{['Home', 'About', 'Contact'].map((label, i) => <NavLink key={i}>{label}</NavLink>)}
```

### Profiling

```tsx
import { Profiler, type ProfilerOnRenderCallback } from 'react';

const onRender: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
  if (actualDuration > 16) {
    console.warn(`Slow render: ${id} (${phase}) took ${actualDuration.toFixed(1)}ms`);
  }
};

<Profiler id="ProductList" onRender={onRender}>
  <ProductList items={products} />
</Profiler>
```

### Debounce Pattern

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

---

## 8. Error Handling

### Error Boundary (Class Component — Required)

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    // Log to monitoring service
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert" className="p-4 text-red-500">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### error.tsx in Next.js App Router

```tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="rounded bg-primary px-4 py-2 text-white">
        Try again
      </button>
    </div>
  );
}
```

### Try/Catch in Server Actions

```tsx
'use server';

export async function deleteItem(id: string) {
  try {
    await db.item.delete({ where: { id } });
    revalidatePath('/items');
    return { success: true, error: null };
  } catch (error) {
    // NEVER expose internal errors to the client
    console.error('Delete failed:', error);
    return { success: false, error: 'Failed to delete item. Please try again.' };
  }
}
```

### Graceful Degradation

```tsx
function UserAvatar({ src, name }: { src: string; name: string }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="h-10 w-10 rounded-full"
      onError={() => setImgError(true)}
    />
  );
}
```

---

## 9. Suspense & Streaming

### Suspense Boundaries

```tsx
import { Suspense } from 'react';

// Nested Suspense for progressive loading
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards /> {/* Loads independently */}
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentActivity /> {/* Loads independently */}
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <AnalyticsChart /> {/* Loads independently */}
      </Suspense>
    </div>
  );
}
```

### loading.tsx in Next.js

```tsx
// app/dashboard/loading.tsx — automatically wraps page in Suspense
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}
```

### Streaming SSR Architecture

```tsx
// Server Component that streams progressively
export default async function ProductPage({ params }: { params: { id: string } }) {
  // This data loads first — above the fold
  const product = await getProduct(params.id);

  return (
    <div>
      {/* Immediate — part of initial HTML */}
      <ProductHero product={product} />

      {/* Streams in after reviews load */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={params.id} />
      </Suspense>

      {/* Streams in after recommendations load */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations category={product.category} />
      </Suspense>
    </div>
  );
}

// Each of these is an async Server Component — they stream independently
async function ProductReviews({ productId }: { productId: string }) {
  const reviews = await getReviews(productId); // Could take 500ms
  return <ReviewList reviews={reviews} />;
}

async function Recommendations({ category }: { category: string }) {
  const items = await getRecommendations(category); // Could take 1s
  return <ProductGrid items={items} />;
}
```

---

## 10. Data Fetching Patterns

### Server Component Direct Fetch

```tsx
// BEST for initial page data — zero client JS, no loading states needed
export default async function UsersPage() {
  const users = await db.user.findMany({ take: 50 });
  return <UserTable users={users} />;
}
```

### Parallel Data Fetching (Prevent Waterfalls)

```tsx
// BAD — sequential waterfall (total = time1 + time2 + time3)
export default async function Dashboard() {
  const stats = await getStats();        // 200ms
  const users = await getUsers();        // 300ms
  const revenue = await getRevenue();    // 250ms
  // Total: ~750ms
}

// GOOD — parallel fetch (total = max(time1, time2, time3))
export default async function Dashboard() {
  const [stats, users, revenue] = await Promise.all([
    getStats(),     // 200ms
    getUsers(),     // 300ms
    getRevenue(),   // 250ms
  ]);
  // Total: ~300ms
}
```

### SWR Pattern

```tsx
'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserList() {
  const { data, error, isLoading, mutate } = useSWR<User[]>('/api/users', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <ul>
      {data?.map((user) => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### TanStack Query Pattern

```tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((r) => r.json()) as Promise<User[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newUser: CreateUserInput) =>
      fetch('/api/users', { method: 'POST', body: JSON.stringify(newUser) }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onMutate: async (newUser) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData<User[]>(['users']);
      queryClient.setQueryData<User[]>(['users'], (old = []) => [
        ...old,
        { ...newUser, id: 'temp', createdAt: new Date().toISOString() },
      ]);
      return { previous };
    },
    onError: (_err, _newUser, context) => {
      queryClient.setQueryData(['users'], context?.previous);
    },
  });
}
```

### Infinite Scroll / Pagination

```tsx
'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

function InfiniteProductList() {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam }) =>
      fetch(`/api/products?cursor=${pageParam}`).then((r) => r.json()),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div>
      {data?.pages.flatMap((page) =>
        page.items.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
      <div ref={ref}>
        {isFetchingNextPage && <Spinner />}
      </div>
    </div>
  );
}
```

---

## 11. Form Patterns

### React Hook Form + Zod

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user', 'editor']),
  bio: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function UserForm({ onSubmit }: { onSubmit: (data: FormValues) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', role: 'user', bio: '' },
  });

  async function onFormSubmit(data: FormValues) {
    await onSubmit(data);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="role">Role</label>
        <select id="role" {...register('role')}>
          <option value="user">User</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### Dynamic Form Fields

```tsx
'use client';
import { useFieldArray, useForm } from 'react-hook-form';

function DynamicForm() {
  const { control, register, handleSubmit } = useForm({
    defaultValues: { items: [{ name: '', quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          <input {...register(`items.${index}.name`)} placeholder="Item name" />
          <input {...register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '', quantity: 1 })}>
        Add Item
      </button>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Multi-Step Form (Wizard)

```tsx
'use client';
import { useState, type ReactNode } from 'react';

function useMultiStepForm(steps: ReactNode[]) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return {
    currentStep: steps[currentIndex],
    currentIndex,
    totalSteps: steps.length,
    isFirst: currentIndex === 0,
    isLast: currentIndex === steps.length - 1,
    next: () => setCurrentIndex((i) => Math.min(i + 1, steps.length - 1)),
    back: () => setCurrentIndex((i) => Math.max(i - 1, 0)),
    goTo: (index: number) => setCurrentIndex(index),
  };
}

function Wizard() {
  const [formData, setFormData] = useState({ name: '', email: '', plan: '' });
  const { currentStep, isFirst, isLast, next, back, currentIndex, totalSteps } =
    useMultiStepForm([
      <StepName data={formData} onUpdate={setFormData} />,
      <StepEmail data={formData} onUpdate={setFormData} />,
      <StepPlan data={formData} onUpdate={setFormData} />,
    ]);

  return (
    <div>
      <div className="text-sm text-muted">Step {currentIndex + 1} of {totalSteps}</div>
      {currentStep}
      <div className="flex gap-2">
        {!isFirst && <button onClick={back}>Back</button>}
        {isLast ? (
          <button onClick={() => submitForm(formData)}>Submit</button>
        ) : (
          <button onClick={next}>Next</button>
        )}
      </div>
    </div>
  );
}
```

---

## 12. Testing Patterns

### React Testing Library

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from './UserForm';

describe('UserForm', () => {
  it('submits valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<UserForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        bio: '',
      });
    });
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<UserForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/name must be at least/i)).toBeInTheDocument();
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

### Custom Hook Testing

```tsx
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.restoreAllTimers());

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 300 } }
    );

    expect(result.current).toBe('hello');

    rerender({ value: 'world', delay: 300 });
    expect(result.current).toBe('hello'); // Not updated yet

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('world'); // Updated after delay
  });
});
```

### MSW for API Mocking

```tsx
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]);
  }),
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: '3', ...body }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('loads and displays users', async () => {
  render(<UserList />);
  expect(await screen.findByText('Alice')).toBeInTheDocument();
  expect(screen.getByText('Bob')).toBeInTheDocument();
});
```

---

## 13. Accessibility (a11y)

### ARIA Attributes

```tsx
// Accessible button with loading state
<button
  aria-busy={isLoading}
  aria-disabled={isLoading}
  aria-label="Save changes"
  onClick={!isLoading ? handleSave : undefined}
>
  {isLoading ? <Spinner aria-hidden="true" /> : null}
  {isLoading ? 'Saving...' : 'Save'}
</button>

// Accessible alert
<div role="alert" aria-live="assertive">
  {error && <p className="text-red-500">{error}</p>}
</div>

// Accessible dialog
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Delete</h2>
  <p id="dialog-desc">This action cannot be undone.</p>
</div>
```

### Focus Management

```tsx
'use client';
import { useEffect, useRef } from 'react';

// Focus trap for modals
function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    firstEl?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl?.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl?.focus();
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}
```

### Keyboard Navigation

```tsx
function useArrowNavigation(itemCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, itemCount - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(itemCount - 1);
        break;
    }
  }

  return { activeIndex, handleKeyDown };
}
```

### useId for Accessible Forms

```tsx
function LabeledInput({ label, error }: { label: string; error?: string }) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <p id={errorId} role="alert" className="text-red-500">{error}</p>}
    </div>
  );
}
```

### Reduced Motion

```tsx
'use client';

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );
}

function AnimatedCard({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      style={{
        transition: prefersReducedMotion ? 'none' : 'transform 300ms ease',
      }}
    >
      {children}
    </div>
  );
}
```

---

## 14. Project Structure

### Feature-Based Organization

```
src/
  app/                          # Next.js App Router
    (dashboard)/                # Route group
      layout.tsx
      page.tsx
      settings/page.tsx
    (auth)/
      login/page.tsx
      register/page.tsx
    api/                        # API routes
      users/route.ts

  components/
    ui/                         # Reusable primitives (Button, Input, Modal)
      Button.tsx
      Input.tsx
      Modal.tsx
    features/                   # Feature-specific components
      auth/
        LoginForm.tsx
        AuthProvider.tsx
      dashboard/
        StatsCard.tsx
        ActivityFeed.tsx
    layouts/                    # Layout components
      Sidebar.tsx
      Header.tsx

  hooks/                        # Custom hooks
    useDebounce.ts
    useLocalStorage.ts
    useMediaQuery.ts

  stores/                       # Zustand stores
    ui-store.ts
    auth-store.ts

  lib/                          # Utilities, API clients, constants
    api.ts
    utils.ts
    constants.ts

  types/                        # Shared TypeScript types
    user.d.ts
    api.d.ts

  actions/                      # Server Actions
    user.ts
    auth.ts
```

### Barrel Exports

Use barrel exports (`index.ts`) ONLY for public API boundaries (e.g., `components/ui/index.ts`). NEVER create barrel exports for every folder — it bloats bundles and slows builds.

```tsx
// components/ui/index.ts — OK, this is a public API
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';

// Import from barrel
import { Button, Input, Modal } from '@/components/ui';
```

### Path Aliases

ALWAYS configure `@/` to point to `src/`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```tsx
// GOOD
import { Button } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';

// BAD — relative path hell
import { Button } from '../../../../components/ui/Button';
```

---

## 15. Anti-Patterns (NEVER DO)

### 1. NEVER Mutate State Directly

```tsx
// WRONG
const [items, setItems] = useState([1, 2, 3]);
items.push(4);       // Mutation — React won't detect change
setItems(items);     // Same reference — no re-render

// CORRECT
setItems((prev) => [...prev, 4]);
```

### 2. NEVER Use useEffect for Derived State

```tsx
// WRONG — unnecessary effect, causes extra render
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// CORRECT — compute during render
const fullName = `${firstName} ${lastName}`;
```

### 3. NEVER Fetch in useEffect When a Server Component Works

```tsx
// WRONG — client-side fetch with loading/error states
'use client';
function Users() {
  const [users, setUsers] = useState([]);
  useEffect(() => { fetch('/api/users').then(r => r.json()).then(setUsers); }, []);
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// CORRECT — Server Component, zero client JS
async function Users() {
  const users = await db.user.findMany();
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### 4. NEVER Use Index as Key for Dynamic Lists

Index keys cause state corruption when items are reordered, inserted, or deleted. React cannot distinguish moved elements from updated elements.

### 5. NEVER Put State in useRef to Avoid Re-Renders

If you need the UI to reflect a value, it MUST be state. Using ref to "hide" state from React causes stale UI.

### 6. NEVER Use Context for Frequently Changing Values Without Optimization

Every context consumer re-renders when the value changes. For high-frequency updates, use Zustand or split into multiple contexts.

### 7. NEVER Nest Ternaries Deeper Than 2 Levels

```tsx
// WRONG — unreadable
{a ? (b ? (c ? <X /> : <Y />) : <Z />) : <W />}

// CORRECT — extract to early returns or variables
if (!a) return <W />;
if (!b) return <Z />;
return c ? <X /> : <Y />;
```

### 8. NEVER Inline Complex Objects/Functions in JSX Without Memoization (Pre-Compiler)

```tsx
// WRONG — new object on every render (may cause child re-renders in non-compiled code)
<Map center={{ lat: 40.7, lng: -74.0 }} />

// CORRECT — stable reference
const center = useMemo(() => ({ lat: 40.7, lng: -74.0 }), []);
<Map center={center} />
```

Note: React Compiler handles most of these automatically in compiled code. You MUST still handle this for non-compiled third-party library props.

### 9. NEVER Use useEffect to Sync Props to State

```tsx
// WRONG — creates a copy that gets stale
function Display({ value }: { value: string }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]); // Anti-pattern
  return <span>{local}</span>;
}

// CORRECT — use the prop directly, or use key to reset
<Display key={itemId} value={item.value} />
```

### 10. NEVER Create Components Inside Components

```tsx
// WRONG — new component identity on every render, destroys state
function Parent() {
  function Child() { return <div>Hi</div>; } // BAD
  return <Child />;
}

// CORRECT — define outside
function Child() { return <div>Hi</div>; }
function Parent() { return <Child />; }
```

---

## 16. Golden Rules

1. **Server Components are the default.** Add `'use client'` only when you need hooks, event handlers, or browser APIs.

2. **Fetch data on the server.** Use async Server Components for initial data. Reserve client-side fetching (SWR, TanStack Query) for real-time updates and user-triggered mutations.

3. **Colocate state as low as possible.** Keep state in the closest component that needs it. Lift only when siblings need to share.

4. **Use composition over configuration.** Prefer `children` and compound components over deeply nested prop objects.

5. **Type everything.** Every prop, every state, every hook return type. Use `z.infer<typeof schema>` to derive form types from Zod schemas.

6. **Validate at the boundary.** Use Zod in Server Actions and API routes. Never trust client input.

7. **Handle all states.** Every async operation has four states: idle, loading, success, error. Render all four.

8. **Use `use()` for context.** Replace `useContext` with the `use()` hook in React 19 for cleaner context consumption.

9. **Prefer URL state for filters, pagination, and tabs.** URL state is shareable, bookmarkable, and survives page refreshes.

10. **Wrap async boundaries in Suspense.** Every async server component should have a Suspense boundary with a meaningful fallback — NEVER a blank screen.

11. **Accessibility is not optional.** Every interactive element MUST be keyboard accessible. Every form input MUST have a label. Every image MUST have alt text.

12. **Errors must be caught.** Wrap route segments with `error.tsx`. Wrap component trees with `ErrorBoundary`. Return result objects from Server Actions — NEVER throw into the void.

13. **Split client bundles aggressively.** Use `lazy()` + `Suspense` for any component heavier than 50KB that is not above the fold.

14. **Never suppress the linter.** If ESLint or the React Compiler warns you, fix the code — do not add `eslint-disable` or `// @ts-ignore` without a documented reason.

15. **Measure before optimizing.** Use React DevTools Profiler and Lighthouse before adding `memo`, `useMemo`, or `useCallback`. The React Compiler already handles most cases. Optimize only what the profiler proves is slow.
