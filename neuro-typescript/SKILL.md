---
name: neuro-typescript
description: TypeScript expert - generics, utility types, type-safe APIs, Zod inference, discriminated unions, React component typing, Prisma types, conditional types, mapped types, and strict mode best practices for any project
trigger: auto
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/tsconfig*.json"
  - "**/types/**"
  - "**/*.d.ts"
  - "**/lib/**"
  - "**/utils/**"
---

# TypeScript Expert Skill

You are a TypeScript expert. Every type decision you make must maximize compile-time safety, minimize runtime errors, and produce code that is self-documenting through its types. Type errors are the #1 time killer in vibe coding — eliminate them at the source.

---

## 1. TypeScript Config Best Practices

### Recommended tsconfig.json for Next.js / React Projects

```jsonc
{
  "compilerOptions": {
    // Strict safety — non-negotiable
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,

    // Additional strictness
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,

    // Module resolution
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,

    // JSX
    "jsx": "preserve",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],

    // Output
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",

    // Path aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/lib/*": ["src/lib/*"],
      "@/types/*": ["src/types/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "next-env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### What Each Strict Flag Does

- **`strict: true`** — Enables all strict checks: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, `alwaysStrict`, `useUnknownInCatchVariables`.
- **`noUncheckedIndexedAccess`** — `arr[0]` returns `T | undefined` instead of `T`. Forces handling of missing array/object indices. This is the single most valuable flag not included in `strict`.
- **`exactOptionalPropertyTypes`** — Distinguishes between `{ x?: string }` (key absent) and `{ x: string | undefined }` (key present but undefined). Prevents `obj.x = undefined` on optional properties.
- **`noPropertyAccessFromIndexSignature`** — Forces bracket notation for index signature access, making implicit property access explicit.
- **`verbatimModuleSyntax`** — Ensures `import type` and `export type` are used correctly. Replaces `importsNotUsedAsValues` and `preserveValueImports`.

---

## 2. Core Types

### Primitives

```typescript
const name: string = "NeuroCode";
const count: number = 42;
const active: boolean = true;
const id: bigint = 9007199254740991n;
const sym: symbol = Symbol("unique");
const nothing: null = null;
const missing: undefined = undefined;
```

### Arrays and Tuples

```typescript
// Arrays
const ids: number[] = [1, 2, 3];
const names: Array<string> = ["a", "b"]; // Same thing, less common
const readonly_ids: readonly number[] = [1, 2, 3]; // Immutable

// Tuples — fixed-length arrays with known types per position
const pair: [string, number] = ["age", 30];
const rgb: [r: number, g: number, b: number] = [255, 128, 0]; // Labeled
const rest: [string, ...number[]] = ["sum", 1, 2, 3]; // Rest elements
const readonly_pair: readonly [string, number] = ["age", 30]; // Immutable
```

### Enums vs Const Objects vs Union Types

**NEVER use `enum`. Use const objects or union types instead.**

```typescript
// BAD — enum generates runtime code, has numeric reverse mapping quirks
enum Status { Active, Inactive }

// GOOD — const object (use when you need runtime values + iteration)
const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;
type Status = (typeof STATUS)[keyof typeof STATUS]; // "active" | "inactive"

// BEST — union type (use when you only need the type, no runtime object)
type Status = "active" | "inactive" | "suspended";
```

### Type vs Interface

```typescript
// Use `type` for: unions, intersections, primitives, tuples, mapped types, utility types
type Result = Success | Failure;
type Pair = [string, number];
type ID = string | number;
type UserKeys = keyof User;

// Use `interface` for: object shapes that may be extended or implemented
interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends User {
  role: "admin";
  permissions: string[];
}

// interface supports declaration merging (useful for augmenting third-party types)
interface Window {
  electronAPI: ElectronAPI;
}
```

**Rule of thumb**: Use `type` by default. Use `interface` when you need `extends`, `implements`, or declaration merging.

### Type Assertions

```typescript
// `as` — tells the compiler "trust me" (avoid when possible)
const input = document.getElementById("name") as HTMLInputElement;

// `satisfies` (TS 5.0+) — validates type while preserving the narrower inferred type
const config = {
  port: 3000,
  host: "localhost",
  debug: true,
} satisfies Record<string, string | number | boolean>;
// config.port is `number`, not `string | number | boolean`

// Non-null assertion `!` — asserts value is not null/undefined (use sparingly)
const el = document.getElementById("app")!;
// PREFER: proper null check
const el = document.getElementById("app");
if (!el) throw new Error("Missing #app element");

// Optional chaining `?.` — safe property access
const name = user?.profile?.name; // string | undefined

// Nullish coalescing `??` — default for null/undefined only (not 0 or "")
const port = config.port ?? 3000;
```

---

## 3. Generics

### Generic Functions

```typescript
// Basic identity
function identity<T>(arg: T): T {
  return arg;
}
const result = identity("hello"); // type: "hello" (literal)

// Generic with constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const name = getProperty({ name: "Alice", age: 30 }, "name"); // string

// Default generic
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

// Multiple generics
function merge<TTarget extends object, TSource extends object>(
  target: TTarget,
  source: TSource
): TTarget & TSource {
  return { ...target, ...source };
}
```

### Generic Constraints

```typescript
// Constraint with interface
interface HasId {
  id: string;
}

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

// Constraint with keyof
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

// Constraint with constructor
function createInstance<T>(Ctor: new () => T): T {
  return new Ctor();
}

// Constraint with callable
function callWith<T, R>(fn: (arg: T) => R, arg: T): R {
  return fn(arg);
}
```

### Generic API Response Pattern

```typescript
// Generic API response wrapper
type ApiResponse<TData> = {
  data: TData;
  status: number;
  timestamp: string;
};

