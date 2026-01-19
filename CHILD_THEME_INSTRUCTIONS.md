# How to Include pickup-type-handler.php in Your Child Theme

## Option 1: Include in functions.php (Recommended)

Add this line to your child theme's `functions.php` file:

```php
<?php
/**
 * Your child theme's functions.php
 */

// Include pickup type handler
require_once get_stylesheet_directory() . '/pickup-type-handler.php';
```

**Or if the file is in a subdirectory:**

```php
require_once get_stylesheet_directory() . '/inc/pickup-type-handler.php';
```

## Option 2: Direct Include (Alternative)

If you prefer to use the parent theme directory:

```php
require_once get_template_directory() . '/pickup-type-handler.php';
```

## Complete Example functions.php

```php
<?php
/**
 * Child Theme Functions
 */

// Enqueue parent theme styles
function child_theme_enqueue_styles() {
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');
    wp_enqueue_style('child-style', get_stylesheet_directory_uri() . '/style.css', array('parent-style'));
}
add_action('wp_enqueue_scripts', 'child_theme_enqueue_styles');

// Include pickup type handler
if (file_exists(get_stylesheet_directory() . '/pickup-type-handler.php')) {
    require_once get_stylesheet_directory() . '/pickup-type-handler.php';
}
```

## File Location Options

Your `pickup-type-handler.php` file can be placed in:

1. **Root of child theme**: `/wp-content/themes/your-child-theme/pickup-type-handler.php`
   - Use: `require_once get_stylesheet_directory() . '/pickup-type-handler.php';`

2. **In an inc folder**: `/wp-content/themes/your-child-theme/inc/pickup-type-handler.php`
   - Use: `require_once get_stylesheet_directory() . '/inc/pickup-type-handler.php';`

3. **In a includes folder**: `/wp-content/themes/your-child-theme/includes/pickup-type-handler.php`
   - Use: `require_once get_stylesheet_directory() . '/includes/pickup-type-handler.php';`

## Verification

After adding the include, you can verify it's working by:

1. **Check for PHP errors**: Look at your WordPress debug log or check the site for any PHP errors
2. **Test in admin**: Go to an order in WooCommerce admin and check if "Pickup Type" appears after shipping address
3. **Check emails**: Place a test order with pickup type selected and check if it appears in order emails

## Troubleshooting

If it's not working:

1. **Check file path**: Make sure the path in `require_once` matches where you placed the file
2. **Check file permissions**: Ensure the file is readable (644 permissions)
3. **Check for syntax errors**: The file should have no PHP syntax errors
4. **Clear cache**: If using caching plugins, clear the cache

## Alternative: Copy Code Directly

If you prefer not to use a separate file, you can copy the entire contents of `pickup-type-handler.php` directly into your `functions.php` file (without the opening `<?php` tag if it's already at the top of functions.php).
