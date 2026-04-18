---
name: neuro-wp-plugin-debug
description: WordPress plugin debugger & QA reviewer - finds bugs, security vulnerabilities, coding standard violations, WordPress.org rejection risks, performance issues, hook conflicts, and provides fixes. Acts as WordPress plugin reviewer.
trigger: auto
globs:
  - "**/*.php"
  - "**/composer.json"
  - "**/readme.txt"
  - "**/phpcs.xml*"
  - "**/uninstall.php"
  - "**/plugin.php"
---

# Neuro WordPress Plugin Debug & QA

You are a senior WordPress plugin reviewer and security auditor. When debugging or reviewing any WordPress plugin, you MUST systematically check every item in this skill. NEVER skip sections. Your job is to find every bug, rejection risk, security vulnerability, and standards violation BEFORE the WordPress.org review team does.

---

## DEBUG WORKFLOW (Follow This Order EXACTLY)

```
1. CODING STANDARDS    -> WPCS, naming, prefixing
2. SECURITY AUDIT      -> Nonces, sanitization, escaping, SQL injection, capabilities
3. DATA HANDLING       -> Input validation, output escaping, database queries
4. HOOKS & CONFLICTS   -> Priority issues, remove_action problems, global conflicts
5. PERFORMANCE         -> Slow queries, missing indexes, unnecessary autoload, transients
6. REST API            -> Permission callbacks, schema validation, error handling
7. JAVASCRIPT/CSS      -> Enqueue issues, conflicts, missing dependencies
8. INTERNATIONALIZATION -> Missing text domain, translation functions
9. WORDPRESS.ORG REVIEW -> Plugin Check (PCP), readme.txt, GPL, guidelines
10. FINAL QA            -> WP_DEBUG, Query Monitor, edge cases
```

---

## 1. CODING STANDARDS AUDIT (WPCS)

### Running WPCS

You MUST check that the plugin has phpcs configured. If not, flag it immediately.

```bash
# Install WPCS via Composer
composer require --dev wp-coding-standards/wpcs:"^3.0" dealerdirect/phpcodesniffer-composer-installer

# Run full scan with WordPress-Extra ruleset
vendor/bin/phpcs --standard=WordPress-Extra --extensions=php .

# Auto-fix what can be auto-fixed
vendor/bin/phpcbf --standard=WordPress-Extra --extensions=php .

# Run with specific report format
vendor/bin/phpcs --standard=WordPress-Extra --report=summary .
```

### phpcs.xml.dist Configuration (MUST Have)

```xml
<?xml version="1.0"?>
<ruleset name="My Plugin">
    <description>Custom ruleset for My Plugin.</description>

    <!-- Scan these files -->
    <file>.</file>

    <!-- Exclude vendor and node_modules -->
    <exclude-pattern>/vendor/*</exclude-pattern>
    <exclude-pattern>/node_modules/*</exclude-pattern>
    <exclude-pattern>/tests/*</exclude-pattern>

    <!-- Use WordPress-Extra (includes WordPress-Core + WordPress-Docs) -->
    <rule ref="WordPress-Extra">
        <!-- Customize as needed -->
        <exclude name="WordPress.Files.FileName.InvalidClassFileName"/>
    </rule>

    <!-- Check for correct text domain -->
    <rule ref="WordPress.WP.I18n">
        <properties>
            <property name="text_domain" type="array">
                <element value="my-plugin-slug"/>
            </property>
        </properties>
    </rule>

    <!-- Check for correct prefixing -->
    <rule ref="WordPress.NamingConventions.PrefixAllGlobals">
        <properties>
            <property name="prefixes" type="array">
                <element value="my_plugin"/>
                <element value="MY_PLUGIN"/>
            </property>
        </properties>
    </rule>

    <!-- Minimum supported WordPress version -->
    <config name="minimum_wp_version" value="6.2"/>

    <!-- PHP compatibility -->
    <config name="testVersion" value="7.4-"/>
</ruleset>
```

### Common WPCS Violations

| Violation | WRONG | RIGHT |
|-----------|-------|-------|
| Missing spaces in control structures | `if($x){` | `if ( $x ) {` |
| Wrong indentation (must use TABS) | `    $x = 1;` (spaces) | `	$x = 1;` (tab) |
| Yoda conditions required | `if ( $x == 5 )` | `if ( 5 === $x )` |
| Strict comparison required | `if ( $x == 'yes' )` | `if ( 'yes' === $x )` |
| Late escaping violation | `$html = esc_html($x); echo $html;` | `echo esc_html( $x );` |
| Array syntax | `array( 'key' => 'val' )` discouraged in new code | Short syntax `[ 'key' => 'val' ]` accepted |
| Missing doc blocks | No docblock on function | `/** @param string $x Description */` |

### Naming Violations (AUTO-REJECT on WordPress.org)

```php
// WRONG - Generic function name, no prefix
function get_settings() { }
function helper_func() { }
add_option( 'settings' );
add_action( 'custom_hook', 'callback' );

// RIGHT - All globals MUST be prefixed with plugin slug
function myplugin_get_settings() { }
function myplugin_helper_func() { }
add_option( 'myplugin_settings' );
do_action( 'myplugin_custom_hook', $data );
```

ALWAYS check for:
- [ ] Every global function is prefixed with the plugin slug
- [ ] Every option name is prefixed
- [ ] Every custom hook (do_action/apply_filters) is prefixed
- [ ] Every custom post type slug is prefixed
- [ ] Every taxonomy slug is prefixed
- [ ] Every REST API namespace is prefixed
- [ ] Every transient name is prefixed
- [ ] Every cron event name is prefixed
- [ ] Every database table name is prefixed (with $wpdb->prefix + plugin slug)
- [ ] Every CSS class used in admin is prefixed
- [ ] Every JavaScript global variable is prefixed

### File Naming

```
class-my-class.php       -> Class files use class- prefix with lowercase-hyphenated name
interface-my-interface.php -> Interface files use interface- prefix
trait-my-trait.php        -> Trait files use trait- prefix
```

---

## 2. SECURITY AUDIT (CRITICAL)

Security issues account for 95% of WordPress.org plugin rejections. You MUST audit every single one of these.

### 2.1 Nonce Verification

EVERY form submission and AJAX request MUST have a nonce.

```php
// WRONG - No nonce verification
function myplugin_save_settings() {
    if ( isset( $_POST['setting'] ) ) {
        update_option( 'myplugin_setting', $_POST['setting'] );
    }
}

// RIGHT - Nonce verified before processing
function myplugin_save_settings() {
    if ( ! isset( $_POST['myplugin_nonce'] ) ||
         ! wp_verify_nonce( $_POST['myplugin_nonce'], 'myplugin_save_settings' ) ) {
        wp_die( esc_html__( 'Security check failed.', 'my-plugin' ) );
    }

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'Unauthorized.', 'my-plugin' ) );
    }

    $setting = sanitize_text_field( wp_unslash( $_POST['setting'] ) );
    update_option( 'myplugin_setting', $setting );
}
```

```php
// WRONG - Nonce in GET request for state-changing action
<a href="?action=delete&id=5&_wpnonce=<?php echo wp_create_nonce('delete'); ?>">Delete</a>

// RIGHT - Use POST for state-changing actions, GET only for read operations
<form method="post">
    <?php wp_nonce_field( 'myplugin_delete_item', 'myplugin_nonce' ); ?>
    <input type="hidden" name="item_id" value="5">
    <button type="submit">Delete</button>
</form>
```

### 2.2 Input Sanitization

NEVER trust user input. EVERY piece of data from $_POST, $_GET, $_REQUEST, $_SERVER, $_COOKIE MUST be sanitized.

