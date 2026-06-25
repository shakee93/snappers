export const DEALS_CACHE_TAG = 'deals';
// Site-wide ACF options (deal countdown end date, etc.).
export const SITE_SETTINGS_CACHE_TAG = 'site-settings';
// Homepage hero/bento sliders + slide CPT. Busted by the WP `acf/save_post`
// hook on Hero Section options page saves, and by save_post on the slide CPT.
export const HERO_SECTION_CACHE_TAG = 'hero-section';

// Per-product tag for SSR GraphQL fetches. Attached to the PDP's GET_PRODUCT
// fetch so /api/revalidate can bust the underlying response, not just the
// rendered HTML — revalidatePath alone can leave the fetch-cache entry intact
// on dynamic routes and the next regen re-serves the stale upstream answer.
export const productTag = (slug: string) => `product:${slug}`;
