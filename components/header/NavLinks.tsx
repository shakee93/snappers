"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@radix-ui/react-navigation-menu";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { ProductCategory } from "@/graphql/types/graphql";
import CategoryMegaPanel from "./mega-menu/CategoryMegaPanel";
import { useClearSearch } from "@/hooks/useClearSearch";
import { siteConfig } from "@/site.config";
import { getMegaMenuPanelData } from "@/lib/megaMenu";

const navLinks = siteConfig.navigation.main;

interface NavLinksProps {
  navCategories: ProductCategory[];
}

export default function NavLinks({ navCategories }: NavLinksProps) {
  const [openMenu, setOpenMenu] = React.useState("");
  const clearSearch = useClearSearch();

  const closeMenu = React.useCallback(() => {
    setOpenMenu("");
  }, []);

  const panelsByHref = React.useMemo(() => {
    const map = new Map<
      string,
      NonNullable<ReturnType<typeof getMegaMenuPanelData>>
    >();
    for (const item of navLinks) {
      const panel = getMegaMenuPanelData(navCategories, item.href);
      if (panel) map.set(item.href, panel);
    }
    return map;
  }, [navCategories]);

  return (
    <NavigationMenu
      value={openMenu}
      onValueChange={setOpenMenu}
      className="NavigationMenuRoot"
    >
      <NavigationMenuList className="NavigationMenuList">
        {navLinks.map((item) => {
          const panel = panelsByHref.get(item.href);
          const special =
            "special" in item && !!(item as { special?: boolean }).special;

          return (
            <NavigationMenuItem key={item.href} value={item.href}>
              {panel ? (
                <>
                  <NavigationMenuTrigger className="NavigationMenuTrigger">
                    {item.name}{" "}
                    <CaretDownIcon className="CaretDown" aria-hidden />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="NavigationMenuContent">
                    <CategoryMegaPanel data={panel} onClose={closeMenu} />
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    onClick={
                      String(item.href) === "/" ? clearSearch : undefined
                    }
                    className={`NavigationMenuLink ${
                      special
                        ? "relative flex animate-bounce items-center gap-1 px-3"
                        : ""
                    }`}
                  >
                    {special ? <span className="mr-1">🔥</span> : null}
                    {item.name}
                  </Link>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>

      <div className="ViewportPosition">
        <NavigationMenuViewport className="NavigationMenuViewport" />
      </div>
    </NavigationMenu>
  );
}