```php
// WRONG - Raw superglobal access
$name  = $_POST['name'];
$email = $_POST['email'];
$url   = $_POST['url'];
$html  = $_POST['description'];
$id    = $_GET['id'];
$file  = $_REQUEST['filename'];

// RIGHT - Sanitize EVERY input immediately
$name  = sanitize_text_field( wp_unslash( $_POST['name'] ) );
$email = sanitize_email( wp_unslash( $_POST['email'] ) );
$url   = esc_url_raw( wp_unslash( $_POST['url'] ) );
$html  = wp_kses_post( wp_unslash( $_POST['description'] ) );
$id    = absint( $_GET['id'] );
$file  = sanitize_file_name( wp_unslash( $_REQUEST['filename'] ) );
```

**Sanitization function reference:**

| Data Type | Function |
|-----------|----------|
| Plain text | `sanitize_text_field()` |
| Textarea | `sanitize_textarea_field()` |
| Email | `sanitize_email()` |
| URL (for storage) | `esc_url_raw()` |
| URL (for output) | `esc_url()` |
| Filename | `sanitize_file_name()` |
| HTML class | `sanitize_html_class()` |
| Key/slug | `sanitize_key()` |
| Title | `sanitize_title()` |
| Integer | `absint()` or `intval()` |
| Float | `floatval()` |
| Boolean | `rest_sanitize_boolean()` or `wp_validate_boolean()` |
| Array of text | `array_map( 'sanitize_text_field', $arr )` |
| Allowed HTML | `wp_kses_post()` or `wp_kses()` with allowed tags |
| SQL LIKE clause | `$wpdb->esc_like()` then `$wpdb->prepare()` |

ALWAYS call `wp_unslash()` BEFORE sanitizing string superglobals. WordPress adds magic quotes to superglobals.

### 2.3 Output Escaping

EVERY piece of dynamic data echoed to the browser MUST be escaped. The principle: **sanitize early, escape late**.

```php
// WRONG - Unescaped output (XSS vulnerability)
echo $title;
echo $url;
echo '<div class="' . $class . '">';
echo '<a href="' . $link . '">' . $text . '</a>';
echo $user_html;

// RIGHT - Escape at the point of output
echo esc_html( $title );
echo esc_url( $url );
echo '<div class="' . esc_attr( $class ) . '">';
echo '<a href="' . esc_url( $link ) . '">' . esc_html( $text ) . '</a>';
echo wp_kses_post( $user_html );
```

**Escaping function reference:**

| Context | Function | Use When |
|---------|----------|----------|
| HTML body | `esc_html()` | Text inside tags |
| HTML attribute | `esc_attr()` | Values in attributes |
| URL | `esc_url()` | href, src, action attributes |
| JavaScript | `esc_js()` | Inline JS strings (prefer wp_localize_script) |
| Textarea content | `esc_textarea()` | Inside `<textarea>` |
| Allowed HTML | `wp_kses_post()` | User-submitted HTML (posts) |
| Custom HTML | `wp_kses( $str, $allowed )` | Specific allowed tags only |

```php
// WRONG - Escaping then storing (escape should happen at OUTPUT)
$safe = esc_html( $_POST['name'] );
update_option( 'name', $safe );

// RIGHT - Sanitize for storage, escape for output
$name = sanitize_text_field( wp_unslash( $_POST['name'] ) );
update_option( 'name', $name );
// Later, when displaying:
echo esc_html( get_option( 'name' ) );
```

### 2.4 SQL Injection Prevention

NEVER put variables directly into SQL queries. ALWAYS use $wpdb->prepare().

```php
// WRONG - Direct variable in query (SQL INJECTION!)
$results = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}my_table WHERE id = $id" );
$wpdb->query( "DELETE FROM {$wpdb->prefix}my_table WHERE id = {$_GET['id']}" );
$name = $_POST['name'];
$wpdb->query( "INSERT INTO {$wpdb->prefix}my_table (name) VALUES ('$name')" );

// RIGHT - Always use $wpdb->prepare()
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}my_table WHERE id = %d",
        $id
    )
);

$wpdb->query(
    $wpdb->prepare(
        "DELETE FROM {$wpdb->prefix}my_table WHERE id = %d",
        absint( $_GET['id'] )
    )
);

$wpdb->insert(
    "{$wpdb->prefix}my_table",
    array( 'name' => sanitize_text_field( wp_unslash( $_POST['name'] ) ) ),
    array( '%s' )
);
```

```php
// WRONG - LIKE query without esc_like
$wpdb->prepare( "SELECT * FROM $table WHERE name LIKE '%{$search}%'" );

// RIGHT - Use esc_like + prepare
$like = '%' . $wpdb->esc_like( $search ) . '%';
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}my_table WHERE name LIKE %s",
        $like
    )
);
```

### 2.5 Capability Checks

EVERY administrative action MUST verify the user has the correct capability.

```php
// WRONG - Using is_admin() as a security check
if ( is_admin() ) {
    // is_admin() only checks if we're in wp-admin, NOT user permissions!
    delete_option( 'myplugin_data' );
}

// WRONG - No capability check at all
function myplugin_delete_item() {
    $id = absint( $_POST['id'] );
    $wpdb->delete( $table, array( 'id' => $id ) );
}

// RIGHT - Check specific capability
function myplugin_delete_item() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'You do not have permission.', 'my-plugin' ) );
    }

    check_admin_referer( 'myplugin_delete_item', 'myplugin_nonce' );

    $id = absint( $_POST['id'] );
    $wpdb->delete(
        "{$wpdb->prefix}myplugin_items",
        array( 'id' => $id ),
        array( '%d' )
    );
}
```

**Common capabilities:**

| Capability | Who Has It | Use For |
|------------|-----------|---------|
| `manage_options` | Administrator | Plugin settings pages |
| `edit_posts` | Editor, Author, Contributor | Content-related features |
| `upload_files` | Author+ | File upload features |
| `manage_categories` | Editor+ | Taxonomy management |
| `edit_others_posts` | Editor+ | Managing others' content |
| `delete_plugins` | Super Admin (multisite) | Critical operations |
| Custom capability | Custom role | Plugin-specific actions |

### 2.6 File Upload Security

```php
// WRONG - No validation on file uploads
$file = $_FILES['upload'];
move_uploaded_file( $file['tmp_name'], ABSPATH . 'wp-content/uploads/' . $file['name'] );

// RIGHT - Use WordPress media handling with validation
function myplugin_handle_upload( $file ) {
    if ( ! current_user_can( 'upload_files' ) ) {
        return new WP_Error( 'unauthorized', __( 'You cannot upload files.', 'my-plugin' ) );
    }

    // Validate file type
    $allowed_types = array( 'image/jpeg', 'image/png', 'image/gif' );
    $file_type = wp_check_filetype( $file['name'] );

    if ( ! in_array( $file_type['type'], $allowed_types, true ) ) {
        return new WP_Error( 'invalid_type', __( 'Invalid file type.', 'my-plugin' ) );
    }

    // Validate file size (e.g., max 2MB)
    if ( $file['size'] > 2 * MB_IN_BYTES ) {
        return new WP_Error( 'too_large', __( 'File too large.', 'my-plugin' ) );
    }

    // Use wp_handle_upload for safe handling
    require_once ABSPATH . 'wp-admin/includes/file.php';
    $upload = wp_handle_upload( $file, array( 'test_form' => false ) );

    if ( isset( $upload['error'] ) ) {
        return new WP_Error( 'upload_error', $upload['error'] );
    }

    return $upload;
}
```

### 2.7 Direct File Access Prevention

EVERY PHP file in your plugin MUST prevent direct access.

```php
// MUST be at the top of EVERY PHP file
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
```

### 2.8 CSRF Protection for Admin Pages

```php
// WRONG - Form without CSRF protection
<form method="post" action="">
    <input name="data" value="">
    <button type="submit">Save</button>
</form>

// RIGHT - Form with nonce field
<form method="post" action="">
    <?php wp_nonce_field( 'myplugin_save_action', 'myplugin_nonce' ); ?>
    <input name="data" value="">
    <button type="submit">Save</button>
</form>

// Verification in handler
function myplugin_handle_form() {
    check_admin_referer( 'myplugin_save_action', 'myplugin_nonce' );
    // Process form...
}
```

