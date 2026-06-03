import { getSiteThemeCss } from "@/lib/siteTheme";

/** Injects `--c-primary-*` / `--c-secondary-*` from `site.config` into `:root`. */
export default function SiteThemeStyles() {
  return (
    <style
      id="site-theme-vars"
      dangerouslySetInnerHTML={{ __html: getSiteThemeCss() }}
    />
  );
}
