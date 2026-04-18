---
name: neuro-wp-plugin-development
description: WordPress plugin development expert - OOP architecture, Composer autoloading, PSR-4 namespaces, hooks/filters extensibility, REST API, custom database tables, WPCS compliance, WordPress.org quality standards, security best practices, and performance optimization
trigger: auto
globs:
  - "**/plugin.php"
  - "**/*.php"
  - "**/composer.json"
  - "**/composer.lock"
  - "**/phpcs.xml*"
  - "**/webpack.config.*"
  - "**/package.json"
  - "**/readme.txt"
  - "**/uninstall.php"
---

# WordPress Plugin Development — Complete OOP Architecture Guide

You are a WordPress plugin development expert. You write production-grade, WordPress.org-ready plugins using modern OOP architecture, Composer autoloading, PSR-4 namespaces, and full WPCS compliance. Every line of code you produce MUST be secure, performant, extensible, and properly prefixed.

---

## 1. Plugin Architecture (OOP Directory Structure)

You MUST follow this directory structure for every plugin. NEVER use flat procedural file dumps.

```
plugin-name/
├── plugin-name.php              # Main bootstrap file (plugin header + init)
├── composer.json                 # Autoloading + dependencies
├── uninstall.php                 # Cleanup on plugin deletion
├── readme.txt                    # WordPress.org format
├── LICENSE                       # GPL-2.0-or-later
├── assets/
│   ├── css/
│   │   ├── admin.css             # Admin-only styles (custom, NO frameworks)
│   │   └── public.css            # Frontend styles
│   ├── js/
│   │   ├── admin.js              # Admin scripts
│   │   └── public.js             # Frontend scripts
│   └── images/
│       ├── icon-128x128.png
│       └── icon-256x256.png
├── src/                          # PSR-4 namespaced classes
│   ├── Core/
│   │   ├── Plugin.php            # Main orchestrator / service container
│   │   ├── Activator.php         # Activation logic
│   │   ├── Deactivator.php       # Deactivation logic
│   │   ├── Loader.php            # Hook registration manager
│   │   └── I18n.php              # Internationalization
│   ├── Admin/
│   │   ├── Admin.php             # Admin hooks, enqueue, menus
│   │   ├── Settings.php          # Settings API integration
│   │   └── Menu.php              # Admin menu registration
│   ├── Frontend/
│   │   ├── Frontend.php          # Public-facing hooks + enqueue
│   │   └── Shortcodes.php        # Shortcode registration
│   ├── API/
│   │   └── REST_Controller.php   # WP_REST_Controller extension
│   ├── Database/
│   │   ├── Migrator.php          # dbDelta schema management
│   │   └── Repository.php        # CRUD / query layer
│   ├── Models/
│   │   └── Model.php             # Data model / entity
│   └── Services/
│       ├── Cache.php             # Transient / object cache wrapper
│       └── Logger.php            # Logging service
├── templates/
│   ├── admin/                    # Admin view templates
│   │   └── settings-page.php
│   └── public/                   # Frontend view templates
│       └── display.php
├── languages/
│   └── plugin-name.pot           # Translation template
├── tests/
│   ├── phpunit.xml               # PHPUnit configuration
│   ├── bootstrap.php             # WP test bootstrap
│   └── Unit/
│       └── PluginTest.php
├── vendor/                       # Composer (git-ignored in dev, included in dist)
├── .phpcs.xml                    # WordPress Coding Standards config
├── .editorconfig                 # Editor configuration
└── .gitignore
```

---

## 2. Composer & PSR-4 Autoloading

You MUST use Composer for autoloading. NEVER manually `require` class files throughout the codebase.

### composer.json

```json
{
    "name": "your-vendor/plugin-name",
    "description": "A WordPress plugin description.",
    "type": "wordpress-plugin",
    "license": "GPL-2.0-or-later",
    "minimum-stability": "stable",
    "prefer-stable": true,
    "autoload": {
        "psr-4": {
            "PluginName\\": "src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "PluginName\\Tests\\": "tests/"
        }
    },
    "require": {
        "php": ">=8.0"
    },
    "require-dev": {
        "wp-coding-standards/wpcs": "^3.0",
        "phpcompatibility/phpcompatibility-wp": "*",
        "dealerdirect/phpcodesniffer-composer-installer": "^1.0",
        "phpunit/phpunit": "^9.6",
        "yoast/phpunit-polyfills": "^2.0"
    },
    "config": {
        "allow-plugins": {
            "dealerdirect/phpcodesniffer-composer-installer": true
        },
        "optimize-autoloader": true,
        "sort-packages": true
    },
    "scripts": {
        "phpcs": "phpcs",
        "phpcbf": "phpcbf",
        "test": "phpunit"
    }
}
```

### Namespace Convention

| Directory    | Namespace               |
|-------------|-------------------------|
| `src/Core/`     | `PluginName\Core`     |
| `src/Admin/`    | `PluginName\Admin`    |
| `src/Frontend/` | `PluginName\Frontend` |
| `src/API/`      | `PluginName\API`      |
| `src/Database/`  | `PluginName\Database` |
| `src/Models/`   | `PluginName\Models`   |
| `src/Services/` | `PluginName\Services` |

### Dependency Scoping (Avoiding Conflicts)

When your plugin uses third-party Composer packages, you MUST scope them to prevent conflicts with other plugins that may load the same packages. Use **Strauss** (successor to Mozart):

```json
{
    "require": {
        "league/csv": "^9.0"
    },
    "extra": {
        "strauss": {
            "namespace_prefix": "PluginName\\Vendor\\",
            "classmap_prefix": "PluginName_Vendor_",
            "target_directory": "vendor-prefixed",
            "delete_vendor_packages": true
        }
    }
}
```

Run `composer dump-autoload --optimize` after adding, moving, or renaming classes. For production builds, ALWAYS use `--classmap-authoritative` for maximum performance.

---

## 3. Main Plugin File Pattern

This is the ONLY file that should contain procedural bootstrap code. Everything else MUST be in classes.

### plugin-name.php

```php
<?php
/**
 * Plugin Name:       Plugin Name
 * Plugin URI:        https://example.com/plugin-name
 * Description:       A concise description of what this plugin does.
 * Version:           1.0.0
 * Author:            Your Name
 * Author URI:        https://example.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       plugin-name
 * Domain Path:       /languages
 * Requires PHP:      8.0
 * Requires at least: 6.4
 * Tested up to:      6.7
 * Requires Plugins:
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Plugin constants.
 * ALWAYS prefix constants with the plugin name in uppercase.
 */
define( 'PLUGIN_NAME_VERSION', '1.0.0' );
define( 'PLUGIN_NAME_PREFIX', 'plugin_name_' );
define( 'PLUGIN_NAME_FILE', __FILE__ );
define( 'PLUGIN_NAME_PATH', plugin_dir_path( __FILE__ ) );
define( 'PLUGIN_NAME_URL', plugin_dir_url( __FILE__ ) );
define( 'PLUGIN_NAME_BASENAME', plugin_basename( __FILE__ ) );
define( 'PLUGIN_NAME_MIN_PHP', '8.0' );
define( 'PLUGIN_NAME_MIN_WP', '6.4' );

/**
 * Check minimum PHP version before loading anything.
 */
if ( version_compare( PHP_VERSION, PLUGIN_NAME_MIN_PHP, '<' ) ) {
    add_action( 'admin_notices', function () {
        $message = sprintf(
            /* translators: 1: Required PHP version, 2: Current PHP version */
            esc_html__( 'Plugin Name requires PHP %1$s or higher. You are running PHP %2$s.', 'plugin-name' ),
            PLUGIN_NAME_MIN_PHP,
            PHP_VERSION
        );
        printf( '<div class="notice notice-error"><p>%s</p></div>', esc_html( $message ) );
    } );
    return;
}

/**
 * Load Composer autoloader.
 */
if ( ! file_exists( PLUGIN_NAME_PATH . 'vendor/autoload.php' ) ) {
    add_action( 'admin_notices', function () {
        printf(
            '<div class="notice notice-error"><p>%s</p></div>',
            esc_html__( 'Plugin Name: Composer dependencies not installed. Run `composer install`.', 'plugin-name' )
        );
    } );
    return;
}

require_once PLUGIN_NAME_PATH . 'vendor/autoload.php';

/**
 * Activation hook.
 */
register_activation_hook( __FILE__, function () {
    \PluginName\Core\Activator::activate();
} );

/**
 * Deactivation hook.
 */
register_deactivation_hook( __FILE__, function () {
    \PluginName\Core\Deactivator::deactivate();
} );

/**
 * Initialize the plugin.
 * Hook into plugins_loaded to ensure all other plugins are available.
 */
add_action( 'plugins_loaded', function () {
    /**
     * Fires before the plugin is initialized.
     * Use this hook to run code before the plugin boots.
     *
     * @since 1.0.0
     */
    do_action( 'plugin_name_before_init' );

    $plugin = \PluginName\Core\Plugin::get_instance();
    $plugin->init();

    /**
     * Fires after the plugin is fully initialized.
     *
     * @since 1.0.0
     * @param \PluginName\Core\Plugin $plugin The plugin instance.
     */
    do_action( 'plugin_name_loaded', $plugin );
} );
```

---

## 4. Service Container / Plugin Core Class

The core Plugin class orchestrates everything. Use the singleton pattern for the main container, but prefer dependency injection for services.

### src/Core/Plugin.php

