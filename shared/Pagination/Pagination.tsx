import { CustomLink } from "@/data/types";
import React, { FC } from "react";
import Link from "next/link";
import twFocusClass from "@/utils/twFocusClass";
import {
  Pagination,
  useInstantSearch,
  usePagination,
} from "react-instantsearch";
import { twMerge } from "tailwind-merge";
import { SearchResults } from "algoliasearch-helper";
import {ChevronLast, ChevronLeft, ChevronRight} from "lucide-react";

const DEMO_PAGINATION: CustomLink[] = [
  {
    label: "1",
    href: "#",
  },
  {
    label: "2",
    href: "#",
  },
  {
    label: "3",
    href: "#",
  },
  {
    label: "4",
    href: "#",
  },
];

export interface PaginationProps {
  className?: string;
  onPageChange?: () => void;
}

const Paginationx: FC<PaginationProps> = ({ className = "", onPageChange }) => {
  const { pages, refine, currentRefinement, isFirstPage, isLastPage, nbPages } =
    usePagination();

  const handleClick = () => {
    if (onPageChange) {
      onPageChange();
    }
  };
  const firstPageIndex = 0;
  const previousPageIndex = currentRefinement - 1;
  const nextPageIndex = currentRefinement + 1;
  const lastPageIndex = nbPages - 1;

  if (nbPages === 1) {
    return <></>;
  }

  return (
    <nav
      className={`nc-Pagination inline-flex space-x-1 text-base font-medium ${className}`}
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
                handleClick();
              }}
              className={twMerge(
                `inline-flex px-4 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`
              )}
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
                handleClick();
              }}
              className={twMerge(
                `inline-flex px-2.5 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`
              )}
            >
              <ChevronLeft/>
            </button>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={(event) => {
                event.preventDefault();
                refine(page);
                handleClick();
              }}
              className={twMerge(
                currentRefinement === page
                  ? `inline-flex w-11 h-11 items-center justify-center rounded-full bg-primary-6000 text-white ${twFocusClass()}`
                  : `inline-flex w-11 h-11 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`
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
              handleClick();
            }}
            className={twMerge(
              `inline-flex px-2.5 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`
            )}
          >
            <ChevronRight/>
          </button>

          <button
            disabled={isLastPage}
            onClick={(event) => {
              event.preventDefault();
              refine(lastPageIndex);
              handleClick();
            }}
            className={twMerge(
              `inline-flex px-2.5 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`
            )}
          >
            <ChevronLast/>
          </button>
        </>
      )}
    </nav>
  );
};

export default Paginationx;
