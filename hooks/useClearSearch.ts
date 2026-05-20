import { useCallback } from "react";
import { useStore } from "@/store/store";

// Clears the search query both from the Zustand store (which feeds the
// header SearchBar input via its sync effect) and from the URL.
//
// We strip `?query=` / `?q=` directly via history.replaceState because the
// InstantSearch routing inside HeaderSearchResults is configured with
// `cleanUrlOnDispose: false` (load-bearing — see InstantSearchWrapper). When
// the search panel unmounts on search === "", it does not clean up the URL
// it wrote on the way in, so a bare <Link href="/"> can leave the param
// behind. Clearing it here keeps the URL in sync with the cleared input.
export function useClearSearch() {
  const setSearch = useStore((s) => s.setSearch);
  return useCallback(() => {
    setSearch("");
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has("query") && !url.searchParams.has("q")) return;
    url.searchParams.delete("query");
    url.searchParams.delete("q");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [setSearch]);
}
