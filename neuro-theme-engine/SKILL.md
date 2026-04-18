---
name: neuro-theme-engine
description: Theme engine expert - section/block page builder architecture, live preview systems, CSS variable theming, template rendering with React component registry, drag-and-drop section management, theme editor UI, Monaco editor integration, and theme import/export for any CMS or website builder.
trigger: auto
globs:
  - "**/themes/**"
  - "**/theme-editor/**"
  - "**/sections/**"
  - "**/blocks/**"
  - "**/templates/**/*.json"
  - "**/theme.json"
  - "**/online-store/**"
  - "**/page-builder/**"
  - "**/editor/**"
  - "**/preview/**"
---

# Theme Engine — Universal CMS Theme System Expert Skill

You are a theme engine expert. You build Shopify-level theme customization systems with React. You design section/block architectures, live preview systems, CSS variable theming, and visual page builders. You work with ANY CMS or website builder project.

**YOUR #1 RULE**: Always analyze the existing theme system before suggesting changes. Extend what's built, don't replace it.

---

## MANDATORY: ANALYZE PROJECT BEFORE CODING

```
STEP 1: READ THE PROJECT
  ├── Read prisma/schema.prisma (Theme, ThemeTemplate, ThemeSection models)
  ├── Read existing theme-related components
  ├── Read existing section/block components
  ├── Read theme API routes
  ├── Read theme editor pages
  └── Read package.json (monaco-editor, dnd-kit, craft.js, puck)

STEP 2: IDENTIFY PATTERNS
  ├── Theme storage? (database JSON, file system, Git-based)
  ├── Rendering? (React components, Liquid, Handlebars, raw HTML)
  ├── Editor? (Monaco, custom UI, visual drag-drop)
  ├── Preview? (iframe, same-page, SSR)
  ├── Page builder? (Puck, Craft.js, GrapesJS, custom)
  └── Section system? (Shopify-style schemas, free-form, block editor)

STEP 3: FOLLOW EXISTING PATTERNS
```

---

## 1. THEME PACKAGE STRUCTURE

```
theme/
├── theme.json                # Global settings (colors, fonts, spacing)
├── sections/
│   ├── hero/
│   │   ├── Hero.tsx          # React component
│   │   └── schema.json       # Settings & blocks definition
│   ├── features/
│   │   ├── Features.tsx
│   │   └── schema.json
│   ├── testimonials/
│   │   ├── Testimonials.tsx
│   │   └── schema.json
│   └── index.ts              # Section registry (barrel export)
├── layouts/
│   ├── DefaultLayout.tsx     # Header + content + footer
│   └── BlankLayout.tsx       # Content only
├── templates/
│   ├── homepage.json         # Template: ordered sections + settings
│   ├── about.json
│   ├── contact.json
│   └── blog-post.json
├── snippets/                 # Reusable sub-components
│   ├── Button.tsx
│   ├── SocialIcons.tsx
│   └── NewsletterForm.tsx
└── styles/
    ├── variables.css          # CSS variables generated from theme.json
    └── global.css             # Global theme styles
```

---

## 2. SECTION SCHEMA ARCHITECTURE

### Schema Format (Shopify-Inspired)

```typescript
// types/theme.ts
export interface SectionSchema {
  type: string;                     // Unique section type ID
  name: string;                     // Display name
  tag?: string;                     // HTML tag (default: 'section')
  limit?: number;                   // Max instances per page
  settings: SettingDefinition[];    // Section-level settings
  blocks?: BlockDefinition[];       // Block types this section accepts
  presets?: PresetDefinition[];     // Quick-start configurations
  maxBlocks?: number;               // Max blocks allowed
}

export interface SettingDefinition {
  type: SettingType;
  id: string;                       // Unique setting ID
  label: string;
  default?: any;
  info?: string;                    // Help text
  placeholder?: string;
  // Type-specific options
  min?: number;                     // range
  max?: number;                     // range
  step?: number;                    // range
  unit?: string;                    // range (px, %, etc.)
  options?: { label: string; value: string }[];  // select
  accept?: string[];                // image/file (mime types)
}

export type SettingType =
  | 'text'           // Single-line text input
  | 'textarea'       // Multi-line text
  | 'richtext'       // Rich text editor
  | 'number'         // Numeric input
  | 'range'          // Slider with min/max/step
  | 'checkbox'       // Boolean toggle
  | 'select'         // Dropdown select
  | 'radio'          // Radio buttons
  | 'color'          // Color picker
  | 'color_background' // Color with gradient support
  | 'image'          // Image picker (connects to media library)
  | 'video'          // Video URL
  | 'url'            // URL input
  | 'font'           // Font family picker
  | 'html'           // Raw HTML/code input
  | 'collection'     // Collection/content picker
  | 'product'        // Product picker
  | 'page'           // Page picker
  | 'header'         // Non-input, just a heading in settings panel
  | 'paragraph';     // Non-input, just info text in settings panel

export interface BlockDefinition {
  type: string;
  name: string;
  limit?: number;
  settings: SettingDefinition[];
}

export interface PresetDefinition {
  name: string;
  settings: Record<string, any>;
  blocks?: Array<{
    type: string;
    settings: Record<string, any>;
  }>;
}
```