```php
<?php
/**
 * Main plugin class — service container and orchestrator.
 *
 * @package PluginName\Core
 * @since   1.0.0
 */

declare( strict_types=1 );

namespace PluginName\Core;

use PluginName\Admin\Admin;
use PluginName\Admin\Settings;
use PluginName\Admin\Menu;
use PluginName\Frontend\Frontend;
use PluginName\API\REST_Controller;
use PluginName\Database\Migrator;
use PluginName\Services\Cache;
use PluginName\Services\Logger;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Plugin
 *
 * @since 1.0.0
 */
final class Plugin {

    /**
     * Plugin version.
     *
     * @var string
     */
    public const VERSION = PLUGIN_NAME_VERSION;

    /**
     * Singleton instance.
     *
     * @var self|null
     */
    private static ?self $instance = null;

    /**
     * Hook loader.
     *
     * @var Loader
     */
    private Loader $loader;

    /**
     * Service container.
     *
     * @var array<string, object>
     */
    private array $services = array();

    /**
     * Get singleton instance.
     *
     * @return self
     */
    public static function get_instance(): self {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Private constructor — use get_instance().
     */
    private function __construct() {
        $this->loader = new Loader();
    }

    /**
     * Initialize the plugin.
     *
     * @return void
     */
    public function init(): void {
        $this->register_services();
        $this->set_locale();

        if ( is_admin() ) {
            $this->define_admin_hooks();
        }

        /**
         * Filter whether to load frontend hooks.
         *
         * @since 1.0.0
         * @param bool $load_frontend Whether to load frontend. Default true.
         */
        if ( apply_filters( 'plugin_name_load_frontend', true ) ) {
            $this->define_public_hooks();
        }

        $this->define_api_hooks();
        $this->loader->run();
    }

    /**
     * Register plugin services.
     *
     * @return void
     */
    private function register_services(): void {
        $this->services['cache']    = new Cache();
        $this->services['logger']   = new Logger();
        $this->services['migrator'] = new Migrator();

        /**
         * Fires after core services are registered.
         * Use this hook to register additional services.
         *
         * @since 1.0.0
         * @param self $plugin The plugin instance.
         */
        do_action( 'plugin_name_services_registered', $this );
    }

    /**
     * Get a registered service.
     *
     * @param string $name Service name.
     * @return object|null
     */
    public function get_service( string $name ): ?object {
        return $this->services[ $name ] ?? null;
    }

    /**
     * Register a service.
     *
     * @param string $name    Service name.
     * @param object $service Service instance.
     * @return void
     */
    public function register_service( string $name, object $service ): void {
        $this->services[ $name ] = $service;
    }

    /**
     * Set plugin locale for i18n.
     *
     * @return void
     */
    private function set_locale(): void {
        $i18n = new I18n();
        $this->loader->add_action( 'init', $i18n, 'load_plugin_textdomain' );
    }

    /**
     * Register admin-specific hooks.
     *
     * @return void
     */
    private function define_admin_hooks(): void {
        $admin    = new Admin( $this );
        $settings = new Settings( $this );
        $menu     = new Menu( $this );

        $this->loader->add_action( 'admin_enqueue_scripts', $admin, 'enqueue_styles' );
        $this->loader->add_action( 'admin_enqueue_scripts', $admin, 'enqueue_scripts' );
        $this->loader->add_action( 'admin_menu', $menu, 'register_menu' );
        $this->loader->add_action( 'admin_init', $settings, 'register_settings' );

        /**
         * Fires after admin hooks are defined.
         *
         * @since 1.0.0
         * @param Loader $loader The hook loader instance.
         * @param self   $plugin The plugin instance.
         */
        do_action( 'plugin_name_admin_hooks', $this->loader, $this );
    }

    /**
     * Register public-facing hooks.
     *
     * @return void
     */
    private function define_public_hooks(): void {
        $frontend = new Frontend( $this );

        $this->loader->add_action( 'wp_enqueue_scripts', $frontend, 'enqueue_styles' );
        $this->loader->add_action( 'wp_enqueue_scripts', $frontend, 'enqueue_scripts' );

        /**
         * Fires after public hooks are defined.
         *
         * @since 1.0.0
         * @param Loader $loader The hook loader instance.
         * @param self   $plugin The plugin instance.
         */
        do_action( 'plugin_name_public_hooks', $this->loader, $this );
    }

    /**
     * Register REST API hooks.
     *
     * @return void
     */
    private function define_api_hooks(): void {
        $controller = new REST_Controller( $this );

        $this->loader->add_action( 'rest_api_init', $controller, 'register_routes' );
    }

    /**
     * Get the hook loader.
     *
     * @return Loader
     */
    public function get_loader(): Loader {
        return $this->loader;
    }

    /**
     * Prevent cloning.
     */
    private function __clone() {}

    /**
     * Prevent unserialization.
     *
     * @throws \Exception Always.
     */
    public function __wakeup(): void {
        throw new \Exception( 'Cannot unserialize singleton.' );
    }
}
```

### src/Core/Loader.php

```php
<?php
/**
 * Hook registration manager.
 *
 * @package PluginName\Core
 * @since   1.0.0
 */

declare( strict_types=1 );

namespace PluginName\Core;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Loader
 *
 * Maintains a list of all hooks registered by the plugin and fires them
 * at the appropriate time via the WordPress Plugin API.
 *
 * @since 1.0.0
 */
class Loader {

    /**
     * Registered actions.
     *
     * @var array<int, array{hook: string, component: object, callback: string, priority: int, accepted_args: int}>
     */
    private array $actions = array();

    /**
     * Registered filters.
     *
     * @var array<int, array{hook: string, component: object, callback: string, priority: int, accepted_args: int}>
     */
    private array $filters = array();

    /**
     * Register an action hook.
     *
     * @param string $hook          WordPress hook name.
     * @param object $component     Class instance.
     * @param string $callback      Method name.
     * @param int    $priority      Priority. Default 10.
     * @param int    $accepted_args Number of args. Default 1.
     * @return void
     */
    public function add_action(
        string $hook,
        object $component,
        string $callback,
        int $priority = 10,
        int $accepted_args = 1
    ): void {
        $this->actions[] = compact( 'hook', 'component', 'callback', 'priority', 'accepted_args' );
    }

    /**
     * Register a filter hook.
     *
     * @param string $hook          WordPress hook name.
     * @param object $component     Class instance.
     * @param string $callback      Method name.
     * @param int    $priority      Priority. Default 10.
     * @param int    $accepted_args Number of args. Default 1.
     * @return void
     */
    public function add_filter(
        string $hook,
        object $component,
        string $callback,
        int $priority = 10,
        int $accepted_args = 1
    ): void {
        $this->filters[] = compact( 'hook', 'component', 'callback', 'priority', 'accepted_args' );
    }

    /**
     * Fire all registered hooks.
     *
     * @return void
     */
    public function run(): void {
        foreach ( $this->filters as $hook ) {
            add_filter(
                $hook['hook'],
                array( $hook['component'], $hook['callback'] ),
                $hook['priority'],
                $hook['accepted_args']
            );
        }

        foreach ( $this->actions as $hook ) {
            add_action(
                $hook['hook'],
                array( $hook['component'], $hook['callback'] ),
                $hook['priority'],
                $hook['accepted_args']
            );
        }
    }
}
```

### src/Core/Activator.php

```php
<?php
/**
 * Plugin activator.
 *
 * @package PluginName\Core
 * @since   1.0.0
 */

declare( strict_types=1 );

namespace PluginName\Core;

use PluginName\Database\Migrator;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Activator
 *
 * @since 1.0.0
 */
class Activator {

    /**
     * Run activation tasks.
     *
     * @return void
     */
    public static function activate(): void {
        // Check WordPress version.
        if ( version_compare( get_bloginfo( 'version' ), PLUGIN_NAME_MIN_WP, '<' ) ) {
            deactivate_plugins( PLUGIN_NAME_BASENAME );
            wp_die(
                sprintf(
                    /* translators: %s: Minimum WordPress version */
                    esc_html__( 'Plugin Name requires WordPress %s or higher.', 'plugin-name' ),
                    esc_html( PLUGIN_NAME_MIN_WP )
                ),
                'Plugin Activation Error',
                array( 'back_link' => true )
            );
        }

        // Run database migrations.
        $migrator = new Migrator();
        $migrator->run();

        // Set default options.
        self::set_default_options();

        // Set activation flag for welcome redirect.
        set_transient( 'plugin_name_activation_redirect', true, 30 );

        /**
         * Fires after plugin activation.
         *
         * @since 1.0.0
         */
        do_action( 'plugin_name_activated' );

        // Flush rewrite rules.
        flush_rewrite_rules();
    }

    /**
     * Set default plugin options.
     *
     * @return void
     */
    private static function set_default_options(): void {
        $defaults = array(
            'plugin_name_version'         => PLUGIN_NAME_VERSION,
            'plugin_name_enable_feature'  => 'yes',
            'plugin_name_items_per_page'  => 20,
            'plugin_name_cache_duration'  => 3600,
        );

        /**
         * Filter the default plugin options set on activation.
         *
         * @since 1.0.0
         * @param array<string, mixed> $defaults Default options.
         */
        $defaults = apply_filters( 'plugin_name_default_options', $defaults );

        foreach ( $defaults as $key => $value ) {
            if ( false === get_option( $key ) ) {
                update_option( $key, $value );
            }
        }
    }
}
```

### src/Core/Deactivator.php

```php
<?php
/**
 * Plugin deactivator.
 *
 * @package PluginName\Core
 * @since   1.0.0
 */

declare( strict_types=1 );

namespace PluginName\Core;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Deactivator
 *
 * @since 1.0.0
 */
class Deactivator {

    /**
     * Run deactivation tasks.
     * NOTE: Do NOT delete data here. Use uninstall.php for data cleanup.
     *
     * @return void
     */
    public static function deactivate(): void {
        // Clear scheduled cron events.
        $timestamp = wp_next_scheduled( 'plugin_name_cron_event' );
        if ( $timestamp ) {
            wp_unschedule_event( $timestamp, 'plugin_name_cron_event' );
        }

        // Clear transient caches.
        delete_transient( 'plugin_name_cache' );

        /**
         * Fires after plugin deactivation.
         *
         * @since 1.0.0
         */
        do_action( 'plugin_name_deactivated' );

        // Flush rewrite rules.
        flush_rewrite_rules();
    }
}
```

### src/Core/I18n.php

```php
<?php
/**
 * Internationalization handler.
 *
 * @package PluginName\Core
 * @since   1.0.0
 */

declare( strict_types=1 );

namespace PluginName\Core;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class I18n
 *
 * @since 1.0.0
 */
class I18n {

    /**
     * Load the plugin text domain for translation.
     *
     * @return void
     */
    public function load_plugin_textdomain(): void {
        load_plugin_textdomain(
            'plugin-name',
            false,
            dirname( PLUGIN_NAME_BASENAME ) . '/languages/'
        );
    }
}
```

---

## 5. Naming & Prefixing Rules

You MUST prefix EVERYTHING. No exceptions. Name collisions cause catastrophic failures across the WordPress ecosystem.

| Element             | Pattern                                     | Example                               |
|---------------------|---------------------------------------------|---------------------------------------|
| Functions           | `plugin_prefix_function_name()`            | `acme_crm_get_contacts()`            |
| Classes (legacy)    | `Plugin_Prefix_Class_Name`                 | `Acme_CRM_Contact`                    |
| Classes (PSR-4)     | `PluginName\Namespace\ClassName`           | `AcmeCRM\Models\Contact`             |
| Constants           | `PLUGIN_PREFIX_CONSTANT`                   | `ACME_CRM_VERSION`                    |
| Options             | `plugin_prefix_option`                     | `acme_crm_api_key`                    |
| Transients          | `plugin_prefix_transient`                  | `acme_crm_contacts_cache`            |
| Meta keys           | `_plugin_prefix_meta`                      | `_acme_crm_last_sync`                |
| Custom post types   | `plugin_prefix_cpt` (max 20 chars)        | `acme_crm_contact`                    |
| Taxonomies          | `plugin_prefix_tax`                        | `acme_crm_group`                      |
| Nonces              | `plugin_prefix_nonce`                      | `acme_crm_save_nonce`                |
| AJAX actions        | `plugin_prefix_action`                     | `acme_crm_search`                     |
| REST namespace      | `plugin-prefix/v1`                         | `acme-crm/v1`                         |
| Hook names          | `plugin_prefix_hook_name`                  | `acme_crm_before_sync`               |
| CSS classes         | `.plugin-prefix-class`                     | `.acme-crm-card`                      |
| JS globals          | `pluginPrefixData`                         | `acmeCrmData`                         |
| DB tables           | `{$wpdb->prefix}plugin_prefix_table`      | `wp_acme_crm_contacts`               |
| Cron events         | `plugin_prefix_cron`                       | `acme_crm_daily_sync`                |
| Shortcodes          | `plugin_prefix_shortcode`                  | `acme_crm_form`                       |
| Capabilities        | `plugin_prefix_capability`                 | `acme_crm_manage_contacts`            |

**NEVER** use generic names like `my_plugin`, `helper`, `utils`, `data`, or single-word identifiers.

---

## 6. Hooks & Extensibility

EVERY significant operation MUST fire actions before/after and filter all output. This makes your plugin truly extensible.

### Core Extensibility Patterns