### 2.9 AJAX Security

```php
// WRONG - AJAX handler without security checks
add_action( 'wp_ajax_myplugin_action', 'myplugin_ajax_handler' );
function myplugin_ajax_handler() {
    $data = $_POST['data'];
    // Process...
    wp_send_json_success( $data );
}

// RIGHT - AJAX handler with full security
add_action( 'wp_ajax_myplugin_action', 'myplugin_ajax_handler' );
function myplugin_ajax_handler() {
    check_ajax_referer( 'myplugin_ajax_nonce', 'nonce' );

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( array( 'message' => 'Unauthorized' ), 403 );
    }

    $data = sanitize_text_field( wp_unslash( $_POST['data'] ) );
    // Process...
    wp_send_json_success( array( 'result' => esc_html( $data ) ) );
}
```

---

## 3. DATA HANDLING DEBUGGING

### Input Validation Patterns

```php
// Validate email
if ( ! is_email( $email ) ) {
    return new WP_Error( 'invalid_email', __( 'Invalid email address.', 'my-plugin' ) );
}

// Validate integer in range
$count = absint( $_POST['count'] );
if ( $count < 1 || $count > 100 ) {
    return new WP_Error( 'invalid_range', __( 'Count must be between 1 and 100.', 'my-plugin' ) );
}

// Validate against allowed values (whitelist)
$allowed_types = array( 'post', 'page', 'product' );
$type = sanitize_key( $_POST['type'] );
if ( ! in_array( $type, $allowed_types, true ) ) {
    return new WP_Error( 'invalid_type', __( 'Invalid type selected.', 'my-plugin' ) );
}

// Validate URL
$url = esc_url_raw( wp_unslash( $_POST['url'] ) );
if ( empty( $url ) || ! wp_http_validate_url( $url ) ) {
    return new WP_Error( 'invalid_url', __( 'Invalid URL.', 'my-plugin' ) );
}

// Validate date
$date = sanitize_text_field( wp_unslash( $_POST['date'] ) );
$timestamp = strtotime( $date );
if ( false === $timestamp ) {
    return new WP_Error( 'invalid_date', __( 'Invalid date format.', 'my-plugin' ) );
}
```

### Output Escaping Audit

Search for EVERY unescaped output. Run these commands:

```bash
# Find all echo/print statements without escaping
grep -rn "echo \$" --include="*.php" .
grep -rn "echo \$_" --include="*.php" .
grep -rn "print \$" --include="*.php" .

# Find printf without escaping
grep -rn "printf.*\$" --include="*.php" . | grep -v "esc_\|wp_kses\|absint\|intval"

# Find dangerous output patterns
grep -rn "echo.*\$_\(POST\|GET\|REQUEST\|SERVER\|COOKIE\)" --include="*.php" .
```

### Database Query Safety Audit

```bash
# Find direct variable interpolation in queries
grep -rn "\$wpdb->query.*\\\$" --include="*.php" . | grep -v "prepare"
grep -rn "\$wpdb->get_" --include="*.php" . | grep -v "prepare"

# Find potential SQL injection in custom queries
grep -rn "SELECT.*FROM.*\\\$" --include="*.php" . | grep -v "prepare"
grep -rn "DELETE.*FROM.*\\\$" --include="*.php" . | grep -v "prepare"
grep -rn "UPDATE.*SET.*\\\$" --include="*.php" . | grep -v "prepare"
grep -rn "INSERT.*INTO.*\\\$" --include="*.php" . | grep -v "prepare"
```

### Option Autoloading Issues

```php
// WRONG - Large data stored with autoload (loaded on EVERY page)
add_option( 'myplugin_log', $huge_log_array );  // autoload defaults to 'yes'
update_option( 'myplugin_cache', $large_cache ); // also autoloads by default

// RIGHT - Disable autoload for large or infrequently used data
add_option( 'myplugin_log', $huge_log_array, '', false );
update_option( 'myplugin_cache', $large_cache, false );

// Check total autoloaded data size (should be under 1MB)
// SQL query to audit:
// SELECT SUM(LENGTH(option_value)) as total_size
// FROM wp_options WHERE autoload = 'yes';
```

### Transient Cleanup

```php
// WRONG - Setting transient without expiration (lives forever in wp_options)
set_transient( 'myplugin_data', $data );

// RIGHT - Always set an expiration
set_transient( 'myplugin_data', $data, HOUR_IN_SECONDS );

// Clean up transients on uninstall
function myplugin_cleanup_transients() {
    global $wpdb;
    $wpdb->query(
        "DELETE FROM {$wpdb->options}
         WHERE option_name LIKE '_transient_myplugin_%'
         OR option_name LIKE '_transient_timeout_myplugin_%'"
    );
}
```

### Serialized Data Safety

```php
// NEVER use unserialize() on untrusted data — use maybe_unserialize() with caution
// WordPress uses serialization for options, but be aware of object injection attacks

// WRONG - Direct unserialize on user input
$data = unserialize( $_POST['data'] ); // Object injection vulnerability!

// RIGHT - Use JSON for data exchange, validate structure
$data = json_decode( sanitize_text_field( wp_unslash( $_POST['data'] ) ), true );
if ( ! is_array( $data ) ) {
    return new WP_Error( 'invalid_data', __( 'Invalid data format.', 'my-plugin' ) );
}
```

---

## 4. HOOKS & CONFLICT DEBUGGING

### Priority Conflicts

```php
// PROBLEM: Two callbacks at same priority — execution order is unreliable
add_action( 'init', 'myplugin_setup', 10 );      // Plugin A
add_action( 'init', 'otherplugin_setup', 10 );    // Plugin B — may run before or after

// SOLUTION: Use specific priorities when order matters
add_action( 'init', 'myplugin_setup', 5 );        // Runs early
add_action( 'init', 'myplugin_late_setup', 20 );  // Runs late

// Common priority conventions:
// 1-9:   Early execution (core setup)
// 10:    Default (most plugins)
// 11-20: After default (modifications)
// 50+:   Late execution (cleanup, output)
// 999:   Very late (final modifications)
// PHP_INT_MAX: Absolute last
```

### remove_action/remove_filter with Class Methods (Common Failure)

```php
// WRONG - Cannot remove action added by another class instance
// Plugin A adds:
class PluginA {
    public function __construct() {
        add_action( 'wp_footer', array( $this, 'render_footer' ) );
    }
    public function render_footer() { echo 'Footer content'; }
}
$plugin_a = new PluginA();

// Plugin B tries to remove — THIS WILL FAIL:
remove_action( 'wp_footer', array( 'PluginA', 'render_footer' ) );  // WRONG — string class name
remove_action( 'wp_footer', array( new PluginA(), 'render_footer' ) ); // WRONG — different instance

// RIGHT — Need the EXACT same object instance
remove_action( 'wp_footer', array( $plugin_a, 'render_footer' ), 10 ); // RIGHT — same instance, same priority

// RIGHT — If plugin stores instance in a global or singleton
if ( function_exists( 'PluginA' ) ) {
    $instance = PluginA(); // Singleton accessor
    remove_action( 'wp_footer', array( $instance, 'render_footer' ), 10 );
}

// RIGHT — For static methods (easier to remove)
class PluginA {
    public static function render_footer() { echo 'Footer content'; }
}
add_action( 'wp_footer', array( 'PluginA', 'render_footer' ) );
remove_action( 'wp_footer', array( 'PluginA', 'render_footer' ), 10 ); // Works!
```

### Global Variable Conflicts

```php
// WRONG - Common global variable names that WILL conflict
global $settings;
global $data;
global $instance;
global $plugin;

// RIGHT - Prefix ALL globals
global $myplugin_settings;
global $myplugin_data;

// BETTER - Avoid globals entirely, use a class or singleton
class MyPlugin {
    private static $instance = null;
    private $settings = array();

    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }
}
```

### Function/Class Name Collisions

