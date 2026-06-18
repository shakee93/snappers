import React, { FC, useEffect, useMemo, useSyncExternalStore } from "react";
import twFocusClass from "@/utils/twFocusClass";
import {
  Pagination,
  useInstantSearch,
  usePagination,
} from "react-instantsearch";
import { twMerge } from "tailwind-merge";
import { SearchResults } from "algoliasearch-helper";
import { ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";

const paginationNavButtonClassName = (twFocusClass: string) =>
  `inline-flex items-center justify-center rounded-full border border-[#E8E8E8] bg-white px-2.5 text-header-green transition-colors hover:border-header-green/40 hover:bg-header-cream/30 disabled:cursor-not-allowed disabled:opacity-50 ${twFocusClass}`;

const paginationPageButtonClassName = (twFocusClass: string, active: boolean) =>
  active
    ? `inline-flex h-11 w-11 items-center justify-center rounded-full bg-header-action font-semibold text-header-green ${twFocusClass}`
    : `inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E8E8] bg-white text-header-green transition-colors hover:border-header-green/40 hover:bg-header-cream/30 ${twFocusClass}`;

const paginationFirstButtonClassName = (twFocusClass: string) =>
  `inline-flex items-center justify-center rounded-full border border-[#E8E8E8] bg-white px-4 text-header-green transition-colors hover:border-header-green/40 hover:bg-header-cream/30 disabled:cursor-not-allowed disabled:opacity-50 ${twFocusClass}`;

const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

function useIsMobile(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(MOBILE_MEDIA_QUERY).matches,
    () => false,
  );
}

export interface PaginationProps {
  className?: string;
  onPageChange?: () => void;
}

const Paginationx: FC<PaginationProps> = ({ className = "", onPageChange }) => {

  const { pages, refine, currentRefinement, isFirstPage, isLastPage, nbPages } =
    usePagination({
      padding: 2
    });

  const isMobile = useIsMobile();

  const firstPageIndex = 0;
  const previousPageIndex = currentRefinement - 1;
  const nextPageIndex = currentRefinement + 1;
  const lastPageIndex = nbPages - 1;

  const visiblePages = useMemo(() => {
    if (!isMobile) return pages;

    const start = Math.max(0, currentRefinement - 1);
    const end = Math.min(nbPages - 1, currentRefinement + 1);
    return pages.slice(start, end + 1);
  }, [isMobile, pages, currentRefinement, nbPages]);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const overlay = document.querySelector('.overlay-class');
    if (overlay) {
      overlay.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentRefinement])


  if (nbPages === 1) {
    return <></>;
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <nav
        className={`nc-Pagination inline-flex space-x-1 text-sm md:text-base font-medium ${className}`}
      >
        {["loading", "stalled"].includes("") ? (
          <div>
            <div className="flex gap-1">
              <div className="h-11 bg-gray-300 rounded-full w-11 animate-pulse"></div>
              <div className="h-11 bg-gray-300 rounded-full w-11 animate-pulse"></div>
              <div className="h-11 bg-gray-300 rounded-full w-11 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <>
            {currentRefinement > 3 && (
              <button
                disabled={isFirstPage}
                onClick={(event) => {
                  event.preventDefault();
                  refine(firstPageIndex);
                }}
                className={paginationFirstButtonClassName(twFocusClass())}
              >
                First
              </button>
            )}

            {!isFirstPage && (
              <button
                disabled={isFirstPage}
                onClick={(event) => {
                  event.preventDefault();
                  refine(previousPageIndex);
                }}
                className={paginationNavButtonClassName(twFocusClass())}
              >
                <ChevronLeft />
              </button>
            )}

            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={(event) => {
                  event.preventDefault();
                  refine(page);
                }}
                className={paginationPageButtonClassName(
                  twFocusClass(),
                  currentRefinement === page,
                )}
              >
                {page + 1}
              </button>
            ))}

            <button
              disabled={isLastPage}
              onClick={(event) => {
                event.preventDefault();
                refine(nextPageIndex);
              }}
              className={paginationNavButtonClassName(twFocusClass())}
            >
              <ChevronRight />
            </button>

            <button
              disabled={isLastPage}
              onClick={(event) => {
                event.preventDefault();
                refine(lastPageIndex);
              }}
              className={paginationNavButtonClassName(twFocusClass())}
            >
              <ChevronLast />
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Paginationx;
