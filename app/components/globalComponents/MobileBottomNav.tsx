"use client";
import {
    Home,
    Search,
    ShoppingBag,
    LayoutGrid,
    UserCircle, Codesandbox, Menu, CircleUser,
} from "lucide-react";
import Logo from "./Logo";
import { XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Category } from "@/graphql/types/graphql";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { useStore } from "@/store/store";
import { useSession } from "@/context/SessionProvider";

const MobileBottomNav = ({ categories }: { categories: any }) => {
    const [openCat, setOpenCat] = useState(false);
    const { cart } = useCart();
    const { mobileMenu, toggleMobileMenu } = useStore()
    const { customer, fetchCustomer, updateCustomer } = useSession();

    const fetchData = async () => {
        await fetchCustomer();
    };

    useEffect(() => {
        if (customer == null) {
            fetchData();
        }
    }, [customer]);

    const handleCat = () => {
        setOpenCat(!openCat);
    };

    const router = useRouter();

    return (
        <div
            className="fixed h-[82px] grid grid-cols-6 shadow-3xl items-center justify-center bottom-0 z-[100] bg-white border-slate-100 border-t-2 w-full  px-1">
            <div className='flex-1'>
                <Logo className='flex  h-full items-center justify-center' imageClass='h-[45px] p-0' />
            </div>
            <Link
                href="/collections"
                className="flex-1 pt-2 flex flex-col justify-center items-center text-primaryColor gap-1 cursor-pointer"
            >
                <LayoutGrid />
                <div className="text-[11px]">Collections</div>
            </Link>
            <Link
                href="/brands"
                className="flex pt-2 flex-1 flex-col justify-center items-center text-primaryColor gap-1 cursor-pointer"
            >
                <Codesandbox />
                <div className="text-[11px]">Brands</div>
            </Link>
            <Link
                href="/cart"
                className="flex pt-2 flex-col justify-center items-center text-primaryColor gap-1"
            >
                <div className='relative'>
                    {!!cart?.contents?.itemCount &&
                        <div
                            className="w-4 h-4 flex items-center justify-center bg-primary-500 absolute -top-1 -right-1.5 rounded-full text-[10px] leading-none text-white font-medium">
                            <span className="mt-[1px]">{cart?.contents?.itemCount}</span>
                        </div>
                    }
                    <ShoppingBag />
                </div>
                <div className="text-[11px]">Cart</div>
            </Link>
            <div
                className="flex pt-2 flex-1 flex-col justify-center items-center text-primaryColor gap-1 cursor-pointer"
                onClick={async () => {
                    const fetchedCustomer = await fetchCustomer();
                    if (!fetchedCustomer || fetchedCustomer?.id === "guest") {
                        router.push('/login');
                    } else {
                        router.push('/account');
                    }
                }}
            >
                <CircleUser />
                <div className="text-[11px]">{!customer || customer?.id === "guest" ? 'Login' : 'Account'}</div>

            </div>
            <div
                onClick={e => toggleMobileMenu()}
                className="flex pt-2 flex-col justify-center items-center text-primaryColor gap-1"
            >
                {mobileMenu ? <XIcon /> : <Menu />}
                <div className="text-[11px]">Menu</div>
            </div>


        </div>
    );
};

export default MobileBottomNav;