```php
// WRONG - Generic names that WILL collide with other plugins
class Helper { }
class Utils { }
class Database { }
function get_data() { }
function render_template() { }

// RIGHT - Namespace or prefix everything
namespace MyPlugin;
class Helper { }

// Or prefix without namespace
class MyPlugin_Helper { }
class MyPlugin_Utils { }
function myplugin_get_data() { }
```

### Hook Timing Issues

```
HOOK ORDER (approximate):
muplugins_loaded    -> MU plugins loaded
plugins_loaded      -> Regular plugins loaded (USE for cross-plugin dependencies)
after_setup_theme   -> Theme setup (USE for theme-dependent features)
init                -> WordPress initialized (USE for CPTs, taxonomies, shortcodes)
wp_loaded           -> WordPress fully loaded
admin_init          -> Admin initialized (admin-only setup)
wp                  -> Main query parsed
template_redirect   -> Before template is loaded
wp_head             -> Inside <head>
wp_enqueue_scripts  -> Enqueue front-end assets
wp_footer           -> Before </body>
shutdown            -> PHP shutdown
```

```php
// WRONG - Registering CPT too early
add_action( 'plugins_loaded', 'myplugin_register_cpt' ); // Too early

// RIGHT - Register CPT on init
add_action( 'init', 'myplugin_register_cpt' );

// WRONG - Enqueuing scripts on init
add_action( 'init', 'myplugin_enqueue_scripts' ); // Wrong hook

// RIGHT - Enqueue on proper hook
add_action( 'wp_enqueue_scripts', 'myplugin_enqueue_front_scripts' );
add_action( 'admin_enqueue_scripts', 'myplugin_enqueue_admin_scripts' );
```

### Hook Debugging Functions

```php
// Check if an action has been fired
if ( did_action( 'init' ) ) {
    // init has already fired, safe to use functions registered on init
}

// Check how many times an action fired
$count = did_action( 'save_post' );

// Check if a specific callback is attached to a hook
if ( has_action( 'wp_footer', 'myplugin_render_footer' ) ) {
    // Callback is registered
}

// Check if any callback is attached to a hook
if ( has_filter( 'the_content' ) ) {
    // Something is filtering the_content
}

// List all callbacks on a hook (debugging only)
global $wp_filter;
if ( isset( $wp_filter['init'] ) ) {
    foreach ( $wp_filter['init']->callbacks as $priority => $callbacks ) {
        foreach ( $callbacks as $id => $callback ) {
            error_log( "init @ priority $priority: $id" );
        }
    }
}
```

---

## 5. PERFORMANCE DEBUGGING

### Enable Query Logging

```php
// In wp-config.php
define( 'SAVEQUERIES', true );

// Then in your code or a debug mu-plugin:
add_action( 'shutdown', function() {
    global $wpdb;
    if ( ! defined( 'SAVEQUERIES' ) || ! SAVEQUERIES ) {
        return;
    }
    error_log( 'Total queries: ' . count( $wpdb->queries ) );
    foreach ( $wpdb->queries as $query ) {
        if ( $query[1] > 0.05 ) { // Queries taking more than 50ms
            error_log( sprintf(
                'SLOW QUERY (%.4fs): %s | Called from: %s',
                $query[1],
                $query[0],
                $query[2]
            ) );
        }
    }
} );
```

### N+1 Query Problems

```php
// WRONG - N+1 query problem (1 query + N queries in loop)
$posts = get_posts( array( 'numberposts' => 50 ) );
foreach ( $posts as $post ) {
    $author = get_userdata( $post->post_author ); // Query per post!
    $meta   = get_post_meta( $post->ID, 'custom_field', true ); // Another query per post!
    echo esc_html( $author->display_name . ': ' . $meta );
}

// RIGHT - Batch fetch with cache priming
$posts = get_posts( array( 'numberposts' => 50 ) );

// Prime author cache
$author_ids = wp_list_pluck( $posts, 'post_author' );
cache_users( array_unique( $author_ids ) ); // Single query for all authors

// Prime post meta cache
$post_ids = wp_list_pluck( $posts, 'ID' );
update_meta_cache( 'post', $post_ids ); // Single query for all meta

foreach ( $posts as $post ) {
    $author = get_userdata( $post->post_author ); // From cache now
    $meta   = get_post_meta( $post->ID, 'custom_field', true ); // From cache now
    echo esc_html( $author->display_name . ': ' . $meta );
}
```

### Autoloaded Options Audit

```php
// Check total autoloaded data size
function myplugin_check_autoload_size() {
    global $wpdb;
    $result = $wpdb->get_row(
        "SELECT COUNT(*) as count, SUM(LENGTH(option_value)) as total_size
         FROM {$wpdb->options}
         WHERE autoload = 'yes'"
    );

    if ( $result->total_size > 1048576 ) { // 1MB
        error_log( sprintf(
            'WARNING: Autoloaded options: %d rows, %s bytes (%.2f MB)',
            $result->count,
            $result->total_size,
            $result->total_size / 1048576
        ) );
    }
}

// Find the largest autoloaded options
// SQL: SELECT option_name, LENGTH(option_value) as size
//      FROM wp_options WHERE autoload = 'yes'
//      ORDER BY size DESC LIMIT 20;
```

### Missing Transient Caching

```php
// WRONG - Expensive operation on every page load
function myplugin_get_external_data() {
    $response = wp_remote_get( 'https://api.example.com/data' );
    return wp_remote_retrieve_body( $response );
}

// RIGHT - Cache with transients
function myplugin_get_external_data() {
    $cached = get_transient( 'myplugin_external_data' );

    if ( false !== $cached ) {
        return $cached;
    }

    $response = wp_remote_get( 'https://api.example.com/data', array(
        'timeout' => 15, // ALWAYS set a timeout
    ) );

    if ( is_wp_error( $response ) ) {
        error_log( 'MyPlugin API error: ' . $response->get_error_message() );
        return false;
    }

    $body = wp_remote_retrieve_body( $response );
    set_transient( 'myplugin_external_data', $body, HOUR_IN_SECONDS );

    return $body;
}
```

### wp_remote_get() Without Timeout

```php
// WRONG - No timeout (defaults to 5s, but can still block)
$response = wp_remote_get( 'https://slow-api.example.com/data' );

// RIGHT - Always set explicit timeout and handle errors
$response = wp_remote_get( 'https://slow-api.example.com/data', array(
    'timeout'   => 10,
    'sslverify' => true,
) );

if ( is_wp_error( $response ) ) {
    error_log( 'HTTP request failed: ' . $response->get_error_message() );
    return false;
}

$code = wp_remote_retrieve_response_code( $response );
if ( 200 !== $code ) {
    error_log( 'HTTP request returned status: ' . $code );
    return false;
}
```

### Memory Usage Monitoring

```php
// Check peak memory usage
add_action( 'shutdown', function() {
    $peak = memory_get_peak_usage( true );
    if ( $peak > 64 * MB_IN_BYTES ) {
        error_log( sprintf(
            'HIGH MEMORY USAGE: %.2f MB (peak) on %s',
            $peak / MB_IN_BYTES,
            isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( $_SERVER['REQUEST_URI'] ) : 'CLI'
        ) );
    }
} );
```

### Database Table Creation Best Practices

```php
// WRONG - Missing index, wrong collation, no dbDelta format
function myplugin_create_table() {
    global $wpdb;
    $wpdb->query( "CREATE TABLE {$wpdb->prefix}myplugin_data (
        id INT,
        user_id INT,
        data TEXT
    )" );
}

// RIGHT - Use dbDelta with proper indexes and collation
function myplugin_create_table() {
    global $wpdb;
    $table_name      = $wpdb->prefix . 'myplugin_data';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        user_id bigint(20) unsigned NOT NULL DEFAULT 0,
        data longtext NOT NULL DEFAULT '',
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY created_at (created_at)
    ) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
}
// NOTE: dbDelta is VERY picky about formatting:
// - Must have TWO spaces before PRIMARY KEY
// - Must have KEY (not INDEX) for secondary indexes
// - Each field on its own line
```