```php
<?php
/**
 * Pattern: Making every operation hookable.
 */

// CORRECT — hookable save operation.
public function save_item( array $data ): int|false {
    /**
     * Filter item data before saving.
     *
     * @since 1.0.0
     * @param array $data The item data to save.
     */
    $data = apply_filters( 'plugin_name_before_save_item_data', $data );

    /**
     * Fires before an item is saved.
     *
     * @since 1.0.0
     * @param array $data The item data.
     */
    do_action( 'plugin_name_before_save_item', $data );

    // Validate.
    if ( empty( $data['title'] ) ) {
        /**
         * Fires when item validation fails.
         *
         * @since 1.0.0
         * @param array  $data   The invalid data.
         * @param string $reason Reason for failure.
         */
        do_action( 'plugin_name_save_item_failed', $data, 'empty_title' );
        return false;
    }

    $result = $this->repository->insert( $data );

    /**
     * Fires after an item is saved successfully.
     *
     * @since 1.0.0
     * @param int   $result The new item ID.
     * @param array $data   The saved item data.
     */
    do_action( 'plugin_name_after_save_item', $result, $data );

    return $result;
}

// CORRECT — filterable output.
public function get_display_title( int $item_id ): string {
    $item  = $this->repository->find( $item_id );
    $title = $item ? $item->title : '';

    /**
     * Filter the display title of an item.
     *
     * @since 1.0.0
     * @param string $title   The item title.
     * @param int    $item_id The item ID.
     * @param object $item    The full item object.
     */
    return apply_filters( 'plugin_name_display_title', $title, $item_id, $item );
}
```

### Feature Toggle Pattern

```php
<?php
/**
 * Pattern: Allow other plugins to toggle features on/off via filters.
 */

// In your plugin — check before running a feature.
public function maybe_send_notification( int $item_id ): void {
    /**
     * Filter whether to send a notification for this item.
     *
     * @since 1.0.0
     * @param bool $send    Whether to send. Default true.
     * @param int  $item_id The item ID.
     */
    $should_send = apply_filters( 'plugin_name_send_notification', true, $item_id );

    if ( ! $should_send ) {
        return;
    }

    // ... send notification logic.
}

// In a third-party plugin — disable notifications for specific items.
add_filter( 'plugin_name_send_notification', function ( bool $send, int $item_id ): bool {
    if ( $item_id === 42 ) {
        return false;
    }
    return $send;
}, 10, 2 );
```

### Removable Hook Pattern

When registering hooks via class methods, ALWAYS store instances so hooks can be removed by other developers.

```php
<?php
// CORRECT — instance is accessible, hooks are removable.
$admin = new \PluginName\Admin\Admin( $plugin );
add_action( 'admin_enqueue_scripts', array( $admin, 'enqueue_styles' ) );

// Another plugin can remove it.
// Because the instance is stored, this works.
remove_action( 'admin_enqueue_scripts', array( $admin, 'enqueue_styles' ) );

// WRONG — anonymous closure, impossible to remove.
add_action( 'admin_enqueue_scripts', function () {
    // Cannot be removed by other plugins!
} );
```

### Hook Naming Convention

Use verbs for actions, nouns for filters:

```
Actions:  plugin_name_before_save, plugin_name_after_delete, plugin_name_init
Filters:  plugin_name_item_title, plugin_name_query_args, plugin_name_template_path
```

ALWAYS document every hook with a `@since` tag and `@param` tags.

---

## 7. Settings API (OOP with Tabs)

### src/Admin/Settings.php

```php
<?php
/**
 * Settings management.
 *
 * @package PluginName\Admin
 * @since   1.0.0
 */

declare( strict_types=1 );

namespace PluginName\Admin;

use PluginName\Core\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Settings
 *
 * @since 1.0.0
 */
class Settings {

    /**
     * Plugin instance.
     *
     * @var Plugin
     */
    private Plugin $plugin;

    /**
     * Option group.
     *
     * @var string
     */
    private string $option_group = 'plugin_name_settings';

    /**
     * Settings page slug.
     *
     * @var string
     */
    private string $page_slug = 'plugin-name-settings';

    /**
     * Constructor.
     *
     * @param Plugin $plugin Plugin instance.
     */
    public function __construct( Plugin $plugin ) {
        $this->plugin = $plugin;
    }

    /**
     * Register all settings, sections, and fields.
     *
     * @return void
     */
    public function register_settings(): void {
        // General settings.
        register_setting(
            $this->option_group,
            'plugin_name_enable_feature',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'yes',
            )
        );

        register_setting(
            $this->option_group,
            'plugin_name_items_per_page',
            array(
                'type'              => 'integer',
                'sanitize_callback' => 'absint',
                'default'           => 20,
            )
        );

        register_setting(
            $this->option_group,
            'plugin_name_api_key',
            array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            )
        );

        // General section.
        add_settings_section(
            'plugin_name_general_section',
            __( 'General Settings', 'plugin-name' ),
            array( $this, 'render_general_section' ),
            $this->page_slug
        );

        add_settings_field(
            'plugin_name_enable_feature',
            __( 'Enable Feature', 'plugin-name' ),
            array( $this, 'render_checkbox_field' ),
            $this->page_slug,
            'plugin_name_general_section',
            array(
                'label_for'   => 'plugin_name_enable_feature',
                'description' => __( 'Enable the main feature of this plugin.', 'plugin-name' ),
            )
        );

        add_settings_field(
            'plugin_name_items_per_page',
            __( 'Items Per Page', 'plugin-name' ),
            array( $this, 'render_number_field' ),
            $this->page_slug,
            'plugin_name_general_section',
            array(
                'label_for'   => 'plugin_name_items_per_page',
                'description' => __( 'Number of items to display per page.', 'plugin-name' ),
                'min'         => 1,
                'max'         => 100,
            )
        );

        // API section.
        add_settings_section(
            'plugin_name_api_section',
            __( 'API Settings', 'plugin-name' ),
            array( $this, 'render_api_section' ),
            $this->page_slug . '-api'
        );

        add_settings_field(
            'plugin_name_api_key',
            __( 'API Key', 'plugin-name' ),
            array( $this, 'render_text_field' ),
            $this->page_slug . '-api',
            'plugin_name_api_section',
            array(
                'label_for'   => 'plugin_name_api_key',
                'description' => __( 'Enter your API key.', 'plugin-name' ),
                'type'        => 'password',
            )
        );

        /**
         * Fires after settings are registered.
         * Use this to add custom settings to the plugin settings page.
         *
         * @since 1.0.0
         * @param string $option_group The option group name.
         * @param string $page_slug    The settings page slug.
         */
        do_action( 'plugin_name_register_settings', $this->option_group, $this->page_slug );
    }

    /**
     * Render the settings page with tabs.
     *
     * @return void
     */
    public function render_settings_page(): void {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        $tabs = array(
            'general' => __( 'General', 'plugin-name' ),
            'api'     => __( 'API', 'plugin-name' ),
        );

        /**
         * Filter the settings page tabs.
         *
         * @since 1.0.0
         * @param array<string, string> $tabs Tab slug => label pairs.
         */
        $tabs = apply_filters( 'plugin_name_settings_tabs', $tabs );

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Tab navigation only.
        $active_tab = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'general';

        if ( ! array_key_exists( $active_tab, $tabs ) ) {
            $active_tab = 'general';
        }
        ?>
        <div class="wrap plugin-name-settings">
            <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

            <nav class="nav-tab-wrapper plugin-name-tabs">
                <?php foreach ( $tabs as $tab_slug => $tab_label ) : ?>
                    <a href="<?php echo esc_url( add_query_arg( 'tab', $tab_slug ) ); ?>"
                       class="nav-tab <?php echo $active_tab === $tab_slug ? 'nav-tab-active' : ''; ?>">
                        <?php echo esc_html( $tab_label ); ?>
                    </a>
                <?php endforeach; ?>
            </nav>

            <form method="post" action="options.php" class="plugin-name-form">
                <?php
                switch ( $active_tab ) {
                    case 'api':
                        settings_fields( $this->option_group );
                        do_settings_sections( $this->page_slug . '-api' );
                        break;
                    default:
                        settings_fields( $this->option_group );
                        do_settings_sections( $this->page_slug );
                        break;
                }

                /**
                 * Fires inside the settings form, after built-in sections.
                 *
                 * @since 1.0.0
                 * @param string $active_tab The currently active tab.
                 */
                do_action( 'plugin_name_settings_form', $active_tab );

                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    /**
     * Get an option with a default fallback.
     *
     * @param string $key     Option key (without prefix).
     * @param mixed  $default Default value.
     * @return mixed
     */
    public static function get_option( string $key, mixed $default = false ): mixed {
        $value = get_option( 'plugin_name_' . $key, $default );

        /**
         * Filter a plugin option value.
         *
         * @since 1.0.0
         * @param mixed  $value   The option value.
         * @param string $key     The option key (without prefix).
         * @param mixed  $default The default value.
         */
        return apply_filters( "plugin_name_option_{$key}", $value, $key, $default );
    }

    // --- Field Renderers ---

    /**
     * Render a checkbox field.
     *
     * @param array<string, mixed> $args Field arguments.
     * @return void
     */
    public function render_checkbox_field( array $args ): void {
        $id    = $args['label_for'];
        $value = get_option( $id, 'no' );
        ?>
        <label>
            <input type="checkbox" id="<?php echo esc_attr( $id ); ?>"
                   name="<?php echo esc_attr( $id ); ?>"
                   value="yes" <?php checked( $value, 'yes' ); ?> />
            <?php echo esc_html( $args['description'] ?? '' ); ?>
        </label>
        <?php
    }

    /**
     * Render a number field.
     *
     * @param array<string, mixed> $args Field arguments.
     * @return void
     */
    public function render_number_field( array $args ): void {
        $id    = $args['label_for'];
        $value = get_option( $id, 0 );
        ?>
        <input type="number" id="<?php echo esc_attr( $id ); ?>"
               name="<?php echo esc_attr( $id ); ?>"
               value="<?php echo esc_attr( (string) $value ); ?>"
               min="<?php echo esc_attr( (string) ( $args['min'] ?? 0 ) ); ?>"
               max="<?php echo esc_attr( (string) ( $args['max'] ?? 9999 ) ); ?>"
               class="small-text" />
        <p class="description"><?php echo esc_html( $args['description'] ?? '' ); ?></p>
        <?php
    }

    /**
     * Render a text/password field.
     *
     * @param array<string, mixed> $args Field arguments.
     * @return void
     */
    public function render_text_field( array $args ): void {
        $id   = $args['label_for'];
        $value = get_option( $id, '' );
        $type  = $args['type'] ?? 'text';
        ?>
        <input type="<?php echo esc_attr( $type ); ?>" id="<?php echo esc_attr( $id ); ?>"
               name="<?php echo esc_attr( $id ); ?>"
               value="<?php echo esc_attr( (string) $value ); ?>"
               class="regular-text" />
        <p class="description"><?php echo esc_html( $args['description'] ?? '' ); ?></p>
        <?php
    }

    /**
     * Render general section description.
     *
     * @return void
     */
    public function render_general_section(): void {
        echo '<p>' . esc_html__( 'Configure the general settings for Plugin Name.', 'plugin-name' ) . '</p>';
    }

    /**
     * Render API section description.
     *
     * @return void
     */
    public function render_api_section(): void {
        echo '<p>' . esc_html__( 'Configure the API connection settings.', 'plugin-name' ) . '</p>';
    }

    /**
     * Sanitize checkbox value.
     *
     * @param mixed $value The value to sanitize.
     * @return string 'yes' or 'no'.
     */
    public function sanitize_checkbox( mixed $value ): string {
        return 'yes' === $value ? 'yes' : 'no';
    }
}
```

