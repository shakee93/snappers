"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/global/ui/sheet";
import Image from "next/image";
import { useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import CartDropdownItem from "@/components/header/CartDropdownItem";
import { BRAND_CTA_BUTTON_CLASS } from "@/shared/Button/ButtonBrand";
import { currencySymbol, toDisplayCurrency } from "@/lib/formatPrice";
import basketIcon from "@/public/global/basket.svg";

const SIDE_CART_CHECKOUT_CLASS =
    `relative w-full h-auto flex flex-1 items-center justify-center rounded-full text-sm sm:text-base font-bold py-3 px-4 sm:py-3 sm:px-6 ${BRAND_CTA_BUTTON_CLASS}`;

/**
 * Radix Sheet uses react-remove-scroll, which locks the body via
 * `data-scroll-locked`. Checkout hides the header (HeaderGate), so the sheet
 * can unmount mid-close and leave that attribute behind — checkout then
 * cannot scroll until a full reload.
 */
function clearBodyScrollLock() {
    document.body.removeAttribute("data-scroll-locked");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
    document.body.style.removeProperty("margin-right");
    document.documentElement.style.removeProperty("overflow");
}

export default function SideCart() {
    const { cart, isCartOpen, setIsCartOpen } = useCart();
    const checkoutDisabled = (cart?.contents?.itemCount ?? 0) === 0;

    const subTotal = useMemo(
        () => toDisplayCurrency(cart?.subtotal) || `${currencySymbol} 0.00`,
        [cart?.subtotal],
    );

    const closeCart = useCallback(() => {
        setIsCartOpen(false);
        clearBodyScrollLock();
    }, [setIsCartOpen]);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsCartOpen(open);
            if (!open) {
                clearBodyScrollLock();
            }
        },
        [setIsCartOpen],
    );

    // Safety net when HeaderGate unmounts this tree on /checkout.
    useEffect(() => {
        return () => {
            clearBodyScrollLock();
        };
    }, []);

    return (
        <Sheet open={isCartOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <button
                    aria-label="Open basket"
                    className="group relative inline-flex items-center gap-2 rounded-xl bg-header-accent px-4 py-2.5 text-neutral-900 transition-[filter] hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-header-accent focus-visible:ring-offset-1"
                >
                    <Image
                        src={basketIcon}
                        alt=""
                        width={18}
                        height={18}
                        className="h-[18px] w-[18px] object-contain"
                        aria-hidden
                    />
                    <span className="text-sm font-semibold">Basket</span>
                    <span
                      className="h-4 w-px shrink-0 bg-neutral-900/25"
                      aria-hidden
                    />
                    <span className="text-sm font-bold tabular-nums">
                        {cart?.contents?.itemCount ?? 0}
                    </span>

                    <Link className="block md:hidden absolute inset-0" href={"/cart"} />
                </button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="fixed inset-y-0 right-0 h-full w-11/12 border-l bg-[#FAFAF8]
                    data-[state=closed]:duration-300 data-[state=open]:duration-200
                    data-[state=open]:animate-in data-[state=closed]:animate-out
                    data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right
                    sm:max-w-lg z-[1000] px-4"
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
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-xl border border-[#E8E8E8] bg-white"
                                >
                                    <CartDropdownItem
                                        item={item}
                                        close={closeCart}
                                        wrapperClassName="flex px-3 py-4 relative border-0 bg-transparent"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-auto">
                        <div className="flex items-baseline justify-between gap-4 font-semibold text-slate-900 dark:text-slate-100">
                            <span>Subtotal</span>
                            <span
                                className="whitespace-nowrap [&_*]:inline"
                                dangerouslySetInnerHTML={{ __html: subTotal || "" }}
                            />
                        </div>
                        <p className="mt-1 text-sm font-normal text-slate-500 dark:text-slate-400">
                            Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-5">
                            {checkoutDisabled ? (
                                <button
                                    type="button"
                                    disabled
                                    className={SIDE_CART_CHECKOUT_CLASS}
                                >
                                    Checkout
                                </button>
                            ) : (
                                <Link
                                    href="/checkout"
                                    onClick={closeCart}
                                    className={SIDE_CART_CHECKOUT_CLASS}
                                >
                                    Checkout
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
