---
name: neuro-wp-block-theme-design
description: WordPress block theme design expert - Gutenberg, Full Site Editing, React-based custom blocks, theme.json, block patterns, template parts, Tailwind CSS integration, fluid typography, responsive design, and customizable theme options
trigger: auto
globs:
  - "**/theme.json"
  - "**/style.css"
  - "**/functions.php"
  - "**/templates/*.html"
  - "**/parts/*.html"
  - "**/patterns/*.php"
  - "**/src/**/*.js"
  - "**/src/**/*.jsx"
  - "**/src/**/*.tsx"
  - "**/blocks/**"
  - "**/block.json"
  - "**/tailwind.config.*"
---

# WordPress Block Theme Design — Comprehensive Expert Skill

You are a WordPress Block Theme Design expert. You build modern, performant, accessible block themes using Full Site Editing (FSE), Gutenberg, React-based custom blocks, theme.json v3, block patterns, template parts, Tailwind CSS integration, fluid typography, the Interactivity API, and customizable theme options. You ALWAYS follow WordPress coding standards and block theme best practices.

---

## 1. Block Theme Architecture

Every block theme MUST follow this directory structure. NEVER deviate from this convention.

```
theme/
├── style.css                  # Theme header (required — name, version, metadata)
├── functions.php              # Enqueue scripts/styles, register patterns, theme support
├── theme.json                 # Global settings & styles (v3 — the design system)
├── templates/                 # Full-page HTML templates (block markup only)
│   ├── index.html             # Required — fallback template
│   ├── front-page.html        # Static front page
│   ├── home.html              # Blog posts page
│   ├── single.html            # Single post
│   ├── page.html              # Single page
│   ├── archive.html           # Archive listing
│   ├── search.html            # Search results
│   ├── 404.html               # Not found
│   └── singular.html          # Fallback for single post/page
├── parts/                     # Reusable template parts
│   ├── header.html            # Site header
│   ├── footer.html            # Site footer
│   ├── sidebar.html           # Optional sidebar
│   └── comments.html          # Comments area
├── patterns/                  # Block patterns (PHP files with header comments)
│   ├── hero.php
│   ├── cta.php
│   ├── feature-grid.php
│   └── testimonial.php
├── assets/                    # Static assets
│   ├── css/                   # Compiled CSS (Tailwind output, custom styles)
│   ├── js/                    # Frontend scripts
│   ├── images/                # Theme images
│   └── fonts/                 # Local webfonts
├── src/                       # Block source code (React/JSX)
│   └── blocks/                # Custom block source directories
│       └── my-block/
│           ├── block.json     # Block metadata
│           ├── edit.js        # Editor component (React)
│           ├── save.js        # Frontend output (static) or null (dynamic)
│           ├── index.js       # Block registration
│           ├── style.scss     # Frontend styles
│           ├── editor.scss    # Editor-only styles
│           ├── render.php     # Server-side render (dynamic blocks)
│           └── view.js        # Interactivity API frontend script
├── build/                     # Compiled block output (@wordpress/scripts)
├── inc/                       # PHP includes (helpers, custom post types, etc.)
│   ├── block-patterns.php
│   ├── block-styles.php
│   └── enqueue.php
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Node dependencies and build scripts
```

### style.css — Theme Header (Required)

```css
/*
Theme Name: My Block Theme
Theme URI: https://example.com/my-block-theme
Author: Developer Name
Author URI: https://example.com
Description: A modern WordPress block theme with Full Site Editing support.
Version: 1.0.0
Requires at least: 6.6
Tested up to: 6.8
Requires PHP: 8.1
License: GNU General Public License v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: my-block-theme
Tags: block-patterns, block-styles, editor-style, full-site-editing, wide-blocks
*/
```

### functions.php — Core Setup

```php
<?php
/**
 * Theme functions and definitions.
 *
 * @package MyBlockTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'MBT_VERSION', wp_get_theme()->get( 'Version' ) );
define( 'MBT_DIR', get_template_directory() );
define( 'MBT_URI', get_template_directory_uri() );

/**
 * Theme setup.
 */
function mbt_setup() {
    // Add support for block styles
    add_theme_support( 'wp-block-styles' );

    // Add support for editor styles
    add_theme_support( 'editor-styles' );

    // Enqueue editor styles
    add_editor_style( 'assets/css/editor-style.css' );

    // Remove core block patterns if shipping custom ones
    remove_theme_support( 'core-block-patterns' );

    // Add support for responsive embeds
    add_theme_support( 'responsive-embeds' );

    // Add support for post thumbnails
    add_theme_support( 'post-thumbnails' );

    // Register navigation menus (optional — block themes use Navigation block)
    register_nav_menus( array(
        'primary' => esc_html__( 'Primary Menu', 'my-block-theme' ),
    ) );
}
add_action( 'after_setup_theme', 'mbt_setup' );

/**
 * Enqueue front-end styles and scripts.
 */
function mbt_enqueue_assets() {
    // Main theme stylesheet
    wp_enqueue_style(
        'mbt-style',
        MBT_URI . '/assets/css/main.css',
        array(),
        MBT_VERSION
    );

    // Tailwind CSS (compiled)
    wp_enqueue_style(
        'mbt-tailwind',
        MBT_URI . '/assets/css/tailwind.css',
        array(),
        MBT_VERSION
    );
}
add_action( 'wp_enqueue_scripts', 'mbt_enqueue_assets' );

/**
 * Enqueue per-block styles for performance.
 */
function mbt_enqueue_block_styles() {
    // Load styles only when the block is used on the page
    wp_enqueue_block_style( 'core/button', array(
        'handle' => 'mbt-button-style',
        'src'    => MBT_URI . '/assets/css/blocks/button.css',
        'ver'    => MBT_VERSION,
        'path'   => MBT_DIR . '/assets/css/blocks/button.css',
    ) );

    wp_enqueue_block_style( 'core/quote', array(
        'handle' => 'mbt-quote-style',
        'src'    => MBT_URI . '/assets/css/blocks/quote.css',
        'ver'    => MBT_VERSION,
        'path'   => MBT_DIR . '/assets/css/blocks/quote.css',
    ) );
}
add_action( 'init', 'mbt_enqueue_block_styles' );

/**
 * Register custom block pattern categories.
 */
function mbt_register_pattern_categories() {
    register_block_pattern_category( 'mbt-hero', array(
        'label' => esc_html__( 'Hero Sections', 'my-block-theme' ),
    ) );

    register_block_pattern_category( 'mbt-cta', array(
        'label' => esc_html__( 'Call to Action', 'my-block-theme' ),
    ) );

    register_block_pattern_category( 'mbt-features', array(
        'label' => esc_html__( 'Features', 'my-block-theme' ),
    ) );
}
add_action( 'init', 'mbt_register_pattern_categories' );

/**
 * Register custom blocks.
 */
function mbt_register_blocks() {
    // Auto-register all blocks in the build directory
    $blocks = glob( MBT_DIR . '/build/blocks/*', GLOB_ONLYDIR );
    foreach ( $blocks as $block ) {
        register_block_type( $block );
    }
}
add_action( 'init', 'mbt_register_blocks' );

// Include additional functionality
require_once MBT_DIR . '/inc/block-styles.php';
```

---

## 2. theme.json Deep Dive

theme.json is the single source of truth for your block theme's design system. You MUST use version 3 (WordPress 6.6+). NEVER hardcode CSS values that can be expressed in theme.json.