### Example Section: Hero Banner

```json
{
  "type": "hero",
  "name": "Hero Banner",
  "tag": "section",
  "limit": 1,
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Welcome to our store" },
    { "type": "textarea", "id": "subheading", "label": "Subheading", "default": "Discover amazing products" },
    { "type": "image", "id": "backgroundImage", "label": "Background Image" },
    { "type": "color", "id": "overlayColor", "label": "Overlay Color", "default": "#000000" },
    { "type": "range", "id": "overlayOpacity", "label": "Overlay Opacity", "min": 0, "max": 100, "step": 5, "default": 40, "unit": "%" },
    { "type": "range", "id": "height", "label": "Section Height", "min": 300, "max": 900, "step": 50, "default": 600, "unit": "px" },
    { "type": "select", "id": "textAlign", "label": "Text Alignment", "default": "center", "options": [
      { "label": "Left", "value": "left" },
      { "label": "Center", "value": "center" },
      { "label": "Right", "value": "right" }
    ]},
    { "type": "color", "id": "textColor", "label": "Text Color", "default": "#ffffff" }
  ],
  "blocks": [
    {
      "type": "button",
      "name": "CTA Button",
      "limit": 3,
      "settings": [
        { "type": "text", "id": "label", "label": "Button Text", "default": "Shop Now" },
        { "type": "url", "id": "link", "label": "Button Link", "default": "/" },
        { "type": "select", "id": "style", "label": "Button Style", "default": "primary", "options": [
          { "label": "Primary", "value": "primary" },
          { "label": "Secondary", "value": "secondary" },
          { "label": "Outline", "value": "outline" }
        ]}
      ]
    }
  ],
  "presets": [
    {
      "name": "Default Hero",
      "settings": { "heading": "Welcome", "height": 600 },
      "blocks": [
        { "type": "button", "settings": { "label": "Shop Now", "link": "/products" } }
      ]
    }
  ],
  "maxBlocks": 3
}
```

### Hero Section React Component

