"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Facebook, Instagram, PhoneCall } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import { useSession } from "@/context/SessionProvider";
import { siteConfig } from "@/site.config";
import { getMegaMenuPanelData, navHrefToSlug } from "@/lib/megaMenu";
import { getMegaMenuCategoryIcon } from "@/lib/megaMenuIcons";
import { getCategoryPath } from "@/lib/productUrl";
import type { CategoryTreeNode } from "@/lib/categoryTree";
import { cn } from "@/lib/utils";
import { getFaviconSources } from "@/lib/siteAssets";

const mobileDrawerMarkSrc = getFaviconSources().light;

type MobileNavLinksProps = {
  navCategories?: ProductCategory[];
};

const MobileNavLinks = ({ navCategories = [] }: MobileNavLinksProps) => {
  const iconSize = 18;
  const navLinks = siteConfig.navigation.main;
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const { mobileMenu, toggleMobileMenu } = useStore();
  const { customer, logout } = useSession();
  const router = useRouter();

  const panelsByHref = useMemo(() => {
    const map = new Map<
      string,
      NonNullable<ReturnType<typeof getMegaMenuPanelData>>
    >();
    for (const item of navLinks) {
      const panel = getMegaMenuPanelData(navCategories, item.href);
      if (panel) map.set(item.href, panel);
    }
    return map;
  }, [navCategories, navLinks]);

  const handleLogout = async () => {
    logout();
    router.push("/login");
  };

  const closeMenu = () => {
    toggleMobileMenu();
    setOpenSlug(null);
  };

  return (
    <div className="w-full">
      <div
        className={`${
          mobileMenu
            ? "bottom-[95px] translate-y-0 opacity-100 scale-100"
            : "bottom-0 translate-y-full opacity-0 scale-50"
        } fixed left-1/2 z-[1001] h-fit w-11/12 origin-center -translate-x-1/2 transform rounded-3xl border border-gray-300 bg-white pt-4 pb-8 shadow-xl duration-150 ease-in-out`}
      >
        <div className="m-auto w-1/5 rounded-xl bg-gray-300 py-0.5" />

        <div className="mt-3 flex justify-center px-4">
          <Link href="/" onClick={closeMenu} className="inline-flex">
            <Image
              src={mobileDrawerMarkSrc}
              alt={siteConfig.brand.name}
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />
          </Link>
        </div>

        <div className="mt-3 flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
          <ul className="items-center gap-1 px-2 text-center text-base font-medium text-primaryColor">
            {navLinks.map((item) => {
              const panel = panelsByHref.get(item.href);
              const slug = navHrefToSlug(item.href);
              const isOpen = openSlug === slug;

              if (!panel) {
                return (
                  <li key={item.href} className="rounded-3xl px-1 py-1 xl:px-3">
                    <Link href={item.href} onClick={closeMenu}>
                      {item.name}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.href} className="rounded-2xl px-1 py-1 text-left">
                  <div className="flex items-center gap-1">
                    <Link
                      href={panel.shopAllHref}
                      onClick={closeMenu}
                      className="flex-1 rounded-xl px-3 py-2"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Hide" : "Show"} ${item.name} subcategories`}
                      onClick={() => setOpenSlug(isOpen ? null : slug)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-primaryColor"
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                  </div>
                  {isOpen ? (
                    <div className="mb-2 space-y-3 rounded-2xl bg-neutral-50 px-3 py-3">
                      {panel.root.children.map((child: CategoryTreeNode) => {
                        const Icon = getMegaMenuCategoryIcon(child);
                        return (
                        <div key={child.slug ?? child.databaseId}>
                          <Link
                            href={getCategoryPath(child.slug ?? "")}
                            onClick={closeMenu}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-header-green"
                          >
                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-header-cream text-header-green">
                              <Icon className="h-3.5 w-3.5" aria-hidden />
                            </span>
                            {child.name}
                          </Link>
                          {child.children.length > 0 ? (
                            <ul className="mt-1.5 space-y-1 pl-1">
                              {child.children.map((grand) => (
                                <li
                                  key={grand.slug ?? grand.databaseId}
                                  className="flex gap-2"
                                >
                                  <span
                                    className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-header-green/35"
                                    aria-hidden
                                  />
                                  <Link
                                    href={getCategoryPath(grand.slug ?? "")}
                                    onClick={closeMenu}
                                    className="py-0.5 text-sm text-neutral-600 hover:text-header-green"
                                  >
                                    {grand.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                        );
                      })}
                      <Link
                        href={panel.shopAllHref}
                        onClick={closeMenu}
                        className="inline-block pt-1 text-sm font-semibold text-primary-600"
                      >
                        {panel.shopAllLabel}
                      </Link>
                    </div>
                  ) : null}
                </li>
              );
            })}
            <li className="rounded-3xl px-1 py-1 xl:px-3">
              <Link
                onClick={closeMenu}
                href={
                  !customer || customer?.id === "guest" ? "/login" : "/account"
                }
              >
                {!customer || customer?.id === "guest" ? "Sign in" : "Account"}
              </Link>
            </li>
          </ul>

          {customer && customer?.id !== "guest" ? (
            <button
              type="button"
              className="cursor-pointer text-center text-base font-medium text-primaryColor"
              onClick={handleLogout}
            >
              Log Out
            </button>
          ) : null}

          <div className="flex items-center justify-center gap-2 text-base text-primaryColor">
            <Link
              href={`tel:${siteConfig.contact.primaryPhone}`}
              className="flex items-center justify-center gap-2"
            >
              <PhoneCall size={iconSize} /> {siteConfig.contact.primaryPhoneDisplay}
            </Link>
          </div>

          <div className="flex justify-center gap-2 text-primaryColor">
            <Link
              href={`https://www.facebook.com/${siteConfig.social.facebook}`}
            >
              <Facebook size={24} />
            </Link>
            <Link
              href={`https://www.instagram.com/${siteConfig.social.instagram}`}
            >
              <Instagram size={24} />
            </Link>
            <Link href={`https://www.tiktok.com/${siteConfig.social.tiktok}`}>
              <FaTiktok size={24} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavLinks;
