---
name: neuro-webapp-design
description: NeuroCode webapp design system & architecture guide - dark theme, Electron + Next.js + React 19 + Tailwind CSS 4 best practices
trigger: auto
globs:
  - "**/*.css"
  - "**/*.scss"
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/globals.css"
  - "**/tailwind.config.*"
  - "**/components/**"
  - "**/stores/**"
  - "**/main/**"
  - "**/preload.*"
---

# NeuroCode — Design System & Architecture Guide

You are the design system guardian and architecture expert for the NeuroCode webapp. When working on any design, styling, or development task, you MUST follow this exact system. Never deviate from these specifications.

---

## PROJECT OVERVIEW

NeuroCode is an Electron-based desktop IDE with AI chat as the core interaction model.
**Stack**: Electron 41 + Next.js 16 (App Router, static export) + React 19 + TypeScript 6 + Zustand 5 + Tailwind CSS 4.2.2 + xterm.js 5 + node-pty
**AI Provider**: OpenRouter API (Claude, GPT-4o, Gemini, DeepSeek) via streaming SSE
**Theme**: Dark-only, GitHub Dark Default-inspired

---

## ARCHITECTURE

### Process Model
```
Electron Main Process (main/)
  ├── index.ts          → Window creation, menu, IPC registration
  ├── preload.ts        → Context bridge (contextIsolation: true, nodeIntegration: false)
  └── ipc/
      ├── ai.ts         → OpenRouter streaming + settings persistence
      ├── file-system.ts → File CRUD operations
      └── terminal.ts   → PTY spawning via node-pty

Next.js Renderer Process (src/)
  ├── app/              → App Router (layout.tsx, page.tsx, globals.css)
  ├── components/       → Feature-grouped React components
  ├── stores/           → Zustand stores (chat, ui, workspace, settings)
  ├── types/            → TypeScript declarations
  ├── hooks/            → Custom React hooks
  └── lib/              → Utilities (models.ts)
```

### IPC Pattern Rules
1. **Request-response** (`ipcMain.handle` + `ipcRenderer.invoke`): For operations returning data
2. **Fire-and-forget** (`ipcMain.on` + `ipcRenderer.send`): For terminal input/resize/kill
3. **Push events** (`webContents.send` + `ipcRenderer.on`): For streaming (ai:stream, terminal:output)
4. NEVER use `ipcRenderer.sendSync()` — blocks entire renderer
5. NEVER expose raw `ipcRenderer` — only whitelisted functions via `contextBridge`

### IPC Channels
```
workspace:open, fs:read-dir, fs:read-file, fs:write-file, fs:create, fs:delete, fs:rename
terminal:create, terminal:input, terminal:resize, terminal:kill, terminal:output, terminal:exit
ai:chat, ai:stream, ai:cancel
settings:save, settings:load, app:get-version
menu:new-agent, menu:open-workspace, menu:settings, menu:toggle-sidebar, menu:toggle-panel
```

---

## COLOR PALETTE (MANDATORY — NEVER INTRODUCE NEW COLORS)

All colors in `src/app/globals.css` via `@theme` block. DARK MODE ONLY.

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-primary` | `#0d1117` | Main background |
| `--color-bg-sidebar` | `#010409` | Sidebar (darkest) |
| `--color-bg-panel` | `#161b22` | Panels, code blocks, cards |
| `--color-bg-input` | `#1c2128` | Input fields |
| `--color-bg-hover` | `#21262d` | Hover states |
| `--color-bg-active` | `#282e35` | Active/selected states |

### Borders
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-border-primary` | `#30363d` | Main borders |
| `--color-border-subtle` | `#21262d` | Subtle dividers |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#e6edf3` | Main text |
| `--color-text-secondary` | `#8b949e` | Secondary text, default button text |
| `--color-text-muted` | `#484f58` | Muted text, inactive icons |
| `--color-text-placeholder` | `#6e7681` | Input placeholders |

### Accents
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent-primary` | `#7c3aed` | Purple (active tabs, pills, resize glow) |
| `--color-accent-hover` | `#8b5cf6` | Purple hover |
| `--color-accent-secondary` | `#06b6d4` | Cyan (inline code) |
| `--color-accent-green` | `#238636` | Green buttons (New Agent, Send) |
| `--color-accent-green-text` | `#3fb950` | Green text indicators |

