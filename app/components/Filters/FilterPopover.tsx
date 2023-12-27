import {Popover, Transition} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/24/outline";
import React, {Fragment, ReactNode} from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import {XIcon} from "lucide-react";
import {twMerge} from "tailwind-merge";


interface FilterPopoverProps {
    icon: ReactNode
    title: string
    children: (props : {
        open : boolean
        close : () => void
    }) => ReactNode
    active: boolean
    onClear: () => void
    className?: string
}

const FilterPopover = ({children, icon, title, active, onClear, className}: FilterPopoverProps) => {

    return (
        <Popover className="relative">
            {({ open, close }) => (
                <>
                    <Popover.Button
                        className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none
               ${
                            open
                                ? "!border-primary-500 "
                                : "border-neutral-300 dark:border-neutral-700"
                        }
                ${
                            active
                                ? "!border-primary-500 bg-primary-50 text-primary-900"
                                : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                        }
                `}
                    >
                        {icon}

                        <span className="ml-2">{title}</span>
                        {!active ? (
                            <ChevronDownIcon className="w-4 h-4 ml-3" />
                        ) : (
                            <span onClick={(e) => {e.preventDefault(); close(); onClear()}}>
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center ml-3 cursor-pointer">
                      <XIcon className='p-0.5'/>
                  </div>
                </span>
                        )}
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
                            "absolute z-40 w-screen max-w-sm px-4 mt-3 sm:px-0 lg:max-w-2xl",
                            className
                        )}>
                            {children({open, close})}
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}

export default FilterPopover