---

## 6. REST API DEBUGGING

### Common REST API Errors

| HTTP Code | Error | Cause | Fix |
|-----------|-------|-------|-----|
| 401 | `rest_not_logged_in` | No authentication | Send X-WP-Nonce header or use Application Passwords |
| 403 | `rest_forbidden` | Insufficient permissions | Check `permission_callback` returns true, verify user capability |
| 404 | `rest_no_route` | Wrong namespace or route | Check `register_rest_route` namespace, route pattern, HTTP method |
| 400 | `rest_invalid_param` | Schema validation failure | Check parameter schema types, required fields |
| 500 | Internal Server Error | Unhandled exception in callback | Wrap callback in try/catch, return `WP_Error` |

### Missing permission_callback (AUTO-REJECT)

```php
// WRONG - No permission_callback (will trigger WordPress notice + security risk)
register_rest_route( 'myplugin/v1', '/data', array(
    'methods'  => 'GET',
    'callback' => 'myplugin_get_data',
) );

// WRONG - Permission callback that always returns true for write operations
register_rest_route( 'myplugin/v1', '/data', array(
    'methods'             => 'POST',
    'callback'            => 'myplugin_save_data',
    'permission_callback' => '__return_true', // DANGEROUS for write operations!
) );

// RIGHT - Proper permission callback
register_rest_route( 'myplugin/v1', '/data', array(
    'methods'             => 'GET',
    'callback'            => 'myplugin_get_data',
    'permission_callback' => '__return_true', // OK for public read-only endpoints
) );

register_rest_route( 'myplugin/v1', '/data', array(
    'methods'             => 'POST',
    'callback'            => 'myplugin_save_data',
    'permission_callback' => function () {
        return current_user_can( 'manage_options' );
    },
    'args'                => array(
        'title' => array(
            'required'          => true,
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => function ( $value ) {
                return ! empty( $value );
            },
        ),
    ),
) );
```

### REST Route Must Be Registered on Correct Hook

```php
// WRONG - Registering outside of rest_api_init
add_action( 'init', function() {
    register_rest_route( 'myplugin/v1', '/data', array( /* ... */ ) );
} );

// RIGHT - Always use rest_api_init
add_action( 'rest_api_init', function() {
    register_rest_route( 'myplugin/v1', '/data', array(
        'methods'             => 'GET',
        'callback'            => 'myplugin_rest_get_data',
        'permission_callback' => '__return_true',
    ) );
} );
```

### Returning WP_Error Properly

```php
// WRONG - Returning plain array for errors
function myplugin_rest_get_data( $request ) {
    $id = $request->get_param( 'id' );
    $data = get_post( $id );
    if ( ! $data ) {
        return array( 'error' => 'Not found' ); // Returns 200 with error body!
    }
    return $data;
}

// RIGHT - Return WP_Error for error states
function myplugin_rest_get_data( $request ) {
    $id = absint( $request->get_param( 'id' ) );
    $data = get_post( $id );

    if ( ! $data ) {
        return new WP_Error(
            'myplugin_not_found',
            __( 'Item not found.', 'my-plugin' ),
            array( 'status' => 404 )
        );
    }

    return rest_ensure_response( array(
        'id'    => $data->ID,
        'title' => $data->post_title,
    ) );
}
```

### Nonce Authentication for REST API

```php
// Enqueue script with REST nonce
function myplugin_enqueue_scripts() {
    wp_enqueue_script( 'myplugin-app', plugin_dir_url( __FILE__ ) . 'js/app.js', array(), '1.0.0', true );
    wp_localize_script( 'myplugin-app', 'mypluginAPI', array(
        'root'  => esc_url_raw( rest_url( 'myplugin/v1/' ) ),
        'nonce' => wp_create_nonce( 'wp_rest' ),
    ) );
}

// JavaScript — send nonce with requests
// fetch( mypluginAPI.root + 'data', {
//     headers: { 'X-WP-Nonce': mypluginAPI.nonce }
// } )
```

---

## 7. JAVASCRIPT & CSS DEBUGGING

### Correct Hook Usage

```php
// WRONG - Admin scripts on front-end hook
add_action( 'wp_enqueue_scripts', 'myplugin_admin_scripts' );

// WRONG - Front-end scripts on admin hook
add_action( 'admin_enqueue_scripts', 'myplugin_front_scripts' );

// WRONG - Enqueueing outside any hook
wp_enqueue_script( 'myplugin-script', plugin_dir_url( __FILE__ ) . 'js/app.js' );

// RIGHT - Front-end scripts
add_action( 'wp_enqueue_scripts', 'myplugin_enqueue_front' );
function myplugin_enqueue_front() {
    wp_enqueue_script(
        'myplugin-front',
        plugin_dir_url( __FILE__ ) . 'js/front.js',
        array(), // dependencies
        '1.0.0',
        true // in footer
    );
    wp_enqueue_style(
        'myplugin-front',
        plugin_dir_url( __FILE__ ) . 'css/front.css',
        array(),
        '1.0.0'
    );
}

// RIGHT - Admin scripts (only on YOUR plugin pages)
add_action( 'admin_enqueue_scripts', 'myplugin_enqueue_admin' );
function myplugin_enqueue_admin( $hook_suffix ) {
    // ONLY load on your plugin's admin page
    if ( 'toplevel_page_myplugin-settings' !== $hook_suffix ) {
        return;
    }
    wp_enqueue_script(
        'myplugin-admin',
        plugin_dir_url( __FILE__ ) . 'js/admin.js',
        array( 'jquery', 'wp-element' ),
        '1.0.0',
        true
    );
}
```

### Loading Scripts Globally (REJECTION RISK)

```php
// WRONG - Loading scripts on EVERY admin page
add_action( 'admin_enqueue_scripts', function() {
    wp_enqueue_script( 'myplugin-admin', plugin_dir_url( __FILE__ ) . 'admin.js' );
    wp_enqueue_style( 'myplugin-admin', plugin_dir_url( __FILE__ ) . 'admin.css' );
} );

// RIGHT - Only load on plugin pages
add_action( 'admin_enqueue_scripts', function( $hook_suffix ) {
    $plugin_pages = array(
        'toplevel_page_myplugin',
        'myplugin_page_myplugin-settings',
    );
    if ( ! in_array( $hook_suffix, $plugin_pages, true ) ) {
        return;
    }
    wp_enqueue_script( 'myplugin-admin', plugin_dir_url( __FILE__ ) . 'admin.js', array(), '1.0.0', true );
    wp_enqueue_style( 'myplugin-admin', plugin_dir_url( __FILE__ ) . 'admin.css', array(), '1.0.0' );
} );
```

### jQuery Conflict Mode

```javascript
// WRONG - Using $ directly (conflicts with other libraries)
$(document).ready(function() {
    $('.myplugin-button').click(function() {
        // This will break if another plugin uses Prototype or MooTools
    });
});

// RIGHT - Use jQuery in no-conflict wrapper
(function($) {
    'use strict';
    $(document).ready(function() {
        $('.myplugin-button').on('click', function() {
            // Safe — $ is scoped to jQuery
        });
    });
})(jQuery);

// ALSO RIGHT - Use jQuery directly
jQuery(document).ready(function($) {
    $('.myplugin-button').on('click', function() {
        // $ is available as parameter
    });
});
```

### Missing Script Dependencies

```php
// WRONG - Missing jQuery dependency
wp_enqueue_script( 'myplugin-script', plugin_dir_url( __FILE__ ) . 'js/app.js' );
// app.js uses jQuery but it may not be loaded yet!

// RIGHT - Declare all dependencies
wp_enqueue_script(
    'myplugin-script',
    plugin_dir_url( __FILE__ ) . 'js/app.js',
    array( 'jquery' ), // Dependencies
    '1.0.0',
    true
);

// Block editor dependencies
wp_enqueue_script(
    'myplugin-block',
    plugin_dir_url( __FILE__ ) . 'js/block.js',
    array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n' ),
    '1.0.0',
    true
);
```

