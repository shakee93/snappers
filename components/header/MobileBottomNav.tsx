"use client";

import { BadgePercent, Menu, ShoppingBasket, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import { useSession } from "@/context/SessionProvider";
import { siteConfig } from "@/site.config";

const navItemClass =
    "flex flex-1 flex-col items-center justify-center gap-1 pt-2 text-white cursor-pointer";

const MobileBottomNav = () => {
    const { cart, setIsCartOpen } = useCart();
    const { fetchCustomer } = useSession();
    const router = useRouter();

    const handleAccountClick = async () => {
        const fetchedCustomer = await fetchCustomer();
        if (!fetchedCustomer || fetchedCustomer?.id === "guest") {
            router.push("/login");
        } else {
            router.push("/account");
        }
    };

    return (
        <div className="fixed bottom-0 z-[100] grid h-[82px] w-full grid-cols-5 items-center justify-center border-t-2 border-slate-100 bg-[#38461F] px-1 shadow-3xl">
            <Link href="/" className="flex flex-1 items-center justify-center">
                <Image
                    src="/global/mobile logo.png"
                    alt={siteConfig.brand.name}
                    width={45}
                    height={45}
                    className="h-[45px] w-auto"
                    priority
                />
            </Link>

            <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className={navItemClass}
            >
                <div className="relative">
                    {!!cart?.contents?.itemCount && (
                        <div className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-medium leading-none text-[#38461F]">
                            <span className="mt-[1px]">{cart.contents.itemCount}</span>
                        </div>
                    )}
                    <ShoppingBasket strokeWidth={1.75} />
                </div>
                <span className="text-[11px]">Basket</span>
            </button>

            <Link href="/deals" className={navItemClass}>
                <BadgePercent strokeWidth={1.75} />
                <span className="text-[11px]">Deals</span>
            </Link>

            <button type="button" onClick={handleAccountClick} className={navItemClass}>
                <User strokeWidth={1.75} />
                <span className="text-[11px]">Account</span>
            </button>

            <Link href="/c" className={navItemClass}>
                <Menu strokeWidth={1.75} />
                <span className="text-[11px]">Categories</span>
            </Link>
        </div>
    );
};

export default MobileBottomNav;