type PaginatedResponse<TData> = ApiResponse<TData[]> & {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

// Generic fetch wrapper
async function fetchApi<TData>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<TData>> {
  const res = await fetch(url, options);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<ApiResponse<TData>>;
}

// Usage — fully typed
const users = await fetchApi<User[]>("/api/users");
// users.data is User[]
```

### Generic Form Handler

```typescript
type FormState<TValues extends Record<string, unknown>> = {
  values: TValues;
  errors: Partial<Record<keyof TValues, string>>;
  touched: Partial<Record<keyof TValues, boolean>>;
  isSubmitting: boolean;
};

function useForm<TValues extends Record<string, unknown>>(
  initialValues: TValues,
  onSubmit: (values: TValues) => Promise<void>
): {
  state: FormState<TValues>;
  setValue: <K extends keyof TValues>(key: K, value: TValues[K]) => void;
  handleSubmit: () => Promise<void>;
} {
  // Implementation
}

// Usage
const form = useForm(
  { email: "", password: "", rememberMe: false },
  async (values) => {
    // values is { email: string; password: string; rememberMe: boolean }
  }
);
form.setValue("email", "a@b.com"); // Type-safe key and value
```

### Generic Table Component (React)

```typescript
type Column<TRow> = {
  key: keyof TRow & string;
  header: string;
  render?: (value: TRow[keyof TRow], row: TRow) => React.ReactNode;
};

type TableProps<TRow extends Record<string, unknown>> = {
  data: TRow[];
  columns: Column<TRow>[];
  onRowClick?: (row: TRow) => void;
  keyExtractor: (row: TRow) => string;
};

function Table<TRow extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  keyExtractor,
}: TableProps<TRow>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={keyExtractor(row)} onClick={() => onRowClick?.(row)}>
            {columns.map((col) => (
              <td key={col.key}>
                {col.render ? col.render(row[col.key], row) : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage — columns are type-checked against User keys
<Table<User>
  data={users}
  columns={[
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "createdAt", header: "Joined", render: (v) => formatDate(v as Date) },
  ]}
  keyExtractor={(u) => u.id}
/>
```

### Generic Hook

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
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

  return [stored, setValue];
}

// Usage
const [theme, setTheme] = useLocalStorage<"dark" | "light">("theme", "dark");
```

### The `infer` Keyword

```typescript
// Extract return type of a function
type MyReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never;

// Extract element type from array
type ElementOf<T> = T extends (infer E)[] ? E : never;
type Item = ElementOf<string[]>; // string

// Extract promise resolution type
type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;
type Result = UnwrapPromise<Promise<Promise<string>>>; // string

// Extract props type from a React component
type PropsOf<T> = T extends React.ComponentType<infer P> ? P : never;
```

---

## 4. Utility Types (All of Them)

### Built-in Utility Types

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
}

// Partial<T> — all properties optional
type UpdateUser = Partial<User>;
// { id?: string; name?: string; email?: string; ... }

// Required<T> — all properties required
type RequiredUser = Required<Partial<User>>;

// Readonly<T> — all properties readonly
type FrozenUser = Readonly<User>;
// { readonly id: string; readonly name: string; ... }

// Pick<T, K> — select specific properties
type UserPreview = Pick<User, "id" | "name">;
// { id: string; name: string }

// Omit<T, K> — exclude specific properties
type CreateUser = Omit<User, "id" | "createdAt">;
// { name: string; email: string; role: "admin" | "user" }

// Record<K, V> — construct an object type with key type K and value type V
type UserMap = Record<string, User>;
type StatusCounts = Record<User["role"], number>;
// { admin: number; user: number }

// Exclude<T, U> — remove members from a union
type NonAdmin = Exclude<User["role"], "admin">; // "user"

// Extract<T, U> — keep only members assignable to U
type OnlyAdmin = Extract<User["role"], "admin">; // "admin"

// NonNullable<T> — remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string

// ReturnType<T> — extract function return type
function getUser() { return { id: "1", name: "Alice" }; }
type UserResult = ReturnType<typeof getUser>;
// { id: string; name: string }

// Parameters<T> — extract function parameter types as a tuple
type GetUserParams = Parameters<typeof fetch>;
// [input: RequestInfo | URL, init?: RequestInit | undefined]

// ConstructorParameters<T> — extract constructor parameters
type DateParams = ConstructorParameters<typeof Date>;

// Awaited<T> — unwrap Promise types (TS 4.5+)
type ResolvedUser = Awaited<Promise<Promise<User>>>; // User

// InstanceType<T> — extract instance type from constructor
class UserService { users: User[] = []; }
type ServiceInstance = InstanceType<typeof UserService>; // UserService

// NoInfer<T> — prevent inference from a specific position (TS 5.4+)
function createFSM<TState extends string>(
  initial: NoInfer<TState>,
  states: TState[]
): void { }
// `initial` must be one of the explicitly provided states
// Without NoInfer, TS would widen the type based on `initial`

// Uppercase<T>, Lowercase<T>, Capitalize<T>, Uncapitalize<T>
type Shout = Uppercase<"hello">; // "HELLO"
type Quiet = Lowercase<"HELLO">; // "hello"
```

### Custom Utility Types

```typescript
// DeepPartial — recursively make all properties optional
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// DeepReadonly — recursively make all properties readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// Prettify — flatten intersection types for readable hover info
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// MakeRequired — make specific properties required
type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// MakeOptional — make specific properties optional
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Mutable — remove readonly from all properties
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// DeepMutable — recursively remove readonly
type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends object ? DeepMutable<T[K]> : T[K];
};

// ValueOf — extract value types from an object
type ValueOf<T> = T[keyof T];

// KeysMatching — get keys whose values match a given type
type KeysMatching<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
type StringKeys = KeysMatching<User, string>; // "id" | "name" | "email"

// RequireAtLeastOne — at least one property must be provided
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

// StrictOmit — like Omit but errors if key doesn't exist
type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Entries — typed Object.entries return type
type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
```

---

## 5. Discriminated Unions & Exhaustive Checking

### Tagged Unions

```typescript
// API response states
type ApiState<TData> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: TData }
  | { status: "error"; error: string; code?: number };