### Complete theme.json Example

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "version": 3,
    "settings": {
        "appearanceTools": true,
        "useRootPaddingAwareAlignments": true,

        "color": {
            "custom": true,
            "customDuotone": true,
            "customGradient": true,
            "defaultDuotone": false,
            "defaultGradients": false,
            "defaultPalette": false,
            "link": true,
            "text": true,
            "heading": true,
            "button": true,
            "palette": [
                {
                    "slug": "primary",
                    "color": "#1e40af",
                    "name": "Primary"
                },
                {
                    "slug": "secondary",
                    "color": "#7c3aed",
                    "name": "Secondary"
                },
                {
                    "slug": "accent",
                    "color": "#06b6d4",
                    "name": "Accent"
                },
                {
                    "slug": "neutral-900",
                    "color": "#111827",
                    "name": "Neutral 900"
                },
                {
                    "slug": "neutral-700",
                    "color": "#374151",
                    "name": "Neutral 700"
                },
                {
                    "slug": "neutral-200",
                    "color": "#e5e7eb",
                    "name": "Neutral 200"
                },
                {
                    "slug": "neutral-50",
                    "color": "#f9fafb",
                    "name": "Neutral 50"
                },
                {
                    "slug": "white",
                    "color": "#ffffff",
                    "name": "White"
                },
                {
                    "slug": "success",
                    "color": "#16a34a",
                    "name": "Success"
                },
                {
                    "slug": "warning",
                    "color": "#d97706",
                    "name": "Warning"
                },
                {
                    "slug": "error",
                    "color": "#dc2626",
                    "name": "Error"
                }
            ],
            "gradients": [
                {
                    "slug": "primary-to-secondary",
                    "gradient": "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)",
                    "name": "Primary to Secondary"
                },
                {
                    "slug": "accent-to-primary",
                    "gradient": "linear-gradient(135deg, #06b6d4 0%, #1e40af 100%)",
                    "name": "Accent to Primary"
                }
            ],
            "duotone": [
                {
                    "slug": "primary-white",
                    "colors": ["#1e40af", "#ffffff"],
                    "name": "Primary and White"
                }
            ]
        },

        "typography": {
            "fluid": true,
            "customFontSize": true,
            "dropCap": false,
            "lineHeight": true,
            "letterSpacing": true,
            "textDecoration": true,
            "textTransform": true,
            "fontFamilies": [
                {
                    "slug": "heading",
                    "name": "Heading",
                    "fontFamily": "'Inter', sans-serif",
                    "fontFace": [
                        {
                            "fontFamily": "Inter",
                            "fontWeight": "700",
                            "fontStyle": "normal",
                            "fontDisplay": "swap",
                            "src": ["file:./assets/fonts/inter/Inter-Bold.woff2"]
                        },
                        {
                            "fontFamily": "Inter",
                            "fontWeight": "800",
                            "fontStyle": "normal",
                            "fontDisplay": "swap",
                            "src": ["file:./assets/fonts/inter/Inter-ExtraBold.woff2"]
                        }
                    ]
                },
                {
                    "slug": "body",
                    "name": "Body",
                    "fontFamily": "'Inter', sans-serif",
                    "fontFace": [
                        {
                            "fontFamily": "Inter",
                            "fontWeight": "400",
                            "fontStyle": "normal",
                            "fontDisplay": "swap",
                            "src": ["file:./assets/fonts/inter/Inter-Regular.woff2"]
                        },
                        {
                            "fontFamily": "Inter",
                            "fontWeight": "500",
                            "fontStyle": "normal",
                            "fontDisplay": "swap",
                            "src": ["file:./assets/fonts/inter/Inter-Medium.woff2"]
                        },
                        {
                            "fontFamily": "Inter",
                            "fontWeight": "600",
                            "fontStyle": "normal",
                            "fontDisplay": "swap",
                            "src": ["file:./assets/fonts/inter/Inter-SemiBold.woff2"]
                        }
                    ]
                },
                {
                    "slug": "mono",
                    "name": "Monospace",
                    "fontFamily": "'JetBrains Mono', monospace",
                    "fontFace": [
                        {
                            "fontFamily": "JetBrains Mono",
                            "fontWeight": "400",
                            "fontStyle": "normal",
                            "fontDisplay": "swap",
                            "src": ["file:./assets/fonts/jetbrains/JetBrainsMono-Regular.woff2"]
                        }
                    ]
                }
            ],
            "fontSizes": [
                {
                    "slug": "small",
                    "size": "0.875rem",
                    "name": "Small",
                    "fluid": {
                        "min": "0.8rem",
                        "max": "0.875rem"
                    }
                },
                {
                    "slug": "medium",
                    "size": "1rem",
                    "name": "Medium",
                    "fluid": {
                        "min": "0.9rem",
                        "max": "1rem"
                    }
                },
                {
                    "slug": "large",
                    "size": "1.25rem",
                    "name": "Large",
                    "fluid": {
                        "min": "1.1rem",
                        "max": "1.25rem"
                    }
                },
                {
                    "slug": "x-large",
                    "size": "1.75rem",
                    "name": "Extra Large",
                    "fluid": {
                        "min": "1.35rem",
                        "max": "1.75rem"
                    }
                },
                {
                    "slug": "xx-large",
                    "size": "2.5rem",
                    "name": "2X Large",
                    "fluid": {
                        "min": "1.75rem",
                        "max": "2.5rem"
                    }
                },
                {
                    "slug": "xxx-large",
                    "size": "3.75rem",
                    "name": "3X Large",
                    "fluid": {
                        "min": "2.25rem",
                        "max": "3.75rem"
                    }
                }
            ]
        },

        "spacing": {
            "blockGap": true,
            "margin": true,
            "padding": true,
            "units": ["px", "em", "rem", "%", "vw", "vh", "svh", "dvh"],
            "spacingScale": {
                "operator": "*",
                "increment": 1.5,
                "steps": 7,
                "mediumStep": 1.5,
                "unit": "rem"
            },
            "spacingSizes": [
                { "slug": "10", "size": "0.25rem", "name": "1" },
                { "slug": "20", "size": "0.5rem", "name": "2" },
                { "slug": "30", "size": "0.75rem", "name": "3" },
                { "slug": "40", "size": "1rem", "name": "4" },
                { "slug": "50", "size": "1.5rem", "name": "5" },
                { "slug": "60", "size": "2rem", "name": "6" },
                { "slug": "70", "size": "3rem", "name": "7" },
                { "slug": "80", "size": "4rem", "name": "8" },
                { "slug": "90", "size": "6rem", "name": "9" }
            ]
        },

        "layout": {
            "contentSize": "720px",
            "wideSize": "1200px"
        },

        "border": {
            "color": true,
            "radius": true,
            "style": true,
            "width": true
        },

        "shadow": {
            "defaultPresets": false,
            "presets": [
                {
                    "slug": "sm",
                    "name": "Small",
                    "shadow": "0 1px 2px 0 rgba(0,0,0,0.05)"
                },
                {
                    "slug": "md",
                    "name": "Medium",
                    "shadow": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)"
                },
                {
                    "slug": "lg",
                    "name": "Large",
                    "shadow": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)"
                },
                {
                    "slug": "xl",
                    "name": "Extra Large",
                    "shadow": "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)"
                }
            ]
        },

        "dimensions": {
            "aspectRatio": true,
            "minHeight": true
        },

        "position": {
            "sticky": true
        },

        "custom": {
            "lineHeight": {
                "tight": 1.2,
                "normal": 1.5,
                "relaxed": 1.75
            },
            "borderRadius": {
                "sm": "0.25rem",
                "md": "0.5rem",
                "lg": "1rem",
                "full": "9999px"
            },
            "transition": {
                "default": "all 0.2s ease-in-out"
            }
        },

        "blocks": {
            "core/button": {
                "border": {
                    "radius": true
                },
                "color": {
                    "custom": true
                },
                "typography": {
                    "fontSizes": true
                }
            },
            "core/code": {
                "typography": {
                    "fontFamilies": [
                        {
                            "slug": "mono",
                            "name": "Monospace",
                            "fontFamily": "'JetBrains Mono', monospace"
                        }
                    ]
                }
            },
            "core/heading": {
                "color": {
                    "palette": [
                        {
                            "slug": "primary",
                            "color": "#1e40af",
                            "name": "Primary"
                        },
                        {
                            "slug": "neutral-900",
                            "color": "#111827",
                            "name": "Dark"
                        },
                        {
                            "slug": "white",
                            "color": "#ffffff",
                            "name": "White"
                        }
                    ]
                }
            }
        }
    },

    "styles": {
        "color": {
            "background": "var(--wp--preset--color--white)",
            "text": "var(--wp--preset--color--neutral-900)"
        },
        "typography": {
            "fontFamily": "var(--wp--preset--font-family--body)",
            "fontSize": "var(--wp--preset--font-size--medium)",
            "lineHeight": "var(--wp--custom--line-height--normal)"
        },
        "spacing": {
            "padding": {
                "top": "0",
                "right": "var(--wp--preset--spacing--50)",
                "bottom": "0",
                "left": "var(--wp--preset--spacing--50)"
            },
            "blockGap": "var(--wp--preset--spacing--50)"
        },
        "elements": {
            "link": {
                "color": {
                    "text": "var(--wp--preset--color--primary)"
                },
                ":hover": {
                    "color": {
                        "text": "var(--wp--preset--color--secondary)"
                    }
                },
                ":focus": {
                    "color": {
                        "text": "var(--wp--preset--color--secondary)"
                    },
                    "outline": {
                        "color": "var(--wp--preset--color--primary)",
                        "offset": "2px",
                        "style": "solid",
                        "width": "2px"
                    }
                }
            },
            "button": {
                "color": {
                    "background": "var(--wp--preset--color--primary)",
                    "text": "var(--wp--preset--color--white)"
                },
                "border": {
                    "radius": "var(--wp--custom--border-radius--md)"
                },
                "typography": {
                    "fontWeight": "600",
                    "fontSize": "var(--wp--preset--font-size--medium)"
                },
                "spacing": {
                    "padding": {
                        "top": "0.75rem",
                        "right": "1.5rem",
                        "bottom": "0.75rem",
                        "left": "1.5rem"
                    }
                },
                ":hover": {
                    "color": {
                        "background": "var(--wp--preset--color--secondary)"
                    }
                }
            },
            "heading": {
                "color": {
                    "text": "var(--wp--preset--color--neutral-900)"
                },
                "typography": {
                    "fontFamily": "var(--wp--preset--font-family--heading)",
                    "fontWeight": "700",
                    "lineHeight": "var(--wp--custom--line-height--tight)"
                }
            },
            "h1": {
                "typography": {
                    "fontSize": "var(--wp--preset--font-size--xxx-large)"
                }
            },
            "h2": {
                "typography": {
                    "fontSize": "var(--wp--preset--font-size--xx-large)"
                }
            },
            "h3": {
                "typography": {
                    "fontSize": "var(--wp--preset--font-size--x-large)"
                }
            },
            "h4": {
                "typography": {
                    "fontSize": "var(--wp--preset--font-size--large)"
                }
            },
            "caption": {
                "color": {
                    "text": "var(--wp--preset--color--neutral-700)"
                },
                "typography": {
                    "fontSize": "var(--wp--preset--font-size--small)"
                }
            }
        },
        "blocks": {
            "core/code": {
                "color": {
                    "background": "var(--wp--preset--color--neutral-900)",
                    "text": "var(--wp--preset--color--neutral-50)"
                },
                "typography": {
                    "fontFamily": "var(--wp--preset--font-family--mono)",
                    "fontSize": "var(--wp--preset--font-size--small)"
                },
                "border": {
                    "radius": "var(--wp--custom--border-radius--md)"
                },
                "spacing": {
                    "padding": {
                        "top": "var(--wp--preset--spacing--50)",
                        "right": "var(--wp--preset--spacing--50)",
                        "bottom": "var(--wp--preset--spacing--50)",
                        "left": "var(--wp--preset--spacing--50)"
                    }
                }
            },
            "core/separator": {
                "color": {
                    "text": "var(--wp--preset--color--neutral-200)"
                },
                "border": {
                    "width": "1px"
                }
            },
            "core/navigation": {
                "typography": {
                    "fontSize": "var(--wp--preset--font-size--medium)",
                    "fontWeight": "500"
                }
            },
            "core/post-title": {
                "typography": {
                    "fontSize": "var(--wp--preset--font-size--xxx-large)"
                }
            },
            "core/quote": {
                "border": {
                    "left": {
                        "color": "var(--wp--preset--color--primary)",
                        "style": "solid",
                        "width": "4px"
                    }
                },
                "spacing": {
                    "padding": {
                        "left": "var(--wp--preset--spacing--50)"
                    }
                },
                "typography": {
                    "fontStyle": "italic"
                }
            }
        },
        "css": "--wp--style--global--wide-size: 1200px;"
    },

    "templateParts": [
        {
            "name": "header",
            "title": "Header",
            "area": "header"
        },
        {
            "name": "footer",
            "title": "Footer",
            "area": "footer"
        },
        {
            "name": "sidebar",
            "title": "Sidebar",
            "area": "uncategorized"
        },
        {
            "name": "comments",
            "title": "Comments",
            "area": "uncategorized"
        }
    ],

    "customTemplates": [
        {
            "name": "blank",
            "title": "Blank",
            "postTypes": ["page", "post"]
        },
        {
            "name": "full-width",
            "title": "Full Width",
            "postTypes": ["page"]
        },
        {
            "name": "with-sidebar",
            "title": "With Sidebar",
            "postTypes": ["page", "post"]
        },
        {
            "name": "landing-page",
            "title": "Landing Page",
            "postTypes": ["page"]
        }
    ],

    "patterns": []
}
```

### How theme.json Generates CSS Custom Properties

theme.json settings AUTOMATICALLY generate CSS custom properties:

| Setting | Generated CSS Variable |
|---------|----------------------|
| `settings.color.palette[slug=primary]` | `--wp--preset--color--primary` |
| `settings.typography.fontFamilies[slug=body]` | `--wp--preset--font-family--body` |
| `settings.typography.fontSizes[slug=large]` | `--wp--preset--font-size--large` |
| `settings.spacing.spacingSizes[slug=50]` | `--wp--preset--spacing--50` |
| `settings.shadow.presets[slug=md]` | `--wp--preset--shadow--md` |
| `settings.custom.lineHeight.tight` | `--wp--custom--line-height--tight` |
| `settings.custom.borderRadius.md` | `--wp--custom--border-radius--md` |

You MUST use these CSS variables in your styles. NEVER hardcode raw color values or font sizes when a preset exists.

---

## 3. Custom Block Development (React + Gutenberg)

### Scaffolding with @wordpress/create-block

```bash
# Create a new block plugin
npx @wordpress/create-block@latest my-custom-block

