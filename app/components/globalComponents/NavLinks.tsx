"use client"

import * as React from "react"
import Link from "next/link"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import NavCategories from "./mega-menu/categories"
import BrandsMenu from "./mega-menu/brands"

type NavLinkItem = {
  href: string;
  name: string;
  component?: React.ComponentType<{ onClose: () => void }>;
}

const navLinks: NavLinkItem[] = [
  {
    href: "/",
    name: "Home",
  },
  {
    href: "/collections",
    name: "Collections",
    component: NavCategories
  },
  {
    href: "/brands",
    name: "Brands",
    component: BrandsMenu
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

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navLinks.map(item => (
          <NavigationMenuItem key={item.href}>
            {item.component ? (
              <>
                <NavigationMenuTrigger>
                  {item.name}
                </NavigationMenuTrigger>

                <NavigationMenuContent className="animate-in">
                  {React.createElement(item.component)}
                </NavigationMenuContent>
              </>
            ) : (
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {item.name}
                </NavigationMenuLink>
              </Link>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