function renderState<T>(state: ApiState<T>, renderData: (data: T) => React.ReactNode) {
  switch (state.status) {
    case "idle":
      return <p>Ready to fetch</p>;
    case "loading":
      return <Spinner />;
    case "success":
      return renderData(state.data); // `state.data` is available here
    case "error":
      return <ErrorBanner message={state.error} />;
  }
}
```

### Exhaustive Checking with `never`

```typescript
// Helper function — place in your utils
function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${JSON.stringify(value)}`);
}

// Usage — compiler errors if you miss a case
function handleAction(action: Action) {
  switch (action.type) {
    case "create": return handleCreate(action);
    case "update": return handleUpdate(action);
    case "delete": return handleDelete(action);
    default: return assertNever(action);
    // If you add a new action type and forget to handle it,
    // TypeScript will error: Argument of type 'NewAction' is not assignable to 'never'
  }
}
```

### Event Handlers with Different Payloads

```typescript
type AppEvent =
  | { type: "USER_LOGIN"; payload: { userId: string; timestamp: Date } }
  | { type: "USER_LOGOUT"; payload: { userId: string } }
  | { type: "PAGE_VIEW"; payload: { path: string; referrer?: string } }
  | { type: "PURCHASE"; payload: { itemId: string; amount: number; currency: string } };

function trackEvent(event: AppEvent) {
  switch (event.type) {
    case "USER_LOGIN":
      analytics.identify(event.payload.userId); // TypeScript knows payload shape
      break;
    case "PURCHASE":
      analytics.revenue(event.payload.amount, event.payload.currency);
      break;
    // ...
  }
}
```

### Form Field Types with Different Validations

```typescript
type FormField =
  | { type: "text"; maxLength?: number; pattern?: RegExp }
  | { type: "number"; min?: number; max?: number; step?: number }
  | { type: "select"; options: { label: string; value: string }[] }
  | { type: "checkbox"; defaultChecked?: boolean }
  | { type: "date"; minDate?: Date; maxDate?: Date };

type FormSchema = Record<string, FormField & { label: string; required?: boolean }>;

function validateField(field: FormField, value: unknown): string | null {
  switch (field.type) {
    case "text":
      if (typeof value !== "string") return "Must be a string";
      if (field.maxLength && value.length > field.maxLength) {
        return `Max ${field.maxLength} characters`;
      }
      return null;
    case "number":
      if (typeof value !== "number") return "Must be a number";
      if (field.min !== undefined && value < field.min) return `Min ${field.min}`;
      if (field.max !== undefined && value > field.max) return `Max ${field.max}`;
      return null;
    case "select":
      if (!field.options.some((o) => o.value === value)) return "Invalid selection";
      return null;
    case "checkbox":
      return typeof value === "boolean" ? null : "Must be boolean";
    case "date":
      if (!(value instanceof Date)) return "Must be a date";
      return null;
    default:
      return assertNever(field);
  }
}
```

### Discriminated Props in React Components

```typescript
type ButtonProps =
  | { variant: "link"; href: string; external?: boolean }
  | { variant: "button"; onClick: () => void; disabled?: boolean }
  | { variant: "submit"; form?: string; loading?: boolean };

function Button(props: ButtonProps) {
  switch (props.variant) {
    case "link":
      return (
        <a href={props.href} target={props.external ? "_blank" : undefined}>
          Link
        </a>
      );
    case "button":
      return <button onClick={props.onClick} disabled={props.disabled}>Click</button>;
    case "submit":
      return <button type="submit" form={props.form}>Submit</button>;
  }
}

// Usage — TypeScript enforces correct props per variant
<Button variant="link" href="/about" />
<Button variant="button" onClick={() => console.log("clicked")} />
// @ts-expect-error — href is not valid on variant="button"
<Button variant="button" href="/about" />
```

---

## 6. Conditional Types

### Basic Conditional Types

```typescript
// Simple conditional
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">; // true
type B = IsString<42>;       // false

// Distributive conditional types — union members are distributed
type ToArray<T> = T extends unknown ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]

// Non-distributive (wrap in tuple to prevent distribution)
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
type Result2 = ToArrayNonDist<string | number>; // (string | number)[]
```

### `infer` in Conditional Types

```typescript
// Extract function return type
type GetReturn<T> = T extends (...args: unknown[]) => infer R ? R : never;

// Extract first argument type
type FirstArg<T> = T extends (first: infer F, ...rest: unknown[]) => unknown ? F : never;

// Extract array element type
type Unpack<T> = T extends Array<infer U> ? U : T;

// Extract promise value type (recursive)
type Resolve<T> = T extends Promise<infer U> ? Resolve<U> : T;

// Extract object value types at a specific key
type PropType<T, K extends string> = T extends Record<K, infer V> ? V : never;
```

### Template Literal Types

```typescript
// Build string patterns
type EventName = `on${Capitalize<"click" | "hover" | "focus">}`;
// "onClick" | "onHover" | "onFocus"

// Route params extraction
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = ExtractParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"

// CSS unit types
type CSSUnit = "px" | "rem" | "em" | "vh" | "vw" | "%";
type CSSValue = `${number}${CSSUnit}` | "auto" | "inherit";

// Type-safe event names
type DOMEventMap = {
  click: MouseEvent;
  keydown: KeyboardEvent;
  submit: SubmitEvent;
};
type OnEvent = `on${Capitalize<keyof DOMEventMap>}`; // "onClick" | "onKeydown" | "onSubmit"
```

### Mapped Types with Key Remapping

