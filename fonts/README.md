# Web fonts

## Albra Sans Semi (`font-albra`)

Headings use **Albra Sans Semi** via the `font-albra` Tailwind utility. Registration lives in `app/layout.tsx` (`--font-albra` on `<html>`).

Web delivery uses `AlbraSans-Semi.woff2` (converted from the source OTF). `AlbraSansTRIAL-Semi.otf` is kept as a fallback source in the font stack.

Before production, replace both files with a **properly licensed** webfont bundle. Keep the `font-albra` class and `localFont` setup — only swap the font files.
