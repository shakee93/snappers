"use client"
import Link from "next/link";
import { PhoneCall, MapPin, Facebook, Instagram } from "lucide-react";
import { useState } from 'react';

interface Brand {
  id: number;
  href: string;
  name: string;
  products?: string[];
}

interface MegaMenuProps {
  products?: string[];
  hover: boolean;
}

const HeaderCategoryBar = () => {
  const brands: Brand[] = [
    {
      id: 1,
      href: "/apple",
      name: "Apple",
      products: ["iPhone", "MacBook", "iPad"],
    },
    {
      id: 2,
      href: "/samsung",
      name: "Samsung",
      products: ["Galaxy S", "Galaxy Note", "Smart TV"],
    },
    {
      id: 3,
      href: "/page-collection-2",
      name: "Beats",
      products: ["Buds", "Note"],
    },

    {
      id: 4,
      href: "/page-collection-2",
      name: "Huawei",
    },
    {
      id: 5,
      href: "/page-collection-2",
      name: "Sony",
    },
    {
      id: 6,
      href: "/page-collection-2",
      name: "Realme",
    },
    {
      id: 7,
      href: "/page-collection-2",
      name: "OnePlus",
    },
    {
      id: 8,
      href: "/page-collection-2",
      name: "JBL",
    },
    {
      id: 9,
      href: "/page-collection-2",
      name: "Honor",
    },
    {
      id: 10,
      href: "/page-collection-2",
      name: "Microsoft",
    },
    {
      id: 11,
      href: "/page-collection-2",
      name: "Microsoft",
    },
    {
      id: 12,
      href: "/page-collection-2",
      name: "Microsoft",
    }
  ];

  const MegaMenu: React.FC<MegaMenuProps> = ({ products, hover }) => {
    return (
      <div className={`mega-menu absolute ${hover ? 'block' : 'hidden'} bg-white p-4 mt-2 shadow-lg z-50`}>
        <ul>
          {products?.map((product, index) => (
            <li key={index} className="text-primary-700">
              {product}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const [brandHover, setBrandHover] = useState<{ [key: number]: boolean }>({});

  return (
    <div className="flex flex-row bg-primary-200 text-xs text-white">
      <div className="bg-primary-700 w-2/12">All Categories</div>
      <div className="w-10/12 p-2">
        <ul className="flex gap-2 text-[13px] items-center font-medium justify-between text-primary-700 mr-5 w-full">
          {brands.map((item) => (
            <Link key={item.id} href={item.href}>
              <div className="relative group hover:bg-slate-200 rounded-3xl px-3 py-1 text-center"
                onMouseEnter={() => setBrandHover({ ...brandHover, [item.id]: true })}
                onMouseLeave={() => setBrandHover({ ...brandHover, [item.id]: false })}
              >
                {item.name}
                {item.products && <MegaMenu products={item.products} hover={brandHover[item.id]} />}
              </div >
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HeaderCategoryBar;
