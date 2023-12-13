import React, { FC, useState } from "react";
import Logo from "@/public/shared/Logo/Logo";
import Navigation from "@/public/shared/Navigation/Navigation";
import ButtonPrimary from "@/public/shared/Button/ButtonPrimary";
import MenuBar from "@/public/shared/MenuBar/MenuBar";
import SwitchDarkMode from "@/public/shared/SwitchDarkMode/SwitchDarkMode";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export interface MainNav1Props {
    isTop: boolean;
}

const MainNav1: FC<MainNav1Props> = ({ isTop }) => {
    const inputRef = React.createRef<HTMLInputElement>();
    const [showSearchForm, setShowSearchForm] = useState(false);
    const router = useRouter();

    const renderMagnifyingGlassIcon = () => {
        return (
            <svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M22 22L20 20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    };

    const renderSearchForm = () => {
        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    router.push("/page-search");
                }}
                className="flex-1 py-2 text-slate-900 dark:text-slate-100"
            >
                <div className="bg-slate-50 dark:bg-slate-800 flex items-center space-x-1.5 px-5 h-full rounded">
                    {renderMagnifyingGlassIcon()}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type and press enter"
                        className="border-none bg-transparent focus:outline-none focus:ring-0 w-full text-base"
                        autoFocus
                    />
                    <button type="button" onClick={() => setShowSearchForm(false)}>
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <input type="submit" hidden value="" />
            </form>
        );
    };

    return (
        <div
            className={`nc-MainNav1 relative z-10 ${isTop ? "onTop " : "notOnTop backdrop-filter"
                }`}
        >
            <div className="container py-5 relative flex justify-between items-center space-x-4 xl:space-x-8">
                <div className="flex justify-start flex-grow items-center space-x-4 sm:space-x-10 2xl:space-x-14">
                    <Logo />
                    <Navigation />
                </div>
                <div className="flex-shrink-0 flex items-center justify-end text-neutral-700 dark:text-neutral-100 space-x-1">
                    <div className="hidden items-center xl:flex space-x-1">
                        <SwitchDarkMode />
                        {showSearchForm ? renderSearchForm() : null}
                        <div className="px-1" />
                        <ButtonPrimary href="/login">Sign up</ButtonPrimary>
                    </div>
                    <div className="flex items-center xl:hidden">
                        <SwitchDarkMode />
                        <div className="px-1" />
                        <MenuBar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainNav1;
