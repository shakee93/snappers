import Link from "next/link";
import Logo from "./Logo";

import { useRouter } from "next/navigation";

const NavLinks = () => {

  const navLinks= [
    {
      id: 1,
      href: "/page-collection",
      name: "Home",
    },
    {
      id: 2,
      href: "/page-collection",
      name: "Shop",
    },
    {
      id:3,
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
    <ul className="flex gap-2 text-[13px] items-center font-medium justify-end text-primary-700 mr-5 w-full">
    {navLinks.map((item) => (
      <li key={item.id}  className="hover:bg-slate-200 rounded-3xl px-3 py-1 text-center">
        <Link href={item.href}>{item.name}</Link>
      </li>
    ))}
  </ul>
  );
};

export default NavLinks;