```typescript
// Getters from object type
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K];
};
type UserGetters = Getters<User>;
// { getId: () => string; getName: () => string; getEmail: () => string; ... }

// Filter keys by value type
type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};
type StringProps = OnlyStrings<User>;
// { id: string; name: string; email: string }

// Prefix all keys
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<K & string>}`]: T[K];
};
type UserFormData = Prefixed<Pick<User, "name" | "email">, "form">;
// { formName: string; formEmail: string }
```

### API Route Type Inference

```typescript
// Define route map
type Routes = {
  "/api/users": { GET: User[]; POST: User };
  "/api/users/:id": { GET: User; PUT: User; DELETE: void };
  "/api/posts": { GET: Post[]; POST: Post };
};

// Extract response type for a given route and method
type RouteResponse<
  TPath extends keyof Routes,
  TMethod extends keyof Routes[TPath],
> = Routes[TPath][TMethod];

type UsersGetResponse = RouteResponse<"/api/users", "GET">; // User[]
```

---

## 7. React + TypeScript Patterns

### Component Props Typing

```typescript
// Use type for simple props, interface if extending
type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

// GOOD — plain function with typed props (preferred over React.FC)
function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Children Props

```typescript
// Explicit children
type LayoutProps = {
  children: React.ReactNode; // Most permissive — accepts anything renderable
};

// Using PropsWithChildren helper
type CardProps = React.PropsWithChildren<{
  title: string;
  className?: string;
}>;

// Render prop children
type DataListProps<T> = {
  items: T[];
  children: (item: T, index: number) => React.ReactNode;
};
```

### Event Handler Types

```typescript
type FormProps = {
  // Form events
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  // Input events
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;

  // Mouse events
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;

  // Keyboard events
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  // Drag events
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;

  // Clipboard events
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
};

// Shorthand — use React.ComponentProps to extract handler types
type InputProps = React.ComponentProps<"input">;
type ButtonHandler = React.ComponentProps<"button">["onClick"];
```

### Ref Types

```typescript
// React 19: ref is a regular prop, no need for forwardRef
type InputProps = {
  ref?: React.Ref<HTMLInputElement>;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function Input({ ref, label, value, onChange }: InputProps) {
  return (
    <label>
      {label}
      <input ref={ref} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

// useRef types
const inputRef = useRef<HTMLInputElement>(null); // RefObject — readonly .current
const countRef = useRef<number>(0); // MutableRefObject — writable .current

// Callback ref
const callbackRef = (node: HTMLDivElement | null) => {
  if (node) node.focus();
};
```

### Generic Components

```typescript
type SelectProps<T> = {
  items: T[];
  selected: T;
  onChange: (item: T) => void;
  getLabel: (item: T) => string;
  getKey: (item: T) => string;
};

function Select<T>({ items, selected, onChange, getLabel, getKey }: SelectProps<T>) {
  return (
    <select
      value={getKey(selected)}
      onChange={(e) => {
        const item = items.find((i) => getKey(i) === e.target.value);
        if (item) onChange(item);
      }}
    >
      {items.map((item) => (
        <option key={getKey(item)} value={getKey(item)}>
          {getLabel(item)}
        </option>
      ))}
    </select>
  );
}

// Usage
<Select
  items={users}
  selected={selectedUser}
  onChange={setSelectedUser}
  getLabel={(u) => u.name}
  getKey={(u) => u.id}
/>
```

### Polymorphic `as` Prop

```typescript
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicProps<
  C extends React.ElementType,
  Props = {},
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

// Usage
type TextProps<C extends React.ElementType> = PolymorphicProps<C, {
  color?: "primary" | "secondary" | "danger";
  weight?: "normal" | "bold";
}>;

function Text<C extends React.ElementType = "span">({
  as,
  color,
  weight,
  children,
  ...rest
}: TextProps<C>) {
  const Component = as || "span";
  return <Component {...rest}>{children}</Component>;
}

// Fully typed — <a> props available when as="a"
<Text as="a" href="/about" color="primary">About</Text>
<Text as="h1" weight="bold">Title</Text>
```

### Context Typing

```typescript
type AuthContextType = {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (credentials: Credentials) => { /* ... */ };
  const logout = () => { /* ... */ };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Custom Hook Return Types

```typescript
// Return object (most common — named properties)
function useFetch<T>(url: string): {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
} {
  // ...
}

// Return tuple (when mimicking useState pattern)
function useToggle(initial: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle];
}

// Return tuple with `as const` for correct inference
function useCounter(initial: number = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initial);
  return [count, { increment, decrement, reset }] as const;
  // Type: readonly [number, { increment: () => void; ... }]
}
```

### Default Props Pattern

```typescript
type ToastProps = {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  dismissible?: boolean;
};

function Toast({
  message,
  type = "info",
  duration = 3000,
  dismissible = true,
}: ToastProps) {
  // type is narrowed to the literal union, not string
  return /* ... */;
}
```

---

## 8. Zod + TypeScript Integration

### Schema Definition

```typescript
import { z } from "zod";

// Primitives
const emailSchema = z.string().email("Invalid email");
const ageSchema = z.number().int().min(0).max(150);
const statusSchema = z.enum(["active", "inactive", "suspended"]);

// Object schema
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email(),
  age: z.number().int().min(13).optional(),
  role: z.enum(["admin", "user", "moderator"]),
  preferences: z.object({
    theme: z.enum(["dark", "light"]).default("dark"),
    notifications: z.boolean().default(true),
  }),
  tags: z.array(z.string()).default([]),
  createdAt: z.coerce.date(), // Coerces string/number to Date
});

// Infer the TypeScript type from the schema
type User = z.infer<typeof userSchema>;
// {
//   id: string;
//   name: string;
//   email: string;
//   age?: number | undefined;
//   role: "admin" | "user" | "moderator";
//   preferences: { theme: "dark" | "light"; notifications: boolean };
//   tags: string[];
//   createdAt: Date;
// }
```

### Schema Composition

```typescript
// Derive schemas from base
const createUserSchema = userSchema.omit({ id: true, createdAt: true });
const updateUserSchema = userSchema.partial().required({ id: true });
const userPreviewSchema = userSchema.pick({ id: true, name: true, email: true });