# Create a dynamic block (server-side rendered)
npx @wordpress/create-block@latest my-dynamic-block --variant=dynamic

# Create inside an existing theme
cd wp-content/themes/my-block-theme/src/blocks
npx @wordpress/create-block@latest feature-card --no-plugin
```

### block.json — Block Metadata (apiVersion 3)

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "mbt/feature-card",
    "version": "1.0.0",
    "title": "Feature Card",
    "category": "theme",
    "icon": "star-filled",
    "description": "A feature card with icon, heading, and description.",
    "keywords": ["feature", "card", "service"],
    "textdomain": "my-block-theme",
    "attributes": {
        "heading": {
            "type": "string",
            "default": "Feature Title"
        },
        "description": {
            "type": "string",
            "default": "Feature description goes here."
        },
        "iconUrl": {
            "type": "string",
            "default": ""
        },
        "iconAlt": {
            "type": "string",
            "default": ""
        },
        "iconId": {
            "type": "number"
        },
        "linkUrl": {
            "type": "string",
            "default": ""
        },
        "showLink": {
            "type": "boolean",
            "default": true
        }
    },
    "supports": {
        "html": false,
        "anchor": true,
        "className": true,
        "color": {
            "background": true,
            "text": true,
            "gradients": true
        },
        "typography": {
            "fontSize": true,
            "lineHeight": true
        },
        "spacing": {
            "margin": true,
            "padding": true,
            "blockGap": true
        },
        "border": {
            "color": true,
            "radius": true,
            "style": true,
            "width": true
        },
        "shadow": true,
        "align": ["wide", "full"]
    },
    "styles": [
        { "name": "default", "label": "Default", "isDefault": true },
        { "name": "outlined", "label": "Outlined" },
        { "name": "elevated", "label": "Elevated" }
    ],
    "editorScript": "file:./index.js",
    "editorStyle": "file:./index.css",
    "style": "file:./style-index.css",
    "render": "file:./render.php",
    "viewScriptModule": "file:./view.js"
}
```

### edit.js — Editor Component (React)

```jsx
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    RichText,
    MediaUpload,
    MediaUploadCheck,
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    ToggleControl,
    Button,
    Placeholder,
} from '@wordpress/components';

import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
    const {
        heading,
        description,
        iconUrl,
        iconAlt,
        iconId,
        linkUrl,
        showLink,
    } = attributes;

    const blockProps = useBlockProps( {
        className: 'mbt-feature-card',
    } );

    const onSelectIcon = ( media ) => {
        setAttributes( {
            iconUrl: media.url,
            iconAlt: media.alt,
            iconId: media.id,
        } );
    };

    const onRemoveIcon = () => {
        setAttributes( {
            iconUrl: '',
            iconAlt: '',
            iconId: undefined,
        } );
    };

    return (
        <>
            <InspectorControls>
                <PanelBody
                    title={ __( 'Card Settings', 'my-block-theme' ) }
                    initialOpen={ true }
                >
                    <ToggleControl
                        label={ __( 'Show Link', 'my-block-theme' ) }
                        checked={ showLink }
                        onChange={ ( value ) =>
                            setAttributes( { showLink: value } )
                        }
                    />
                    { showLink && (
                        <TextControl
                            label={ __( 'Link URL', 'my-block-theme' ) }
                            value={ linkUrl }
                            onChange={ ( value ) =>
                                setAttributes( { linkUrl: value } )
                            }
                            type="url"
                        />
                    ) }
                </PanelBody>
                <PanelBody
                    title={ __( 'Icon', 'my-block-theme' ) }
                    initialOpen={ false }
                >
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={ onSelectIcon }
                            allowedTypes={ [ 'image' ] }
                            value={ iconId }
                            render={ ( { open } ) => (
                                <div>
                                    { iconUrl ? (
                                        <>
                                            <img
                                                src={ iconUrl }
                                                alt={ iconAlt }
                                                style={ {
                                                    maxWidth: '64px',
                                                    marginBottom: '8px',
                                                } }
                                            />
                                            <Button
                                                onClick={ onRemoveIcon }
                                                variant="secondary"
                                                isDestructive
                                            >
                                                { __( 'Remove Icon', 'my-block-theme' ) }
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={ open }
                                            variant="secondary"
                                        >
                                            { __( 'Select Icon', 'my-block-theme' ) }
                                        </Button>
                                    ) }
                                </div>
                            ) }
                        />
                    </MediaUploadCheck>
                </PanelBody>
            </InspectorControls>

            <div { ...blockProps }>
                { iconUrl && (
                    <div className="mbt-feature-card__icon">
                        <img src={ iconUrl } alt={ iconAlt } />
                    </div>
                ) }
                { ! iconUrl && (
                    <Placeholder
                        icon="format-image"
                        label={ __( 'Icon', 'my-block-theme' ) }
                    >
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={ onSelectIcon }
                                allowedTypes={ [ 'image' ] }
                                render={ ( { open } ) => (
                                    <Button onClick={ open } variant="primary">
                                        { __( 'Upload Icon', 'my-block-theme' ) }
                                    </Button>
                                ) }
                            />
                        </MediaUploadCheck>
                    </Placeholder>
                ) }

                <RichText
                    tagName="h3"
                    className="mbt-feature-card__heading"
                    value={ heading }
                    onChange={ ( value ) =>
                        setAttributes( { heading: value } )
                    }
                    placeholder={ __( 'Feature Title...', 'my-block-theme' ) }
                />

                <RichText
                    tagName="p"
                    className="mbt-feature-card__description"
                    value={ description }
                    onChange={ ( value ) =>
                        setAttributes( { description: value } )
                    }
                    placeholder={ __(
                        'Feature description...',
                        'my-block-theme'
                    ) }
                />

                { showLink && (
                    <div className="mbt-feature-card__link">
                        <span>{ __( 'Learn More →', 'my-block-theme' ) }</span>
                    </div>
                ) }
            </div>
        </>
    );
}
```

### save.js — Static HTML Output

```jsx
import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
    const { heading, description, iconUrl, iconAlt, linkUrl, showLink } =
        attributes;

    const blockProps = useBlockProps.save( {
        className: 'mbt-feature-card',
    } );

    const CardContent = () => (
        <>
            { iconUrl && (
                <div className="mbt-feature-card__icon">
                    <img src={ iconUrl } alt={ iconAlt } loading="lazy" />
                </div>
            ) }
            <RichText.Content
                tagName="h3"
                className="mbt-feature-card__heading"
                value={ heading }
            />
            <RichText.Content
                tagName="p"
                className="mbt-feature-card__description"
                value={ description }
            />
            { showLink && (
                <span className="mbt-feature-card__link">Learn More →</span>
            ) }
        </>
    );

    // Wrap in link if URL is provided
    if ( showLink && linkUrl ) {
        return (
            <a { ...blockProps } href={ linkUrl }>
                <CardContent />
            </a>
        );
    }

    return (
        <div { ...blockProps }>
            <CardContent />
        </div>
    );
}
```

### index.js — Block Registration

```js
import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import Save from './save';
import './style.scss';

const featureCardIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
    >
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
        <path d="M12 7l-4 5h3v4h2v-4h3z" />
    </svg>
);

registerBlockType( metadata.name, {
    icon: featureCardIcon,
    edit: Edit,
    save: Save,
} );
```

### InnerBlocks — Nested Block Support

```jsx
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [
    'core/heading',
    'core/paragraph',
    'core/image',
    'core/button',
];

const TEMPLATE = [
    [ 'core/heading', { level: 3, placeholder: 'Section Title' } ],
    [ 'core/paragraph', { placeholder: 'Section content...' } ],
    [ 'core/button', { text: 'Learn More' } ],
];

export default function Edit() {
    const blockProps = useBlockProps();
    return (
        <div { ...blockProps }>
            <InnerBlocks
                allowedBlocks={ ALLOWED_BLOCKS }
                template={ TEMPLATE }
                templateLock="insert"
                orientation="vertical"
            />
        </div>
    );
}

// save.js for InnerBlocks
export function Save() {
    const blockProps = useBlockProps.save();
    return (
        <div { ...blockProps }>
            <InnerBlocks.Content />
        </div>
    );
}
```

### Dynamic Block — Server-Side Rendering (render.php)

For blocks that need real-time data, use dynamic rendering with `render.php`:

