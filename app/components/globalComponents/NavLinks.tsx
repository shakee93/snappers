import React, { useEffect, useState } from "react";
import Link from "next/link";

const NavLinks = () => {
  const iconSize = 18;

  const navLinks = [
    {
      id: 2,
      href: "/collections/all",
      name: "Shop",
    },
    {
      id: 3,
      href: "/page-collection-2",
      name: "About Us",
    },

    {
      id: 4,
      href: "/page-collection-2",
      name: "Contact Us",
    },
  ];

  return (
    <ul className="gap-1 text-sm  flex text-center items-center font-medium  text-black ">
      {navLinks.map((item) => (
        <Link href={item.href} key={item.id}>
          <li className="hover:[#f1f5f9] rounded-3xl px-1 xl:px-3  py-1 ">
            {item.name}
          </li>
        </Link>
      ))}
    </ul>
  );
};

export default NavLinks;
