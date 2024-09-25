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
    component: BrandsMenu,
  },
  {
    href: "/collections/all",
    name: "Shop",
  },
  {
    href: "/contact",
    name: "Contact",
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
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink className="NavigationMenuLink">
                  {item.name}
                </NavigationMenuLink>
              </Link>
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
