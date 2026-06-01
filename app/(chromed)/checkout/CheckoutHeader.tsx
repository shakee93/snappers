import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/gq-logo.png";
import { Lock, Phone } from "lucide-react";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { siteConfig } from "@/site.config";

const SUPPORT_PHONE_DISPLAY = siteConfig.contact.secondaryPhone;
const SUPPORT_PHONE_TEL = `tel:${siteConfig.contact.secondaryPhone}`;
const SUPPORT_WHATSAPP = `https://wa.me/${siteConfig.contact.whatsapp}`;

const CheckoutHeader = () => {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex h-14 md:h-16 items-center justify-between gap-3">
        <Link href="/" aria-label={`${siteConfig.brand.name} home`} className="shrink-0">
          <Image
            src={SiteLogo}
            alt={siteConfig.brand.name}
            width={160}
            height={40}
            priority
            className="h-8 md:h-10 w-auto"
          />
        </Link>

        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
          <span className="inline-flex items-center gap-1.5 text-gray-600">
            <Lock size={14} className="text-green-600" />
            <span className="hidden sm:inline">Secure Checkout</span>
          </span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="hidden md:inline text-gray-500">Need help?</span>
          <Link
            href={SUPPORT_PHONE_TEL}
            className="inline-flex items-center gap-1.5 text-gray-700 hover:text-primaryColor"
            aria-label={`Call ${SUPPORT_PHONE_DISPLAY}`}
          >
            <Phone size={14} className="text-primaryColor" />
            <span className="hidden sm:inline">{SUPPORT_PHONE_DISPLAY}</span>
          </Link>
          <Link
            href={SUPPORT_WHATSAPP}
            target="_blank"
            aria-label="Chat on WhatsApp"
            className="inline-flex items-center text-[#25d366] hover:opacity-80"
          >
            <PiWhatsappLogoDuotone size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default CheckoutHeader;
