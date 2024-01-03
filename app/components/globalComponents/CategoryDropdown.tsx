"use client"
import React, {Fragment, useState} from 'react';
import {ChevronDown, XIcon} from 'lucide-react';
import Link from 'next/link';
import { Category } from '@/graphql/types/graphql';
import {Popover, Transition} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/24/outline";
import {twMerge} from "tailwind-merge";
import {usePathname} from "next/navigation";

const DropdownButton = ({categories} : { categories: any }) => {

    const path = usePathname()

  return (
    <div className="relative text-center">
        <Popover className="relative">
            {({ open, close }) => (
                <>
                    <Popover.Button
                        className="hidden uppercase md:flex whitespace-nowrap focus:outline-0 py-4 pl-6  pr-4 h-full justify-center text-xs xl:text-sm items-center"
                    >
                        All Categories <ChevronDown className={twMerge(
                            `h-5 ml-1 transition-all duration-500`,
                        open && 'rotate-180'
                    )} />
                    </Popover.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className={twMerge(
                            "absolute z-[350] w-screen max-w-sm mt-3 lg:max-w-5xl  shadow-2xl bg-white rounded-lg",
                        )}>
                            <ul className="py-4 px-4 text-left text-sm font-normal text-gray-700 grid grid-cols-4 dark:text-gray-200">
                                {categories?.map((category: Category, index: number) => (
                                    <li key={index} className='w-full'>
                                        <Link

                                            onClick={e => close()}
                                            href={`/collections/${category.slug}`}
                                            className={twMerge(
                                                "transition-all block px-4 py-3 hover:pl-6 rounded hover:text-white hover:bg-primaryColor dark:hover:bg-gray-600 dark:hover:text-white",
                                                path === `/collections/${category.slug}` && 'text-white bg-primaryColor pl-6'
                                            )}
                                        >
                                            {category.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>

    </div>
  );
};

export default DropdownButton;