### Status
| Token | Hex |
|-------|-----|
| `--color-status-success` | `#3fb950` |
| `--color-status-error` | `#f85149` |
| `--color-status-warning` | `#d29922` |
| `--color-status-info` | `#58a6ff` |

### File Icon Colors
- TypeScript/TSX: `#3178c6` | JavaScript/JSX: `#f7df1e` | JSON: `#cb8600`
- CSS/SCSS: `#563d7c` | HTML: `#e34c26` | Markdown: `#58a6ff`
- Images: `#3fb950` | YAML: `#d29922` | Default: `#484f58`

### Terminal Theme (xterm.js)
Background: `#0d1117` | Foreground: `#e6edf3` | Cursor: `#e6edf3` | Selection: `#264f78`
Black: `#484f58` | Red: `#f85149` | Green: `#3fb950` | Yellow: `#d29922`
Blue: `#58a6ff` | Magenta: `#bc8cff` | Cyan: `#39c5cf` | White: `#e6edf3`

---

## TYPOGRAPHY

### Font Stacks
- **System:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`
- **Monospace:** `'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace`

### Font Sizes
| Context | Size | Weight |
|---------|------|--------|
| Logo/Large headers | 28-32px | 700 |
| H1 (chat) | 18px | 600 |
| H2 (chat) | 15px | 600 |
| Body/buttons | 13px | 400-500 |
| Tabs/pills | 11px | 500 |
| Code blocks | 13px | 400, line-height 1.6 |
| Inline code | 12px | 400 |
| Kbd shortcuts | 9px | 400 (mono) |
| Base (html) | 14px | 400, line-height 1.5 |

---

## SPACING SYSTEM (Base unit: 4px)

### Padding
- Tight: `2-6px` | Standard buttons: `6px 10px` to `10px 16px`
- Content: `12px 16px` | Page containers: `24px 32px`

### Gaps
- Tight: `2-4px` | Standard: `6-8px` | Medium: `10-12px` | Large: `16-24px`

### Component Heights
- Header/Tab bars: `36-40px` | Status bar: `24px`
- Buttons: `28-36px` | Icon buttons: `28-30px`

---

## BORDER RADIUS
- Small (pills, icon-btn): `6px` | Medium (buttons, inputs): `8px`
- Large (chat input, cards): `10-12px` | Circular: `50%` | Scrollbar: `3px` | Kbd: `4px`

## BORDERS
- Standard: `1px solid #30363d` | Subtle: `1px solid #21262d`
- Active/Focus: `1px solid #484f58` | Active tab: `2px solid #7c3aed` (bottom)

## SHADOWS & Z-INDEX
- Dropdowns/Modals: `0 8px 32px rgba(0,0,0,0.5)`
- Resize glow: `0 0 12px rgba(124, 58, 237, 0.5)`
- Z-index: Dividers `10` | Resize overlay `50` | Modals `100`

## TRANSITIONS (Keep fast — 0.1s-0.15s)
- Hover: `all 0.12s` | Standard: `all 0.15s`
- Button press: `transform: scale(0.98)` on `:active`
- Loading dots: `bounce 1s infinite` (staggered: 0s, 0.15s, 0.3s)

---

## BUTTON PATTERNS

### Primary Action (.btn-new-agent)
`height: 36px; background: #238636; border-radius: 8px; color: white; font-size: 13px; font-weight: 500`
Hover: `#2ea043` | Active: `scale(0.98)`

### Send Button (.btn-send)
`width: 28px; height: 28px; border-radius: 8px; background: #238636; color: white`
Disabled: `opacity: 0.3`

### Icon Button (.icon-btn)
`padding: 6px; border-radius: 6px; background: transparent; color: #484f58`
Hover: `color: #8b949e; background: #21262d`

### Pill (.pill)
`padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 500`
Default: `bg: #21262d; color: #8b949e` | Active: `bg: #7c3aed; color: white`

