"use client";

import Image from "next/image";
import whatsappLogo from "@/public/images/whatsapplogo.webp";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { useParams, usePathname, useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

const WhatsappLogoComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { navigation } = useStore()

  const params = useParams()

  const isProduct = useMemo(() => {

    if (!params) {
      return false;
    }

    return ['brand', 'slug'].join('') === Object.keys(params).join('');
  }, [params])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={twMerge(
      "transition-transform fixed z-[1000] md:bottom-12 md:right-10 bottom-[120px] right-7 h-8 w-12 md:mb-5",
      isProduct && 'bottom-44'
    )}>
      <Link href={"https://wa.me/94777555665"} target="_blank">
        <div className="relative flex flex-col items-center">
          <Image
            src={whatsappLogo}
            alt="WhatsApp-Logo"
            width={80}
            height={80}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          <div className="min-w-max text-xs font-medium text-[#25d366]" >
            Chat with us
          </div>
        </div>
      </Link>

      {isScrolled && (
        <button
          onClick={scrollToTop}
          className="hidden md:block p-2 bg-white text-white rounded border border-black absolute right-0 bottom-12 mr-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
          </svg>
        </button>
      )}

    </div>
  );
};

export default WhatsappLogoComponent;
