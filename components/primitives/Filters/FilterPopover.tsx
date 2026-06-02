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

        <div>
            {/*<h4>{title}</h4>*/}
            <div>
                {children({
                    open: true,
                    close: () => {}
                })}
            </div>
        </div>

    );
}

export default FilterPopover