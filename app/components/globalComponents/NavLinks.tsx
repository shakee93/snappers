"use client"

import * as React from "react"
import Link from "next/link"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport } from "@/components/ui/navigation-menu"
import NavCategories from "./mega-menu/categories"
import BrandsMenu from "./mega-menu/brands"
// import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { CaretDownIcon } from '@radix-ui/react-icons';

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
    <NavigationMenu className="NavigationMenuRoot">
      <NavigationMenuList className="NavigationMenuList">
        {navLinks.map(item => (
          <NavigationMenuItem key={item.href}>
            {item.component ? (
              <>
                <NavigationMenuTrigger className="NavigationMenuTrigger">
                  {item.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="NavigationMenuContent test">
                  {React.createElement(item.component, { onClose: () => { } })}
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

    // <NavigationMenu>
    //   <NavigationMenuList>
    //     {navLinks.map(item => (
    //       <NavigationMenuItem key={item.href}>
    //         {item.component ? (
    //           <>
    //             <NavigationMenuTrigger>
    //               {item.name}
    //             </NavigationMenuTrigger>

    //             <NavigationMenuContent className="animate-in fade-in">
    //               {React.createElement(item.component)}
    //             </NavigationMenuContent>
    //           </>
    //         ) : (
    //           <Link href={item.href} legacyBehavior passHref>
    //             <NavigationMenuLink className={navigationMenuTriggerStyle()}>
    //               {item.name}
    //             </NavigationMenuLink>
    //           </Link>
    //         )}
    //       </NavigationMenuItem>
    //     ))}
    //   </NavigationMenuList>
    // </NavigationMenu>

  )


}