// Extend
const adminSchema = userSchema.extend({
  permissions: z.array(z.string()),
  department: z.string(),
});

// Merge two schemas
const withTimestamps = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
const fullUserSchema = userSchema.merge(withTimestamps);

// Union of schemas
const resultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: userSchema }),
  z.object({ status: z.literal("error"), error: z.string(), code: z.number() }),
]);
type Result = z.infer<typeof resultSchema>;
```

### Validation

```typescript
// parse() — throws ZodError on failure
try {
  const user = userSchema.parse(unknownData);
  // user is fully typed User
} catch (err) {
  if (err instanceof z.ZodError) {
    console.error(err.issues); // Detailed error info
  }
}

// safeParse() — returns result object (preferred for APIs)
const result = userSchema.safeParse(unknownData);
if (result.success) {
  const user = result.data; // Typed User
} else {
  const errors = result.error.flatten();
  // { formErrors: string[]; fieldErrors: Record<string, string[]> }
}
```

### Transforms and Preprocessing

```typescript
// Transform output type
const slugSchema = z
  .string()
  .transform((val) => val.toLowerCase().replace(/\s+/g, "-"));
// Input: string, Output: string (but transformed)

// Preprocess input before validation
const numberFromString = z.preprocess(
  (val) => (typeof val === "string" ? parseInt(val, 10) : val),
  z.number().int().positive()
);

// Chain transforms
const monetarySchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Invalid currency format")
  .transform(Number)
  .refine((n) => n > 0, "Amount must be positive");
```

### Refinements

```typescript
// Simple refinement
const passwordSchema = z
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), "Must contain uppercase")
  .refine((val) => /[0-9]/.test(val), "Must contain number")
  .refine((val) => /[^A-Za-z0-9]/.test(val), "Must contain special character");

// Super refinement for cross-field validation
const signupSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });
```

### React Hook Form Integration

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = (data: LoginForm) => {
    // data is fully typed and validated
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}
      <input type="checkbox" {...register("rememberMe")} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### API Validation

```typescript
// Next.js Route Handler with Zod validation
import { NextRequest, NextResponse } from "next/server";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).max(10).default([]),
  published: z.boolean().default(false),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort: z.enum(["newest", "oldest", "popular"]).default("newest"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = createPostSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const post = await db.post.create({ data: result.data });
  return NextResponse.json(post, { status: 201 });
}

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const result = querySchema.safeParse(params);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { page, limit, search, sort } = result.data;
  // All values are typed and validated
}
```

---

## 9. Prisma + TypeScript

### Generated Types from Schema

```typescript
// Prisma generates types automatically from your schema.prisma
// Access them via the Prisma namespace
import { Prisma } from "@prisma/client";
import type { User, Post, Comment } from "@prisma/client";

// Use generated types directly
function displayUser(user: User) {
  console.log(user.name, user.email);
}
```

### Type-Safe Queries with Select/Include

```typescript
// Prisma.ModelGetPayload — type based on query shape
type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true };
}>;
// { id: string; name: string; email: string; posts: Post[] }

type UserPreview = Prisma.UserGetPayload<{
  select: { id: true; name: true; email: true };
}>;
// { id: string; name: string; email: string }

type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    author: { select: { id: true; name: true } };
    comments: { include: { author: true } };
  };
}>;

// Use the satisfies operator with Prisma queries
const userSelect = {
  id: true,
  name: true,
  email: true,
  _count: { select: { posts: true } },
} satisfies Prisma.UserSelect;

type UserListItem = Prisma.UserGetPayload<{ select: typeof userSelect }>;
```

### Reusable Query Helpers

```typescript
// Define reusable query arguments
const userWithPostsArgs = {
  include: {
    posts: {
      orderBy: { createdAt: "desc" as const },
      take: 5,
    },
  },
} satisfies Prisma.UserFindManyArgs;

type UserWithRecentPosts = Prisma.UserGetPayload<typeof userWithPostsArgs>;

// Type-safe where clauses
function findUsers(filters: Prisma.UserWhereInput): Promise<User[]> {
  return prisma.user.findMany({ where: filters });
}

// Type-safe create input
function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({ data });
}
```

### Transaction Types

```typescript
// Interactive transactions
async function transferCredits(fromId: string, toId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    // tx has the same type as prisma but runs in a transaction
    const from = await tx.user.update({
      where: { id: fromId },
      data: { credits: { decrement: amount } },
    });

    if (from.credits < 0) {
      throw new Error("Insufficient credits");
    }

    await tx.user.update({
      where: { id: toId },
      data: { credits: { increment: amount } },
    });
  });
}
```

### Extending Prisma Types

```typescript
// Add computed fields
type UserWithFullName = User & {
  fullName: string;
};

function withFullName(user: User): UserWithFullName {
  return {
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
  };
}

// Prisma enums are available as both types and runtime values
import { Role } from "@prisma/client";

function isAdmin(user: User): boolean {
  return user.role === Role.ADMIN; // or user.role === "ADMIN"
}

// Extend PrismaClient with custom methods
const prisma = new PrismaClient().$extends({
  model: {
    user: {
      async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
      },
    },
  },
});
```

---

## 10. API Type Safety

### Type-Safe API Route Handlers (Next.js)

```typescript
// Shared types between client and server
// types/api.ts
export type ApiResult<TData> =
  | { success: true; data: TData }
  | { success: false; error: string; code: string };

export type PaginatedResult<TData> = ApiResult<{
  items: TData[];
  pagination: { page: number; pageSize: number; total: number };
}>;

