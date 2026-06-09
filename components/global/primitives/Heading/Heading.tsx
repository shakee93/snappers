import React, { HTMLAttributes, ReactNode } from "react";
import NextPrev from "shared/NextPrev/NextPrev";
import Link from "next/link";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  fontClass?: string;
  rightDescText?: ReactNode;
  rightPopoverOptions?: typeof solutions;
  desc?: ReactNode;
  hasNextPrev?: boolean;
  isCenter?: boolean;
  link?: string;
}

const solutions = [
  {
    name: "last 24 hours",
    href: "##",
  },
  {
    name: "last 7 days",
    href: "##",
  },
  {
    name: "last 30 days",
    href: "##",
  },
];

const Heading: React.FC<HeadingProps> = ({
  children,
  desc = "",
  className = "mb-5 flex md:mb-6 text-neutral-900 dark:text-neutral-50",
  isCenter = false,
  hasNextPrev = false,
  fontClass = "text-2xl md:text-3xl font-semibold flex items-center justify-center",
  rightDescText,
  rightPopoverOptions = solutions,
  link,
  ...args
}) => {

  return (
    <div
      className={`nc-Section-Heading relative flex flex-row sm:flex-row sm:items-end justify-between ${className}`}
    >
      <div
        className={
          isCenter
            ? "flex flex-col items-center text-center w-full mx-auto"
            : ""
        }
      >
        {link ? (
          <Link href={link} target="_blank" rel="noopener noreferrer">
            <h2
              className={`${isCenter ? "justify-center" : ""} ${fontClass}`}
              {...args}
            >
              {children || `Section Heading`}
              {rightDescText && (
                <>
                  {/* <span className="">{`. `}</span> */}
                  {/* <span className="pl-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </span> */}
                  <span className="text-neutral-500 dark:text-neutral-400 hidden lg:flex">
                    {rightDescText}
                  </span>
                </>
              )}
            </h2>
          </Link>
        ) : (
          <h2
            className={`${isCenter ? "justify-center" : ""} ${fontClass}`}
            {...args}
          >
            {children || `Section Heading`}
            {rightDescText && (
              <>
                {/* <span className="">{`. `}</span> */}
                <span className="text-neutral-500 dark:text-neutral-400 hidden lg:flex">
                  {rightDescText}
                </span>
              </>
            )}
          </h2>
        )}

        {!!desc && (
          <span className="mt-2 md:mt-3 font-normal block text-base sm:text-xl text-neutral-500 dark:text-neutral-400">
            {desc}
          </span>
        )}
      </div>

      {hasNextPrev && !isCenter && (
        <div className="flex flex-row items-center justify-center">
          <div className="md:mt-4 flex justify-end sm:ml-2 sm:mt-0 flex-shrink-0">
            <NextPrev onClickNext={() => { }} onClickPrev={() => { }} />
          </div>
          {link ? (
            <Link href={link} target="_blank" rel="noopener noreferrer"
              className="text-xs md:text-base md:mt-4 md:ml-4 flex p-2 justify-end sm:ml-2 sm:mt-0 flex-shrink-0 border border-slate-200 rounded-lg">
              See More
            </Link>
          ) : <>
          </>
          }
        </div>

      )}
    </div>
  );
};

export default Heading;