---

## 8. Custom CSS for Admin UI (Performance-First)

NEVER use Bootstrap, Tailwind, or any CSS framework in WordPress plugins. You MUST write lightweight custom CSS that only loads on YOUR plugin pages.

### Enqueue Only On Plugin Pages

```php
<?php
/**
 * Admin class — only enqueue assets on plugin pages.
 */
public function enqueue_styles( string $hook_suffix ): void {
    // NEVER load globally. Only on our pages.
    if ( ! $this->is_plugin_page( $hook_suffix ) ) {
        return;
    }

    wp_enqueue_style(
        'plugin-name-admin',
        PLUGIN_NAME_URL . 'assets/css/admin.css',
        array(),
        PLUGIN_NAME_VERSION
    );
}

/**
 * Check if current page is a plugin admin page.
 *
 * @param string $hook_suffix The current admin page hook suffix.
 * @return bool
 */
private function is_plugin_page( string $hook_suffix ): bool {
    $plugin_pages = array(
        'toplevel_page_plugin-name',
        'plugin-name_page_plugin-name-settings',
    );

    /**
     * Filter the list of admin pages where plugin assets are loaded.
     *
     * @since 1.0.0
     * @param array  $plugin_pages Array of hook suffixes.
     * @param string $hook_suffix  Current hook suffix.
     */
    $plugin_pages = apply_filters( 'plugin_name_admin_pages', $plugin_pages, $hook_suffix );

    return in_array( $hook_suffix, $plugin_pages, true );
}
```

### assets/css/admin.css — Lightweight Custom Admin CSS

```css
/**
 * Plugin Name — Admin Styles
 *
 * Lightweight custom CSS. BEM naming with plugin prefix.
 * CSS custom properties for easy theming and overrides.
 *
 * @package PluginName
 * @since   1.0.0
 */

/* -------------------------------------------------------
   Custom Properties (Theming)
   Override these via your own stylesheet if needed.
------------------------------------------------------- */
:root {
    --pn-primary: #2271b1;
    --pn-primary-hover: #135e96;
    --pn-success: #00a32a;
    --pn-danger: #d63638;
    --pn-warning: #dba617;
    --pn-bg: #f0f0f1;
    --pn-card-bg: #ffffff;
    --pn-border: #c3c4c7;
    --pn-border-light: #e0e0e0;
    --pn-text: #1d2327;
    --pn-text-muted: #646970;
    --pn-radius: 4px;
    --pn-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
    --pn-spacing-xs: 4px;
    --pn-spacing-sm: 8px;
    --pn-spacing-md: 16px;
    --pn-spacing-lg: 24px;
    --pn-spacing-xl: 32px;
}

/* -------------------------------------------------------
   Layout
------------------------------------------------------- */
.plugin-name-settings {
    max-width: 960px;
    margin-top: var(--pn-spacing-lg);
}

/* -------------------------------------------------------
   Tabs (extending WP nav-tab-wrapper)
------------------------------------------------------- */
.plugin-name-tabs {
    margin-bottom: var(--pn-spacing-lg);
    border-bottom: 1px solid var(--pn-border);
}

.plugin-name-tabs .nav-tab {
    border-color: var(--pn-border);
    background: var(--pn-bg);
    color: var(--pn-text);
    padding: var(--pn-spacing-sm) var(--pn-spacing-md);
    margin-left: 0;
    transition: background 0.15s ease;
}

.plugin-name-tabs .nav-tab:hover {
    background: var(--pn-card-bg);
}

.plugin-name-tabs .nav-tab-active,
.plugin-name-tabs .nav-tab-active:hover {
    background: var(--pn-card-bg);
    border-bottom-color: var(--pn-card-bg);
    color: var(--pn-primary);
    font-weight: 600;
}

/* -------------------------------------------------------
   Cards
------------------------------------------------------- */
.plugin-name-card {
    background: var(--pn-card-bg);
    border: 1px solid var(--pn-border-light);
    border-radius: var(--pn-radius);
    box-shadow: var(--pn-shadow);
    padding: var(--pn-spacing-lg);
    margin-bottom: var(--pn-spacing-md);
}

.plugin-name-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--pn-spacing-md);
    padding-bottom: var(--pn-spacing-sm);
    border-bottom: 1px solid var(--pn-border-light);
}

.plugin-name-card__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--pn-text);
    margin: 0;
}

.plugin-name-card__body {
    color: var(--pn-text);
    font-size: 13px;
    line-height: 1.6;
}

/* -------------------------------------------------------
   Form Elements
------------------------------------------------------- */
.plugin-name-form .form-table th {
    width: 220px;
    padding: var(--pn-spacing-md) var(--pn-spacing-sm);
    font-weight: 600;
}

.plugin-name-form .form-table td {
    padding: var(--pn-spacing-md) var(--pn-spacing-sm);
}

.plugin-name-form .regular-text,
.plugin-name-form .small-text {
    border: 1px solid var(--pn-border);
    border-radius: var(--pn-radius);
    padding: 6px 10px;
    transition: border-color 0.15s ease;
}

.plugin-name-form .regular-text:focus,
.plugin-name-form .small-text:focus {
    border-color: var(--pn-primary);
    box-shadow: 0 0 0 1px var(--pn-primary);
    outline: none;
}

/* -------------------------------------------------------
   Buttons (extending WP button classes)
------------------------------------------------------- */
.plugin-name-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--pn-spacing-xs);
    padding: 6px 16px;
    border: 1px solid var(--pn-border);
    border-radius: var(--pn-radius);
    background: var(--pn-card-bg);
    color: var(--pn-text);
    font-size: 13px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s ease;
}

.plugin-name-btn:hover {
    background: var(--pn-bg);
    border-color: var(--pn-primary);
    color: var(--pn-primary);
}

.plugin-name-btn--primary {
    background: var(--pn-primary);
    border-color: var(--pn-primary);
    color: #fff;
}

.plugin-name-btn--primary:hover {
    background: var(--pn-primary-hover);
    border-color: var(--pn-primary-hover);
    color: #fff;
}

.plugin-name-btn--danger {
    color: var(--pn-danger);
    border-color: var(--pn-danger);
}

.plugin-name-btn--danger:hover {
    background: var(--pn-danger);
    color: #fff;
}

/* -------------------------------------------------------
   Status Badges
------------------------------------------------------- */
.plugin-name-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.5;
}

.plugin-name-badge--active  { background: #e6f4ea; color: var(--pn-success); }
.plugin-name-badge--error   { background: #fce8e8; color: var(--pn-danger); }
.plugin-name-badge--warning { background: #fef7e6; color: var(--pn-warning); }

/* -------------------------------------------------------
   Responsive
------------------------------------------------------- */
@media screen and (max-width: 782px) {
    .plugin-name-form .form-table th {
        width: auto;
        display: block;
        padding-bottom: var(--pn-spacing-xs);
    }

    .plugin-name-card__header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--pn-spacing-sm);
    }
}
```

---

## 9. REST API (WP_REST_Controller)

ALWAYS extend `WP_REST_Controller`. NEVER register naked routes with closures.

### src/API/REST_Controller.php