### Action Button (.btn-action)
`padding: 10px 16px; border-radius: 8px; border: 1px solid #30363d; background: transparent; color: #8b949e`
Hover: `bg: #21262d; color: #e6edf3; border: #484f58`

---

## INPUT PATTERNS

### Chat Input Container (.chat-input-container)
`border-radius: 12px; border: 1px solid #30363d; background: #1c2128`
Focus-within: `border-color: #484f58`

### Chat Textarea (.chat-input-textarea)
`padding: 12px 16px 44px 16px; background: transparent; font-size: 13px; color: #e6edf3`
Placeholder: `color: #6e7681`

---

## LAYOUT

### Main Structure
```
[100vh × 100vw, flex column, overflow: hidden]
├── Main [flex: 1, flex row]
│   ├── Sidebar [resizable 260px default, min 150, max 500, bg: #010409]
│   ├── ResizeDivider [6px, purple glow on hover/drag]
│   ├── ChatArea [flex: 1, min 300px]
│   │   ├── Header [40px]
│   │   ├── Messages [flex: 1, padding 16px 24px]
│   │   └── Input [padding 8px 24px 16px]
│   ├── ResizeDivider
│   └── RightPanel [resizable 420px default, min 300, max 800]
│       ├── TabBar [36px, horizontal scroll]
│       └── Content [flex: 1]
└── StatusBar [24px, border-top]
```

### Chat Messages
- User: `max-width: 85%; bg: #161b22; border: 1px solid #21262d; border-radius: 12px; padding: 12px 16px`
- Avatar: User `bg: #1f6feb` | AI `bg: #7c3aed` | Size: `24-28px`, border-radius `50%`

### File Explorer
- Depth indentation: `depth × 16px + 8px`
- Folders sorted first, then files alphabetically
- Hidden files (`.`) and `node_modules` filtered out

### Scrollbar
`width: 6px; thumb: #30363d; thumb-hover: #484f58; track: transparent; border-radius: 3px`

---

## COMPONENT CONVENTIONS

### Functional Components Only
```tsx
'use client';
export function ComponentName({ prop }: { prop: Type }) { ... }
// Default export only for Next.js pages
```

### Props — Inline Types (simple) or Interface (complex)
### Named Exports preferred (except pages)
### `@/` path alias for all `src/` imports

### Import Order
1. `'use client'` directive → 2. React → 3. Next.js types → 4. Third-party (lucide-react, etc.)
5. Local stores → 6. Local utilities → 7. Sibling components

---

## STATE MANAGEMENT (Zustand 5)

### Four Stores
1. **chat-store** — Conversations, messages, streaming
2. **ui-store** — Panel sizes, visibility, tabs, open files
3. **workspace-store** — Workspaces, active workspace
4. **settings-store** — API key, model, font size, theme

### Patterns
- Selectors for perf: `useStore(s => s.field)` not `const store = useStore()`
- Immutable updates: spread + map, never mutate
- Actions inside store, not components
- Use `get()` inside actions for current state

---

## REACT 19 PATTERNS

- **ref as prop** — No `forwardRef` needed
- **useTransition** — For heavy state updates (file filtering, etc.)
- **Automatic batching** — All state updates batched, even async
- **Cleanup effects** — CRITICAL in Electron: always return cleanup in `useEffect`

```tsx
useEffect(() => {
  const cleanup = window.electronAPI.onTerminalOutput(handler);
  const observer = new ResizeObserver(callback);
  observer.observe(element);
  return () => { cleanup(); observer.disconnect(); };
}, []);
```

---

## ELECTRON SECURITY (MANDATORY)

```typescript
// REQUIRED webPreferences
{ contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true }
```

- NEVER expose raw `ipcRenderer` — only whitelisted functions via `contextBridge`
- Validate ALL IPC inputs in main process (type checks, path traversal prevention)
- Use `safeStorage` API for credentials (API keys)
- Production CSP: `default-src 'self'; connect-src 'self' https://openrouter.ai;`

### NEVER Use
- `webSecurity: false` | `allowRunningInsecureContent: true`
- `experimentalFeatures: true` | `enableRemoteModule: true`
- `shell.openExternal(userInput)` without URL validation
- Plaintext API keys in renderer

---

## ELECTRON PERFORMANCE