// Route handler with type safety
// app/api/users/route.ts
export async function GET(req: NextRequest): Promise<NextResponse<PaginatedResult<User>>> {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({
      success: true,
      data: { items: users, pagination: { page: 1, pageSize: 20, total: users.length } },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch users", code: "FETCH_FAILED" },
      { status: 500 }
    );
  }
}
```

### Type-Safe Fetch Wrapper

```typescript
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<TData>(path: string, params?: Record<string, string>): Promise<TData> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const res = await fetch(url.toString());
    if (!res.ok) throw new ApiError(res.status, await res.text());
    const json = (await res.json()) as ApiResult<TData>;
    if (!json.success) throw new ApiError(400, json.error);
    return json.data;
  }

  async post<TData, TBody = unknown>(path: string, body: TBody): Promise<TData> {
    const res = await fetch(new URL(path, this.baseUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    const json = (await res.json()) as ApiResult<TData>;
    if (!json.success) throw new ApiError(400, json.error);
    return json.data;
  }
}

// Usage
const api = new ApiClient("/api");
const users = await api.get<User[]>("/users", { page: "1" });
const newUser = await api.post<User, CreateUserInput>("/users", {
  name: "Alice",
  email: "alice@example.com",
});
```

### Error Type Definitions

```typescript
// Typed error hierarchy
type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "RATE_LIMITED";

type ApiErrorResponse = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, string[]>; // Field-level errors
  };
};

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }

  toJSON(): ApiErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}
```

### Pagination Types

```typescript
type PaginationParams = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type Paginated<T> = {
  items: T[];
  meta: PaginationMeta;
};

function paginate<T>(items: T[], total: number, params: PaginationParams): Paginated<T> {
  const totalPages = Math.ceil(total / params.pageSize);
  return {
    items,
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPrevPage: params.page > 1,
    },
  };
}
```

---

## 11. Advanced Patterns

### Branded Types

```typescript
// Prevent mixing IDs of different entity types
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;
type OrderId = Brand<string, "OrderId">;

// Factory functions
function userId(id: string): UserId { return id as UserId; }
function postId(id: string): PostId { return id as PostId; }

// Now you cannot accidentally pass a PostId where a UserId is expected
function getUser(id: UserId): Promise<User> { /* ... */ }
function getPost(id: PostId): Promise<Post> { /* ... */ }

const uid = userId("user_123");
const pid = postId("post_456");

getUser(uid); // OK
getUser(pid); // ERROR: Argument of type 'PostId' is not assignable to parameter of type 'UserId'

// Branded primitives for validated data
type Email = Brand<string, "Email">;
type PositiveInt = Brand<number, "PositiveInt">;
type NonEmptyString = Brand<string, "NonEmptyString">;

function validateEmail(input: string): Email {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
    throw new Error("Invalid email");
  }
  return input as Email;
}
```

### Builder Pattern with Types

```typescript
type QueryBuilder<T extends Record<string, unknown>> = {
  where<K extends keyof T>(key: K, value: T[K]): QueryBuilder<T>;
  orderBy<K extends keyof T>(key: K, dir: "asc" | "desc"): QueryBuilder<T>;
  limit(n: number): QueryBuilder<T>;
  select<K extends keyof T>(...keys: K[]): QueryBuilder<Pick<T, K>>;
  execute(): Promise<T[]>;
};

function query<T extends Record<string, unknown>>(table: string): QueryBuilder<T> {
  const state = { wheres: [], orders: [], limit: 0, selects: [] };
  const builder: QueryBuilder<T> = {
    where(key, value) { state.wheres.push({ key, value }); return builder; },
    orderBy(key, dir) { state.orders.push({ key, dir }); return builder; },
    limit(n) { state.limit = n; return builder; },
    select(...keys) { state.selects = keys; return builder as any; },
    async execute() { /* build and run SQL */ return []; },
  };
  return builder;
}

// Usage — fully type-safe chaining
const users = await query<User>("users")
  .where("role", "admin")      // TypeScript checks key and value type
  .orderBy("createdAt", "desc") // Only valid User keys
  .limit(10)
  .execute();
```

### Type-Safe Event Emitter

```typescript
type EventMap = Record<string, unknown[]>;

class TypedEmitter<TEvents extends EventMap> {
  private listeners = new Map<keyof TEvents, Set<Function>>();

  on<K extends keyof TEvents>(event: K, listener: (...args: TEvents[K]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
  }

  off<K extends keyof TEvents>(event: K, listener: (...args: TEvents[K]) => void): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<K extends keyof TEvents>(event: K, ...args: TEvents[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }
}

// Usage
type AppEvents = {
  "user:login": [user: User];
  "user:logout": [userId: string];
  "notification": [message: string, severity: "info" | "warning" | "error"];
  "data:sync": [table: string, count: number];
};

const emitter = new TypedEmitter<AppEvents>();
emitter.on("user:login", (user) => { /* user is User */ });
emitter.on("notification", (message, severity) => { /* both typed */ });
emitter.emit("data:sync", "users", 42); // Args are type-checked
```

### Type-Safe i18n Keys

```typescript
// Define translation structure
type Translations = {
  common: {
    save: string;
    cancel: string;
    delete: string;
  };
  auth: {
    login: string;
    logout: string;
    errors: {
      invalidEmail: string;
      weakPassword: string;
    };
  };
};

// Flatten nested keys with dot notation
type FlattenKeys<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? FlattenKeys<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

type TranslationKey = FlattenKeys<Translations>;
// "common.save" | "common.cancel" | "common.delete" | "auth.login" | ...

function t(key: TranslationKey): string {
  /* ... */
}

t("common.save");     // OK
t("auth.errors.invalidEmail"); // OK
t("common.foo");      // ERROR
```

### Type-Safe Route Paths

```typescript
type AppRoutes = {
  "/": {};
  "/users": {};
  "/users/:id": { id: string };
  "/users/:id/posts": { id: string };
  "/users/:id/posts/:postId": { id: string; postId: string };
  "/settings": {};
};

type PathParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof PathParams<Rest>]: string }
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};