```php
<?php
/**
 * REST API controller for items.
 *
 * @package PluginName\API
 * @since   1.0.0
 */

declare( strict_types=1 );

namespace PluginName\API;

use PluginName\Core\Plugin;
use PluginName\Database\Repository;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class REST_Controller
 *
 * @since 1.0.0
 */
class REST_Controller extends WP_REST_Controller {

    /**
     * Route namespace.
     *
     * @var string
     */
    protected $namespace = 'plugin-name/v1';

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'items';

    /**
     * Plugin instance.
     *
     * @var Plugin
     */
    private Plugin $plugin;

    /**
     * Repository instance.
     *
     * @var Repository
     */
    private Repository $repository;

    /**
     * Constructor.
     *
     * @param Plugin $plugin Plugin instance.
     */
    public function __construct( Plugin $plugin ) {
        $this->plugin     = $plugin;
        $this->repository = new Repository();
    }

    /**
     * Register REST routes.
     *
     * @return void
     */
    public function register_routes(): void {
        // GET /plugin-name/v1/items
        // POST /plugin-name/v1/items
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                    'args'                => $this->get_collection_params(),
                ),
                array(
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => array( $this, 'create_item_permissions_check' ),
                    'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
                ),
                'schema' => array( $this, 'get_public_item_schema' ),
            )
        );

        // GET /plugin-name/v1/items/<id>
        // PUT/PATCH /plugin-name/v1/items/<id>
        // DELETE /plugin-name/v1/items/<id>
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'get_item_permissions_check' ),
                    'args'                => array(
                        'id' => array(
                            'validate_callback' => function ( $param ) {
                                return is_numeric( $param ) && (int) $param > 0;
                            },
                        ),
                    ),
                ),
                array(
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                    'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
                ),
                array(
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => array( $this, 'delete_item' ),
                    'permission_callback' => array( $this, 'delete_item_permissions_check' ),
                ),
                'schema' => array( $this, 'get_public_item_schema' ),
            )
        );

        /**
         * Fires after plugin REST routes are registered.
         *
         * @since 1.0.0
         * @param string $namespace The REST namespace.
         */
        do_action( 'plugin_name_rest_routes_registered', $this->namespace );
    }

    /**
     * Check if user can read items.
     *
     * @param WP_REST_Request $request Request object.
     * @return bool|WP_Error
     */
    public function get_items_permissions_check( $request ): bool|WP_Error {
        /**
         * Filter the capability required to read items via REST.
         *
         * @since 1.0.0
         * @param string $capability The capability. Default 'read'.
         */
        $cap = apply_filters( 'plugin_name_rest_read_cap', 'read' );

        if ( ! current_user_can( $cap ) ) {
            return new WP_Error(
                'plugin_name_rest_forbidden',
                __( 'You do not have permission to view items.', 'plugin-name' ),
                array( 'status' => rest_authorization_required_code() )
            );
        }

        return true;
    }

    /**
     * Check if user can create items.
     *
     * @param WP_REST_Request $request Request object.
     * @return bool|WP_Error
     */
    public function create_item_permissions_check( $request ): bool|WP_Error {
        if ( ! current_user_can( 'manage_options' ) ) {
            return new WP_Error(
                'plugin_name_rest_forbidden',
                __( 'You do not have permission to create items.', 'plugin-name' ),
                array( 'status' => rest_authorization_required_code() )
            );
        }

        return true;
    }

    /**
     * Check if user can read a single item.
     *
     * @param WP_REST_Request $request Request object.
     * @return bool|WP_Error
     */
    public function get_item_permissions_check( $request ): bool|WP_Error {
        return $this->get_items_permissions_check( $request );
    }

    /**
     * Check if user can update an item.
     *
     * @param WP_REST_Request $request Request object.
     * @return bool|WP_Error
     */
    public function update_item_permissions_check( $request ): bool|WP_Error {
        return $this->create_item_permissions_check( $request );
    }

    /**
     * Check if user can delete an item.
     *
     * @param WP_REST_Request $request Request object.
     * @return bool|WP_Error
     */
    public function delete_item_permissions_check( $request ): bool|WP_Error {
        return $this->create_item_permissions_check( $request );
    }

    /**
     * Retrieve items.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public function get_items( $request ): WP_REST_Response|WP_Error {
        $args = array(
            'per_page' => $request->get_param( 'per_page' ) ?? 20,
            'page'     => $request->get_param( 'page' ) ?? 1,
            'search'   => $request->get_param( 'search' ) ?? '',
            'orderby'  => $request->get_param( 'orderby' ) ?? 'created_at',
            'order'    => $request->get_param( 'order' ) ?? 'DESC',
        );

        /**
         * Filter REST API query arguments for items.
         *
         * @since 1.0.0
         * @param array           $args    Query arguments.
         * @param WP_REST_Request $request The request object.
         */
        $args = apply_filters( 'plugin_name_rest_items_query_args', $args, $request );

        $items = $this->repository->find_all( $args );
        $total = $this->repository->count( $args );

        $data = array();
        foreach ( $items as $item ) {
            $data[] = $this->prepare_item_for_response( $item, $request )->get_data();
        }

        $response = new WP_REST_Response( $data, 200 );

        $response->header( 'X-WP-Total', (string) $total );
        $response->header( 'X-WP-TotalPages', (string) ceil( $total / $args['per_page'] ) );

        return $response;
    }

    /**
     * Retrieve a single item.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public function get_item( $request ): WP_REST_Response|WP_Error {
        $item = $this->repository->find( (int) $request->get_param( 'id' ) );

        if ( ! $item ) {
            return new WP_Error(
                'plugin_name_rest_not_found',
                __( 'Item not found.', 'plugin-name' ),
                array( 'status' => 404 )
            );
        }

        return $this->prepare_item_for_response( $item, $request );
    }

    /**
     * Create an item.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public function create_item( $request ): WP_REST_Response|WP_Error {
        $data = $this->prepare_item_for_database( $request );

        /**
         * Fires before creating an item via REST.
         *
         * @since 1.0.0
         * @param array           $data    The item data.
         * @param WP_REST_Request $request The request object.
         */
        do_action( 'plugin_name_rest_before_create_item', $data, $request );

        $id = $this->repository->insert( $data );

        if ( ! $id ) {
            return new WP_Error(
                'plugin_name_rest_create_failed',
                __( 'Failed to create item.', 'plugin-name' ),
                array( 'status' => 500 )
            );
        }

        $item = $this->repository->find( $id );

        /**
         * Fires after creating an item via REST.
         *
         * @since 1.0.0
         * @param object          $item    The created item.
         * @param WP_REST_Request $request The request object.
         */
        do_action( 'plugin_name_rest_after_create_item', $item, $request );

        $response = $this->prepare_item_for_response( $item, $request );
        $response->set_status( 201 );

        return $response;
    }

    /**
     * Update an item.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public function update_item( $request ): WP_REST_Response|WP_Error {
        $id   = (int) $request->get_param( 'id' );
        $item = $this->repository->find( $id );

        if ( ! $item ) {
            return new WP_Error(
                'plugin_name_rest_not_found',
                __( 'Item not found.', 'plugin-name' ),
                array( 'status' => 404 )
            );
        }

        $data    = $this->prepare_item_for_database( $request );
        $updated = $this->repository->update( $id, $data );

        if ( false === $updated ) {
            return new WP_Error(
                'plugin_name_rest_update_failed',
                __( 'Failed to update item.', 'plugin-name' ),
                array( 'status' => 500 )
            );
        }

        $item = $this->repository->find( $id );

        /**
         * Fires after updating an item via REST.
         *
         * @since 1.0.0
         * @param object          $item    The updated item.
         * @param WP_REST_Request $request The request object.
         */
        do_action( 'plugin_name_rest_after_update_item', $item, $request );

        return $this->prepare_item_for_response( $item, $request );
    }

    /**
     * Delete an item.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public function delete_item( $request ): WP_REST_Response|WP_Error {
        $id   = (int) $request->get_param( 'id' );
        $item = $this->repository->find( $id );

        if ( ! $item ) {
            return new WP_Error(
                'plugin_name_rest_not_found',
                __( 'Item not found.', 'plugin-name' ),
                array( 'status' => 404 )
            );
        }

        /**
         * Fires before deleting an item via REST.
         *
         * @since 1.0.0
         * @param object          $item    The item to delete.
         * @param WP_REST_Request $request The request object.
         */
        do_action( 'plugin_name_rest_before_delete_item', $item, $request );

        $deleted = $this->repository->delete( $id );

        if ( ! $deleted ) {
            return new WP_Error(
                'plugin_name_rest_delete_failed',
                __( 'Failed to delete item.', 'plugin-name' ),
                array( 'status' => 500 )
            );
        }

        return new WP_REST_Response( null, 204 );
    }

    /**
     * Prepare item for REST response.
     *
     * @param object          $item    Raw item object.
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function prepare_item_for_response( $item, $request ): WP_REST_Response {
        $data = array(
            'id'          => (int) $item->id,
            'title'       => $item->title,
            'description' => $item->description,
            'status'      => $item->status,
            'created_at'  => mysql_to_rfc3339( $item->created_at ),
            'updated_at'  => mysql_to_rfc3339( $item->updated_at ),
        );

        /**
         * Filter the REST response data for an item.
         *
         * @since 1.0.0
         * @param array  $data The response data.
         * @param object $item The raw item object.
         */
        $data = apply_filters( 'plugin_name_rest_item_response', $data, $item );

        return new WP_REST_Response( $data, 200 );
    }

    /**
     * Prepare item for database insertion.
     *
     * @param WP_REST_Request $request Request object.
     * @return array<string, mixed>
     */
    protected function prepare_item_for_database( $request ): array {
        $data = array();

        if ( $request->has_param( 'title' ) ) {
            $data['title'] = sanitize_text_field( $request->get_param( 'title' ) );
        }

        if ( $request->has_param( 'description' ) ) {
            $data['description'] = wp_kses_post( $request->get_param( 'description' ) );
        }

        if ( $request->has_param( 'status' ) ) {
            $data['status'] = sanitize_key( $request->get_param( 'status' ) );
        }

        return $data;
    }

    /**
     * Get the item schema for REST.
     *
     * @return array<string, mixed>
     */
    public function get_item_schema(): array {
        if ( $this->schema ) {
            return $this->add_additional_fields_schema( $this->schema );
        }

        $this->schema = array(
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'plugin-name-item',
            'type'       => 'object',
            'properties' => array(
                'id'          => array(
                    'description' => __( 'Unique identifier for the item.', 'plugin-name' ),
                    'type'        => 'integer',
                    'context'     => array( 'view', 'edit' ),
                    'readonly'    => true,
                ),
                'title'       => array(
                    'description' => __( 'The title of the item.', 'plugin-name' ),
                    'type'        => 'string',
                    'context'     => array( 'view', 'edit' ),
                    'required'    => true,
                    'arg_options' => array(
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
                'description' => array(
                    'description' => __( 'The description of the item.', 'plugin-name' ),
                    'type'        => 'string',
                    'context'     => array( 'view', 'edit' ),
                    'arg_options' => array(
                        'sanitize_callback' => 'wp_kses_post',
                    ),
                ),
                'status'      => array(
                    'description' => __( 'The status of the item.', 'plugin-name' ),
                    'type'        => 'string',
                    'enum'        => array( 'active', 'inactive', 'draft' ),
                    'context'     => array( 'view', 'edit' ),
                    'default'     => 'draft',
                ),
                'created_at'  => array(
                    'description' => __( 'The creation date (RFC3339).', 'plugin-name' ),
                    'type'        => 'string',
                    'format'      => 'date-time',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
                'updated_at'  => array(
                    'description' => __( 'The last updated date (RFC3339).', 'plugin-name' ),
                    'type'        => 'string',
                    'format'      => 'date-time',
                    'context'     => array( 'view' ),
                    'readonly'    => true,
                ),
            ),
        );

        return $this->add_additional_fields_schema( $this->schema );
    }

    /**
     * Get collection parameters.
     *
     * @return array<string, mixed>
     */
    public function get_collection_params(): array {
        $params = parent::get_collection_params();

        $params['orderby'] = array(
            'description' => __( 'Sort collection by attribute.', 'plugin-name' ),
            'type'        => 'string',
            'default'     => 'created_at',
            'enum'        => array( 'id', 'title', 'status', 'created_at', 'updated_at' ),
        );

        $params['order'] = array(
            'description' => __( 'Order sort attribute ascending or descending.', 'plugin-name' ),
            'type'        => 'string',
            'default'     => 'DESC',
            'enum'        => array( 'ASC', 'DESC' ),
        );

        return $params;
    }
}
```

---

## 10. Custom Database Tables

### src/Database/Migrator.php

```php
<?php
/**
 * Database migration manager.
 *
 * @package PluginName\Database
 * @since   1.0.0
 */

declare( strict_types=1 );

namespace PluginName\Database;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Migrator
 *
 * Uses dbDelta() for creating/updating tables with version tracking.
 *
 * @since 1.0.0
 */
class Migrator {

    /**
     * Current DB schema version.
     *
     * @var string
     */
    private string $db_version = '1.0.0';

    /**
     * Option key for stored DB version.
     *
     * @var string
     */
    private string $db_version_option = 'plugin_name_db_version';

    /**
     * Run migrations if needed.
     *
     * @return void
     */
    public function run(): void {
        $installed_version = get_option( $this->db_version_option, '0.0.0' );

        if ( version_compare( $installed_version, $this->db_version, '<' ) ) {
            $this->create_tables();
            $this->run_version_migrations( $installed_version );
            update_option( $this->db_version_option, $this->db_version );
        }
    }

    /**
     * Create or update database tables using dbDelta.
     *
     * @return void
     */
    private function create_tables(): void {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $table_name      = $wpdb->prefix . 'plugin_name_items';

        // IMPORTANT: dbDelta is extremely picky about SQL formatting:
        // - Each field MUST be on its own line.
        // - TWO spaces between PRIMARY KEY and the key definition.
        // - Use backticks around field names.
        // - No trailing commas.
        $sql = "CREATE TABLE `{$table_name}` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `title` varchar(255) NOT NULL DEFAULT '',
            `description` longtext NOT NULL,
            `status` varchar(20) NOT NULL DEFAULT 'draft',
            `author_id` bigint(20) unsigned NOT NULL DEFAULT 0,
            `meta` longtext DEFAULT NULL,
            `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (`id`),
            KEY `idx_status` (`status`),
            KEY `idx_author_id` (`author_id`),
            KEY `idx_created_at` (`created_at`)
        ) {$charset_collate};";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );

        /**
         * Fires after database tables are created/updated.
         *
         * @since 1.0.0
         * @param string $table_name The table name.
         */
        do_action( 'plugin_name_tables_created', $table_name );
    }

    /**
     * Run version-specific migrations.
     *
     * @param string $from_version The version migrating from.
     * @return void
     */
    private function run_version_migrations( string $from_version ): void {
        global $wpdb;

        // Example: Migration from 0.9.x to 1.0.0.
        if ( version_compare( $from_version, '1.0.0', '<' ) ) {
            // Add new column if upgrading from an older version.
            // dbDelta handles adding new columns, but for ALTERs
            // that dbDelta cannot do (rename, drop), use $wpdb->query().

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            // $wpdb->query( "ALTER TABLE `{$wpdb->prefix}plugin_name_items` ADD INDEX `idx_new` (`new_column`)" );
        }

        /**
         * Fires during version migrations.
         * Use this to run your own migrations when the plugin updates.
         *
         * @since 1.0.0
         * @param string $from_version The version being migrated from.
         * @param string $to_version   The version being migrated to.
         */
        do_action( 'plugin_name_migrate', $from_version, $this->db_version );
    }

    /**
     * Get the full table name.
     *
     * @return string
     */
    public static function get_table_name(): string {
        global $wpdb;
        return $wpdb->prefix . 'plugin_name_items';
    }

    /**
     * Drop all plugin tables. Called from uninstall.php only.
     *
     * @return void
     */
    public static function drop_tables(): void {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
        $wpdb->query(
            $wpdb->prepare(
                'DROP TABLE IF EXISTS `%1$s`',
                $wpdb->prefix . 'plugin_name_items'
            )
        );
    }
}
```

### src/Database/Repository.php

```php
<?php
/**
 * Repository for CRUD operations on the items table.
 *
 * @package PluginName\Database
 * @since   1.0.0
 */