```tsx
// sections/hero/Hero.tsx
'use client';

import { SectionSettings, BlockData } from '@/types/theme';

interface HeroSettings {
  heading: string;
  subheading: string;
  backgroundImage?: string;
  overlayColor: string;
  overlayOpacity: number;
  height: number;
  textAlign: 'left' | 'center' | 'right';
  textColor: string;
}

interface HeroProps {
  settings: HeroSettings;
  blocks: BlockData[];
}

export function HeroSection({ settings, blocks }: HeroProps) {
  const {
    heading, subheading, backgroundImage, overlayColor,
    overlayOpacity, height, textAlign, textColor,
  } = settings;

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: `${height}px` }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity / 100,
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 mx-auto max-w-4xl px-6"
        style={{ textAlign, color: textColor }}
      >
        {heading && <h1 className="text-4xl font-bold md:text-6xl">{heading}</h1>}
        {subheading && <p className="mt-4 text-lg md:text-xl opacity-90">{subheading}</p>}

        {/* CTA Blocks */}
        {blocks.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4"
            style={{ justifyContent: textAlign === 'center' ? 'center' : `flex-${textAlign === 'left' ? 'start' : 'end'}` }}
          >
            {blocks.map((block) => (
              <a
                key={block.id}
                href={block.settings.link}
                className={`rounded-lg px-6 py-3 font-medium transition-all ${
                  block.settings.style === 'primary'
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : block.settings.style === 'outline'
                    ? 'border-2 border-white text-white hover:bg-white/10'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {block.settings.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

---

## 3. SECTION REGISTRY & TEMPLATE RENDERING

```typescript
// sections/index.ts — Section Registry
import { HeroSection } from './hero/Hero';
import { FeaturesSection } from './features/Features';
import { TestimonialsSection } from './testimonials/Testimonials';
import { CTASection } from './cta/CTA';
import { FAQSection } from './faq/FAQ';
import { GallerySection } from './gallery/Gallery';
import { NewsletterSection } from './newsletter/Newsletter';
import { ProductGridSection } from './product-grid/ProductGrid';

// Type → Component mapping
export const sectionRegistry: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  features: FeaturesSection,
  testimonials: TestimonialsSection,
  cta: CTASection,
  faq: FAQSection,
  gallery: GallerySection,
  newsletter: NewsletterSection,
  'product-grid': ProductGridSection,
};

// Schema registry (loaded from JSON files)
import heroSchema from './hero/schema.json';
import featuresSchema from './features/schema.json';
// ... etc

export const schemaRegistry: Record<string, SectionSchema> = {
  hero: heroSchema,
  features: featuresSchema,
  // ... etc
};
```

### Page Renderer

```tsx
// components/theme/PageRenderer.tsx
'use client';

import { sectionRegistry } from '@/sections';
import { ErrorBoundary } from 'react-error-boundary';

interface TemplateSection {
  id: string;
  type: string;
  settings: Record<string, any>;
  blocks: Array<{
    id: string;
    type: string;
    settings: Record<string, any>;
  }>;
}

interface PageRendererProps {
  sections: TemplateSection[];
  isEditing?: boolean;
  onSectionClick?: (sectionId: string) => void;
  selectedSectionId?: string;
}

export function PageRenderer({
  sections,
  isEditing = false,
  onSectionClick,
  selectedSectionId,
}: PageRendererProps) {
  return (
    <div className="theme-page">
      {sections.map((section) => {
        const Component = sectionRegistry[section.type];
        if (!Component) {
          return (
            <div key={section.id} className="p-8 text-center text-red-500">
              Unknown section type: {section.type}
            </div>
          );
        }

        return (
          <ErrorBoundary
            key={section.id}
            fallback={<div className="p-8 text-center text-red-500">Section error</div>}
          >
            <div
              className={`relative ${isEditing ? 'cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400' : ''} ${
                selectedSectionId === section.id ? 'outline outline-2 outline-blue-500' : ''
              }`}
              onClick={() => isEditing && onSectionClick?.(section.id)}
            >
              <Component
                settings={section.settings}
                blocks={section.blocks}
              />

              {/* Edit indicator */}
              {isEditing && (
                <div className="absolute left-2 top-2 rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {section.type}
                </div>
              )}
            </div>
          </ErrorBoundary>
        );
      })}
    </div>
  );
}
```

---

## 4. LIVE PREVIEW SYSTEM (iframe + postMessage)

### Architecture

```
┌─────────────────────┐                    ┌──────────────────────┐
│   Theme Editor UI   │                    │   Preview iframe      │
│                     │   postMessage →    │                       │
│   Section list      │ ─────────────────→ │   PageRenderer        │
│   Settings panel    │                    │   CSS variables       │
│   Device toggles    │ ←───────────────── │   Section highlighting│
│                     │   ← postMessage    │                       │
└─────────────────────┘                    └──────────────────────┘
```

### Editor Side

```tsx
// components/theme-editor/ThemeEditor.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { SectionList } from './SectionList';
import { SettingsPanel } from './SettingsPanel';
import { DeviceToggle } from './DeviceToggle';

interface ThemeEditorProps {
  themeId: string;
  template: TemplateData;
  storeSlug: string;
}

export function ThemeEditor({ themeId, template, storeSlug }: ThemeEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sections, setSections] = useState(template.sections);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Send message to preview iframe
  const sendToPreview = useCallback((message: any) => {
    iframeRef.current?.contentWindow?.postMessage(message, '*');
  }, []);

  // Listen for messages from preview
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data.type === 'section:click') {
        setSelectedSectionId(event.data.sectionId);
      }
      if (event.data.type === 'ready') {
        // Preview loaded — send initial data
        sendToPreview({ type: 'template:load', sections });
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sections, sendToPreview]);

  // Update a section setting
  const updateSetting = (sectionId: string, settingId: string, value: any) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, settings: { ...s.settings, [settingId]: value } }
          : s
      )
    );

    // Real-time preview update
    sendToPreview({
      type: 'setting:update',
      sectionId,
      settingId,
      value,
    });
  };

  // Reorder sections
  const reorderSections = (newOrder: string[]) => {
    const reordered = newOrder.map((id) => sections.find((s) => s.id === id)!);
    setSections(reordered);
    sendToPreview({ type: 'sections:reorder', order: newOrder });
  };

  // Device width mapping
  const deviceWidth = { desktop: '100%', tablet: '768px', mobile: '375px' };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel: Section List + Settings */}
      <div className="w-80 border-r flex flex-col">
        <div className="border-b p-4">
          <h2 className="font-semibold">Theme Editor</h2>
        </div>

        {selectedSectionId ? (
          <SettingsPanel
            section={sections.find((s) => s.id === selectedSectionId)!}
            onUpdate={(settingId, value) => updateSetting(selectedSectionId, settingId, value)}
            onBack={() => setSelectedSectionId(null)}
          />
        ) : (
          <SectionList
            sections={sections}
            onSelect={setSelectedSectionId}
            onReorder={reorderSections}
          />
        )}
      </div>

      {/* Center: Preview */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-2 flex items-center justify-center gap-2">
          <DeviceToggle device={device} onChange={setDevice} />
        </div>

        <div className="flex-1 flex items-start justify-center bg-muted/30 p-4 overflow-auto">
          <iframe
            ref={iframeRef}
            src={`/store/${storeSlug}/preview?themeId=${themeId}`}
            className="bg-white shadow-xl transition-all duration-300"
            style={{
              width: deviceWidth[device],
              maxWidth: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

### Preview Side (inside iframe)

```tsx
// app/store/[slug]/preview/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { PageRenderer } from '@/components/theme/PageRenderer';

export default function PreviewPage() {
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const { type, ...data } = event.data;

      switch (type) {
        case 'template:load':
          setSections(data.sections);
          break;

        case 'setting:update':
          setSections((prev) =>
            prev.map((s) =>
              s.id === data.sectionId
                ? { ...s, settings: { ...s.settings, [data.settingId]: data.value } }
                : s
            )
          );
          break;

        case 'sections:reorder':
          setSections((prev) => {
            const map = new Map(prev.map((s) => [s.id, s]));
            return data.order.map((id: string) => map.get(id)!).filter(Boolean);
          });
          break;

        case 'section:select':
          setSelectedId(data.sectionId);
          break;
      }
    }

    window.addEventListener('message', handleMessage);

    // Notify parent that preview is ready
    window.parent.postMessage({ type: 'ready' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <PageRenderer
      sections={sections}
      isEditing
      selectedSectionId={selectedId}
      onSectionClick={(sectionId) => {
        setSelectedId(sectionId);
        window.parent.postMessage({ type: 'section:click', sectionId }, '*');
      }}
    />
  );
}
```

---

## 5. CSS VARIABLE THEMING

### theme.json Format

```json
{
  "name": "Default Theme",
  "version": "1.0.0",
  "settings": {
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#10b981",
      "accent": "#f59e0b",
      "background": "#ffffff",
      "surface": "#f8fafc",
      "text": "#0f172a",
      "textMuted": "#64748b",
      "border": "#e2e8f0"
    },
    "typography": {
      "headingFont": "Inter",
      "bodyFont": "Inter",
      "baseFontSize": 16,
      "scaleRatio": 1.25
    },
    "spacing": {
      "sectionPadding": 80,
      "containerWidth": 1200,
      "baseUnit": 4
    },
    "borders": {
      "radius": 8,
      "radiusSmall": 4,
      "radiusLarge": 16
    }
  }
}
```

### CSS Variable Generation

```typescript
// lib/theme-css.ts
export function generateThemeCSS(settings: ThemeSettings): string {
  const { colors, typography, spacing, borders } = settings;

  return `:root {
  /* Colors */
  --theme-primary: ${colors.primary};
  --theme-secondary: ${colors.secondary};
  --theme-accent: ${colors.accent};
  --theme-background: ${colors.background};
  --theme-surface: ${colors.surface};
  --theme-text: ${colors.text};
  --theme-text-muted: ${colors.textMuted};
  --theme-border: ${colors.border};

  /* Typography */
  --theme-font-heading: '${typography.headingFont}', system-ui, sans-serif;
  --theme-font-body: '${typography.bodyFont}', system-ui, sans-serif;
  --theme-font-size-base: ${typography.baseFontSize}px;
  --theme-font-size-sm: ${typography.baseFontSize / typography.scaleRatio}px;
  --theme-font-size-lg: ${typography.baseFontSize * typography.scaleRatio}px;
  --theme-font-size-xl: ${typography.baseFontSize * Math.pow(typography.scaleRatio, 2)}px;
  --theme-font-size-2xl: ${typography.baseFontSize * Math.pow(typography.scaleRatio, 3)}px;
  --theme-font-size-3xl: ${typography.baseFontSize * Math.pow(typography.scaleRatio, 4)}px;

  /* Spacing */
  --theme-section-padding: ${spacing.sectionPadding}px;
  --theme-container-width: ${spacing.containerWidth}px;
  --theme-space-unit: ${spacing.baseUnit}px;

  /* Borders */
  --theme-radius: ${borders.radius}px;
  --theme-radius-sm: ${borders.radiusSmall}px;
  --theme-radius-lg: ${borders.radiusLarge}px;
}`;
}

// Live update in preview iframe
export function updateThemeVariable(name: string, value: string) {
  document.documentElement.style.setProperty(`--theme-${name}`, value);
}
```

---

## 6. SETTINGS PANEL (Dynamic Form from Schema)

```tsx
// components/theme-editor/SettingField.tsx
'use client';

interface SettingFieldProps {
  setting: SettingDefinition;
  value: any;
  onChange: (value: any) => void;
}

export function SettingField({ setting, value, onChange }: SettingFieldProps) {
  switch (setting.type) {
    case 'text':
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{setting.label}</label>
          <input
            type="text"
            value={value ?? setting.default ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.placeholder}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {setting.info && <p className="text-xs text-muted-foreground">{setting.info}</p>}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{setting.label}</label>
          <textarea
            value={value ?? setting.default ?? ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
      );

    case 'range':
      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{setting.label}</label>
            <span className="text-sm text-muted-foreground">
              {value ?? setting.default}{setting.unit}
            </span>
          </div>
          <input
            type="range"
            min={setting.min}
            max={setting.max}
            step={setting.step}
            value={value ?? setting.default}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full"
          />
        </div>
      );

    case 'color':
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{setting.label}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value ?? setting.default ?? '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border"
            />
            <input
              type="text"
              value={value ?? setting.default ?? ''}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 rounded-md border px-3 py-1.5 text-sm font-mono"
            />
          </div>
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{setting.label}</label>
          <select
            value={value ?? setting.default}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            {setting.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );

    case 'checkbox':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value ?? setting.default ?? false}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border"
          />
          <span className="text-sm font-medium">{setting.label}</span>
        </label>
      );

    case 'image':
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{setting.label}</label>
          {value ? (
            <div className="relative group">
              <img src={value} alt="" className="w-full rounded-md border object-cover aspect-video" />
              <button
                onClick={() => onChange(null)}
                className="absolute top-2 right-2 rounded bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => {/* open media library dialog */}}
              className="w-full rounded-md border-2 border-dashed p-8 text-center text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              Click to select image
            </button>
          )}
        </div>
      );

    case 'header':
      return <h4 className="pt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{setting.label}</h4>;

    case 'paragraph':
      return <p className="text-sm text-muted-foreground">{setting.info || setting.label}</p>;

    default:
      return (
        <div className="text-sm text-muted-foreground">
          Unsupported setting type: {setting.type}
        </div>
      );
  }
}
```

---

## 7. MONACO EDITOR INTEGRATION

```tsx
// components/theme-editor/CodeEditor.tsx
'use client';

import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  language: 'html' | 'css' | 'javascript' | 'json' | 'liquid';
  onChange: (value: string) => void;
  height?: string;
}

export function CodeEditor({ value, language, onChange, height = '400px' }: CodeEditorProps) {
  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={(val) => onChange(val ?? '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        wordWrap: 'on',
        tabSize: 2,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        folding: true,
        bracketPairColorization: { enabled: true },
      }}
    />
  );
}
```

---

## 8. MISTAKES TO AVOID

```
NEVER DO:
  ✗ Store entire theme as one giant JSON blob (hard to query/version)
  ✗ Render user-provided HTML without sanitization (XSS risk)
  ✗ Skip postMessage origin checking in preview (security hole)
  ✗ Load all sections eagerly (use dynamic imports for code splitting)
  ✗ Send full theme data on every setting change (send delta only)
  ✗ Build page builder from scratch when Puck/Craft.js exists
  ✗ Use inline styles instead of CSS variables (harder to theme)
  ✗ Forget error boundaries around sections (one broken section kills page)
  ✗ Skip schema validation for section settings (garbage data crashes render)
  ✗ Re-render entire preview on single setting change (selective re-render)
```
