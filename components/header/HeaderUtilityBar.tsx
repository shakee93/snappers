"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import SearchBar from "./SearchBar";

const { links } = siteConfig.navigation.utility;

function isUtilityLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop dark-green utility bar: search (left) · quick links (right).
 * Announcement messages live in `HeaderAnnouncementBar` above the cream bar.
 */
const HeaderUtilityBar = () => {
  const pathname = usePathname();

  return (
    <div className="hidden lg:block bg-header-green">
      <div className="flex h-[72px] w-full items-center px-6">
        {/* Left: pill search */}
        <div className="min-w-0 w-full max-w-3xl">
          <SearchBar
            variant="utility"
            placeholder="Search for brand, products or categories..."
          />
        </div>

        {/* Right: quick links with active underline */}
        <nav className="ml-auto flex shrink-0 items-center gap-8 pl-10 xl:gap-10">
          {links.map((item) => {
            const active = isUtilityLinkActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative whitespace-nowrap pb-2 text-sm font-semibold transition-colors",
                  active ? "text-white" : "text-white/80 hover:text-white"
                )}
              >
                {item.name}
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-header-accent transition-opacity",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default HeaderUtilityBar;