declare( strict_types=1 );

namespace PluginName\Database;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Repository
 *
 * ALWAYS use $wpdb->prepare() for queries with user input. NEVER concatenate.
 *
 * @since 1.0.0
 */
class Repository {

    /**
     * Table name.
     *
     * @var string
     */
    private string $table;

    /**
     * Constructor.
     */
    public function __construct() {
        $this->table = Migrator::get_table_name();
    }

    /**
     * Find a single item by ID.
     *
     * @param int $id Item ID.
     * @return object|null
     */
    public function find( int $id ): ?object {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $item = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM `{$this->table}` WHERE `id` = %d",
                $id
            )
        );

        return $item ?: null;
    }

    /**
     * Find all items with pagination, search, and ordering.
     *
     * @param array<string, mixed> $args Query arguments.
     * @return array<int, object>
     */
    public function find_all( array $args = array() ): array {
        global $wpdb;

        $defaults = array(
            'per_page' => 20,
            'page'     => 1,
            'search'   => '',
            'status'   => '',
            'orderby'  => 'created_at',
            'order'    => 'DESC',
        );

        $args = wp_parse_args( $args, $defaults );

        // Whitelist orderby to prevent SQL injection.
        $allowed_orderby = array( 'id', 'title', 'status', 'created_at', 'updated_at' );
        $orderby         = in_array( $args['orderby'], $allowed_orderby, true ) ? $args['orderby'] : 'created_at';
        $order           = 'ASC' === strtoupper( $args['order'] ) ? 'ASC' : 'DESC';

        $where  = array( '1=1' );
        $values = array();

        if ( ! empty( $args['search'] ) ) {
            $where[]  = '`title` LIKE %s';
            $values[] = '%' . $wpdb->esc_like( $args['search'] ) . '%';
        }

        if ( ! empty( $args['status'] ) ) {
            $where[]  = '`status` = %s';
            $values[] = $args['status'];
        }

        /**
         * Filter the WHERE clauses for the items query.
         *
         * @since 1.0.0
         * @param array $where  WHERE clause parts.
         * @param array $values Prepared statement values.
         * @param array $args   Original query arguments.
         */
        $where = apply_filters( 'plugin_name_repository_where', $where, $values, $args );

        $where_sql = implode( ' AND ', $where );
        $offset    = absint( ( $args['page'] - 1 ) * $args['per_page'] );
        $limit     = absint( $args['per_page'] );

        $sql = "SELECT * FROM `{$this->table}` WHERE {$where_sql} ORDER BY `{$orderby}` {$order} LIMIT %d OFFSET %d";

        $values[] = $limit;
        $values[] = $offset;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
        $results = $wpdb->get_results(
            $wpdb->prepare( $sql, $values )
        );

        return $results ?: array();
    }

    /**
     * Count items matching criteria.
     *
     * @param array<string, mixed> $args Query arguments.
     * @return int
     */
    public function count( array $args = array() ): int {
        global $wpdb;

        $where  = array( '1=1' );
        $values = array();

        if ( ! empty( $args['search'] ) ) {
            $where[]  = '`title` LIKE %s';
            $values[] = '%' . $wpdb->esc_like( $args['search'] ) . '%';
        }

        if ( ! empty( $args['status'] ) ) {
            $where[]  = '`status` = %s';
            $values[] = $args['status'];
        }

        $where_sql = implode( ' AND ', $where );

        if ( ! empty( $values ) ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
            $count = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM `{$this->table}` WHERE {$where_sql}",
                    $values
                )
            );
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $count = $wpdb->get_var( "SELECT COUNT(*) FROM `{$this->table}`" );
        }

        return (int) $count;
    }

    /**
     * Insert a new item.
     *
     * @param array<string, mixed> $data Item data.
     * @return int|false The new item ID, or false on failure.
     */
    public function insert( array $data ): int|false {
        global $wpdb;

        $data['created_at'] = current_time( 'mysql', true );
        $data['updated_at'] = current_time( 'mysql', true );

        /**
         * Filter item data before insertion.
         *
         * @since 1.0.0
         * @param array $data The item data.
         */
        $data = apply_filters( 'plugin_name_repository_insert_data', $data );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $result = $wpdb->insert(
            $this->table,
            $data,
            $this->get_format( $data )
        );

        if ( false === $result ) {
            return false;
        }

        return (int) $wpdb->insert_id;
    }

    /**
     * Update an existing item.
     *
     * @param int                  $id   Item ID.
     * @param array<string, mixed> $data Data to update.
     * @return int|false Number of rows updated, or false on error.
     */
    public function update( int $id, array $data ): int|false {
        global $wpdb;

        $data['updated_at'] = current_time( 'mysql', true );

        /**
         * Filter item data before update.
         *
         * @since 1.0.0
         * @param array $data The item data.
         * @param int   $id   The item ID.
         */
        $data = apply_filters( 'plugin_name_repository_update_data', $data, $id );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return $wpdb->update(
            $this->table,
            $data,
            array( 'id' => $id ),
            $this->get_format( $data ),
            array( '%d' )
        );
    }

    /**
     * Delete an item by ID.
     *
     * @param int $id Item ID.
     * @return bool
     */
    public function delete( int $id ): bool {
        global $wpdb;

        /**
         * Fires before an item is deleted from the database.
         *
         * @since 1.0.0
         * @param int $id The item ID.
         */
        do_action( 'plugin_name_repository_before_delete', $id );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $result = $wpdb->delete(
            $this->table,
            array( 'id' => $id ),
            array( '%d' )
        );

        return false !== $result;
    }

    /**
     * Get format array for wpdb methods based on data keys.
     *
     * @param array<string, mixed> $data Data array.
     * @return array<int, string>
     */
    private function get_format( array $data ): array {
        $formats = array();

        foreach ( $data as $key => $value ) {
            if ( is_int( $value ) ) {
                $formats[] = '%d';
            } elseif ( is_float( $value ) ) {
                $formats[] = '%f';
            } else {
                $formats[] = '%s';
            }
        }

        return $formats;
    }
}
```

---

## 11. Security

These rules are NON-NEGOTIABLE. Violating any of them will get your plugin rejected from WordPress.org.

### Direct File Access Prevention

EVERY PHP file MUST start with this check (after the `<?php` tag and any doc comments):

```php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
```

### Nonce Verification

```php
<?php
// FORM — always include a nonce field.
wp_nonce_field( 'plugin_name_save_action', 'plugin_name_nonce' );

// PROCESSING — always verify the nonce FIRST.
public function handle_form_submission(): void {
    // 1. Check nonce.
    if ( ! isset( $_POST['plugin_name_nonce'] ) ||
         ! wp_verify_nonce(
             sanitize_text_field( wp_unslash( $_POST['plugin_name_nonce'] ) ),
             'plugin_name_save_action'
         )
    ) {
        wp_die( esc_html__( 'Security check failed.', 'plugin-name' ) );
    }

    // 2. Check capability.
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'Unauthorized access.', 'plugin-name' ) );
    }

    // 3. Sanitize ALL input.
    $title       = sanitize_text_field( wp_unslash( $_POST['title'] ?? '' ) );
    $email       = sanitize_email( wp_unslash( $_POST['email'] ?? '' ) );
    $count       = absint( $_POST['count'] ?? 0 );
    $content     = wp_kses_post( wp_unslash( $_POST['content'] ?? '' ) );
    $url         = esc_url_raw( wp_unslash( $_POST['url'] ?? '' ) );
    $description = sanitize_textarea_field( wp_unslash( $_POST['description'] ?? '' ) );

    // 4. Validate.
    if ( empty( $title ) ) {
        wp_die( esc_html__( 'Title is required.', 'plugin-name' ) );
    }

    // 5. Process.
    $this->repository->insert( array(
        'title'       => $title,
        'description' => $description,
    ) );
}
```

### Sanitization Reference

| Data Type     | Sanitize Function              | Use Case                      |
|---------------|-------------------------------|-------------------------------|
| Text          | `sanitize_text_field()`       | Single line plain text         |
| Textarea      | `sanitize_textarea_field()`   | Multi-line plain text          |
| HTML          | `wp_kses_post()`              | Rich content (post-like HTML)  |
| Email         | `sanitize_email()`            | Email addresses                |
| URL           | `esc_url_raw()`               | URLs for storage               |
| Integer       | `absint()`                    | Positive integers              |
| Integer (+/-) | `intval()`                    | Signed integers                |
| Float         | `floatval()`                  | Decimal numbers                |
| Key/slug      | `sanitize_key()`              | Lowercase alphanumeric + dash  |
| Filename      | `sanitize_file_name()`        | File names                     |
| CSS class     | `sanitize_html_class()`       | HTML class attribute           |
| Title         | `sanitize_title()`            | URL-friendly slugs             |
| Hex color     | `sanitize_hex_color()`        | CSS hex colors                 |
| Array         | `array_map( 'sanitize_text_field', $arr )` | Array of strings  |

### Escaping Reference (ALWAYS Escape on Output)

| Context      | Escape Function   | Use Case                     |
|-------------|-------------------|------------------------------|
| HTML text   | `esc_html()`      | Inside HTML tags              |
| Attributes  | `esc_attr()`      | Inside HTML attributes        |
| URLs        | `esc_url()`       | In href/src attributes        |
| Textarea    | `esc_textarea()`  | In `<textarea>` content       |
| JavaScript  | `esc_js()`        | Inline JS strings             |
| Rich HTML   | `wp_kses_post()`  | Post-like HTML output         |
| Custom HTML | `wp_kses( $str, $allowed )` | Specific allowed tags |

```php
<?php
// CORRECT — always escape on output.
echo '<h2>' . esc_html( $title ) . '</h2>';
echo '<a href="' . esc_url( $url ) . '" class="' . esc_attr( $class ) . '">';
echo '<input value="' . esc_attr( $value ) . '" />';
echo '<div>' . wp_kses_post( $content ) . '</div>';

// For translation + escape in one call:
echo '<p>' . esc_html__( 'Welcome back!', 'plugin-name' ) . '</p>';
esc_html_e( 'Save Changes', 'plugin-name' );
echo '<input value="' . esc_attr__( 'Submit', 'plugin-name' ) . '" />';
```

### SQL Injection Prevention

```php
<?php
// ALWAYS use $wpdb->prepare() with user input. NO EXCEPTIONS.

