"use client";

import Link from "next/link";
import { siteConfig } from "@/site.config";
import SearchBar from "./SearchBar";

const { links, message } = siteConfig.navigation.utility;

/**
 * Desktop dark-green utility bar: quick links · search · delivery message.
 * Sits directly under the cream top bar (see `HeaderContent`).
 */
const HeaderUtilityBar = () => {
  return (
    <div className="hidden lg:block bg-header-green text-header-cream">
      <div className="grid h-[80px] w-full grid-cols-[1fr_auto_1fr] items-center gap-6 px-6">
        {/* Left: quick links */}
        <nav className="flex min-w-0 items-center gap-6 xl:text-sm text-xs font-medium">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-white/90 transition-colors hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Center: search */}
        <div className="flex 2xl:w-[38rem] xl:w-[34rem] w-[20rem] max-w-full justify-center">
          <SearchBar
            variant="utility"
            placeholder="Search for brand, products or categories..."
          />
        </div>

        {/* Right: delivery message */}
        <p className="min-w-0 justify-self-end text-right xl:text-sm text-xs font-medium text-white/90">
          {message.map((line, i) => (
            <span
              key={line}
              className={`block whitespace-nowrap xl:inline ${
                i > 0 ? "xl:ml-1" : ""
              }`}
            >
              {line}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};

export default HeaderUtilityBar;
