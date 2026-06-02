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
import NavCategories from "./mega-menu/categories";
import { useClearSearch } from "@/hooks/useClearSearch";
import { siteConfig } from "@/site.config";

const navLinks = siteConfig.navigation.main;

interface NavLinksProps {
  navCategories: ProductCategory[];
}

export default function NavLinks({ navCategories }: NavLinksProps) {
  const [openMenu, setOpenMenu] = React.useState<string>("");
  const clearSearch = useClearSearch();

  const closeMenu = () => {
    setOpenMenu("");
  };

  return (
    <NavigationMenu
      value={openMenu}
      onValueChange={(e: string) => setOpenMenu(e)}
      className="NavigationMenuRoot"
    >
      <NavigationMenuList className="NavigationMenuList">
        {navLinks.map((item) => (
          <NavigationMenuItem key={item.href}>
            {"menu" in item && item.menu === "categories" ? (
              <>
                <NavigationMenuTrigger className="NavigationMenuTrigger">
                  {item.name} <CaretDownIcon className="CaretDown" aria-hidden />
                </NavigationMenuTrigger>
                <NavigationMenuContent className="NavigationMenuContent test">
                  <NavCategories onClose={closeMenu} categories={navCategories} />
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  onClick={item.href === "/" ? clearSearch : undefined}
                  className={`NavigationMenuLink ${
                    "special" in item && item.special
                      ? "relative px-3 animate-bounce flex items-center gap-1"
                      : ""
                  }`}
                >
                  {"special" in item && item.special && (
                    <span className="mr-1">🔥</span>
                  )}
                  {item.name}
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>

      <div className="ViewportPosition">
        <NavigationMenuViewport className="NavigationMenuViewport" />
      </div>
    </NavigationMenu>
  );
}