function navigate<T extends keyof AppRoutes>(
  path: T,
  ...args: keyof AppRoutes[T] extends never ? [] : [params: AppRoutes[T]]
): void {
  /* ... */
}

navigate("/");                                    // No params needed
navigate("/users/:id", { id: "123" });           // Params required
navigate("/users/:id/posts/:postId", { id: "1", postId: "42" });
```

### Recursive Types

```typescript
// Tree structure
type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

// Nested form (JSON-like structure)
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// Deep nested object paths
type PathsOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${Prefix}${K}` | PathsOf<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : never;
    }[keyof T]
  : never;

// File system tree
type FileNode =
  | { type: "file"; name: string; content: string }
  | { type: "directory"; name: string; children: FileNode[] };
```

### Type Guards

```typescript
// `is` keyword — narrows types in conditional branches
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value
  );
}

// Assertion function — throws if condition is false, narrows type after call
function assertDefined<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message ?? "Value is null or undefined");
  }
}

// Usage
const user = getUser(); // User | null
assertDefined(user, "User not found");
user.name; // TypeScript knows user is User here (not null)

// Discriminated union guard
function isSuccess<T>(result: ApiState<T>): result is { status: "success"; data: T } {
  return result.status === "success";
}

// Array filter narrowing
const mixed: (string | null)[] = ["a", null, "b", null, "c"];
const strings: string[] = mixed.filter((x): x is string => x !== null);
```

---

## 12. Common Type Errors & Fixes

### "Type 'X' is not assignable to type 'Y'"

```typescript
// Cause 1: Literal type mismatch
const status = "active"; // type: string (not "active")
const user: { status: "active" | "inactive" } = { status }; // ERROR
// Fix: Use `as const` or explicit annotation
const status = "active" as const; // type: "active"
const status: "active" | "inactive" = "active";

// Cause 2: Missing properties
type User = { id: string; name: string; email: string };
const u: User = { id: "1", name: "Alice" }; // ERROR: missing email
// Fix: Add all required properties or use Partial<User>

// Cause 3: Extra properties in object literal
const u: User = { id: "1", name: "Alice", email: "a@b.com", age: 30 }; // ERROR
// Fix: Remove extra properties or extend the type

// Cause 4: Union type narrowing needed
function handle(value: string | number) {
  value.toUpperCase(); // ERROR: number has no toUpperCase
  // Fix: Narrow first
  if (typeof value === "string") value.toUpperCase(); // OK
}

// Cause 5: Readonly assignment
const arr: readonly number[] = [1, 2, 3];
arr.push(4); // ERROR
// Fix: Use mutable type or spread: [...arr, 4]
```

### "Property 'X' does not exist on type 'Y'"

```typescript
// Cause: Accessing unknown properties on union types
type A = { kind: "a"; foo: string };
type B = { kind: "b"; bar: number };
type AB = A | B;

function handle(val: AB) {
  val.foo; // ERROR: Property 'foo' does not exist on type 'B'
  // Fix: Narrow with discriminant
  if (val.kind === "a") val.foo; // OK
}

// Cause: Dynamic property access
const obj: Record<string, unknown> = {};
obj.foo; // ERROR with noPropertyAccessFromIndexSignature
// Fix: Use bracket notation
obj["foo"]; // OK
```

### "Object is possibly 'undefined'"

```typescript
// Cause: noUncheckedIndexedAccess or optional properties
const arr = [1, 2, 3];
const first = arr[0]; // number | undefined (with noUncheckedIndexedAccess)

// Fix 1: Null check
if (first !== undefined) { console.log(first * 2); }

// Fix 2: Non-null assertion (only if you are certain)
const first = arr[0]!;

// Fix 3: Default value
const first = arr[0] ?? 0;

// Fix 4: Optional chaining
const name = users[0]?.name ?? "Unknown";

// Fix 5: Type guard
function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
const defined = arr.filter(isDefined);
```

### "Type 'X' has no index signature"

```typescript
// Cause: Accessing object with dynamic key
const user: User = { id: "1", name: "Alice", email: "a@b.com" };
const key = "name"; // type: string (too wide)
user[key]; // ERROR

// Fix 1: Constrain the key type
const key: keyof User = "name";
user[key]; // OK

// Fix 2: Use Record for dynamic objects
const config: Record<string, string> = {};
config["anything"]; // OK

// Fix 3: Type assertion on key
user[key as keyof User]; // Last resort
```

### "Cannot find module"

```typescript
// Cause 1: Missing type declarations
// Fix: Install @types package
// npm install -D @types/lodash

// Cause 2: Path alias not configured
// Fix: Add to tsconfig.json paths AND bundler config (next.config.js, vite.config.ts)

// Cause 3: Missing declaration file for non-TS module
// Fix: Create a declaration file
// types/my-module.d.ts
declare module "my-module" {
  export function doSomething(arg: string): number;
}

// For CSS modules
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

// For image imports
declare module "*.svg" {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}
```

### When to Use `as` vs Proper Typing

```typescript
// AVOID: Type assertion to force a type
const data = fetchData() as User; // Dangerous — no runtime check

// PREFER: Type guard or validation
const data = fetchData();
if (isUser(data)) {
  // data is User
}

// PREFER: Zod validation for external data
const data = userSchema.parse(fetchData());

// ACCEPTABLE uses of `as`:
// 1. DOM element casting (you know the element type)
const input = document.getElementById("email") as HTMLInputElement;

// 2. Const assertion for literal types
const config = { port: 3000 } as const;

// 3. After exhaustive type narrowing where TS cannot infer
```

### `@ts-expect-error` vs `@ts-ignore`

