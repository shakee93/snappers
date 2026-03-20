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
import NavCategories from "./mega-menu/categories";
import BrandsMenu from "./mega-menu/brands";

type NavLinkItem = {
  href: string;
  name: string;
  component?: React.ComponentType<{ onClose: () => void }>;
  special?: boolean;
};

const navLinks: NavLinkItem[] = [
  {
    href: "/",
    name: "Home",
  },
  {
    href: "/collections",
    name: "Collections",
    component: NavCategories,
  },
  {
    href: "/brands",
    name: "Brands",
    // component: BrandsMenu,
  },
  {
    href: "/collections/all",
    name: "Shop",
  },
  {
    href: "/tag/clearance",
    name: "Clearance",
    special: true,
  },
  {
    href: "/contact",
    name: "Location",
  },
  {
    href: "/tag/pre-order",
    name: "Pre-Order",
  },
];

export default function NavLinks() {
  const [openMenu, setOpenMenu] = React.useState<string>("");

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
            {item.component ? (
              <>
                <NavigationMenuTrigger className="NavigationMenuTrigger">
                  {item.name} <CaretDownIcon className="CaretDown" aria-hidden />
                </NavigationMenuTrigger>
                <NavigationMenuContent className="NavigationMenuContent test">
                  {React.createElement(item.component, { onClose: closeMenu })}
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  className={`NavigationMenuLink ${
                    item.special
                      ? "relative px-3 animate-bounce flex items-center gap-1"
                      : ""
                  }`}
                >
                  {item.special && (
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