### Passing Data to JavaScript

```php
// WRONG - Inline PHP in JavaScript files
<script>
var ajaxUrl = '<?php echo admin_url("admin-ajax.php"); ?>';
var postId = <?php echo $post->ID; ?>;
</script>

// RIGHT - Use wp_localize_script
wp_enqueue_script( 'myplugin-app', plugin_dir_url( __FILE__ ) . 'js/app.js', array(), '1.0.0', true );
wp_localize_script( 'myplugin-app', 'mypluginData', array(
    'ajaxUrl' => admin_url( 'admin-ajax.php' ),
    'nonce'   => wp_create_nonce( 'myplugin_ajax' ),
    'postId'  => absint( $post->ID ),
    'i18n'    => array(
        'confirm' => __( 'Are you sure?', 'my-plugin' ),
        'success' => __( 'Saved successfully.', 'my-plugin' ),
    ),
) );

// ALSO RIGHT - wp_add_inline_script for simple data
wp_add_inline_script(
    'myplugin-app',
    'const MYPLUGIN_CONFIG = ' . wp_json_encode( array(
        'restUrl' => esc_url_raw( rest_url( 'myplugin/v1/' ) ),
        'nonce'   => wp_create_nonce( 'wp_rest' ),
    ) ),
    'before'
);
```

### Version String for Cache Busting

```php
// WRONG - No version (browser caches forever)
wp_enqueue_script( 'myplugin-app', plugin_dir_url( __FILE__ ) . 'js/app.js' );

// WRONG - Static version that never changes
wp_enqueue_script( 'myplugin-app', plugin_dir_url( __FILE__ ) . 'js/app.js', array(), '1.0' );

// RIGHT - Use plugin version constant
define( 'MYPLUGIN_VERSION', '1.2.3' );
wp_enqueue_script( 'myplugin-app', plugin_dir_url( __FILE__ ) . 'js/app.js', array(), MYPLUGIN_VERSION, true );

// RIGHT - Use filemtime for development (auto-busts on file change)
wp_enqueue_script(
    'myplugin-app',
    plugin_dir_url( __FILE__ ) . 'js/app.js',
    array(),
    filemtime( plugin_dir_path( __FILE__ ) . 'js/app.js' ),
    true
);
```

---

## 8. INTERNATIONALIZATION (i18n) DEBUGGING

### Text Domain Must Match Plugin Slug

```php
// Plugin slug: my-awesome-plugin

// WRONG - Text domain doesn't match slug
__( 'Hello', 'myawesomeplugin' )
__( 'Hello', 'my_awesome_plugin' )
__( 'Hello', 'MyAwesomePlugin' )

// RIGHT - Exact match with plugin slug (lowercase, hyphens)
__( 'Hello', 'my-awesome-plugin' )
```

### Common i18n Mistakes

```php
// WRONG - Variable as text domain
$domain = 'my-plugin';
__( 'Hello', $domain );  // Translation tools CANNOT parse this

// RIGHT - Literal string text domain
__( 'Hello', 'my-plugin' );

// WRONG - Variable inside translation function
__( $variable_text, 'my-plugin' );  // Translation tools need LITERAL strings

// RIGHT - Use sprintf for dynamic content
sprintf(
    /* translators: %s: user name */
    __( 'Hello, %s!', 'my-plugin' ),
    esc_html( $user_name )
);

// WRONG - Concatenation inside translation
__( 'Hello ' . $name, 'my-plugin' );  // Untranslatable

// RIGHT - Placeholder
sprintf( __( 'Hello %s', 'my-plugin' ), esc_html( $name ) );

// WRONG - Using _e() where you need the return value
$title = _e( 'My Title', 'my-plugin' );  // _e() ECHOES, returns nothing

// RIGHT - Use __() for return, _e() for echo
$title = __( 'My Title', 'my-plugin' );  // Returns string
_e( 'My Title', 'my-plugin' );           // Echoes string

// WRONG - HTML inside translation strings
__( '<strong>Bold text</strong>', 'my-plugin' );  // Translators shouldn't deal with HTML

// RIGHT - Wrap HTML around translated string
'<strong>' . esc_html__( 'Bold text', 'my-plugin' ) . '</strong>';

// WRONG - Escaping inside translation
__( esc_html( 'Hello' ), 'my-plugin' );  // Escaping the source string is pointless

// RIGHT - Escape AFTER translation
esc_html__( 'Hello', 'my-plugin' );
esc_html_e( 'Hello', 'my-plugin' );
esc_attr__( 'Hello', 'my-plugin' );
```

### Loading Text Domain

```php
// WRONG - Loading text domain too early
load_plugin_textdomain( 'my-plugin', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );

// RIGHT - Load on init hook (WordPress 6.7+ handles this automatically for wp.org plugins)
add_action( 'init', 'myplugin_load_textdomain' );
function myplugin_load_textdomain() {
    load_plugin_textdomain(
        'my-plugin',
        false,
        dirname( plugin_basename( __FILE__ ) ) . '/languages'
    );
}

// NOTE: Since WordPress 4.6+, WordPress automatically checks wp-content/languages/plugins/
// for translation files BEFORE the plugin's own /languages/ directory.
// Since WordPress 6.7+, translations are loaded just-in-time automatically for
// plugins hosted on WordPress.org. Manual loading is only needed for self-hosted plugins.
```

### Plural Forms

```php
// WRONG - Hardcoded plural
echo $count . ' items';

// RIGHT - Use _n() for plurals
printf(
    /* translators: %d: number of items */
    _n(
        '%d item',
        '%d items',
        $count,
        'my-plugin'
    ),
    $count
);
```

### Translation Debugging Commands

```bash
# Audit i18n issues with WP-CLI
wp i18n make-pot . languages/my-plugin.pot --domain=my-plugin

# Check for i18n issues with WPCS
vendor/bin/phpcs --standard=WordPress-Extra --sniffs=WordPress.WP.I18n .
```

---

## 9. WORDPRESS.ORG PLUGIN REVIEW CHECKLIST

### Plugin Check (PCP) — WordPress.org's Official Tool

ALWAYS run Plugin Check before submitting. Since 2025, PCP is REQUIRED for new submissions.

```bash
# Install via WP-CLI
wp plugin install plugin-check --activate

# Run checks via WP-CLI
wp plugin check my-plugin

# Run only security checks (required to pass)
wp plugin check my-plugin --categories=security

# Run all checks including performance
wp plugin check my-plugin --categories=security,performance,plugin_repo
```

### Common WordPress.org Rejection Reasons (Complete List)

#### SECURITY REJECTIONS (Most Common)

| # | Issue | What Reviewers Look For | Fix |
|---|-------|------------------------|-----|
| 1 | Unescaped output | `echo $variable` without `esc_*` | Use `esc_html()`, `esc_attr()`, `esc_url()` on ALL output |
| 2 | Unsanitized input | Raw `$_POST`, `$_GET`, `$_REQUEST` usage | Use `sanitize_text_field()`, `absint()`, etc. |
| 3 | Missing nonce verification | Form/AJAX without nonce check | Add `wp_nonce_field()` + `check_admin_referer()` |
| 4 | SQL injection | Direct variables in `$wpdb->query()` | ALWAYS use `$wpdb->prepare()` |
| 5 | Missing capability checks | No `current_user_can()` on admin actions | Add capability checks to every handler |
| 6 | Direct file access | PHP files accessible without WordPress | Add `if (!defined('ABSPATH')) exit;` |
| 7 | eval() usage | `eval()`, `create_function()` | Remove completely, refactor code |
| 8 | Obfuscated code | `base64_encode`/`decode` for code execution | Remove all code obfuscation |
| 9 | Missing CSRF protection | Forms without `check_admin_referer()` | Add nonce verification |
| 10 | Unsafe file operations | Direct file writes without validation | Use WordPress filesystem API |

#### CODING STANDARD REJECTIONS