### Startup
- `show: false` + `ready-to-show` event for seamless display
- `backgroundColor` in BrowserWindow to prevent white flash
- Lazy load non-critical modules

### Renderer
- `requestIdleCallback()` for background work
- Web Workers for CPU-intensive tasks
- `useTransition` for expensive state updates
- NEVER use synchronous IPC

### Memory Leak Prevention
- Clean up IPC listeners in `useEffect` return
- Dispose xterm.js Terminal instances
- Disconnect ResizeObservers
- Kill PTY processes on terminal close
- Remove window/document event listeners

---

## TERMINAL (xterm.js + node-pty)

### Best Practices
1. Dynamic import: `await import('xterm')` (no SSR support)
2. FitAddon for automatic sizing
3. ResizeObserver → `fitAddon.fit()` → send `terminal:resize` IPC
4. `term.dispose()` on unmount (GPU memory)
5. `setTimeout(() => fitAddon.fit(), 50)` after `term.open()`
6. One PTY per terminal session
7. Container `innerHTML = ''` before reattaching

### Terminal Font
`'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace` at `13px`

---

## ERROR HANDLING

### IPC: Return Result Objects
```typescript
{ success: true, id, shell }  // success
{ success: false, error: '...' }  // error
null / false / []  // file op failures
```

### Components: Try/Catch + Status
```tsx
try { ... } catch (error: any) { setStatus('error'); } finally { setStreaming(false); }
```

### Guards: `if (!input.trim() || isStreaming) return;`

---

## TYPESCRIPT PATTERNS

- Strict mode, `@/*` path alias
- Interfaces for object shapes, Types for unions (no `enum`)
- No `React.FC`, no barrel files, no `@ts-ignore` (use `@ts-expect-error`)
- `any` only for untyped 3rd-party (xterm, node-pty)

---

## NAMING CONVENTIONS

| Element | Convention | Example |
|---------|-----------|---------|
| Variables/Functions | camelCase | `handleSend`, `isStreaming` |
| Components | PascalCase | `ChatArea.tsx` |
| Stores | kebab-case-store | `chat-store.ts` |
| IPC Channels | namespace:action | `fs:read-dir` |
| CSS Classes | kebab-case | `.icon-btn` |
| Constants | UPPER_CASE | `AVAILABLE_MODELS` |
| Hooks | use{Name} | `useTerminal` |

---

## BUILD & SCRIPTS

```
npm run dev       → Concurrent Next.js (port 3456) + Electron
npm run build     → Next.js build + Electron tsc
npm run dist      → Production installer (electron-builder)
```

- `output: 'export'` for static Next.js (no server in production)
- Production: `loadFile(out/index.html)` | Dev: `loadURL(http://localhost:3456)`
- Native modules (node-pty) rebuilt by electron-builder

---

## ICON USAGE (Lucide React ONLY)

| Size | Context |
|------|---------|
| 9-10px | Chevrons in pills |
| 11-12px | Tabs, secondary actions |
| 13-15px | Buttons, main actions |
| 18-22px | Prominent actions |

---

## 15 GOLDEN RULES

1. **ALWAYS** use colors from the defined palette — never introduce new colors
2. **ALWAYS** dark mode only — never add light theme
3. **ALWAYS** use Lucide React icons — no other icon libraries
4. **ALWAYS** hybrid CSS: globals.css classes + inline styles + minimal Tailwind
5. **ALWAYS** fast transitions: 0.1s-0.15s — no slow animations
6. **ALWAYS** validate IPC inputs in main process
7. **ALWAYS** clean up effects (listeners, observers, timers, terminals)
8. **ALWAYS** use `contextIsolation: true`, `nodeIntegration: false`
9. **ALWAYS** dynamic import xterm.js (no SSR)
10. **ALWAYS** use Zustand selectors, not full store subscriptions
11. **ALWAYS** functional components with named exports and `'use client'`
12. **ALWAYS** immutable state updates (spread, never mutate)
13. **ALWAYS** use `invoke()` never `sendSync()` for IPC
14. **MATCH** the GitHub Dark Default aesthetic throughout
15. **MAINTAIN** 4px spacing base unit for consistency
