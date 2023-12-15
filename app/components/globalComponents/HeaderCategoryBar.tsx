"use client"
import Link from "next/link";
import { PhoneCall, MapPin, Facebook, Instagram } from "lucide-react";
import { useState, useRef, useEffect } from 'react';
import MegaMenu from "./MegaMenu";

interface Product {
  id: string;
  brand: string;
  category: string;
  name: string;
  slug: string;
  description: string;
}

interface Brand {
  id: number;
  href: string;
  name: string;
  products?: Product[];
}

interface MegaMenuProps {
  products?: Product[];
  hover: boolean;
}

const HeaderCategoryBar = () => {
  const brands: Brand[] = [
    {
      id: 1,
      href: "/apple",
      name: "Apple",
      products: [
        {
          id: '1',
          brand: 'Apple',
          category: 'Phones',
          name: 'iPhone 15',
          slug: 'iphone-15',
          description: 'The latest iPhone model.',
        },
        {
          id: '2',
          brand: 'Apple',
          category: 'Laptops',
          name: 'MacBook Pro',
          slug: 'macbook-pro',
          description: 'Powerful MacBook for professionals.',
        },
        {
          id: '3',
          brand: 'Apple',
          category: 'Tablets',
          name: 'iPad Pro',
          slug: 'ipad-pro',
          description: 'High-performance iPad for creative tasks.',
        }
      ],
    },
    {
      id: 2,
      href: "/samsung",
      name: "Samsung",
      products: [
        {
          id: '1',
          brand: 'Samsung',
          category: 'Phones',
          name: 'Galaxy S',
          slug: 'galaxys',
          description: 'The latest Samsung model.',
        },
        {
          id: '2',
          brand: 'Samsung',
          category: 'Phone',
          name: 'Galaxy Note',
          slug: 'galaxy-note',
          description: 'Powerful MacBook for professionals.',
        },
        {
          id: '3',
          brand: 'Samsung',
          category: 'TV',
          name: 'Smart TV',
          slug: 'smart-tv',
          description: 'High-performance iPad for creative tasks.',
        }],
    },
    {
      id: 3,
      href: "/page-collection-2",
      name: "Beats",
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


  const [brandHover, setBrandHover] = useState<{ [key: number]: boolean }>({});
  const menuRef = useRef(null);

  useEffect(() => {
    const handleMouseEnter = (itemId) => {
      setBrandHover({ ...brandHover, [itemId]: true });
    };

    const handleMouseLeave = (itemId) => {
      setBrandHover({ ...brandHover, [itemId]: false });
    };

    const handleMenuMouseEnter = () => {
      setBrandHover((prev) => ({ ...prev, [menuRef.current]: true }));
    };

    const handleMenuMouseLeave = () => {
      setBrandHover((prev) => ({ ...prev, [menuRef.current]: false }));
    };

    return () => {
      document.removeEventListener('mouseenter', handleMenuMouseEnter);
      document.removeEventListener('mouseleave', handleMenuMouseLeave);
    };
  }, [brandHover]);

  return (
    <div className="flex flex-row bg-primary-200 text-xs text-white w-full">
      <div className="bg-primary-700 w-2/12">All Categories</div>
      <div className="w-10/12 p-2">
        <ul className="flex gap-2 text-[13px] items-center font-medium justify-between text-primary-700 w-full">
          {brands.map((item) => (
            <li
              key={item.id}
              className="w-full relative group hover:bg-slate-200 rounded-3xl px-3 py-1 text-center"
              onMouseEnter={() => setBrandHover({ ...brandHover, [item.id]: true })}
              onMouseLeave={() => setBrandHover({ ...brandHover, [item.id]: false })}
            >
              <Link href={item.href}>
                {item.name}
              </Link>
              {item.products && (
                <MegaMenu products={item.products} hover={brandHover[item.id]} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>

  );
}

export default HeaderCategoryBar;