| # | Issue | Fix |
|---|-------|-----|
| 11 | Generic function names | Prefix ALL functions with plugin slug |
| 12 | Generic class names | Prefix or namespace ALL classes |
| 13 | Generic option names | Prefix ALL option names |
| 14 | Generic hook names | Prefix ALL custom hooks |
| 15 | Short PHP tags | Replace `<?` with `<?php`, remove `<?=` (use `<?php echo`) |
| 16 | Deprecated functions | Replace with modern equivalents |
| 17 | Using `extract()` | Remove, use explicit variable assignment |
| 18 | Unused code / dead code | Remove all unused functions, files, libraries |

#### EXTERNAL RESOURCE REJECTIONS

| # | Issue | Fix |
|---|-------|-----|
| 19 | CDN for scripts/styles | Bundle all JS/CSS locally, NEVER load from CDN |
| 20 | Undisclosed external calls | Disclose ALL `wp_remote_get/post` calls, get user consent |
| 21 | Tracking without consent | NEVER track users without explicit opt-in |
| 22 | Loading Google Fonts from CDN | Bundle fonts or use system fonts |
| 23 | External images/resources | Bundle all assets locally |

#### BUILD & PACKAGING REJECTIONS

| # | Issue | Fix |
|---|-------|-----|
| 24 | Minified JS/CSS without source | Include unminified source files alongside minified |
| 25 | Including development files | Exclude node_modules, .git, tests, .env from dist |
| 26 | Including other plugins | Never bundle other WordPress plugins |
| 27 | GPL incompatible dependencies | ALL code must be GPL-2.0+ compatible |

#### FUNCTIONALITY REJECTIONS

| # | Issue | Fix |
|---|-------|-----|
| 28 | No uninstall cleanup | Create `uninstall.php` to delete ALL plugin data |
| 29 | Loading scripts globally | Only enqueue on pages where needed |
| 30 | Storing data outside Options API | Use `update_option()`, NOT direct file writes |
| 31 | Non-serializable option data | Store only serializable data in options |
| 32 | Not using Settings API | Use `register_setting()` + `settings_fields()` |
| 33 | Trademark in plugin name | Remove "WordPress", "WP" (as word), "Starter" |
| 34 | Plugin does nothing useful | Must provide clear functionality |
| 35 | Duplicate functionality | Must differentiate from existing plugins |

#### README.TXT REJECTIONS

| # | Issue | Fix |
|---|-------|-----|
| 36 | Wrong format | Use WordPress readme.txt validator |
| 37 | Missing "Tested up to" | Add current WordPress version |
| 38 | Missing "Requires at least" | Add minimum WordPress version |
| 39 | Missing "Requires PHP" | Add minimum PHP version |
| 40 | Missing "License" | Must state "GPLv2 or later" |
| 41 | Inaccurate description | Description must match actual functionality |
| 42 | Missing changelog | Add changelog section |

### readme.txt Template

```
=== My Plugin Name ===
Contributors: yourusername
Tags: tag1, tag2, tag3
Requires at least: 6.2
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Short description (150 characters max).

== Description ==

Full description of the plugin.

== Installation ==

1. Upload to /wp-content/plugins/
2. Activate
3. Configure at Settings > My Plugin

== Frequently Asked Questions ==

= Question? =

Answer.

== Screenshots ==

1. Screenshot description

== Changelog ==

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 1.0.0 =
Initial release.
```

### uninstall.php Template

```php
<?php
/**
 * Uninstall handler for My Plugin.
 *
 * @package MyPlugin
 */

// If uninstall.php is not called by WordPress, die.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Delete options.
delete_option( 'myplugin_settings' );
delete_option( 'myplugin_version' );

// Delete transients.
delete_transient( 'myplugin_cache' );

// Delete user meta (for all users).
global $wpdb;
$wpdb->query( "DELETE FROM {$wpdb->usermeta} WHERE meta_key LIKE 'myplugin_%'" );

// Delete post meta.
$wpdb->query( "DELETE FROM {$wpdb->postmeta} WHERE meta_key LIKE 'myplugin_%'" );

// Drop custom tables.
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}myplugin_data" );

// Delete custom post types and their data.
$posts = get_posts( array(
    'post_type'   => 'myplugin_cpt',
    'numberposts' => -1,
    'post_status' => 'any',
    'fields'      => 'ids',
) );
foreach ( $posts as $post_id ) {
    wp_delete_post( $post_id, true );
}

// Clear scheduled cron events.
wp_clear_scheduled_hook( 'myplugin_daily_cron' );

// Clear any cached data.
wp_cache_flush();
```

---

## 10. FINAL QA — DEBUG TOOLS & CONFIGURATION

### wp-config.php Debug Constants

```php
// Enable ALL debugging — USE ON STAGING/LOCAL ONLY
define( 'WP_DEBUG', true );             // Enable debug mode
define( 'WP_DEBUG_LOG', true );         // Log errors to wp-content/debug.log
define( 'WP_DEBUG_DISPLAY', false );    // DON'T show errors on screen
define( 'SCRIPT_DEBUG', true );         // Use non-minified core JS/CSS
define( 'SAVEQUERIES', true );          // Log all database queries
define( 'WP_DISABLE_FATAL_ERROR_HANDLER', true ); // Show fatal errors (dev only)

// Custom log file location
define( 'WP_DEBUG_LOG', '/path/to/custom/debug.log' );

// For AJAX debugging
@ini_set( 'log_errors', 'On' );
@ini_set( 'error_log', WP_CONTENT_DIR . '/debug.log' );
```

### Query Monitor Plugin Usage

Query Monitor is the ESSENTIAL debugging plugin. It provides:

- **Queries tab**: Shows every SQL query, time, caller, component
- **Queries by Component**: Groups queries by plugin/theme — find YOUR plugin's queries
- **Slow Queries**: Highlights queries over a threshold
- **PHP Errors**: Shows all PHP notices, warnings, errors with file/line
- **Hooks & Actions**: See which hooks fire and what's attached
- **HTTP API Calls**: All outgoing HTTP requests with timing
- **Transients**: Shows transient usage
- **Environment**: PHP/MySQL/WordPress version info
- **Conditional Tags**: Which template conditionals are true

### Additional Debug Tools

| Tool | Purpose | Install |
|------|---------|---------|
| **Plugin Check (PCP)** | WordPress.org compliance | `wp plugin install plugin-check --activate` |
| **Query Monitor** | Runtime debugging | `wp plugin install query-monitor --activate` |
| **Debug Bar** | Legacy debug panel | `wp plugin install debug-bar --activate` |
| **Log Deprecated Notices** | Find deprecated usage | `wp plugin install log-deprecated-notices --activate` |
| **PHPStan** (Level 5+) | Static analysis | `composer require --dev phpstan/phpstan` |
| **Psalm** | Static analysis (alternative) | `composer require --dev vimeo/psalm` |
| **WP-CLI** | Command-line debugging | Pre-installed or `curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar` |

### PHPStan Configuration for WordPress

```yaml
# phpstan.neon
parameters:
    level: 6
    paths:
        - .
    excludePaths:
        - vendor
        - node_modules
    scanDirectories:
        - vendor/php-stubs/wordpress-stubs
    bootstrapFiles:
        - vendor/php-stubs/wordpress-stubs/wordpress-stubs.php
```

```bash
# Install WordPress stubs for PHPStan
composer require --dev php-stubs/wordpress-stubs szepeviktor/phpstan-wordpress

# Run PHPStan
vendor/bin/phpstan analyse
```

### Full Debug Workflow Checklist