```php
<?php
/**
 * Server-side render for the feature-card block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 *
 * @package MyBlockTheme
 */

$heading     = $attributes['heading'] ?? '';
$description = $attributes['description'] ?? '';
$icon_url    = $attributes['iconUrl'] ?? '';
$icon_alt    = $attributes['iconAlt'] ?? '';
$link_url    = $attributes['linkUrl'] ?? '';
$show_link   = $attributes['showLink'] ?? true;

$wrapper_attributes = get_block_wrapper_attributes( array(
    'class' => 'mbt-feature-card',
) );

$tag = ( $show_link && $link_url ) ? 'a' : 'div';
$href = ( $show_link && $link_url ) ? ' href="' . esc_url( $link_url ) . '"' : '';
?>
<<?php echo $tag; ?> <?php echo $wrapper_attributes; ?><?php echo $href; ?>>
    <?php if ( $icon_url ) : ?>
        <div class="mbt-feature-card__icon">
            <img src="<?php echo esc_url( $icon_url ); ?>"
                 alt="<?php echo esc_attr( $icon_alt ); ?>"
                 loading="lazy"
                 width="64"
                 height="64">
        </div>
    <?php endif; ?>

    <?php if ( $heading ) : ?>
        <h3 class="mbt-feature-card__heading">
            <?php echo wp_kses_post( $heading ); ?>
        </h3>
    <?php endif; ?>

    <?php if ( $description ) : ?>
        <p class="mbt-feature-card__description">
            <?php echo wp_kses_post( $description ); ?>
        </p>
    <?php endif; ?>

    <?php if ( $show_link ) : ?>
        <span class="mbt-feature-card__link">
            <?php esc_html_e( 'Learn More →', 'my-block-theme' ); ?>
        </span>
    <?php endif; ?>
</<?php echo $tag; ?>>
```

### Block Variations

```js
import { registerBlockVariation } from '@wordpress/blocks';

registerBlockVariation( 'core/group', {
    name: 'mbt-card-group',
    title: 'Card Group',
    description: 'A group styled as a card with shadow and padding.',
    icon: 'grid-view',
    scope: [ 'inserter', 'block', 'transform' ],
    attributes: {
        className: 'is-style-mbt-card',
        style: {
            border: { radius: '8px' },
            spacing: { padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' } },
            shadow: 'var(--wp--preset--shadow--md)',
        },
    },
    innerBlocks: [
        [ 'core/heading', { level: 3, placeholder: 'Card Title' } ],
        [ 'core/paragraph', { placeholder: 'Card content...' } ],
    ],
    isActive: ( blockAttributes ) =>
        blockAttributes.className?.includes( 'is-style-mbt-card' ),
} );
```

---

## 4. Tailwind CSS Integration

### Installation and Setup

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### tailwind.config.js

ALWAYS sync your Tailwind config with theme.json values. This ensures design consistency between the block editor and Tailwind utilities.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './templates/**/*.html',
        './parts/**/*.html',
        './patterns/**/*.php',
        './src/**/*.{js,jsx,ts,tsx}',
        './inc/**/*.php',
        './functions.php',
    ],
    // DO NOT include templates/*.html for Tailwind class scanning
    // Block template HTML only supports block markup — NOT arbitrary CSS classes
    theme: {
        extend: {
            // Sync with theme.json color palette
            colors: {
                primary: '#1e40af',
                secondary: '#7c3aed',
                accent: '#06b6d4',
                neutral: {
                    50: '#f9fafb',
                    200: '#e5e7eb',
                    700: '#374151',
                    900: '#111827',
                },
                success: '#16a34a',
                warning: '#d97706',
                error: '#dc2626',
            },
            // Sync with theme.json font families
            fontFamily: {
                heading: ['Inter', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            // Sync with theme.json spacing
            spacing: {
                'wp-10': '0.25rem',
                'wp-20': '0.5rem',
                'wp-30': '0.75rem',
                'wp-40': '1rem',
                'wp-50': '1.5rem',
                'wp-60': '2rem',
                'wp-70': '3rem',
                'wp-80': '4rem',
                'wp-90': '6rem',
            },
            // Sync with theme.json layout
            maxWidth: {
                content: '720px',
                wide: '1200px',
            },
            // Sync with theme.json shadows
            boxShadow: {
                sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
                md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            },
            borderRadius: {
                sm: '0.25rem',
                md: '0.5rem',
                lg: '1rem',
            },
        },
    },
    plugins: [],
};
```

### postcss.config.js

```js
module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

### Build Process

Add to package.json scripts:

```json
{
    "scripts": {
        "tw:build": "npx tailwindcss -i ./assets/css/tailwind-input.css -o ./assets/css/tailwind.css --minify",
        "tw:watch": "npx tailwindcss -i ./assets/css/tailwind-input.css -o ./assets/css/tailwind.css --watch",
        "blocks:build": "wp-scripts build --webpack-src-dir=src/blocks --output-path=build/blocks",
        "blocks:start": "wp-scripts start --webpack-src-dir=src/blocks --output-path=build/blocks",
        "build": "npm run tw:build && npm run blocks:build",
        "dev": "concurrently \"npm run tw:watch\" \"npm run blocks:start\""
    }
}
```

### assets/css/tailwind-input.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component classes using @apply */
@layer components {
    .btn-primary {
        @apply bg-primary text-white font-semibold py-3 px-6 rounded-md
               hover:bg-secondary transition-colors duration-200;
    }

    .card {
        @apply bg-white rounded-lg shadow-md p-6
               border border-neutral-200;
    }

    .section-padding {
        @apply py-16 px-4 md:py-24 lg:py-32;
    }
}
```

### Enqueue Tailwind in functions.php

```php
function mbt_enqueue_tailwind() {
    wp_enqueue_style(
        'mbt-tailwind',
        get_template_directory_uri() . '/assets/css/tailwind.css',
        array(),
        filemtime( get_template_directory() . '/assets/css/tailwind.css' )
    );
}
add_action( 'wp_enqueue_scripts', 'mbt_enqueue_tailwind' );

// Also load in the editor for consistency
function mbt_enqueue_editor_tailwind() {
    add_editor_style( 'assets/css/tailwind.css' );
}
add_action( 'after_setup_theme', 'mbt_enqueue_editor_tailwind' );
```

### Critical Rules for Tailwind in Block Themes

- You MUST NOT use Tailwind utility classes directly in `templates/*.html` or `parts/*.html` files. These files ONLY support WordPress block markup (HTML comments like `<!-- wp:group -->`).
- You MUST use Tailwind classes in `patterns/*.php` files (PHP-rendered patterns can output any HTML).
- You MUST use Tailwind in custom block `render.php` files and in `edit.js` React components.
- ALWAYS run production builds with `--minify` to purge unused CSS.
- Prefer `@apply` in component CSS over long chains of utility classes in PHP templates for maintainability.

---

## 5. Block Patterns

### File-Based Pattern Registration (Recommended)

Create PHP files in the `patterns/` directory with a standardized header comment. WordPress auto-discovers these.

#### patterns/hero.php

```php
<?php
/**
 * Title: Hero Section
 * Slug: my-block-theme/hero
 * Categories: mbt-hero, featured
 * Keywords: hero, banner, header
 * Block Types: core/template-part/header
 * Post Types: page
 * Viewport Width: 1200
 */
?>
<!-- wp:cover {"overlayColor":"neutral-900","minHeight":600,"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|90","bottom":"var:preset|spacing|90","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}}} -->
<div class="wp-block-cover alignfull" style="min-height:600px;padding-top:var(--wp--preset--spacing--90);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--90);padding-left:var(--wp--preset--spacing--50)">
    <span aria-hidden="true" class="wp-block-cover__background has-neutral-900-background-color has-background-dim-100 has-background-dim"></span>
    <div class="wp-block-cover__inner-container">
        <!-- wp:group {"layout":{"type":"constrained","contentSize":"720px"}} -->
        <div class="wp-block-group">
            <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontWeight":"800"}},"textColor":"white","fontSize":"xxx-large"} -->
            <h1 class="wp-block-heading has-text-align-center has-white-color has-text-color has-xxx-large-font-size" style="font-weight:800"><?php esc_html_e( 'Build Something Amazing', 'my-block-theme' ); ?></h1>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"align":"center","textColor":"neutral-200","fontSize":"large"} -->
            <p class="has-text-align-center has-neutral-200-color has-text-color has-large-font-size"><?php esc_html_e( 'Create beautiful, fast, and accessible websites with the power of WordPress block themes.', 'my-block-theme' ); ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|60"}}}} -->
            <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--60)">
                <!-- wp:button {"backgroundColor":"primary","textColor":"white","style":{"border":{"radius":"6px"},"spacing":{"padding":{"top":"0.9rem","bottom":"0.9rem","left":"2rem","right":"2rem"}}}} -->
                <div class="wp-block-button"><a class="wp-block-button__link has-white-color has-primary-background-color has-text-color has-background wp-element-button" style="border-radius:6px;padding-top:0.9rem;padding-right:2rem;padding-bottom:0.9rem;padding-left:2rem"><?php esc_html_e( 'Get Started', 'my-block-theme' ); ?></a></div>
                <!-- /wp:button -->

                <!-- wp:button {"className":"is-style-outline","style":{"border":{"radius":"6px"},"spacing":{"padding":{"top":"0.9rem","bottom":"0.9rem","left":"2rem","right":"2rem"}}},"textColor":"white"} -->
                <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-white-color has-text-color wp-element-button" style="border-radius:6px;padding-top:0.9rem;padding-right:2rem;padding-bottom:0.9rem;padding-left:2rem"><?php esc_html_e( 'Learn More', 'my-block-theme' ); ?></a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
    </div>
</div>
<!-- /wp:cover -->
```

#### patterns/feature-grid.php

```php
<?php
/**
 * Title: Feature Grid
 * Slug: my-block-theme/feature-grid
 * Categories: mbt-features
 * Keywords: features, grid, services, cards
 * Viewport Width: 1200
 */
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">

    <!-- wp:heading {"textAlign":"center","fontSize":"xx-large"} -->
    <h2 class="wp-block-heading has-text-align-center has-xx-large-font-size"><?php esc_html_e( 'What We Offer', 'my-block-theme' ); ?></h2>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center","textColor":"neutral-700","fontSize":"large"} -->
    <p class="has-text-align-center has-neutral-700-color has-text-color has-large-font-size"><?php esc_html_e( 'Everything you need to build a modern website.', 'my-block-theme' ); ?></p>
    <!-- /wp:paragraph -->

    <!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"},"margin":{"top":"var:preset|spacing|70"}}}} -->
    <div class="wp-block-columns" style="margin-top:var(--wp--preset--spacing--70)">

        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}},"border":{"radius":"8px","width":"1px"}},"borderColor":"neutral-200"} -->
        <div class="wp-block-column has-border-color has-neutral-200-border-color" style="border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--50)">
            <!-- wp:heading {"level":3,"fontSize":"large"} -->
            <h3 class="wp-block-heading has-large-font-size"><?php esc_html_e( 'Fast Performance', 'my-block-theme' ); ?></h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"neutral-700"} -->
            <p class="has-neutral-700-color has-text-color"><?php esc_html_e( 'Optimized for speed with minimal CSS and JavaScript. Your site loads instantly.', 'my-block-theme' ); ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}},"border":{"radius":"8px","width":"1px"}},"borderColor":"neutral-200"} -->
        <div class="wp-block-column has-border-color has-neutral-200-border-color" style="border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--50)">
            <!-- wp:heading {"level":3,"fontSize":"large"} -->
            <h3 class="wp-block-heading has-large-font-size"><?php esc_html_e( 'Fully Responsive', 'my-block-theme' ); ?></h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"neutral-700"} -->
            <p class="has-neutral-700-color has-text-color"><?php esc_html_e( 'Looks great on every device with fluid typography and responsive layouts.', 'my-block-theme' ); ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}},"border":{"radius":"8px","width":"1px"}},"borderColor":"neutral-200"} -->
        <div class="wp-block-column has-border-color has-neutral-200-border-color" style="border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--50)">
            <!-- wp:heading {"level":3,"fontSize":"large"} -->
            <h3 class="wp-block-heading has-large-font-size"><?php esc_html_e( 'Accessible', 'my-block-theme' ); ?></h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"neutral-700"} -->
            <p class="has-neutral-700-color has-text-color"><?php esc_html_e( 'Built with WCAG 2.1 AA compliance in mind. Everyone can use your site.', 'my-block-theme' ); ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->

    </div>
    <!-- /wp:columns -->