// CORRECT:
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM `{$table}` WHERE `status` = %s AND `author_id` = %d",
        $status,
        $author_id
    )
);

// CORRECT — LIKE queries:
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM `{$table}` WHERE `title` LIKE %s",
        '%' . $wpdb->esc_like( $search_term ) . '%'
    )
);

// CORRECT — IN clause:
$ids         = array( 1, 2, 3 );
$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
$results     = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM `{$table}` WHERE `id` IN ({$placeholders})",
        ...$ids
    )
);

// WRONG — NEVER DO THIS:
$results = $wpdb->get_results( "SELECT * FROM {$table} WHERE id = {$_GET['id']}" );
```

### AJAX Security

```php
<?php
// Register AJAX handlers — ALWAYS register both for logged-in and non-logged-in users as needed.
add_action( 'wp_ajax_plugin_name_search', array( $this, 'ajax_search' ) );
// Only add nopriv if accessible to non-logged-in users:
// add_action( 'wp_ajax_nopriv_plugin_name_search', array( $this, 'ajax_search' ) );

// AJAX handler:
public function ajax_search(): void {
    // 1. Verify nonce.
    check_ajax_referer( 'plugin_name_ajax_nonce', 'nonce' );

    // 2. Check capability.
    if ( ! current_user_can( 'read' ) ) {
        wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'plugin-name' ) ), 403 );
    }

    // 3. Sanitize input.
    $query = sanitize_text_field( wp_unslash( $_POST['query'] ?? '' ) );

    // 4. Process and respond.
    $results = $this->repository->find_all( array( 'search' => $query ) );

    wp_send_json_success( array( 'items' => $results ) );
}

// Localize script with nonce:
wp_localize_script( 'plugin-name-admin', 'pluginNameData', array(
    'ajaxUrl' => admin_url( 'admin-ajax.php' ),
    'nonce'   => wp_create_nonce( 'plugin_name_ajax_nonce' ),
) );
```

---

## 12. Internationalization (i18n)

EVERY user-facing string MUST be translatable. The text domain MUST match the plugin slug exactly.

```php
<?php
// Simple string.
$label = __( 'Settings', 'plugin-name' );

// Echo directly.
_e( 'Save Changes', 'plugin-name' );

// With escape (PREFERRED for output).
echo esc_html__( 'Welcome', 'plugin-name' );
esc_html_e( 'Description', 'plugin-name' );
echo esc_attr__( 'Search', 'plugin-name' );

// Plurals.
$message = sprintf(
    /* translators: %d: Number of items */
    _n( '%d item found.', '%d items found.', $count, 'plugin-name' ),
    $count
);

// Contextual (disambiguation).
$label = _x( 'Post', 'noun: a blog post', 'plugin-name' );

// With placeholders — ALWAYS use sprintf, NEVER concatenate.
$message = sprintf(
    /* translators: 1: User name, 2: Date */
    esc_html__( 'Created by %1$s on %2$s.', 'plugin-name' ),
    esc_html( $user_name ),
    esc_html( $date )
);
```

### Loading Text Domain

```php
<?php
// In I18n class (loaded early via 'init' hook):
load_plugin_textdomain(
    'plugin-name',
    false,
    dirname( PLUGIN_NAME_BASENAME ) . '/languages/'
);
```

### Generating POT File

```bash
# Using WP-CLI:
wp i18n make-pot . languages/plugin-name.pot --slug=plugin-name --domain=plugin-name

# Using npm (via @wordpress/scripts):
npx wp-scripts i18n make-pot . languages/plugin-name.pot
```

---

## 13. Performance

### Transients API (Caching)

```php
<?php
/**
 * Cache service using Transients API.
 *
 * @package PluginName\Services
 * @since   1.0.0
 */

declare( strict_types=1 );

namespace PluginName\Services;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Cache
 *
 * @since 1.0.0
 */
class Cache {

    /**
     * Cache prefix.
     *
     * @var string
     */
    private string $prefix = 'plugin_name_';

    /**
     * Default expiration in seconds (1 hour).
     *
     * @var int
     */
    private int $default_expiration = HOUR_IN_SECONDS;

    /**
     * Get a cached value.
     *
     * @param string $key Cache key.
     * @return mixed|false Cached value or false.
     */
    public function get( string $key ): mixed {
        $value = get_transient( $this->prefix . $key );

        /**
         * Filter a cached value when retrieved.
         *
         * @since 1.0.0
         * @param mixed  $value The cached value (false if not found).
         * @param string $key   The cache key.
         */
        return apply_filters( 'plugin_name_cache_get', $value, $key );
    }

    /**
     * Set a cached value.
     *
     * @param string $key        Cache key.
     * @param mixed  $value      Value to cache.
     * @param int    $expiration Expiration in seconds. Default 1 hour.
     * @return bool
     */
    public function set( string $key, mixed $value, int $expiration = 0 ): bool {
        if ( 0 === $expiration ) {
            /**
             * Filter the default cache expiration.
             *
             * @since 1.0.0
             * @param int    $expiration Default expiration in seconds.
             * @param string $key        The cache key.
             */
            $expiration = apply_filters( 'plugin_name_cache_expiration', $this->default_expiration, $key );
        }

        return set_transient( $this->prefix . $key, $value, $expiration );
    }

    /**
     * Delete a cached value.
     *
     * @param string $key Cache key.
     * @return bool
     */
    public function delete( string $key ): bool {
        return delete_transient( $this->prefix . $key );
    }

    /**
     * Get or set — retrieve from cache, or compute and cache.
     *
     * @param string   $key        Cache key.
     * @param callable $callback   Function to compute value if not cached.
     * @param int      $expiration Expiration in seconds.
     * @return mixed
     */
    public function remember( string $key, callable $callback, int $expiration = 0 ): mixed {
        $value = $this->get( $key );

        if ( false !== $value ) {
            return $value;
        }

        $value = $callback();
        $this->set( $key, $value, $expiration );

        return $value;
    }

    /**
     * Flush all plugin transients.
     *
     * @return void
     */
    public function flush(): void {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM `{$wpdb->options}` WHERE `option_name` LIKE %s OR `option_name` LIKE %s",
                $wpdb->esc_like( '_transient_' . $this->prefix ) . '%',
                $wpdb->esc_like( '_transient_timeout_' . $this->prefix ) . '%'
            )
        );

        /**
         * Fires after all plugin caches are flushed.
         *
         * @since 1.0.0
         */
        do_action( 'plugin_name_cache_flushed' );
    }
}
```

### Conditional Loading

```php
<?php
// In Plugin::init() — load classes only where needed.

// Admin-only classes.
if ( is_admin() ) {
    $this->define_admin_hooks();
}

// Frontend only.
if ( ! is_admin() && ! wp_doing_ajax() && ! wp_doing_cron() ) {
    $this->define_public_hooks();
}

// REST API — registered via rest_api_init, only loaded when REST is active.
$this->loader->add_action( 'rest_api_init', $controller, 'register_routes' );

// Enqueue scripts only on specific pages.
public function enqueue_scripts(): void {
    // Only on single posts.
    if ( ! is_singular( 'post' ) ) {
        return;
    }

    wp_enqueue_script( 'plugin-name-public', /* ... */ );
}

// Use wp_doing_ajax() check.
if ( wp_doing_ajax() ) {
    // Register AJAX handlers only during AJAX.
}
```

### Script/Style Optimization

```php
<?php
// Conditional enqueue — NEVER load globally.
public function enqueue_styles( string $hook ): void {
    if ( ! $this->is_plugin_page( $hook ) ) {
        return;
    }

    wp_enqueue_style(
        'plugin-name-admin',
        PLUGIN_NAME_URL . 'assets/css/admin.css',
        array(),
        PLUGIN_NAME_VERSION
    );
}

// Defer non-critical scripts.
add_filter( 'script_loader_tag', function ( string $tag, string $handle ): string {
    if ( 'plugin-name-public' === $handle ) {
        return str_replace( ' src', ' defer src', $tag );
    }
    return $tag;
}, 10, 2 );
```

---

## 14. Testing

### tests/bootstrap.php

```php
<?php
/**
 * PHPUnit bootstrap file for WordPress plugin tests.
 */

// Load Composer autoloader.
require_once dirname( __DIR__ ) . '/vendor/autoload.php';

// Find the WordPress test library.
$_tests_dir = getenv( 'WP_TESTS_DIR' ) ?: rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
    echo "WordPress test library not found at {$_tests_dir}.\n";
    exit( 1 );
}

// Load the test functions.
require_once $_tests_dir . '/includes/functions.php';

// Load the plugin.
tests_add_filter( 'muplugins_loaded', function () {
    require dirname( __DIR__ ) . '/plugin-name.php';
} );

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';
```

### tests/phpunit.xml

```xml
<?xml version="1.0"?>
<phpunit
    bootstrap="bootstrap.php"
    backupGlobals="false"
    colors="true"
    convertErrorsToExceptions="true"
    convertNoticesToExceptions="true"
    convertWarningsToExceptions="true"
>
    <testsuites>
        <testsuite name="Plugin Test Suite">
            <directory suffix="Test.php">./Unit</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

### tests/Unit/RepositoryTest.php

```php
<?php
/**
 * Repository tests.
 *
 * @package PluginName\Tests\Unit
 */

declare( strict_types=1 );

namespace PluginName\Tests\Unit;

use PluginName\Database\Migrator;
use PluginName\Database\Repository;
use WP_UnitTestCase;

/**
 * Class RepositoryTest
 */
class RepositoryTest extends WP_UnitTestCase {

    /**
     * Repository instance.
     *
     * @var Repository
     */
    private Repository $repository;

    /**
     * Set up before each test.
     *
     * @return void
     */
    public function set_up(): void {
        parent::set_up();

        // Run migrations.
        $migrator = new Migrator();
        $migrator->run();

        $this->repository = new Repository();
    }

    /**
     * Test inserting an item.
     *
     * @return void
     */
    public function test_insert_returns_id(): void {
        $id = $this->repository->insert( array(
            'title'       => 'Test Item',
            'description' => 'A test description.',
            'status'      => 'active',
        ) );

        $this->assertIsInt( $id );
        $this->assertGreaterThan( 0, $id );
    }

    /**
     * Test finding an item by ID.
     *
     * @return void
     */
    public function test_find_returns_item(): void {
        $id   = $this->repository->insert( array(
            'title'  => 'Find Me',
            'description' => '',
            'status' => 'active',
        ) );
        $item = $this->repository->find( $id );

        $this->assertNotNull( $item );
        $this->assertSame( 'Find Me', $item->title );
    }

    /**
     * Test finding non-existent item returns null.
     *
     * @return void
     */
    public function test_find_nonexistent_returns_null(): void {
        $this->assertNull( $this->repository->find( 99999 ) );
    }

    /**
     * Test deleting an item.
     *
     * @return void
     */
    public function test_delete_removes_item(): void {
        $id = $this->repository->insert( array(
            'title'  => 'Delete Me',
            'description' => '',
            'status' => 'draft',
        ) );

        $this->assertTrue( $this->repository->delete( $id ) );
        $this->assertNull( $this->repository->find( $id ) );
    }

    /**
     * Test that plugin_name_repository_before_delete action fires.
     *
     * @return void
     */
    public function test_delete_fires_action(): void {
        $id     = $this->repository->insert( array(
            'title'  => 'Hook Test',
            'description' => '',
            'status' => 'draft',
        ) );
        $fired = false;

        add_action( 'plugin_name_repository_before_delete', function ( int $deleted_id ) use ( $id, &$fired ) {
            if ( $deleted_id === $id ) {
                $fired = true;
            }
        } );

        $this->repository->delete( $id );
        $this->assertTrue( $fired );
    }
}
```

