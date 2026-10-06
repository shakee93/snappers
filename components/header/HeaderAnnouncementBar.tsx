import Link from "next/link";
import { siteConfig } from "@/site.config";

const { links, message, helpLabel } = siteConfig.navigation.topBar;
const { primaryPhone, primaryPhoneDisplay } = siteConfig.contact;

/**
 * Thin top bar: quick links · delivery message · support phone.
 * Mobile shows the message only.
 */
const HeaderAnnouncementBar = () => {
  const topBarBg = siteConfig.theme.brandHex.topBar;

  return (
    <div
      className="bg-header-topbar text-white"
      style={{ backgroundColor: topBarBg }}
    >
      <div className="mx-auto grid h-9 max-w-[1368px] grid-cols-1 items-center px-4 text-[11px] sm:h-10 lg:grid-cols-3 lg:px-6 lg:text-xs">
        <nav aria-label="Top bar" className="hidden items-stretch lg:flex">
          {links.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center whitespace-nowrap px-4 text-white/95 transition-colors first:pl-0 hover:text-white hover:underline ${
                index < links.length - 1
                  ? "border-r border-white/35"
                  : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <p className="truncate text-center font-medium">{message}</p>

        <p className="hidden justify-end whitespace-nowrap lg:flex">
          {helpLabel}&nbsp;
          <a href={`tel:${primaryPhone}`} className="hover:underline">
            {primaryPhoneDisplay}
          </a>
        </p>
      </div>
    </div>
  );
};

export default HeaderAnnouncementBar;