</div>
<!-- /wp:group -->
```

#### patterns/cta.php

```php
<?php
/**
 * Title: Call to Action
 * Slug: my-block-theme/cta
 * Categories: mbt-cta
 * Keywords: cta, call to action, banner
 * Viewport Width: 1200
 */
?>
<!-- wp:group {"align":"full","backgroundColor":"primary","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained","contentSize":"680px"}} -->
<div class="wp-block-group alignfull has-primary-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","textColor":"white","fontSize":"xx-large"} -->
    <h2 class="wp-block-heading has-text-align-center has-white-color has-text-color has-xx-large-font-size"><?php esc_html_e( 'Ready to Get Started?', 'my-block-theme' ); ?></h2>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center","textColor":"neutral-200"} -->
    <p class="has-text-align-center has-neutral-200-color has-text-color"><?php esc_html_e( 'Join thousands of creators building with our block theme. No code required.', 'my-block-theme' ); ?></p>
    <!-- /wp:paragraph -->

    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-buttons">
        <!-- wp:button {"backgroundColor":"white","textColor":"primary","style":{"border":{"radius":"6px"}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-primary-color has-white-background-color has-text-color has-background wp-element-button" style="border-radius:6px"><?php esc_html_e( 'Start Building', 'my-block-theme' ); ?></a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->
```

#### patterns/testimonial.php

```php
<?php
/**
 * Title: Testimonial
 * Slug: my-block-theme/testimonial
 * Categories: mbt-features
 * Keywords: testimonial, review, quote
 * Viewport Width: 1200
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60","left":"var:preset|spacing|60","right":"var:preset|spacing|60"}},"border":{"radius":"12px"}},"backgroundColor":"neutral-50","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-neutral-50-background-color has-background" style="border-radius:12px;padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--60)">
    <!-- wp:paragraph {"style":{"typography":{"fontStyle":"italic","fontSize":"1.25rem","lineHeight":"1.75"}},"textColor":"neutral-700"} -->
    <p class="has-neutral-700-color has-text-color" style="font-size:1.25rem;font-style:italic;line-height:1.75"><?php esc_html_e( '"This theme transformed the way I build websites. The patterns are beautiful and the performance is outstanding."', 'my-block-theme' ); ?></p>
    <!-- /wp:paragraph -->

    <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
    <div class="wp-block-group">
        <!-- wp:image {"width":"48px","height":"48px","scale":"cover","sizeSlug":"thumbnail","style":{"border":{"radius":"9999px"}}} -->
        <figure class="wp-block-image size-thumbnail is-resized" style="border-radius:9999px"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/avatar-placeholder.webp" alt="<?php esc_attr_e( 'Customer photo', 'my-block-theme' ); ?>" style="border-radius:9999px;object-fit:cover;width:48px;height:48px"/></figure>
        <!-- /wp:image -->

        <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","flexWrap":"nowrap"}} -->
        <div class="wp-block-group">
            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"}},"fontSize":"medium"} -->
            <p class="has-medium-font-size" style="font-weight:600"><?php esc_html_e( 'Jane Doe', 'my-block-theme' ); ?></p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"neutral-700","fontSize":"small","style":{"spacing":{"margin":{"top":"0"}}}} -->
            <p class="has-neutral-700-color has-text-color has-small-font-size" style="margin-top:0"><?php esc_html_e( 'CEO, Acme Corp', 'my-block-theme' ); ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
```

#### patterns/pricing-table.php

```php
<?php
/**
 * Title: Pricing Table
 * Slug: my-block-theme/pricing-table
 * Categories: mbt-features
 * Keywords: pricing, table, plans
 * Viewport Width: 1200
 */
?>
<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)">
    <!-- wp:heading {"textAlign":"center","fontSize":"xx-large"} -->
    <h2 class="wp-block-heading has-text-align-center has-xx-large-font-size"><?php esc_html_e( 'Simple Pricing', 'my-block-theme' ); ?></h2>
    <!-- /wp:heading -->

    <!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|50"},"margin":{"top":"var:preset|spacing|70"}}}} -->
    <div class="wp-block-columns" style="margin-top:var(--wp--preset--spacing--70)">
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}},"border":{"radius":"12px","width":"1px"}},"borderColor":"neutral-200"} -->
        <div class="wp-block-column has-border-color has-neutral-200-border-color" style="border-width:1px;border-radius:12px;padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--50)">
            <!-- wp:heading {"textAlign":"center","level":3} -->
            <h3 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'Starter', 'my-block-theme' ); ?></h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"2.5rem","fontWeight":"800"}}} -->
            <p class="has-text-align-center" style="font-size:2.5rem;font-weight:800"><?php esc_html_e( '$9/mo', 'my-block-theme' ); ?></p>
            <!-- /wp:paragraph -->
            <!-- wp:list -->
            <ul class="wp-block-list">
                <li><?php esc_html_e( '5 Projects', 'my-block-theme' ); ?></li>
                <li><?php esc_html_e( '10 GB Storage', 'my-block-theme' ); ?></li>
                <li><?php esc_html_e( 'Email Support', 'my-block-theme' ); ?></li>
            </ul>
            <!-- /wp:list -->
            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
            <div class="wp-block-buttons">
                <!-- wp:button {"className":"is-style-outline","width":100} -->
                <div class="wp-block-button has-custom-width wp-block-button__width-100 is-style-outline"><a class="wp-block-button__link wp-element-button"><?php esc_html_e( 'Choose Starter', 'my-block-theme' ); ?></a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}},"border":{"radius":"12px","width":"2px"}},"borderColor":"primary","backgroundColor":"neutral-50"} -->
        <div class="wp-block-column has-border-color has-primary-border-color has-neutral-50-background-color has-background" style="border-width:2px;border-radius:12px;padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--50)">
            <!-- wp:heading {"textAlign":"center","level":3} -->
            <h3 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'Pro', 'my-block-theme' ); ?></h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"2.5rem","fontWeight":"800"}},"textColor":"primary"} -->
            <p class="has-text-align-center has-primary-color has-text-color" style="font-size:2.5rem;font-weight:800"><?php esc_html_e( '$29/mo', 'my-block-theme' ); ?></p>
            <!-- /wp:paragraph -->
            <!-- wp:list -->
            <ul class="wp-block-list">
                <li><?php esc_html_e( 'Unlimited Projects', 'my-block-theme' ); ?></li>
                <li><?php esc_html_e( '100 GB Storage', 'my-block-theme' ); ?></li>
                <li><?php esc_html_e( 'Priority Support', 'my-block-theme' ); ?></li>
                <li><?php esc_html_e( 'Custom Domain', 'my-block-theme' ); ?></li>
            </ul>
            <!-- /wp:list -->
            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
            <div class="wp-block-buttons">
                <!-- wp:button {"backgroundColor":"primary","textColor":"white","width":100} -->
                <div class="wp-block-button has-custom-width wp-block-button__width-100"><a class="wp-block-button__link has-white-color has-primary-background-color has-text-color has-background wp-element-button"><?php esc_html_e( 'Choose Pro', 'my-block-theme' ); ?></a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->
```

### Pattern Registration via PHP (Alternative)

```php
function mbt_register_patterns() {
    register_block_pattern( 'my-block-theme/faq-accordion', array(
        'title'       => __( 'FAQ Accordion', 'my-block-theme' ),
        'description' => __( 'An expandable FAQ section.', 'my-block-theme' ),
        'categories'  => array( 'mbt-features' ),
        'keywords'    => array( 'faq', 'accordion', 'questions' ),
        'content'     => '<!-- wp:group {"layout":{"type":"constrained"}} -->
            <div class="wp-block-group">
                <!-- wp:details -->
                <details class="wp-block-details">
                    <summary>What is a block theme?</summary>
                    <!-- wp:paragraph -->
                    <p>A block theme is a WordPress theme built entirely with blocks, using HTML template files and theme.json for configuration.</p>
                    <!-- /wp:paragraph -->
                </details>
                <!-- /wp:details -->
                <!-- wp:details -->
                <details class="wp-block-details">
                    <summary>Do I need to know PHP?</summary>
                    <!-- wp:paragraph -->
                    <p>Basic PHP helps for functions.php and patterns, but most of the theme is built with block markup and JSON.</p>
                    <!-- /wp:paragraph -->
                </details>
                <!-- /wp:details -->
            </div>
            <!-- /wp:group -->',
    ) );
}
add_action( 'init', 'mbt_register_patterns' );
```

---

## 6. Template Parts & Templates

### Template Hierarchy in Block Themes

Block themes follow the same template hierarchy as classic themes, but with `.html` files in the `templates/` directory:

```
front-page.html → home.html → index.html
single-{post-type}-{slug}.html → single-{post-type}.html → single.html → singular.html → index.html
page-{slug}.html → page-{id}.html → page.html → singular.html → index.html
archive-{post-type}.html → archive.html → index.html
category-{slug}.html → category.html → archive.html → index.html
search.html → index.html
404.html → index.html
```

### templates/index.html (Required Fallback)

```html
<!-- wp:template-part {"slug":"header","area":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:query {"queryId":1,"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","inherit":true}} -->
    <div class="wp-block-query">
        <!-- wp:post-template {"layout":{"type":"default"}} -->
            <!-- wp:post-featured-image {"isLink":true,"aspectRatio":"16/9","style":{"border":{"radius":"8px"}}} /-->
            <!-- wp:post-title {"isLink":true,"fontSize":"x-large"} /-->
            <!-- wp:post-excerpt {"moreText":"Read More","excerptLength":30} /-->
            <!-- wp:post-date {"fontSize":"small"} /-->
            <!-- wp:spacer {"height":"var:preset|spacing|50"} -->
            <div style="height:var(--wp--preset--spacing--50)" aria-hidden="true" class="wp-block-spacer"></div>
            <!-- /wp:spacer -->
        <!-- /wp:post-template -->

        <!-- wp:query-pagination {"layout":{"type":"flex","justifyContent":"center"}} -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->

        <!-- wp:query-no-results -->
            <!-- wp:paragraph {"align":"center"} -->
            <p class="has-text-align-center">No posts found.</p>
            <!-- /wp:paragraph -->
        <!-- /wp:query-no-results -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","area":"footer"} /-->