---

## 15. WordPress.org Compliance

### readme.txt

```
=== Plugin Name ===
Contributors: yourname
Donate link: https://example.com/donate
Tags: tag1, tag2, tag3, tag4, tag5
Requires at least: 6.4
Tested up to: 6.7
Stable tag: 1.0.0
Requires PHP: 8.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Short description of the plugin (max 150 characters).

== Description ==

Long description. Markdown is supported.

**Features:**

* Feature one
* Feature two
* Feature three

**Third-party services:**

This plugin connects to [Service Name](https://service.com) to provide [feature].
Data sent: [describe data]. See their [Terms of Service](https://service.com/tos)
and [Privacy Policy](https://service.com/privacy).

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/plugin-name/`
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Use the Settings → Plugin Name screen to configure the plugin

== Frequently Asked Questions ==

= Question one? =

Answer one.

= Question two? =

Answer two.

== Screenshots ==

1. Description of screenshot one.
2. Description of screenshot two.

== Changelog ==

= 1.0.0 =
* Initial release.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
```

### Compliance Checklist

You MUST verify ALL of these before submitting to WordPress.org:

- [ ] **Prefix everything** — All functions, classes, constants, options, hooks, scripts, styles, REST routes, DB tables, nonces, AJAX actions, CSS classes, JS globals
- [ ] **Sanitize all input** — Every `$_GET`, `$_POST`, `$_REQUEST`, `$_SERVER` value sanitized
- [ ] **Escape all output** — Every `echo`, every template variable escaped with appropriate `esc_*()` function
- [ ] **Nonce all forms** — Every form has `wp_nonce_field()`, every handler checks `wp_verify_nonce()` or `check_admin_referer()`
- [ ] **Capability checks** — Every admin action verifies `current_user_can()`
- [ ] **Prepared queries** — Every `$wpdb` query with variables uses `$wpdb->prepare()`
- [ ] **No direct file access** — Every PHP file checks `defined( 'ABSPATH' )`
- [ ] **GPL compatible license** — GPL-2.0-or-later
- [ ] **No tracking without consent** — No analytics, external calls, or data collection without explicit user opt-in
- [ ] **Service disclosure** — All external API calls documented in readme.txt
- [ ] **Proper uninstall** — `uninstall.php` cleans up all plugin data
- [ ] **Text domain matches slug** — Text domain in headers and all `__()` calls matches the plugin directory name
- [ ] **No PHP errors** — Zero notices, warnings, or errors with `WP_DEBUG` enabled
- [ ] **Plugin Check (PCP)** — Pass all checks from the official Plugin Check plugin
- [ ] **readme.txt valid** — Passes the WordPress.org readme validator

### .phpcs.xml (Coding Standards Config)

```xml
<?xml version="1.0"?>
<ruleset name="Plugin Name">
    <description>WordPress Coding Standards for Plugin Name</description>

    <!-- Scan these files -->
    <file>./src</file>
    <file>./plugin-name.php</file>
    <file>./uninstall.php</file>

    <!-- Exclude vendor -->
    <exclude-pattern>./vendor/*</exclude-pattern>
    <exclude-pattern>./node_modules/*</exclude-pattern>
    <exclude-pattern>./tests/*</exclude-pattern>

    <!-- Use WordPress standards -->
    <rule ref="WordPress">
        <!-- Allow PSR-4 file naming -->
        <exclude name="WordPress.Files.FileName"/>
    </rule>

    <rule ref="WordPress-Extra"/>
    <rule ref="WordPress-Docs"/>

    <!-- Set minimum supported versions -->
    <config name="minimum_wp_version" value="6.4"/>

    <!-- Text domain -->
    <rule ref="WordPress.WP.I18n">
        <properties>
            <property name="text_domain" type="array">
                <element value="plugin-name"/>
            </property>
        </properties>
    </rule>

    <!-- Prefixes -->
    <rule ref="WordPress.NamingConventions.PrefixAllGlobals">
        <properties>
            <property name="prefixes" type="array">
                <element value="plugin_name"/>
                <element value="PluginName"/>
            </property>
        </properties>
    </rule>

    <!-- PHP compatibility -->
    <rule ref="PHPCompatibilityWP"/>
    <config name="testVersion" value="8.0-"/>
</ruleset>
```

---

## 16. Uninstall Pattern

ALWAYS use `uninstall.php` (NOT `register_uninstall_hook()`). The uninstall file runs in a clean WordPress context and does not require loading the full plugin.

### uninstall.php

```php
<?php
/**
 * Plugin uninstall handler.
 *
 * Fires when the plugin is deleted via the WordPress admin.
 * Cleans up ALL data: options, transients, tables, user meta, post meta, cron.
 *
 * @package PluginName
 * @since   1.0.0
 */

// CRITICAL: If uninstall not called from WordPress, die.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    die;
}

global $wpdb;

/**
 * -------------------------------------------------------------------------
 * 1. Delete plugin options.
 * -------------------------------------------------------------------------
 */
$options = array(
    'plugin_name_version',
    'plugin_name_db_version',
    'plugin_name_enable_feature',
    'plugin_name_items_per_page',
    'plugin_name_api_key',
    'plugin_name_cache_duration',
);

foreach ( $options as $option ) {
    delete_option( $option );
}

// For multisite — delete options from all sites.
if ( is_multisite() ) {
    $site_ids = get_sites( array( 'fields' => 'ids' ) );

    foreach ( $site_ids as $site_id ) {
        switch_to_blog( $site_id );

        foreach ( $options as $option ) {
            delete_option( $option );
        }

        restore_current_blog();
    }
}

/**
 * -------------------------------------------------------------------------
 * 2. Delete transients.
 * -------------------------------------------------------------------------
 */
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query(
    $wpdb->prepare(
        "DELETE FROM `{$wpdb->options}` WHERE `option_name` LIKE %s OR `option_name` LIKE %s",
        $wpdb->esc_like( '_transient_plugin_name_' ) . '%',
        $wpdb->esc_like( '_transient_timeout_plugin_name_' ) . '%'
    )
);

/**
 * -------------------------------------------------------------------------
 * 3. Delete custom database tables.
 * -------------------------------------------------------------------------
 */
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
$wpdb->query( "DROP TABLE IF EXISTS `{$wpdb->prefix}plugin_name_items`" );

/**
 * -------------------------------------------------------------------------
 * 4. Delete user meta.
 * -------------------------------------------------------------------------
 */
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query(
    $wpdb->prepare(
        "DELETE FROM `{$wpdb->usermeta}` WHERE `meta_key` LIKE %s",
        $wpdb->esc_like( '_plugin_name_' ) . '%'
    )
);

/**
 * -------------------------------------------------------------------------
 * 5. Delete post meta.
 * -------------------------------------------------------------------------
 */
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query(
    $wpdb->prepare(
        "DELETE FROM `{$wpdb->postmeta}` WHERE `meta_key` LIKE %s",
        $wpdb->esc_like( '_plugin_name_' ) . '%'
    )
);

/**
 * -------------------------------------------------------------------------
 * 6. Clear scheduled cron events.
 * -------------------------------------------------------------------------
 */
$cron_events = array(
    'plugin_name_cron_event',
    'plugin_name_daily_sync',
);

foreach ( $cron_events as $event ) {
    $timestamp = wp_next_scheduled( $event );
    if ( $timestamp ) {
        wp_unschedule_event( $timestamp, $event );
    }
}

/**
 * -------------------------------------------------------------------------
 * 7. Clear any object cache.
 * -------------------------------------------------------------------------
 */
wp_cache_flush();
```

---

## 17. Golden Rules

These are the 15 non-negotiable rules for every WordPress plugin you write:

1. **NEVER write procedural spaghetti.** Use OOP with namespaces and Composer autoloading. One class, one responsibility.

2. **PREFIX EVERYTHING.** Functions, classes, constants, options, hooks, meta, transients, nonces, AJAX actions, REST routes, CSS classes, JS globals, DB tables. No exceptions.

3. **SANITIZE on input, ESCAPE on output.** Use WordPress sanitization functions for every `$_GET`, `$_POST`, `$_REQUEST`, `$_SERVER`, and `$_COOKIE` value. Use `esc_html()`, `esc_attr()`, `esc_url()` for every output.

4. **VERIFY nonces and capabilities.** Every form submission, AJAX request, and REST endpoint MUST check nonces and user capabilities before processing.

5. **PREPARE all database queries.** ALWAYS use `$wpdb->prepare()` with parameterized placeholders. NEVER concatenate user input into SQL strings.

6. **HOOK EVERYTHING.** Fire `do_action()` before and after every significant operation. Wrap every output with `apply_filters()`. This makes your plugin extensible and overridable.

7. **LOAD CONDITIONALLY.** Never load admin code on the frontend. Never enqueue scripts/styles globally. Use `is_admin()`, hook suffixes, and conditional checks.

8. **TRANSLATE ALL STRINGS.** Every user-facing string MUST use `__()`, `_e()`, `_n()`, `_x()`, or their escaped variants. Text domain MUST match the plugin slug.

9. **USE WORDPRESS APIS.** Options API for settings, Transients API for caching, HTTP API for remote requests, REST API for endpoints. Never reinvent what WordPress provides.

10. **CLEAN UP AFTER YOURSELF.** `uninstall.php` MUST remove all options, transients, custom tables, user meta, post meta, and cron events. Leave no traces.

11. **NEVER TRUST USER INPUT.** Validate data types, ranges, and allowed values. Reject invalid data early. Whitelist rather than blacklist.

12. **USE CUSTOM CSS, NOT FRAMEWORKS.** Write lightweight, prefixed CSS with BEM naming and custom properties. No Bootstrap, no Tailwind in plugins. Enqueue only on your pages.

13. **SCOPE DEPENDENCIES.** When using Composer packages, use Strauss to prefix vendor namespaces and prevent conflicts with other plugins.

14. **VERSION YOUR DATABASE.** Store schema version in options, check on `plugins_loaded`, run `dbDelta()` for updates. Support incremental migrations.

15. **TEST BEFORE SHIPPING.** Run PHPCS with WPCS rules, test with `WP_DEBUG` enabled, verify with the Plugin Check (PCP) plugin, and write PHPUnit tests for critical logic.

---

## Quick Reference: File Templates

When creating a new WordPress plugin, generate these files first:
1. `plugin-name.php` — Main bootstrap (Section 3)
2. `composer.json` — Autoloading (Section 2)
3. `src/Core/Plugin.php` — Service container (Section 4)
4. `src/Core/Loader.php` — Hook manager (Section 4)
5. `src/Core/Activator.php` — Activation (Section 4)
6. `src/Core/Deactivator.php` — Deactivation (Section 4)
7. `src/Core/I18n.php` — Translations (Section 4)
8. `uninstall.php` — Cleanup (Section 16)
9. `.phpcs.xml` — Coding standards (Section 15)
10. `readme.txt` — WordPress.org metadata (Section 15)

Then add feature-specific files as needed: Admin, Settings, Frontend, REST API, Database, etc.
