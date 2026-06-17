"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import { useSession } from "@/context/SessionProvider";
import { siteConfig } from "@/site.config";
import basketIcon from "@/public/global/boxicons_basket-filled.svg";
import dealIcon from "@/public/global/deal.svg";
import menuIcon from "@/public/global/charm_menu-hamburger.svg";
import profileIcon from "@/public/global/profile-m.svg";

const navItemClass =
    "flex flex-1 flex-col items-center justify-center gap-1 pt-2 text-white cursor-pointer";

const mobileNavIconClass = "h-[22px] w-[22px] object-contain";

const MobileBottomNav = () => {
    const { cart, setIsCartOpen } = useCart();
    const { fetchCustomer } = useSession();
    const router = useRouter();

    const handleAccountClick = async () => {
        const data = await fetchCustomer();
        if (!data) {
            router.push("/login");
        } else {
            router.push("/account");
        }
    };

    return (
        <div className="fixed bottom-0 z-[100] grid h-[82px] w-full grid-cols-5 items-center justify-center border-t-2 border-slate-100 bg-header-green px-1 shadow-3xl">
            <Link href="/" className="flex flex-1 items-center justify-center">
                <Image
                    src="/global/mobile-logo.png"
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
                        <div className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-medium leading-none text-header-green">
                            <span className="mt-[1px]">{cart.contents.itemCount}</span>
                        </div>
                    )}
                    <Image
                        src={basketIcon}
                        alt=""
                        width={22}
                        height={22}
                        className={mobileNavIconClass}
                        aria-hidden
                    />
                </div>
                <span className="text-[11px]">Basket</span>
            </button>

            <Link href="/deals" className={navItemClass}>
                <Image
                    src={dealIcon}
                    alt=""
                    width={22}
                    height={22}
                    className={mobileNavIconClass}
                    aria-hidden
                />
                <span className="text-[11px]">Deals</span>
            </Link>

            <button type="button" onClick={handleAccountClick} className={navItemClass}>
                <Image
                    src={profileIcon}
                    alt=""
                    width={22}
                    height={22}
                    className={mobileNavIconClass}
                    aria-hidden
                />
                <span className="text-[11px]">Account</span>
            </button>

            <Link href="/c" className={navItemClass}>
                <Image
                    src={menuIcon}
                    alt=""
                    width={22}
                    height={22}
                    className={mobileNavIconClass}
                    aria-hidden
                />
                <span className="text-[11px]">Categories</span>
            </Link>
        </div>
    );
};

export default MobileBottomNav;