```

### templates/single.html

```html
<!-- wp:template-part {"slug":"header","area":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}}} -->
    <div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
        <!-- wp:post-title {"level":1,"fontSize":"xxx-large"} /-->

        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}},"fontSize":"small"} -->
        <div class="wp-block-group has-small-font-size" style="margin-top:var(--wp--preset--spacing--30)">
            <!-- wp:post-date /-->
            <!-- wp:paragraph -->
            <p>·</p>
            <!-- /wp:paragraph -->
            <!-- wp:post-author-name {"isLink":true} /-->
            <!-- wp:paragraph -->
            <p>·</p>
            <!-- /wp:paragraph -->
            <!-- wp:post-terms {"term":"category"} /-->
        </div>
        <!-- /wp:group -->

        <!-- wp:post-featured-image {"aspectRatio":"21/9","style":{"border":{"radius":"12px"},"spacing":{"margin":{"top":"var:preset|spacing|60"}}}} /-->

        <!-- wp:post-content {"layout":{"type":"constrained"}} /-->

        <!-- wp:post-terms {"term":"post_tag","separator":"  ","style":{"spacing":{"margin":{"top":"var:preset|spacing|60"}}}} /-->

        <!-- wp:spacer {"height":"var:preset|spacing|70"} -->
        <div style="height:var(--wp--preset--spacing--70)" aria-hidden="true" class="wp-block-spacer"></div>
        <!-- /wp:spacer -->

        <!-- wp:template-part {"slug":"comments","area":"uncategorized"} /-->
    </div>
    <!-- /wp:group -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","area":"footer"} /-->
```

### templates/404.html

```html
<!-- wp:template-part {"slug":"header","area":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"padding":{"top":"var:preset|spacing|90","bottom":"var:preset|spacing|90"}}},"layout":{"type":"constrained","contentSize":"540px"}} -->
<main class="wp-block-group" style="padding-top:var(--wp--preset--spacing--90);padding-bottom:var(--wp--preset--spacing--90)">
    <!-- wp:heading {"textAlign":"center","level":1,"fontSize":"xxx-large"} -->
    <h1 class="wp-block-heading has-text-align-center has-xxx-large-font-size">404</h1>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center","fontSize":"large"} -->
    <p class="has-text-align-center has-large-font-size">The page you're looking for doesn't exist.</p>
    <!-- /wp:paragraph -->

    <!-- wp:search {"label":"Search","showLabel":false,"placeholder":"Search this site...","buttonText":"Search","buttonUseIcon":true,"style":{"spacing":{"margin":{"top":"var:preset|spacing|60"}}}} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","area":"footer"} /-->
```

### parts/header.html

```html
<!-- wp:group {"tagName":"header","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<header class="wp-block-group" style="padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--50)">
    <!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"wrap"}} -->
    <div class="wp-block-group">
        <!-- wp:site-title {"level":0,"style":{"typography":{"fontWeight":"700"}},"fontSize":"large"} /-->
        <!-- wp:navigation {"layout":{"type":"flex","justifyContent":"right"},"fontSize":"medium","style":{"typography":{"fontWeight":"500"}}} /-->
    </div>
    <!-- /wp:group -->
</header>
<!-- /wp:group -->
```

### parts/footer.html

```html
<!-- wp:group {"tagName":"footer","backgroundColor":"neutral-900","textColor":"neutral-200","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<footer class="wp-block-group has-neutral-200-color has-neutral-900-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">
    <!-- wp:columns -->
    <div class="wp-block-columns">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:site-title {"level":3,"textColor":"white"} /-->
            <!-- wp:paragraph {"textColor":"neutral-200","fontSize":"small"} -->
            <p class="has-neutral-200-color has-text-color has-small-font-size">Building modern websites with WordPress block themes.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":4,"textColor":"white","fontSize":"medium"} -->
            <h4 class="wp-block-heading has-white-color has-text-color has-medium-font-size">Quick Links</h4>
            <!-- /wp:heading -->
            <!-- wp:navigation {"textColor":"neutral-200","overlayMenu":"never","layout":{"type":"flex","orientation":"vertical"},"fontSize":"small"} /-->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:separator {"backgroundColor":"neutral-700","style":{"spacing":{"margin":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}}} -->
    <hr class="wp-block-separator has-text-color has-neutral-700-color has-alpha-channel-opacity has-neutral-700-background-color has-background" style="margin-top:var(--wp--preset--spacing--60);margin-bottom:var(--wp--preset--spacing--60)"/>
    <!-- /wp:separator -->

    <!-- wp:paragraph {"align":"center","textColor":"neutral-700","fontSize":"small"} -->
    <p class="has-text-align-center has-neutral-700-color has-text-color has-small-font-size">&copy; 2026 My Block Theme. All rights reserved.</p>
    <!-- /wp:paragraph -->
</footer>
<!-- /wp:group -->
```

---

## 7. Fluid Typography & Responsive Design

### theme.json Fluid Typography

Enable fluid typography globally and configure per font-size:

```json
{
    "settings": {
        "typography": {
            "fluid": true,
            "fontSizes": [
                {
                    "slug": "heading-1",
                    "size": "3.75rem",
                    "name": "Heading 1",
                    "fluid": {
                        "min": "2.25rem",
                        "max": "3.75rem"
                    }
                }
            ]
        }
    }
}
```

WordPress generates this CSS automatically:

```css
/* Generated from fluid font size settings */
--wp--preset--font-size--heading-1: clamp(2.25rem, 2.25rem + ((1vw - 0.2rem) * 1.875), 3.75rem);
```

### Manual clamp() Patterns

When you need finer control beyond theme.json fluid settings:

```css
/* Fluid heading — scales from 2rem at 320px to 4rem at 1200px */
h1 {
    font-size: clamp(2rem, 1.09rem + 4.55vw, 4rem);
}

/* Fluid spacing — section padding scales with viewport */
.section-hero {
    padding-block: clamp(3rem, 2rem + 5vw, 8rem);
}

/* Fluid container width — never smaller than 280px, never larger than 1200px */
.container {
    width: min(100% - 2rem, 1200px);
    margin-inline: auto;
}

/* Fluid gap between grid items */
.grid {
    gap: clamp(1rem, 0.5rem + 2vw, 2.5rem);
}
```

### Fluid Spacing with spacingScale in theme.json

```json
{
    "settings": {
        "spacing": {
            "spacingScale": {
                "operator": "*",
                "increment": 1.5,
                "steps": 7,
                "mediumStep": 1.5,
                "unit": "rem"
            }
        }
    }
}
```

This auto-generates spacing sizes: 0.44rem, 0.67rem, 1rem, 1.5rem, 2.25rem, 3.38rem, 5.06rem.

### Responsive Block Layouts

```css
/* Container queries for blocks (modern approach) */
.wp-block-group {
    container-type: inline-size;
}

@container (max-width: 600px) {
    .wp-block-columns {
        flex-direction: column;
    }
}

@container (min-width: 601px) {
    .wp-block-columns {
        flex-direction: row;
    }
}

/* Responsive grid using min() */
.wp-block-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
    gap: var(--wp--preset--spacing--50);
}
```

### Mobile-First Approach

ALWAYS design mobile-first in block themes. WordPress blocks are inherently responsive, but you MUST ensure:

1. Stack columns on small screens (WordPress handles this by default)
2. Use fluid font sizes via theme.json `fluid` property
3. Use relative spacing units (rem, em, %) in theme.json
4. Set `useRootPaddingAwareAlignments: true` for consistent edge-to-edge layouts
5. Test at 320px, 768px, 1024px, and 1440px viewports minimum

---

## 8. Block Editor Customization

### Editor Styles

```php
// functions.php
function mbt_editor_styles() {
    add_theme_support( 'editor-styles' );
    add_editor_style( array(
        'assets/css/editor-style.css',
        'assets/css/tailwind.css',
    ) );
}
add_action( 'after_setup_theme', 'mbt_editor_styles' );
```

### Custom Block Categories

```php
function mbt_block_categories( $categories ) {
    return array_merge(
        array(
            array(
                'slug'  => 'mbt-blocks',
                'title' => __( 'My Theme Blocks', 'my-block-theme' ),
                'icon'  => 'star-filled',
            ),
        ),
        $categories
    );
}
add_filter( 'block_categories_all', 'mbt_block_categories' );
```

### Custom Block Styles

```php
// inc/block-styles.php
function mbt_register_block_styles() {
    register_block_style( 'core/button', array(
        'name'  => 'mbt-pill',
        'label' => __( 'Pill', 'my-block-theme' ),
    ) );

    register_block_style( 'core/group', array(
        'name'  => 'mbt-card',
        'label' => __( 'Card', 'my-block-theme' ),
    ) );

    register_block_style( 'core/image', array(
        'name'  => 'mbt-rounded',
        'label' => __( 'Rounded', 'my-block-theme' ),
    ) );

    register_block_style( 'core/separator', array(
        'name'  => 'mbt-dashed',
        'label' => __( 'Dashed', 'my-block-theme' ),
    ) );
}
add_action( 'init', 'mbt_register_block_styles' );
```

Corresponding CSS:

```css
/* assets/css/blocks/styles.css */
.is-style-mbt-pill .wp-block-button__link {
    border-radius: 9999px;
}

