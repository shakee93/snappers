import Link from "next/link";
import { siteConfig } from "@/site.config";

const { links, helpLabel } = siteConfig.navigation.topBar;
const centerLinks = siteConfig.navigation.footerQuickLinks.links;
const { primaryPhone, primaryPhoneDisplay } = siteConfig.contact;

const topBarLinkClass = (isLast: boolean) =>
  `flex items-center whitespace-nowrap px-3 text-white/95 transition-colors first:pl-0 hover:text-white hover:underline sm:px-4 ${
    isLast ? "" : "border-r border-white/35"
  }`;

/**
 * Thin top bar: account links · quick links (center) · support phone.
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
              className={topBarLinkClass(index >= links.length - 1)}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <nav
          aria-label="Quick links"
          className="flex items-stretch justify-center overflow-x-auto scrollbar-none"
        >
          {centerLinks.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={topBarLinkClass(index >= centerLinks.length - 1)}
            >
              {item.name}
            </Link>
          ))}
        </nav>

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
