"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/global/ui/sheet";
import { ShoppingCart } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import CartDropdownItem from "@/components/header/CartDropdownItem";

export default function SideCart() {
    const { cart, isCartOpen, setIsCartOpen } = useCart();
    let empty = cart?.contents?.itemCount == 0;


    const subTotal = useMemo(() => {
        return cart?.subtotal;
    }, [cart]);

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
                <button
                    className="group w-10 h-10 sm:w-10 sm:h-10 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 relative"
                >
                    {!!cart?.contents?.itemCount && (
                        <div className="w-5 bg-primaryColor h-5 flex items-center justify-center bg-primaryColor absolute top-0 right-0 rounded-full text-[11px] leading-none text-white font-medium">
                            <span className="mt-[1px] font-bold">{cart?.contents?.itemCount}</span>
                        </div>
                    )}

                    <div className="text-primaryColor flex items-center justify-center w-10 sm:h-10">
                        <ShoppingCart className="w-5" />
                    </div>

                    <Link className="block md:hidden absolute inset-0" href={"/cart"} />
                </button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="fixed inset-y-0 right-0 h-full w-10/12 border-l bg-background
                    data-[state=closed]:duration-300 data-[state=open]:duration-200
                    data-[state=open]:animate-in data-[state=closed]:animate-out
                    data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right
                    sm:max-w-sm z-[1000] px-4"
            >
                <SheetHeader className="space-y-4 pb-6">
                    <Link href={"/cart"} className="text-sm text-slate-500 dark:text-slate-400">
                        <SheetTitle className="text-xl font-semibold">Shopping Cart</SheetTitle>
                    </Link>
                </SheetHeader>

                <div className="flex flex-col h-[calc(100%-3rem)]">
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <div className="flex gap-2 flex-col">
                            {cart?.contents?.nodes?.map((item, index) => (
                                <CartDropdownItem
                                    item={item}
                                    key={index}
                                    close={() => setIsCartOpen(false)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-auto">
                        <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                            <span>
                                <span>Subtotal</span>
                                <span className="block text-sm text-slate-500 dark:text-slate-400 font-normal">
                                    Shipping and taxes calculated at checkout.
                                </span>
                            </span>
                            <span dangerouslySetInnerHTML={{ __html: subTotal || '' }} />
                        </div>
                        <div className="flex space-x-2 mt-5">
                            <Link className="flex-1" href={"/checkout"}>
                                <button
                                    disabled={empty}
                                    onClick={() => setIsCartOpen(false)}
                                    className={
                                        "relative w-full h-auto flex-1 items-center justify-center rounded-full \
                                        transition-colors disabled:cursor-not-allowed text-sm sm:text-base font-medium py-3 px-4 sm:py-3 sm:px-6 \
                                        disabled:bg-opacity-90 bg-primaryColor text-white"
                                    }
                                >
                                    <span className="">Checkout</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