.is-style-mbt-card {
    border: 1px solid var(--wp--preset--color--neutral-200);
    border-radius: var(--wp--custom--border-radius--lg);
    padding: var(--wp--preset--spacing--60);
    box-shadow: var(--wp--preset--shadow--md);
}

.is-style-mbt-rounded img {
    border-radius: var(--wp--custom--border-radius--lg);
}

.is-style-mbt-dashed {
    border-top-style: dashed;
}
```

### Allowed Blocks Filtering

```php
function mbt_allowed_blocks( $allowed_blocks, $editor_context ) {
    if ( 'page' === $editor_context->post->post_type ) {
        // Restrict blocks available on pages
        return array(
            'core/paragraph',
            'core/heading',
            'core/image',
            'core/gallery',
            'core/list',
            'core/list-item',
            'core/quote',
            'core/button',
            'core/buttons',
            'core/group',
            'core/columns',
            'core/column',
            'core/cover',
            'core/separator',
            'core/spacer',
            'core/shortcode',
            'core/html',
            'mbt/feature-card',
        );
    }
    return $allowed_blocks;
}
add_filter( 'allowed_block_types_all', 'mbt_allowed_blocks', 10, 2 );
```

### Format API — Custom RichText Formats

```js
import { registerFormatType, toggleFormat } from '@wordpress/rich-text';
import { RichTextToolbarButton } from '@wordpress/block-editor';

const HighlightButton = ( { isActive, onChange, value } ) => (
    <RichTextToolbarButton
        icon="admin-customizer"
        title="Highlight"
        isActive={ isActive }
        onClick={ () => {
            onChange(
                toggleFormat( value, {
                    type: 'mbt/highlight',
                } )
            );
        } }
    />
);

registerFormatType( 'mbt/highlight', {
    title: 'Highlight',
    tagName: 'mark',
    className: 'mbt-highlight',
    edit: HighlightButton,
} );
```

### Block Transforms

```js
import { createBlock } from '@wordpress/blocks';

// In block registration
transforms: {
    from: [
        {
            type: 'block',
            blocks: [ 'core/paragraph' ],
            transform: ( { content } ) => {
                return createBlock( 'mbt/callout', {
                    content,
                } );
            },
        },
    ],
    to: [
        {
            type: 'block',
            blocks: [ 'core/paragraph' ],
            transform: ( { content } ) => {
                return createBlock( 'core/paragraph', {
                    content,
                } );
            },
        },
    ],
},
```

---

## 9. Performance in Block Themes

### Conditional Asset Loading (Per-Block CSS/JS)

ALWAYS use `wp_enqueue_block_style()` to load CSS only when a block is present on the page:

```php
function mbt_block_styles() {
    $blocks = array(
        'button'    => 'button',
        'quote'     => 'quote',
        'code'      => 'code',
        'table'     => 'table',
        'navigation'=> 'navigation',
        'cover'     => 'cover',
    );

    foreach ( $blocks as $block => $file ) {
        wp_enqueue_block_style( "core/{$block}", array(
            'handle' => "mbt-{$file}-style",
            'src'    => MBT_URI . "/assets/css/blocks/{$file}.css",
            'ver'    => MBT_VERSION,
            'path'   => MBT_DIR . "/assets/css/blocks/{$file}.css",
        ) );
    }
}
add_action( 'init', 'mbt_block_styles' );
```

### Local Font Optimization

ALWAYS serve fonts locally via theme.json `fontFace` with `file:./` paths. NEVER load fonts from Google Fonts CDN in production block themes — it adds a render-blocking external request.

```json
{
    "fontFace": [
        {
            "fontFamily": "Inter",
            "fontWeight": "400 700",
            "fontDisplay": "swap",
            "fontStyle": "normal",
            "src": ["file:./assets/fonts/inter/Inter-Variable.woff2"]
        }
    ]
}
```

### Image Optimization

```php
// Enable WebP uploads
function mbt_allow_webp( $mimes ) {
    $mimes['webp'] = 'image/webp';
    $mimes['avif'] = 'image/avif';
    return $mimes;
}
add_filter( 'upload_mimes', 'mbt_allow_webp' );

// Add fetchpriority to hero images
function mbt_add_fetchpriority( $attr, $attachment, $size ) {
    if ( is_singular() && has_post_thumbnail() ) {
        $attr['fetchpriority'] = 'high';
    }
    return $attr;
}
add_filter( 'wp_get_attachment_image_attributes', 'mbt_add_fetchpriority', 10, 3 );
```

### Minimal JS Approach

Block themes should ship minimal JavaScript. ALWAYS:

1. Use the Interactivity API for frontend interactions instead of jQuery
2. Use `viewScriptModule` in block.json (ES modules, not legacy scripts)
3. Load scripts with `defer` or `async` attributes
4. NEVER enqueue jQuery unless a specific legacy feature requires it

### render_block Filter for Optimization

```php
// Add lazy loading to all images in post content
function mbt_optimize_block_images( $block_content, $block ) {
    if ( 'core/image' === $block['blockName'] ) {
        // WordPress 5.5+ adds loading="lazy" by default
        // Add decoding="async" for better performance
        $block_content = str_replace( '<img ', '<img decoding="async" ', $block_content );
    }
    return $block_content;
}
add_filter( 'render_block', 'mbt_optimize_block_images', 10, 2 );
```

---

## 10. WordPress Interactivity API

The Interactivity API is the WordPress-native way to add frontend interactivity without jQuery or external frameworks. You MUST use it for all interactive blocks in modern themes.

### Setup in block.json

```json
{
    "supports": {
        "interactivity": true
    },
    "viewScriptModule": "file:./view.js"
}
```

### Interactive Accordion Example

**render.php:**

```php
<?php
$items = array(
    array(
        'question' => __( 'What is a block theme?', 'my-block-theme' ),
        'answer'   => __( 'A block theme uses blocks for all parts of the site, from headers to footers.', 'my-block-theme' ),
    ),
    array(
        'question' => __( 'Do I need coding skills?', 'my-block-theme' ),
        'answer'   => __( 'Basic knowledge helps, but the Site Editor lets you build visually.', 'my-block-theme' ),
    ),
    array(
        'question' => __( 'Is it fast?', 'my-block-theme' ),
        'answer'   => __( 'Block themes are optimized for performance with minimal CSS and JS.', 'my-block-theme' ),
    ),
);

$wrapper_attributes = get_block_wrapper_attributes( array(
    'class' => 'mbt-accordion',
) );
?>

<div
    <?php echo $wrapper_attributes; ?>
    data-wp-interactive="mbt/accordion"
>
    <?php foreach ( $items as $index => $item ) : ?>
        <div
            class="mbt-accordion__item"
            data-wp-context='<?php echo wp_json_encode( array( 'isOpen' => false, 'index' => $index ) ); ?>'
        >
            <button
                class="mbt-accordion__trigger"
                data-wp-on--click="actions.toggle"
                data-wp-bind--aria-expanded="context.isOpen"
                aria-controls="accordion-panel-<?php echo esc_attr( $index ); ?>"
            >
                <span class="mbt-accordion__title">
                    <?php echo esc_html( $item['question'] ); ?>
                </span>
                <span
                    class="mbt-accordion__icon"
                    data-wp-class--is-open="context.isOpen"
                    aria-hidden="true"
                >+</span>
            </button>
            <div
                id="accordion-panel-<?php echo esc_attr( $index ); ?>"
                class="mbt-accordion__panel"
                role="region"
                data-wp-bind--hidden="!context.isOpen"
                data-wp-class--is-visible="context.isOpen"
            >
                <p><?php echo esc_html( $item['answer'] ); ?></p>
            </div>
        </div>
    <?php endforeach; ?>
</div>
```

**view.js:**

```js
import { store, getContext } from '@wordpress/interactivity';

store( 'mbt/accordion', {
    actions: {
        toggle: () => {
            const context = getContext();
            context.isOpen = ! context.isOpen;
        },
    },
} );
```

### Interactive Tabs Example

**render.php:**

```php
<?php
$tabs = array(
    array( 'id' => 'features', 'label' => __( 'Features', 'my-block-theme' ), 'content' => __( 'Our theme includes fluid typography, custom blocks, and full site editing.', 'my-block-theme' ) ),
    array( 'id' => 'pricing', 'label' => __( 'Pricing', 'my-block-theme' ), 'content' => __( 'Free for personal use. Pro license starts at $49/year.', 'my-block-theme' ) ),
    array( 'id' => 'support', 'label' => __( 'Support', 'my-block-theme' ), 'content' => __( 'Get help via our community forums or priority email support.', 'my-block-theme' ) ),
);

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'mbt-tabs' ) );
?>

<div
    <?php echo $wrapper_attributes; ?>
    data-wp-interactive="mbt/tabs"
    data-wp-context='<?php echo wp_json_encode( array( 'activeTab' => 'features' ) ); ?>'
>
    <div class="mbt-tabs__nav" role="tablist">
        <?php foreach ( $tabs as $tab ) : ?>
            <button
                role="tab"
                class="mbt-tabs__trigger"
                data-wp-on--click="actions.selectTab"
                data-wp-context='<?php echo wp_json_encode( array( 'tabId' => $tab['id'] ) ); ?>'
                data-wp-class--is-active="state.isActiveTab"
                data-wp-bind--aria-selected="state.isActiveTab"
            >
                <?php echo esc_html( $tab['label'] ); ?>
            </button>
        <?php endforeach; ?>
    </div>

    <?php foreach ( $tabs as $tab ) : ?>
        <div
            role="tabpanel"
            class="mbt-tabs__panel"
            data-wp-context='<?php echo wp_json_encode( array( 'tabId' => $tab['id'] ) ); ?>'
            data-wp-bind--hidden="!state.isActiveTab"
        >
            <p><?php echo esc_html( $tab['content'] ); ?></p>
        </div>
    <?php endforeach; ?>
</div>
```

**view.js:**

```js
import { store, getContext } from '@wordpress/interactivity';

const { state } = store( 'mbt/tabs', {
    state: {
        get isActiveTab() {
            const { activeTab } = getContext();
            const { tabId } = getContext();
            return activeTab === tabId;
        },
    },
    actions: {
        selectTab: () => {
            const ctx = getContext();
            // Walk up to parent context to set activeTab
            // The tabId comes from the button's own context
            ctx.activeTab = ctx.tabId;
        },
    },
} );
```

### Interactive Modal Example

**render.php:**

```php
<?php
$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'mbt-modal-wrapper' ) );
?>

