"use client";

import Image from "next/image";
import whatsappLogo from "@/public/images/whatsapplogo.webp";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { siteConfig } from "@/site.config";

const WHATSAPP_HREF = `https://wa.me/${siteConfig.contact.whatsapp}`;

const WhatsappLogoComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const params = useParams();
  const pathname = usePathname();

  const isSlugPage = useMemo(() => {
    if (!params?.slug) {
      return false;
    }

    const keys = Object.keys(params);

    if (keys.length === 1 && keys[0] === "slug") {
      return true;
    }

    return keys.sort().join("") === "brandslug";
  }, [params]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pathname?.startsWith("/checkout")) {
    return null;
  }

  return (
    <div
      className={twMerge(
        "fixed z-[1000] h-8 w-12 transition-transform",
        "max-md:bottom-[120px] max-md:right-7",
        isSlugPage && "max-md:bottom-[180px]",
        "md:bottom-12 md:right-10 md:mb-5 md:left-auto",
      )}
    >
      <Link href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
        <div className="relative flex flex-col items-center">
          <Image
            src={whatsappLogo}
            alt="WhatsApp-Logo"
            width={80}
            height={80}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          <div className="min-w-max text-xs font-medium text-[#25d366]">
            Chat with us
          </div>
        </div>
      </Link>

      {isScrolled && (
        <button
          onClick={scrollToTop}
          className="hidden md:block absolute bottom-12 right-0 mr-1 rounded border border-black bg-white p-2 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="black"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default WhatsappLogoComponent;