```typescript
// NEVER: @ts-ignore — silently suppresses errors, even if the error goes away
// @ts-ignore
const x: string = 42;

// ALWAYS: @ts-expect-error — errors if the next line does NOT have an error
// Use with a reason comment
// @ts-expect-error — third-party lib types are incorrect, see issue #123
const result = brokenLib.doThing("arg");

// If you fix the underlying issue, @ts-expect-error will tell you to remove it
// @ts-ignore will silently remain, hiding that it's no longer needed
```

---

## 13. Anti-Patterns (NEVER DO)

### Never Use `any`

```typescript
// BAD
function process(data: any) { return data.foo.bar; }

// GOOD — use `unknown` and narrow
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "foo" in data) {
    // Narrow step by step
  }
}

// GOOD — use a generic
function process<T extends { foo: { bar: string } }>(data: T) {
  return data.foo.bar;
}
```

### Never Use `@ts-ignore`

```typescript
// BAD
// @ts-ignore
brokenFunction(wrongArg);

// GOOD — with reason
// @ts-expect-error — upstream types are wrong, fixed in v2.1.0
brokenFunction(wrongArg);
```

### Never Chain `as unknown as T`

```typescript
// BAD — double assertion bypasses ALL type checking
const user = response as unknown as User;

// GOOD — validate at runtime
const user = userSchema.parse(response);

// GOOD — use a type guard
if (isUser(response)) { /* response is User */ }
```

### Never Use `!` Without Validation

```typescript
// BAD — crashes at runtime if null
const user = getUser()!;

// GOOD — handle the null case
const user = getUser();
if (!user) throw new Error("User not found");
```

### Never Use `enum`

```typescript
// BAD — generates runtime code, has quirks with reverse mapping
enum Direction { Up, Down, Left, Right }

// GOOD — const object when you need runtime values
const DIRECTION = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
} as const;
type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];

// GOOD — union type when you only need the type
type Direction = "up" | "down" | "left" | "right";
```

### Never Use `React.FC`

```typescript
// BAD — adds implicit children prop, poor generic support, verbose
const Button: React.FC<ButtonProps> = ({ label }) => { ... };

// GOOD — plain function declaration
function Button({ label }: ButtonProps) { ... }
```

### Never Mutate Function Parameters

```typescript
// BAD — mutates the input
function addTimestamp(obj: Record<string, unknown>) {
  obj.timestamp = Date.now(); // Mutation
  return obj;
}

// GOOD — return new object
function addTimestamp<T extends Record<string, unknown>>(obj: T) {
  return { ...obj, timestamp: Date.now() };
}
```

### Never Return `any` from Functions

```typescript
// BAD
function parseConfig(raw: string): any { return JSON.parse(raw); }

// GOOD — return unknown, let the caller validate
function parseConfig(raw: string): unknown { return JSON.parse(raw); }

// BETTER — validate and return typed result
function parseConfig(raw: string): AppConfig {
  return configSchema.parse(JSON.parse(raw));
}
```

---

## 14. Golden Rules

1. **Enable `strict: true` and `noUncheckedIndexedAccess` on every project.** These two flags alone prevent the majority of runtime type errors. There is no valid reason to disable them.

2. **Never use `any`. Use `unknown` and narrow.** The `any` type disables TypeScript entirely for that value. Use `unknown` for truly unknown data and narrow with type guards, Zod validation, or conditional checks.

3. **Prefer `type` over `interface` unless you need extension or declaration merging.** Types are more flexible — they support unions, intersections, tuples, and mapped types. Use `interface` only for object shapes that will be extended or for augmenting third-party types.

4. **Use discriminated unions for any value that can be in multiple states.** Loading states, API responses, form fields, event types — model them as tagged unions with a `type` or `status` discriminant and use exhaustive `switch` with `never` in the default case.

5. **Use `satisfies` over `as` whenever possible.** The `satisfies` operator validates the type while preserving the narrower inferred type. Use `as` only for DOM casting or when TypeScript genuinely cannot infer what you know to be true.

6. **Validate all external data at the boundary with Zod.** API responses, user input, URL parameters, environment variables, localStorage, JSON.parse results — anything from outside your type system must be validated, not asserted.

7. **Use generics to write reusable, type-safe abstractions.** Generic functions, components, and hooks eliminate duplication while maintaining full type safety. Constrain generics with `extends` to ensure they have the properties you need.

8. **Use branded types to prevent ID mixing.** A `UserId` and a `PostId` are both strings, but they are not interchangeable. Branded types catch these bugs at compile time with zero runtime cost.

9. **Prefer union types over enums.** Union types are simpler, produce no runtime code, work naturally with `switch` exhaustiveness checking, and are easier to compose with other types.

10. **Use `as const` for literal inference.** When you need TypeScript to infer `"dark"` instead of `string`, use `as const` on the value or `satisfies` on the containing object.

11. **Use `@ts-expect-error` with a reason, never `@ts-ignore`.** The `@ts-expect-error` directive is self-cleaning — it errors when the suppressed issue is fixed. The `@ts-ignore` directive silently hides errors forever.

12. **Type your function return values explicitly for public APIs.** While TypeScript can infer return types, explicit annotations on exported functions serve as documentation, prevent accidental return type changes, and catch bugs where the implementation does not match the intent.

13. **Use `Readonly<T>` and `readonly` arrays for data that should not be mutated.** Immutability at the type level prevents accidental mutations in reducers, stores, and shared state. Combine with `as const` for deep immutability.

14. **Never silence TypeScript without understanding the error.** Every type error is telling you something. Investigate before suppressing. If you must suppress, use `@ts-expect-error` with a clear reason explaining why the suppression is necessary and when it can be removed.

15. **Keep types close to where they are used; share only what must be shared.** Define component prop types in the component file. Define API types in the API layer. Export to a shared `types/` directory only when multiple modules need the same type. This prevents type files from becoming dumping grounds.