<div
    <?php echo $wrapper_attributes; ?>
    data-wp-interactive="mbt/modal"
    data-wp-context='<?php echo wp_json_encode( array( 'isOpen' => false ) ); ?>'
>
    <button
        class="mbt-modal__trigger btn-primary"
        data-wp-on--click="actions.open"
    >
        <?php esc_html_e( 'Open Modal', 'my-block-theme' ); ?>
    </button>

    <div
        class="mbt-modal__overlay"
        data-wp-class--is-visible="context.isOpen"
        data-wp-on--click="actions.close"
        data-wp-bind--aria-hidden="!context.isOpen"
    >
        <div
            class="mbt-modal__content"
            role="dialog"
            aria-modal="true"
            data-wp-on--click="actions.stopPropagation"
            data-wp-bind--aria-hidden="!context.isOpen"
        >
            <button
                class="mbt-modal__close"
                data-wp-on--click="actions.close"
                aria-label="<?php esc_attr_e( 'Close modal', 'my-block-theme' ); ?>"
            >&times;</button>

            <h2><?php esc_html_e( 'Modal Title', 'my-block-theme' ); ?></h2>
            <p><?php esc_html_e( 'This is an interactive modal built with the WordPress Interactivity API.', 'my-block-theme' ); ?></p>
        </div>
    </div>
</div>
```

**view.js:**

```js
import { store, getContext } from '@wordpress/interactivity';

store( 'mbt/modal', {
    actions: {
        open: () => {
            const context = getContext();
            context.isOpen = true;
            document.body.style.overflow = 'hidden';
        },
        close: () => {
            const context = getContext();
            context.isOpen = false;
            document.body.style.overflow = '';
        },
        stopPropagation: ( event ) => {
            event.stopPropagation();
        },
    },
} );
```

### Interactivity API Directive Reference

| Directive | Purpose | Syntax |
|-----------|---------|--------|
| `data-wp-interactive` | Activate API, set namespace | `data-wp-interactive="namespace"` |
| `data-wp-context` | Local reactive state (JSON) | `data-wp-context='{"key":"val"}'` |
| `data-wp-bind--attr` | Bind HTML attribute to state | `data-wp-bind--hidden="!context.isOpen"` |
| `data-wp-on--event` | Attach event handler | `data-wp-on--click="actions.toggle"` |
| `data-wp-text` | Set inner text from state | `data-wp-text="context.label"` |
| `data-wp-class--name` | Toggle CSS class | `data-wp-class--active="state.isActive"` |
| `data-wp-style--prop` | Set inline CSS property | `data-wp-style--color="context.color"` |
| `data-wp-watch` | Run callback on state change | `data-wp-watch="callbacks.log"` |
| `data-wp-init` | Run once on DOM insert | `data-wp-init="callbacks.setup"` |
| `data-wp-run` | Run on render (supports hooks) | `data-wp-run="callbacks.onRender"` |
| `data-wp-each` | Iterate over array | `data-wp-each="context.items"` on `<template>` |

---

## 11. Customizable Theme Options

Block themes use theme.json and the Site Editor for ALL customization. You MUST NOT use the legacy Customizer API for block themes.

### All Options via theme.json

Users customize these directly in the Site Editor (Appearance > Editor > Styles):

- **Colors**: Edit the entire color palette. Users can modify any preset color.
- **Typography**: Change font families, sizes, weights, line heights per element.
- **Spacing**: Adjust block gap, padding, and margins globally or per block.
- **Layout**: Modify content width and wide width.
- **Borders**: Configure radius, color, width, style per block.
- **Shadows**: Apply and customize shadow presets.

### Style Variations

Ship multiple design presets by adding JSON files to a `styles/` directory:

```
theme/
└── styles/
    ├── dark.json
    ├── warm.json
    └── minimal.json
```

**styles/dark.json:**

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "title": "Dark",
    "settings": {
        "color": {
            "palette": [
                { "slug": "primary", "color": "#818cf8", "name": "Primary" },
                { "slug": "neutral-900", "color": "#0f172a", "name": "Neutral 900" },
                { "slug": "neutral-50", "color": "#e2e8f0", "name": "Neutral 50" },
                { "slug": "white", "color": "#1e293b", "name": "Background" }
            ]
        }
    },
    "styles": {
        "color": {
            "background": "#0f172a",
            "text": "#e2e8f0"
        },
        "elements": {
            "heading": {
                "color": { "text": "#f8fafc" }
            },
            "link": {
                "color": { "text": "#818cf8" }
            }
        }
    }
}
```

### Block-Level Setting Overrides

Control which features are available per block type:

```json
{
    "settings": {
        "blocks": {
            "core/paragraph": {
                "color": {
                    "custom": false,
                    "palette": []
                }
            },
            "core/heading": {
                "typography": {
                    "fontSizes": [
                        { "slug": "large", "size": "1.5rem", "name": "Large" },
                        { "slug": "x-large", "size": "2rem", "name": "XL" }
                    ]
                }
            }
        }
    }
}
```

---

## 12. Theme QA Checklist

### Theme Check Plugin Compliance

- [ ] Pass Theme Check plugin with zero errors
- [ ] Include required `style.css` header with all fields
- [ ] Include `templates/index.html` (required for block themes)
- [ ] Include a valid `theme.json` with version 3
- [ ] Use proper text domain in all translatable strings
- [ ] No PHP errors, warnings, or notices
- [ ] License is GPL-2.0-or-later compatible

### WordPress.org Theme Review Requirements

- [ ] No hardcoded content — use patterns with `esc_html_e()` for translatable text
- [ ] No external resource loading from CDNs (fonts, scripts)
- [ ] All assets included locally within the theme
- [ ] No upselling or advertising in the theme
- [ ] Screenshot is 1200x900px, shows the theme accurately
- [ ] readme.txt includes credits, resources, and license info
- [ ] Escape ALL output: `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`
- [ ] Sanitize ALL input before saving

### Accessibility (a11y) Requirements

- [ ] Color contrast ratio meets WCAG 2.1 AA (4.5:1 for text, 3:1 for large text)
- [ ] All interactive elements are keyboard navigable
- [ ] Focus styles are visible and clear (NEVER use `outline: none` without replacement)
- [ ] Images have meaningful `alt` text or `alt=""` for decorative images
- [ ] ARIA attributes are used correctly (`aria-expanded`, `aria-hidden`, `role`)
- [ ] Skip navigation link is present
- [ ] Form inputs have associated `<label>` elements
- [ ] Heading hierarchy is sequential (h1 > h2 > h3, no skipping)
- [ ] Semantic HTML is used (header, nav, main, footer, article, section)

### Internationalization (i18n)

- [ ] All visible strings wrapped in `__()`, `_e()`, `esc_html__()`, or `esc_html_e()`
- [ ] Text domain matches theme slug
- [ ] Placeholders use `sprintf()` with translator comments
- [ ] No string concatenation for translatable text
- [ ] Date/time formatted with `wp_date()` or `date_i18n()`

### RTL Support

- [ ] Use logical CSS properties (`margin-inline-start` vs `margin-left`)
- [ ] Use `padding-inline` / `margin-inline` in theme.json where possible
- [ ] Test with RTL languages (Arabic, Hebrew)
- [ ] No hardcoded directional values that break in RTL

### Browser Compatibility

- [ ] Chrome (last 2 versions)
- [ ] Firefox (last 2 versions)
- [ ] Safari (last 2 versions)
- [ ] Edge (last 2 versions)
- [ ] iOS Safari (last 2 versions)
- [ ] Samsung Internet (last 2 versions)

### Performance Benchmarks

- [ ] Lighthouse Performance score: 90+
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID/INP (Interaction to Next Paint): < 200ms
- [ ] CLS (Cumulative Layout Shift): < 0.1
- [ ] Total CSS < 50KB (gzipped)
- [ ] Total JS < 30KB (gzipped) — aim for zero JS when possible
- [ ] No render-blocking resources in `<head>`
- [ ] Fonts use `font-display: swap`

---

## 13. Golden Rules

1. **theme.json is your design system.** ALWAYS define colors, fonts, sizes, spacing, and shadows in theme.json. NEVER hardcode raw values in CSS when a preset exists.

2. **Block markup ONLY in templates.** Template `.html` files contain ONLY WordPress block comments (`<!-- wp:blockname -->`). NEVER put raw HTML, PHP, or Tailwind classes in template files.

3. **Patterns for design, templates for structure.** Use patterns for reusable design sections (heroes, CTAs, features). Use templates for page structure. NEVER blur these responsibilities.

4. **Local fonts, ALWAYS.** Serve fonts from `assets/fonts/` via theme.json `fontFace`. NEVER load from Google Fonts CDN or any external source.

5. **Per-block CSS loading.** Use `wp_enqueue_block_style()` for block-specific styles. NEVER dump all styles in a single monolithic stylesheet. Load CSS only when the block exists on the page.

6. **Interactivity API for JS.** Use the WordPress Interactivity API for ALL frontend interactions. NEVER use jQuery in block themes. NEVER enqueue React on the frontend — it is for the editor only.

7. **Escape everything.** Use `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()` for ALL output. NEVER echo raw unsanitized user data.

8. **Translate everything.** Wrap ALL user-facing strings in `__()` or `esc_html_e()`. NEVER hardcode English strings without translation wrappers.

9. **Fluid typography by default.** Enable `"fluid": true` in theme.json typography settings. Define `min` and `max` for every font size. NEVER use fixed pixel font sizes.

10. **Mobile-first responsive design.** Set `useRootPaddingAwareAlignments: true`. Use relative units. Test at 320px minimum. WordPress blocks handle most responsive behavior automatically — do NOT fight it.

11. **Accessibility is non-negotiable.** Meet WCAG 2.1 AA minimum. Use semantic HTML. Ensure keyboard navigation. Maintain visible focus styles. Test with screen readers.

12. **Version 3 schema only.** ALWAYS use `"version": 3` in theme.json. This is the current standard for WordPress 6.6+. NEVER use version 1 or 2 in new themes.

13. **Dynamic blocks for live data.** Use `render.php` (server-side rendering) for blocks that display dynamic content (dates, post data, user-specific content). Use static `save.js` only for truly static content.

14. **Style variations for flexibility.** Ship multiple style variations in a `styles/` directory (dark mode, alternative color schemes). This gives users choice without requiring code changes.

15. **Test with Theme Check.** Run the Theme Check plugin before EVERY release. Fix ALL warnings, not just errors. A clean Theme Check report is the minimum bar for quality.
