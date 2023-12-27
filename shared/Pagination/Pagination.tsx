import { CustomLink } from "@/data/types";
import React, { FC } from "react";
import Link from "next/link";
import twFocusClass from "@/utils/twFocusClass";
import {Pagination, usePagination} from "react-instantsearch";
import {twMerge} from "tailwind-merge";
import {SearchResults} from "algoliasearch-helper";

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
}

const Paginationx: FC<PaginationProps> = ({ className = "" }) => {


  const {
    pages, refine, currentRefinement, isFirstPage,
    isLastPage, nbPages
  } = usePagination();

  const firstPageIndex = 0;
  const previousPageIndex = currentRefinement - 1;
  const nextPageIndex = currentRefinement + 1;
  const lastPageIndex = nbPages - 1;

    if (nbPages === 1) {
        return <></>
    }

  return (
      <nav
          className={`nc-Pagination inline-flex space-x-1 text-base font-medium ${className}`}
      >

          {currentRefinement > 3 &&
              <button
                  disabled={isFirstPage}
                  onClick={(event) => {
                      event.preventDefault();
                      refine(firstPageIndex);
                  }}
                  className={twMerge(
                      `inline-flex px-4 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`
                  )}
              >
                  First
              </button>
          }


          {!isFirstPage &&

              <button
                  disabled={isFirstPage}
                  onClick={(event) => {
                      event.preventDefault();
                      refine(previousPageIndex);
                  }}
                  className={twMerge(
                      `inline-flex px-4 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`
                  )}
              >
                  Prev
              </button>
          }




        {pages.map((page) => (
            <button
                key={page}
                onClick={(event) => {
                  event.preventDefault();
                  refine(page);
                }}
                className={twMerge(
                    currentRefinement === page ?
                        `inline-flex w-11 h-11 items-center justify-center rounded-full bg-primary-6000 text-white ${twFocusClass()}`
                        :
                    `inline-flex w-11 h-11 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`
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
            className={twMerge(
                    `inline-flex px-4 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`
            )}
        >
          Next
        </button>

        <button
            disabled={isLastPage}
            onClick={(event) => {
              event.preventDefault();
              refine(lastPageIndex);
            }}
            className={twMerge(
                `inline-flex px-4 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`
            )}
        >
          Last
        </button>
      </nav>
  );
};

export default Paginationx;