```
[ ] WP_DEBUG enabled, WP_DEBUG_LOG enabled
[ ] Query Monitor installed and active
[ ] Run Plugin Check (PCP) — ALL categories must pass
[ ] Run phpcs with WordPress-Extra — zero errors
[ ] Run PHPStan level 5+ — zero errors
[ ] Check debug.log for notices, warnings, deprecations from YOUR plugin
[ ] Check Query Monitor Queries tab — no slow queries from YOUR plugin
[ ] Check Query Monitor PHP Errors tab — zero errors from YOUR plugin
[ ] Check Query Monitor HTTP tab — all external calls have timeouts
[ ] Check browser console — zero JS errors from YOUR plugin
[ ] Test with SCRIPT_DEBUG=true — no missing unminified files
[ ] Test activation on clean WordPress install
[ ] Test deactivation (nothing breaks)
[ ] Test uninstall (all data cleaned up)
[ ] Test with latest WordPress version
[ ] Test with minimum supported WordPress version
[ ] Test with minimum supported PHP version
[ ] Test with PHP 8.2+ (check deprecations)
[ ] Test multisite (if applicable)
[ ] Test with popular plugins (WooCommerce, Elementor, Yoast)
[ ] Test with default Twenty Twenty-Five theme
[ ] Test all user roles (admin, editor, author, subscriber)
[ ] Test with object cache enabled (Redis/Memcached)
[ ] Verify no console errors on ANY WordPress admin page
[ ] Verify plugin assets only load on relevant pages
```

---

## 11. WHEN WORDPRESS.ORG REJECTS YOUR PLUGIN

### Step-by-Step Recovery Process

1. **Read the rejection email CAREFULLY** — Reviewers cite specific issues with file paths and line numbers
2. **Do NOT reply arguing** — Fix the issues first, then reply
3. **Fix ALL mentioned issues** — Not just some. They will check again
4. **Fix issues they DIDN'T mention too** — If they found one unescaped output, audit ALL outputs
5. **Run Plugin Check (PCP)** — Pass all checks before resubmitting
6. **Run phpcs with WordPress-Extra** — Zero errors
7. **Reply to the email** with a summary of what you fixed
8. **Wait patiently** — Reviews take 1-7 days for resubmissions

### Common Rejection to Fix Mapping

| Rejection Reason | Search For | Fix |
|-----------------|------------|-----|
| "Unescaped output" | `echo $`, `print $`, `printf` without esc | Add `esc_html()`, `esc_attr()`, `esc_url()` |
| "Unsanitized input" | `$_POST[`, `$_GET[`, `$_REQUEST[` | Add `sanitize_text_field()`, `absint()`, etc. |
| "Missing nonce" | `<form`, `wp_ajax_`, `admin_post_` | Add `wp_nonce_field()` + verification |
| "Direct database call" | `$wpdb->query(`, `$wpdb->get_` without prepare | Add `$wpdb->prepare()` |
| "Generic function names" | Functions without prefix | Add plugin slug prefix to ALL globals |
| "Calling remote resources" | `wp_remote_`, CDN URLs, external `<script>` | Bundle locally or add disclosure/opt-in |
| "Included minified files" | `.min.js`, `.min.css` | Include source files alongside minified |
| "No uninstall" | Missing `uninstall.php` | Create `uninstall.php` with full cleanup |
| "Scripts loaded globally" | `wp_enqueue` without page check | Add `$hook_suffix` check in admin enqueue |
| "Deprecated functions" | Old WP function calls | Replace with modern alternatives |

### Re-submission Best Practices

- Fix issues in BULK — do not resubmit with partial fixes
- Add a short changelog of what was fixed in your reply email
- If you disagree with a review point, ask politely for clarification
- Average re-review time: 3-5 business days
- After 3 rejections for the SAME issue, your plugin may be permanently closed

---

## 12. GOLDEN RULES FOR BUG-FREE WORDPRESS PLUGINS

1. **NEVER trust user input.** Sanitize EVERYTHING from `$_POST`, `$_GET`, `$_REQUEST`, `$_SERVER`, `$_COOKIE`.

2. **ALWAYS escape output.** Every `echo`, `printf`, `print` of dynamic data MUST use `esc_html()`, `esc_attr()`, `esc_url()`, or `wp_kses()`.

3. **ALWAYS use nonces.** Every form, AJAX request, and state-changing URL MUST have nonce verification.

4. **ALWAYS check capabilities.** Every admin action MUST verify `current_user_can()` with the appropriate capability.

5. **NEVER put variables in SQL.** ALWAYS use `$wpdb->prepare()` with `%s`, `%d`, `%f` placeholders.

6. **ALWAYS prefix everything.** Functions, classes, options, hooks, transients, cron events, database tables, REST namespaces, CSS classes, JS globals.

7. **NEVER load assets globally.** Enqueue scripts/styles only on pages where they are needed.

8. **ALWAYS clean up on uninstall.** Delete ALL plugin data (options, transients, user meta, post meta, custom tables, cron events).

9. **NEVER use eval(), create_function(), or obfuscated code.** These are auto-reject on WordPress.org.

10. **ALWAYS bundle external resources.** NEVER load JS/CSS from CDNs. Include unminified source alongside minified files.

11. **ALWAYS disclose external calls.** If your plugin calls external APIs, disclose in readme.txt and get user consent.

12. **ALWAYS set timeouts on HTTP requests.** `wp_remote_get()` / `wp_remote_post()` MUST have a `timeout` parameter.

13. **ALWAYS use transients for caching expensive operations.** API calls, complex queries, and computed data MUST be cached.

14. **NEVER store large data with autoload.** Use `add_option( $key, $value, '', false )` or `update_option( $key, $value, false )` for large data.

15. **ALWAYS test with WP_DEBUG, Query Monitor, and Plugin Check (PCP) before every release.** Zero errors, zero warnings, zero notices from your plugin.

---

## QUICK REFERENCE: SECURITY FUNCTION CHEAT SHEET

```
INPUT (Sanitize)          OUTPUT (Escape)           DATABASE (Prepare)
--------------------      --------------------      --------------------
sanitize_text_field()     esc_html()                $wpdb->prepare()
sanitize_textarea_field() esc_attr()                $wpdb->insert()
sanitize_email()          esc_url()                 $wpdb->update()
sanitize_file_name()      esc_js()                  $wpdb->delete()
sanitize_key()            esc_textarea()            $wpdb->esc_like()
sanitize_title()          wp_kses_post()
sanitize_html_class()     wp_kses()
absint()                  esc_html__()
intval() / floatval()     esc_attr__()
wp_unslash()              esc_html_e()
wp_kses_post()            esc_attr_e()
esc_url_raw()             wp_kses_allowed_html()

NONCE (CSRF)              CAPABILITY (Auth)
--------------------      --------------------
wp_nonce_field()          current_user_can()
wp_verify_nonce()         wp_get_current_user()
check_admin_referer()     is_user_logged_in()
check_ajax_referer()      user_can()
wp_create_nonce()         map_meta_cap()
```

---

## DIAGNOSTIC COMMANDS CHEAT SHEET

```bash
# Run WPCS check
vendor/bin/phpcs --standard=WordPress-Extra --extensions=php .

# Auto-fix WPCS issues
vendor/bin/phpcbf --standard=WordPress-Extra --extensions=php .

# Run Plugin Check via WP-CLI
wp plugin check my-plugin --format=table

# Run PHPStan
vendor/bin/phpstan analyse --level=6

# Generate POT file for translations
wp i18n make-pot . languages/my-plugin.pot --domain=my-plugin

# Check for deprecated functions
wp plugin check my-plugin --categories=plugin_repo

# Check plugin headers
wp plugin list --field=name,version,status

# Test REST API endpoint
wp eval 'var_dump(rest_url("myplugin/v1/data"));'

# Check autoloaded options size
wp db query "SELECT SUM(LENGTH(option_value)) as bytes FROM wp_options WHERE autoload='yes';"

# Find orphaned plugin options
wp db query "SELECT option_name, LENGTH(option_value) as size FROM wp_options WHERE option_name LIKE 'myplugin_%' ORDER BY size DESC;"

# Check cron events
wp cron event list

# Verify uninstall cleanup
wp plugin deactivate my-plugin && wp plugin uninstall my-plugin
wp db query "SELECT * FROM wp_options WHERE option_name LIKE 'myplugin_%';"
```
